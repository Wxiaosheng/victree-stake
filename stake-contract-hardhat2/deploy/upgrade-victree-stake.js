const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("♻️ 开始升级合约...");
  const { deployer } = await getNamedAccounts();

  // 获取代理合约信息
  const { address: proxyAddress } = deployments.get('VictreeStakeProxyHardhat2');
  console.log("代理合约地址：", proxyAddress);
}

module.exports.tags = ["UpgradeVictreeStakeHardhat2"]