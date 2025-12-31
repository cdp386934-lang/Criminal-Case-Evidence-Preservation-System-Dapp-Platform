import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const EvidenceStorage = await ethers.getContractFactory("EvidenceStorage");
  const evidenceStorage = await EvidenceStorage.deploy();

  await evidenceStorage.waitForDeployment();

  const address = await evidenceStorage.getAddress();
  console.log("EvidenceStorage deployed to:", address);
  console.log("\nPlease update the CONTRACT_ADDRESS in your .env files:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

