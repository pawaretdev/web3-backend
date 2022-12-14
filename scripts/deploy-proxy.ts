async function deployProxy() {
  const Box = await ethers.getContractFactory('Box')
  console.log('Deploying Box...')
  const box = await upgrades.deployProxy(Box, [42], { initializer: 'store' })
  await box.deployed();
  console.log("Pizza deployed to:", box.address);
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
