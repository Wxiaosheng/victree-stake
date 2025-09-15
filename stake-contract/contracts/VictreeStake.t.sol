// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import { VictreeStake } from "./VictreeStake.sol";
import { Test } from "forge-std/Test.sol";

contract VictreeStakeTest is Test {
  address owner;
  address user;
  VictreeStake stake;

  function setUp() public {
    owner = address(this);
    user = makeAddr("user");

    vm.deal(user, 1 ether);

    // Deploy a new instance of the VictreeStake contract before each test
    stake = new VictreeStake();
  }

  // 测试1: 测试质押功能（单次质押）
  function testStake() public {
    vm.prank(user);

    uint256 amount = 0;
    vm.expectRevert();
    stake.stakeETH{value: amount}();
    assertEq(user.balance, 1 ether, unicode"user 初始化余额错误");

    assertEq(stake.getTotalStaked(), 0, unicode"默认质押金额为0");

    // 注意必须使用 start-end包裹这个交易，否则 user.balance 读取的还是初始值，因为 address 变量不会自动更新余额
    vm.startPrank(user);
    amount = 0.5 ether;
    stake.stakeETH{value: amount}();
    vm.stopPrank();

    assertEq(address(user).balance, 1 ether - amount, unicode"user 质押后余额错误");
    assertEq(stake.getUserTotalStaked(user), amount, unicode"user 质押金额错误");
    assertEq(stake.getTotalStaked(), amount, unicode"总质押金额错误");
  }

  // 测试2: 测试多次质押功能
  function testMultiStake() public {

    uint256 amount1 = 0.3 ether;
    uint256 amount2 = 0.2 ether;

    vm.startPrank(user);
    stake.stakeETH{value: amount1}();
    stake.stakeETH{value: amount2}();
    vm.stopPrank();

    assertEq(address(user).balance, 1 ether - amount1 - amount2, unicode"user 多次质押后余额错误");
    assertEq(stake.getUserTotalStaked(user), amount1 + amount2, unicode"user 多次质押金额错误");
    assertEq(stake.getTotalStaked(), amount1 + amount2, unicode"总质押金额错误");
  }

  // 测试3: 测试解除质押功能
  function testUnStake() public {
    // 查询用户之前质押的余额
  }

}
