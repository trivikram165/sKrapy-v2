const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("SkrapContract");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress(); // ✅ Proper way in ethers v6
  console.log(`SkrapContract deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
