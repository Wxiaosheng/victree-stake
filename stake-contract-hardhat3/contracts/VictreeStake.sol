// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/** @title VictreeStake
 *  @dev A contract for staking and managing user stakes
 */
contract VictreeStake is Initializable, UUPSUpgradeable, OwnableUpgradeable {
  
  struct ETHStake {
    // 总质押量
    uint256 totalStaked;
    // 冷却期
    uint256 cooldown;
  }

  ETHStake public ethStake;

  struct StakeData {
    // 原始质押金额
    uint256 originAmount;
    // 已取消质押金额
    uint256 unstakeAmount;
    uint256 startTime;
  }

  // 用户质押数据（可多次质押，分别计算奖励）
  mapping(address => StakeData[]) public stakes;

  // 解除质押列表（记录解除时间，判断是否在冷静期内）
  struct UnStakeData {
    // 原始解除质押金额
    uint256 originAmount;
    // 已提取金额
    uint256 withdrawAmount;
    uint256 unStakeTime;
  }

  mapping(address => UnStakeData[]) public unStakes;

  // 质押事件
  event Staked(address indexed user, uint256 amount, uint256 timestamp);

  // 取消质押事件
  event UnStaked(address indexed user, uint256 amount, uint256 timestamp);

  function initialize() public initializer {
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();
    
    // 初始化 ETH 质押参数
    ethStake = ETHStake({
      totalStaked: 0,
      cooldown: 20 minutes
    });
  }

  // 空实现，只依赖 onlyOwner 修饰符
  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  // 查询总的质押金额
  function getTotalStaked() public view returns (uint256) {
    return ethStake.totalStaked;
  }

  // 查询用户质押金额
  function getUserTotalStaked(address user) public view returns (uint256) {
    StakeData[] memory userStakes = stakes[user];
    uint256 total = 0;
    for (uint256 i = 0; i < userStakes.length; i++) {
      // 质押金额 = 原始质押金额 - 已解除质押金额
      uint256 stakeAmount = userStakes[i].originAmount - userStakes[i].unstakeAmount;
      total += stakeAmount;
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
      originAmount: msg.value,
      unstakeAmount: 0,
      startTime: block.timestamp
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
      // 如果当前质押金额大于等于要取消的金额
      if (amount >= userStakes[i].originAmount) {
        amount -= userStakes[i].originAmount;
        userStakes[i].unstakeAmount = userStakes[i].originAmount;
        // 如果取消金额为0，直接跳出循环
        if (amount == 0)  break;
      } else {
        // 当前质押金额大于要取消的金额，直接扣除
        userStakes[i].unstakeAmount += amount;
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
      originAmount: amount,
      withdrawAmount: 0,
      unStakeTime: block.timestamp
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
      // 冷静期可提取金额 = unstake 金额 - 已提取金额
      uint256 cooldownAmount = userUnStakes[i].originAmount - userUnStakes[i].withdrawAmount;
      // 冷静时间
      uint256 duration = block.timestamp - userUnStakes[i].unStakeTime;

      // 如果在冷静期内且未提取
      if (duration < ethStake.cooldown) {
        // 冷静期内，cooldownAmount 肯定等于 originAmount
        cooldownTotal += cooldownAmount;
      }
      
      // 超过冷静期
      if (duration >= ethStake.cooldown) {
        withdrawableTotal += cooldownAmount;
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
      uint256 duration = block.timestamp - userUnStakes[i].unStakeTime;
      // 如果在冷静期内，跳过
      if (duration < ethStake.cooldown) continue;

      // 如果要提取的金额 大于等于 当前解除质押金额，则本条数据全都提取，并更新要提取金额
      if (amount >= userUnStakes[i].originAmount) {
        amount -= userUnStakes[i].originAmount;
        userUnStakes[i].withdrawAmount = userUnStakes[i].originAmount;

        if (amount == 0) break;
      } else {
        // 如果要提取金额 小于 当前解除质押金额，则直接更新当条记录的提取金额
        userUnStakes[i].withdrawAmount += amount;
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

   // 获取用户的质押列表的长度
  function getUserStakesLeng() external view returns (uint256) {
    return stakes[msg.sender].length;
  }
  function getUserStakesLeng(address user) external view returns (uint256) {
    return stakes[user].length;
  }

  // 获取用户的解除质押列表的长度
    function getUserUnstakesLeng() external view returns (uint256) {
    return unStakes[msg.sender].length;
  }
  function getUserUnstakesLeng(address user) external view returns (uint256) {
    return unStakes[user].length;
  }

}
