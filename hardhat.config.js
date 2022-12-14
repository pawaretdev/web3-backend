require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('@openzeppelin/hardhat-upgrades')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // allowUnlimitedContractSize: true,
    },
  },
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/HvutltQvN5Cu2-AS2UHMCuAu5vg5aROr`,
      // url: `https://matic-mumbai.chainstacklabs.com/`,
      accounts: [
        // Platform Wallet 0xebC40d4fdc6C13a41cAe034ee5B1D276cD93f512
        `9a4bfe83a0a42733d937ec5c4adc47d06dd03c8277daf156387715e5900f6c6b`, 
      ],
      gas: 50000000000,
    },
    testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      accounts: [
        // 0xf9FDF2ce01c3F9bF74bB9903D8FB050C94cd8eb0
        'b9a895a4a8a3a750c2bc84e5f4bbec5d87e54e01aed62cfdde6c09dd3fceefdc', 
      ],
    },
  },
  etherscan: {
    apiKey: 'DHM5372DAT6D2CUZIFIBW8S7IW37UZ4YBJ', // testnet
    // apiKey: '4XYAS1C8RKJZP798WPTTX1J1K1CH6JU3E4', //mumbai
  },
}
