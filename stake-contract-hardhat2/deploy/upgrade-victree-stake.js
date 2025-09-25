const fs = require("fs");
const path = require("path");
const { ethers, upgrades } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("♻️ 开始升级合约...");
  const { deployer } = await getNamedAccounts();

  // 获取代理合约信息
  const { address: proxyAddress } = await deployments.get('VictreeStakeProxyHardhat2');
  console.log("代理合约地址：", proxyAddress);

  console.log("获取升级合约的实例...");
  const V2 = await ethers.getContractFactory("VictreeStakeV2");

  console.log("开始升级合约...");
  const proxyV2 = await upgrades.upgradeProxy(proxyAddress, V2);
  await proxyV2.waitForDeployment();

  console.log("✅ 升级合约成功！");

  const impleAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("实现合约地址：", impleAddress);

  deployments.save("VictreeStakeProxyHardhat2", {
    address: proxyAddress,
    impleAddress,
    abi: V2.interface.format('json')
  });

  const storePath = path.resolve(__dirname, './.cache/VictreeStakeProxy.json');
  // 确保文件夹存在
  const dirPath = path.dirname(storePath);
  if (!fs.existsSync(dirPath)) {
    console.log(dirPath + " 目录不存在，自动创建...")
    fs.mkdirSync(dirPath, { recursive: true });
    console.log("✅ 创建成功！")
  }

  // 保存部署信息
  fs.writeFileSync(storePath, JSON.stringify({
    address: proxyAddress,
    impleAddress,
    abi: V2.interface.format('json')
  }, null, 2));

  console.log("部署信息已保存，请查看 " + storePath);
}

module.exports.tags = ["UpgradeVictreeStakeHardhat2"]