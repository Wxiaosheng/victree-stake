require("@nomicfoundation/hardhat-toolbox");

require("@openzeppelin/hardhat-upgrades");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  namedAccounts: {
    deployer: 0
  },
  networks: {
    sepolia: {
      chainId: "1115511",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    }
  }
};
