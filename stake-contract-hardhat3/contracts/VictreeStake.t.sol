// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { VictreeStake } from './VictreeStake.sol';
import { Test } from 'forge-std/Test.sol';
import "hardhat/console.sol";

contract VictreeStakeTest is Test {
  address user;
  VictreeStake vs = new VictreeStake();

  // 虚拟机快照地址
  uint256 snapshotId;

  function setUp() public {
    user = makeAddr('user');

    // 给用户分配足够的 ETH
    vm.deal(user, 100 ether);

    // 代理合约初始化
    vs.initialize();
  }

  // 1、测试初始化 - ETH质押池相关信息
  function test01_EthStake() public view {
    (uint256 total, uint256 time) = vs.ethStake();
    // 初始化 ETH质押池金额应为 0
    assertEq(total, 0, unicode"初始化 ETH质押池金额应为 0");

    // ETH 质押池冷却期应为 20 min
    assertEq(time, 20 minutes, unicode"ETH 质押池冷却期应为 20 min");

    // 总的质押金额
    assertEq(vs.getTotalStaked(), 0, unicode"总的质押金额应为 0");
  }

  function stakeEth() public returns (uint256 totalAmount, uint256 count) {
    uint256 amount;
    // uint256 totalAmount;
    // uint256 count = 5;
    count = 5;
    for (uint256 i = 1; i <= count; i++) {
      // 指定调用者的身份
      vm.prank(user);
      amount = i * 1000 gwei;
      totalAmount += amount;
      (bool success, ) = address(vs).call{ value: amount }(abi.encodeWithSignature("stakeETH()"));
      require(success, unicode"质押失败");
    }
  }

  // 2、测试质押 eth
  function test02_StakeETH() public {
    // TODO 预期触发 Staked 事件
    // vm.expectEmit(true, false, false, true);
    // emit Staked(user, amount1, block.timestamp);

    // 每次质押 1000 gwei
    (uint256 totalAmount, uint256 count) = stakeEth();

    // 检查用户质押列表
    assertEq(vs.getUserStakesLeng(user), count, unicode"用户质押列表应为 count");

    // 检查用户质押列表的初始值（默认检查第一项）
    (uint256 originAmount, uint256 unstakeAmount, ) = vs.stakes(address(user), 0);
    assertEq(originAmount, 1000 gwei, unicode"默认质押金额为 1000 gwei");
    assertEq(unstakeAmount, 0, unicode"默认解除质押金额为 0");

    // 检查质押用户质押量
    assertEq(vs.getUserTotalStaked(user), totalAmount, unicode"用户质押量不正确");

    // 检查 eth 总质押量
    (uint256 total, ) = vs.ethStake();
    assertEq(total, totalAmount);

    // 记录 vm 快照
    // snapshotId =  vm.snapshot();
  }

  // 3、测试解除质押
  function test03_UnstakeETH() public {
    // 恢复 vm 快照
    // vm.revertTo(snapshotId);
    stakeEth();
    console.log("vs.getUserTotalStaked");
    console.log(vs.getUserTotalStaked(user));

    // 解除质押
    uint256 unstakeAmount = 5000 gwei;
    vm.prank(user);
    vs.unStakeETH(unstakeAmount);

    // 对质押列表的影响
    (uint256 o0, uint256 u0,) = vs.stakes(user, 0);
    assertEq(o0, 1000 gwei, unicode"第一条质押金额为 1000 gwei");
    assertEq(o0, u0, unicode"第一条质押记录已被 unstake");
    (uint256 o1, uint256 u1,) = vs.stakes(user, 1);
    (uint256 o2, uint256 u2,) = vs.stakes(user, 2);

    uint256 len = vs.getUserUnstakesLeng(user);
    assertEq(len, 1);

    // vm.startPank(user);
  }

  // 4、测试提取质押
}