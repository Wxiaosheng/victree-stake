// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/** @title VictreeStake
 *  @dev A contract for staking and managing user stakes
 */
contract VictreeStake {
  
  struct ETHStake {
    // 总质押量
    uint256 totalStaked;
    // 冷却期
    uint256 cooldown;
  }

  ETHStake public ethStake;

  struct StakeData {
    uint256 amount;
    uint256 startTime;
    // 是否已解除质押
    bool isUnStaked;
  }

  // 用户质押数据（可多次质押，分别计算奖励）
  mapping(address => StakeData[]) public stakes;

  // 解除质押列表（记录解除时间，判断是否在冷静期内）
  struct UnStakeData {
    uint256 amount;
    uint256 unStakeTime;
    //  是否已提取
    bool isWithdrawn;
  }

  mapping(address => UnStakeData[]) public unStakes;

  // 质押事件
  event Staked(address indexed user, uint256 amount, uint256 timestamp);

  // 取消质押事件
  event UnStaked(address indexed user, uint256 amount, uint256 timestamp);

  constructor() {
    // 初始化 ETH 质押参数
    ethStake = ETHStake({
      totalStaked: 0,
      cooldown: 20 minutes
    });
  }

  // 查询总的质押金额
  function getTotalStaked() public view returns (uint256) {
    return ethStake.totalStaked;
  }

  // 查询用户质押金额
  function getUserTotalStaked(address user) public view returns (uint256) {
    StakeData[] memory userStakes = stakes[user];
    uint256 total = 0;
    for (uint256 i = 0; i < userStakes.length; i++) {
      total += userStakes[i].isUnStaked ? 0 : userStakes[i].amount;
    }
    return total;
  }

  // 质押ETH
  function stakeETH() external payable {
    require(msg.value > 0, unicode"质押金额不能小于0");
    // ! 合约这里不需要检查用户余额，因为如果余额不足，交易会直接失败
    // require(address(msg.sender).balance >= msg.value, unicode"用户余额不足");

    // 记录质押信息
    stakes[msg.sender].push(StakeData({
      amount: msg.value,
      startTime: block.timestamp,
      isUnStaked: false
    }));

    // 更新总质押量
    ethStake.totalStaked += msg.value;

    // 触发质押事件
    emit Staked(msg.sender, msg.value, block.timestamp);
  }

  // 更新质押列表
  function _updateStakeList(address user, uint256 amount) internal {
    StakeData[] storage userStakes = stakes[user];
    
    for (uint256 i = 0; i < userStakes.length; i++) {
      if (userStakes[i].isUnStaked) continue;

      // 如果当前质押金额大于等于要取消的金额
      if (amount >= userStakes[i].amount) {
        amount -= userStakes[i].amount;
        userStakes[i].isUnStaked = true;

        // 如果取消金额为0，直接跳出循环
        if (amount == 0)  break;
      } else {
        // 当前质押金额大于要取消的金额，直接扣除
        userStakes[i].amount -= amount;
        break;
      }
    }
  }

  // 取消质押
  function unStakeETH(uint256 amount) external {
    require(amount > 0, unicode"取消质押金额不能小于0");
    uint256 userTotalStaked = getUserTotalStaked(msg.sender);
    require(userTotalStaked >= amount, unicode"取消质押金额不能大于已质押金额");

    unStakes[msg.sender].push(UnStakeData({
      amount: amount,
      unStakeTime: block.timestamp,
      isWithdrawn: false
    }));

    // 更新总质押量 和 用户质押列表
    ethStake.totalStaked -= amount;
    _updateStakeList(msg.sender, amount);

    // 触发取消质押事件
    emit UnStaked(msg.sender, amount, block.timestamp);
  }

  // 查询解除质押金额
  function _getUserTotalUnStaked(address user) internal view returns (uint256[2] memory) {
    UnStakeData[] memory userUnStakes = unStakes[user];
    uint256 cooldownTotal = 0;
    uint256 withdrawableTotal = 0;

    for (uint256 i = 0; i < userUnStakes.length; i++) {
      if (userUnStakes[i].isWithdrawn) continue;

      uint256 duration = block.timestamp - userUnStakes[i].unStakeTime;
      // 如果在冷静期内且未提取
      if (duration < ethStake.cooldown) {
        cooldownTotal += userUnStakes[i].amount;
      }
      
      if (duration >= ethStake.cooldown) {
        withdrawableTotal += userUnStakes[i].amount;
      }
    }
    return [cooldownTotal, withdrawableTotal];
  }

  // 查询冷静期金额
  function getCooldownAmount(address user) public view returns (uint256) {
    uint256[2] memory userUnStaked = _getUserTotalUnStaked(user);
    return userUnStaked[0];
  }

  // 查询可提取金额
  function getWithdrawableAmount(address user) public view returns (uint256) {
    uint256[2] memory userUnStaked = _getUserTotalUnStaked(user);
    return userUnStaked[1];
  }

  // 更新解除质押列表
  function _updateUnStakeList(address user, uint256 amount) internal {
    UnStakeData[] storage userUnStakes = unStakes[user];

    for (uint256 i = 0; i < userUnStakes.length; i++) {
      if (userUnStakes[i].isWithdrawn) continue;
      uint256 duration = block.timestamp - userUnStakes[i].unStakeTime;
      // 如果在冷静期内，跳过
      if (duration < ethStake.cooldown) continue;
      // 如果当前解除质押金额大于等于要提取的金额
      if (amount >= userUnStakes[i].amount) {
        amount -= userUnStakes[i].amount;
        userUnStakes[i].isWithdrawn = true;

        if (amount == 0) break;
      } else {
        userUnStakes[i].amount -= amount;
        break;
      }
    }
  }

  // 提取解除质押的ETH
  function withdrawUnStakedETH(uint256 amount) external {
    uint256 withdrawableAmount = getWithdrawableAmount(msg.sender);
    require(withdrawableAmount > 0, unicode"没有可提取的金额");
    require(amount > 0, unicode"提取金额不能小于0");
    require(withdrawableAmount >= amount, unicode"提取金额不能大于可提取金额");
    require(address(this).balance >= withdrawableAmount, unicode"合约余额不足");

    // 更新解除质押列表
    _updateUnStakeList(msg.sender, amount);
    
    // 提取资金
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, unicode"提取失败");

    // 更新解除质押列表状态
    emit UnStaked(msg.sender, amount, block.timestamp);
  }

}
