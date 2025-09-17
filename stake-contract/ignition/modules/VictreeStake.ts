import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VictreeStakeModule", (m) => {
  // 创建 VictreeStake 合约实例
  const vs = m.contract("VictreeStake");
  
  return { vs };
})