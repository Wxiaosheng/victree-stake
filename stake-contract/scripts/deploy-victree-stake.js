const fs = require("fs");
const path = require("path");
const { ethers, upgrades } = require('hardhat');

module.exports = async ({ getNameAccounts, deployments }) => {
  console.log("VictreeStake 合约开始部署");

  // 部署者
  const { deployer } = await getNameAccounts();
  console.log("部署者地址：", deployer);

  // 获取实现合约
  const VictreeStake = await ethers.getContractFactory("VictreeStake");
  const proxy = await upgrades.deployProxy(VictreeStake, [], {
    initializer: "initialize"
  });
  await proxy.awaitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const impleAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("✅ 部署成功。。。");
  console.log("代理合约地址：", proxyAddress);
  console.log("实现合约地址：", impleAddress);

  deployments.save("VictreeStakeProxy", {
    address: proxyAddress,
    impleAddress,
    abi: VictreeStake.interface.format('json')
  });

  const storePath = path.resolve(__dirname, './.cache/VictreeStakeProxy.json');
  fs.writeFileSync(storePath, storePath);

}

module.exports.tags = ["DeployVictreeStake"];