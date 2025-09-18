import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// VictreeStakeModule#VictreeStake - 0xa9eC99e4e4566B029e8770d441AF2f2246581751
export default buildModule("VictreeStakeModule", (m) => {
  // 创建 VictreeStake 合约实例
  const vs = m.contract("VictreeStake");
  
  return { vs };
})