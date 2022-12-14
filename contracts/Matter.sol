// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;
pragma abicoder v2;

import './interfaces/IWETH.sol';
import './Collection.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

contract Matter is
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    uint256 public constant RATE_BASE = 1e6;

    uint8 public constant KIND_MINT = 1;
    uint8 public constant KIND_BUY = 2;
    uint8 public constant KIND_OFFER = 3;
    uint8 public constant KIND_ACCEPT = 4;
    uint8 public constant KIND_CANCEL = 5;

    uint8 public constant STATUS_OPEN = 1;
    uint8 public constant STATUS_DONE = 2;
    uint8 public constant STATUS_CLOSE = 3;

    address public collector;
    address[] public contracts;
    uint256 public mintFee;
    uint256 public platformRate;
    uint256 public creatorRate;

    IWETH public weth;

    struct NFT {
        address tokenAddress;
        uint256 tokenId;
        uint256 price;
    }

    struct Detail {
        uint256 id;
        NFT nft;
        address user;
        address caller;
        address signer;
        uint8 kind;
    }

    struct MarketDeal {
        NFT nft;
        address seller;
        address buyer;
        uint8 kind;
        uint8 status;
    }

    event MintCollection(
        address sender,
        address tokenAddress,
        string name,
        string symbol
    );
    event Buy(
        uint256 id,
        address buyer,
        address seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    );
    event Offer(uint256 id, MarketDeal item);
    event UpdateCollector(address collector);
    event UpdateSigner(address signer, bool remove);
    event UpdateCreator(address tokenAddress, address creator, bool remove);

    mapping(uint256 => MarketDeal) public items;
    mapping(address => bool) public contractSigner;
    mapping(address => address) public creatorAddress;

    receive() external payable {}

    function initialize(
        uint256 _mintFee,
        uint256 _platformRate,
        uint256 _creatorRate,
        address _collector,
        address _initSigner,
        IWETH _weth
    ) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        __ReentrancyGuard_init();

        collector = _collector;
        mintFee = _mintFee;
        platformRate = _platformRate;
        creatorRate = _creatorRate;
        contractSigner[_initSigner] = true;
        weth = _weth;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function updateCollector(address _newCollector) external onlyOwner {
        collector = _newCollector;
        emit UpdateCollector(_newCollector);
    }

    function updateSigner(address _signer, bool _remove) external onlyOwner {
        if (_remove) {
            delete contractSigner[_signer];
        } else {
            contractSigner[_signer] = true;
        }
        emit UpdateSigner(_signer, _remove);
    }

    function updateCreator(
        address _tokenAddress,
        address _creator,
        bool _remove
    ) external onlyOwner {
        if (_remove) {
            delete creatorAddress[_tokenAddress];
        } else {
            creatorAddress[_tokenAddress] = _creator;
        }
        emit UpdateCreator(_tokenAddress, _creator, _remove);
    }

    function mintCollection(string memory _name, string memory _symbol)
        external
        payable
    {
        if (msg.sender != owner()) {
            require(msg.value >= mintFee, 'insufficient fee');
        }
        weth.deposit{value: mintFee}();
        _transfer(payable(collector), msg.value);
        Collection collection = new Collection(_name, _symbol, msg.sender);
        contracts.push(address(collection));
        emit MintCollection(msg.sender, address(collection), _name, _symbol);
    }

    function execute(Detail calldata detail, bytes calldata signature)
        public
        payable
        nonReentrant
    {
        require(
            contractSigner[detail.signer] &&
                isSignatureValid(
                    signature,
                    keccak256(abi.encode(detail)),
                    detail.signer
                ),
            'signature invalid'
        );

        if (detail.kind == KIND_BUY) {
            _assertSender(detail.caller);
            _buy(detail.id, detail.user, detail.caller, detail.nft);
        } else if (detail.kind == KIND_OFFER) {
            _assertSender(detail.caller);
            _makeOffer(detail.id, detail.user, detail.caller, detail.nft);
        } else if (detail.kind == KIND_CANCEL) {
            _assertSender(detail.caller);
            _cancelOffer(detail.id);
        } else if (detail.kind == KIND_ACCEPT) {
            _assertSender(detail.caller);
            _acceptOffer(detail.id, detail.user, detail.nft);
        } else {
            revert('unknown kind');
        }
    }

    function _buy(
        uint256 _id,
        address _seller,
        address _buyer,
        NFT calldata _nft
    ) internal {
        items[_id] = MarketDeal(_nft, _seller, _buyer, KIND_BUY, STATUS_DONE);
        weth.deposit{value: _nft.price}();
        _completeTransaction(_id);
        IERC721Upgradeable(_nft.tokenAddress).safeTransferFrom(
            _seller,
            _buyer,
            _nft.tokenId
        );
        emit Buy(_id,_buyer, _seller, _nft.tokenAddress, _nft.tokenId, _nft.price);
    }

    function _makeOffer(
        uint256 _id,
        address _seller,
        address _buyer,
        NFT calldata _nft
    ) internal {
        require(_nft.price == msg.value, 'msg.value must be equal price');
        weth.deposit{value: _nft.price}();
        items[_id] = MarketDeal(
            _nft,
            _seller,
            _buyer,
            KIND_OFFER,
            STATUS_OPEN
        );
        emit Offer(_id, items[_id]);
    }

    function _cancelOffer(uint256 _id) internal {
        require(isOffer(_id) && isStatusOpen(_id), 'only open order');
        MarketDeal storage item = items[_id];
        require(msg.sender == item.buyer, 'caller is not buyer');

        item.status = STATUS_CLOSE;
        _transfer(item.buyer, item.nft.price);

        emit Offer(_id, item);
    }

    function _acceptOffer(
        uint256 _id,
        address _seller,
        NFT calldata _nft
    ) internal {
        require(isOffer(_id) && isStatusOpen(_id), 'only open offer');
        MarketDeal storage item = items[_id];

        item.status = STATUS_DONE;
        item.seller = _seller;

        IERC721(_nft.tokenAddress).safeTransferFrom(
            _seller,
            item.buyer,
            _nft.tokenId
        );
        _completeTransaction(_id);
        emit Offer(_id, item);
    }

    function _completeTransaction(uint256 _id) internal {
        MarketDeal storage item = items[_id];
        uint256 platformFee = (item.nft.price * platformRate) / RATE_BASE;
        uint256 creatorFee = (item.nft.price * creatorRate) / RATE_BASE;
        uint256 totalRecieve = item.nft.price - platformFee - creatorFee;
        address creator = creatorAddress[item.nft.tokenAddress];
        _transfer(collector, platformFee); // send fee to platform
        if (creator != address(0))
            _transfer(creator, creatorFee); // send royalty to creator
        else _transfer(collector, creatorFee);
        _transfer(item.seller, totalRecieve); // send total to seller
    }

    function _transfer(address _to, uint256 _amount) internal {
        if (_amount == 0) return;
        require(_to != address(0), 'cannot transfer to address(0)');
        weth.withdraw(_amount);
        payable(_to).transfer(_amount);
    }

    function setMintFee(uint256 _newFee) external onlyOwner {
        mintFee = _newFee;
    }

    function setPlatformRate(uint256 _newRate) external onlyOwner {
        platformRate = _newRate;
    }

    function setRoyaltyRate(uint256 _newRate) external onlyOwner {
        creatorRate = _newRate;
    }

    function isOffer(uint256 id) public view returns (bool) {
        return items[id].kind == KIND_OFFER;
    }

    function isStatusOpen(uint256 _id) public view returns (bool) {
        return items[_id].status == STATUS_OPEN;
    }

    function isSignatureValid(
        bytes memory _signature,
        bytes32 _hash,
        address _signer
    ) public pure returns (bool) {
        return
            ECDSAUpgradeable.recover(
                ECDSAUpgradeable.toEthSignedMessageHash(_hash),
                _signature
            ) == _signer;
    }

    function _assertSender(address _sender) internal view {
        require(_sender == msg.sender, 'wrong sender');
    }
}
