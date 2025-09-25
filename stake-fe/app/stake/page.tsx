'use client';

import { useMemo, useState } from "react";
import { Button, Col, InputNumber, Row, Statistic } from "antd";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import { STAKE_ADDRESS } from "../constant";
import abi from '../../abi/victreeStake.json';

export default function Stake() {
  const [loading, setLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<number | undefined>(undefined);

  // 当前用户
  const { address } = useAccount();

  // 当前用户余额
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const userBalance = useMemo(() => {
    return balance?.value ? formatEther(balance.value, 'gwei') : 0;
  }, [balance]);

  // 当前用户质押金额
  const { data: totalStake, refetch: refetchTotalStake } = useReadContract({
    abi, // 替换为你的合约 ABI
    functionName: 'getUserTotalStaked',
    args: [address],
    address: STAKE_ADDRESS, // 替换为你的合约地址
  });

  const userStakeAmount = useMemo(() => {
    return totalStake ? formatEther(totalStake as bigint, 'gwei') : 0
  }, [totalStake]);

  // 可改合约实例
  const { writeContract } = useWriteContract();

  /**
   * 质押 ETH
   */
  const handleStake = () => {
    if (!stakeAmount || stakeAmount <= 0) {
      alert("Please input a valid stake amount");
      return;
    }
    if (parseFloat(userBalance as string) < stakeAmount) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);

    // 调用合约的 stakeETH 方法进行质押
    writeContract({
      abi,
      address: STAKE_ADDRESS,
      functionName: 'stakeETH',
      args: [],
      value: parseEther(`${stakeAmount}`, 'gwei'),
    }, {
      onSuccess(data, variables, context) {
        console.log('✅ 质押成功！')
        refetchBalance();
        refetchTotalStake();
        setLoading(false);
      },
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
              addonAfter="Gwei"
              style={{ width: "100%" }} 
              value={stakeAmount}
              onChange={(value) => setStakeAmount(value || 0)}
              placeholder="Please input amount to stake" 
            />
          </Col>
        </Row>

        <Row justify="center">
          <Button loading={loading} type="primary" onClick={handleStake}>Stake</Button>
        </Row>
      </Col>
      <Col span="4"/>
    </Row>
  );
}