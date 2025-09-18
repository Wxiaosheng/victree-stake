'use client';

import { useState } from "react";
import { Button, Col, InputNumber, Row, Statistic } from "antd";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import abi from '../../abi/victreeStake.json';

export default function Stake() {
  const [stakeAmount, setStakeAmount] = useState<number | undefined>(undefined);

  // 当前用户
  const { address } = useAccount();

  // 当前用户余额
  const balance = useBalance({ address });
  const userBalance = balance.data?.value ? formatEther(balance.data.value) : 0;

  // 当前用户质押金额
  const userStaked = useReadContract({
    abi, // 替换为你的合约 ABI
    functionName: 'getUserTotalStaked',
    args: [address],
    address: '0xa9eC99e4e4566B029e8770d441AF2f2246581751', // 替换为你的合约地址
  });
  const userStakeAmount = userStaked.data ? formatEther(userStaked.data as bigint) : 0;

  // 可改合约实例
  const { writeContract } = useWriteContract();

  const handleStake = () => {
    if (!stakeAmount || stakeAmount <= 0) {
      alert("Please input a valid stake amount");
      return;
    }
    if (parseFloat(userBalance as string) < stakeAmount) {
      alert("Insufficient balance");
      return;
    }

    // 调用合约的 stakeETH 方法进行质押
    writeContract({
      abi,
      address: '0xa9eC99e4e4566B029e8770d441AF2f2246581751', // 替换为你的合约地址
      functionName: 'stakeETH',
      args: [],
      value: parseEther(`${stakeAmount}`),
    });

  }
  
  return (
    <Row gutter={16} style={{ marginTop: 30 }}>
      <Col span="4"/>
      <Col span="16">
        <Row style={{ marginBottom: 60 }}>
          <Col span="12">
            <Statistic title="Sepolia Amount(ETH)" value={userBalance} />
          </Col>
          <Col span="12">
            <Statistic title="Stake Amount(ETH)" value={userStakeAmount} />
          </Col>
        </Row>
        
        <Row>
          <Col span="24" >Amount to Stake</Col>
          <Col span="24" style={{ marginBottom: 20, marginTop: 10 }}>
            <InputNumber
              min={0}
              addonAfter="ETH"
              style={{ width: "100%" }} 
              value={stakeAmount}
              onChange={(value) => setStakeAmount(value || 0)}
              placeholder="Please input amount to stake" 
            />
          </Col>
        </Row>

        <Row justify="center">
          <Button type="primary" onClick={handleStake}>Stake</Button>
        </Row>
      </Col>
      <Col span="4"/>
    </Row>
  );
}