const hre = require("hardhat");

async function main() {
  console.log("Deploying GameStarter contract to Base Mainnet...");

  // Get the contract factory
  const GameStarter = await hre.ethers.getContractFactory("GameStarter");

  // Deploy the contract
  const gameStarter = await GameStarter.deploy();

  // Wait for deployment to complete
  await gameStarter.waitForDeployment();

  const address = await gameStarter.getAddress();

  console.log("✅ GameStarter deployed to:", address);
  console.log("📝 Save this address to your .env file:");
  console.log(`NEXT_PUBLIC_GAME_STARTER_ADDRESS=${address}`);
  console.log("");
  console.log("🔍 Verify contract on BaseScan:");
  console.log(`npx hardhat verify --network base ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
