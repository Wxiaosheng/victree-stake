const fs = require("fs");
const path = require("path");
const { ethers, upgrades } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  console.log("VictreeStake 合约开始部署......");
  console.log("部署网络为：", network.name);
  console.log("当前区块高度：", await ethers.provider.getBlockNumber());

  // 部署者
  const { deployer } = await getNamedAccounts();
  console.log("部署者地址：", deployer);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("部署者余额：", ethers.formatEther(balance));

  console.log("获取合约实例");
  // 获取实现合约
  const VictreeStake = await ethers.getContractFactory("VictreeStake");

  console.log("开始部署合约。。。");
  // try {
    const proxy = await upgrades.deployProxy(VictreeStake, [], {
      kind: 'uups',
      initializer: "initialize"
    });
  // } catch (error) {
  //   console.log(error.code)
  //   console.log(error.data)
  //   console.log(error.reason)
  //   return 
  // }
  
  console.log("等待部署合约。。。");
  await proxy.waitForDeployment();
  console.log("✅ 合约部署完成！");

  const proxyAddress = await proxy.getAddress();
  console.log("代理合约地址：", proxyAddress);

  const impleAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  // console.log("✅ 部署成功。。。");
  // console.log("代理合约地址：", proxyAddress);
  console.log("实现合约地址：", impleAddress);

  deployments.save("VictreeStakeProxyHardhat2", {
    address: proxyAddress,
    impleAddress,
    abi: VictreeStake.interface.format('json')
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
    abi: VictreeStake.interface.format('json')
  }, null, 2));

  console.log("部署信息已保存，请查看 " + storePath);
}

module.exports.tags = ["DeployVictreeStakeHardhat2"];