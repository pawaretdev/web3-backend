const proxyAddress = '0x350A2220779c3EA8C575D61FE7534e9e1e1A5524'

async function upgrade() {
  console.log(proxyAddress," Original Proxy Address")
  const UpgradeMatter = await ethers.getContractFactory("MatterV2")
  console.log("Upgrade to BoxV2...")
  const upgradeMatter = await upgrades.upgradeProxy(proxyAddress, UpgradeMatter)
  console.log(upgradeMatter.address," Matter Address(should be the same)")
}

upgrade().catch((error) => {
  console.error(error)
  process.exitCode = 1
})