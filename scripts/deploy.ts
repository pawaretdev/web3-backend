const { ethers, network, upgrades } = require('hardhat')
const { WETH } = require('./config.ts')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  const Matter = await ethers.getContractFactory('Matter')
  console.log('Deploying Matter...')
  // * Deploy proxy
  const matter = await upgrades.deployProxy(
    Matter,
    // ? initialize params
    [
      1e15, // mintFee
      2500, // platfromRate
      5000, // royaltyRate
      '0x2c684109868286414F584674beed8ddD7Ff93220', // collector
      '0x77e1b2880E18E3d0B598a71A331B2a3f6F035588', // initSigner
      WETH.mumbai, //IWETH
    ],
    // ? options
    {},
  )
  // * Deploy default
  // const matter = await Matter.deploy(WETH.mumbai)
  await matter.deployed()
  console.log('Matter deployed to:', matter.address)

  // * Deploy with arguments
  // const Matter = await ethers.getContractFactory('TK9Minter')
  // console.log('Deploying Matter...')
  // const matter = await Matter.deploy("0xaB268D139B81CeD3414331e9Ba7397265FAAd8d6", "0xf9FDF2ce01c3F9bF74bB9903D8FB050C94cd8eb0")
  // await matter.deployed()
  // console.log('Matter deployed to:', matter.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
