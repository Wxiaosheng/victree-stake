'use client';

import { useMemo, useState } from "react";
import { Button, Col, InputNumber, Row, Statistic } from "antd";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContracts, useWatchContractEvent, useWriteContract } from "wagmi";
import { STAKE_ADDRESS } from "../constant";
import abi from '../../abi/victreeStake.json';

export default function Withdraw() {
  const { address, isConnected } = useAccount();
  const [unstakeAmount, setUnstakeAmount] = useState<number | null>();
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>();

  // 当前用户质押金额
  const { data, refetch } = useReadContracts({
    contracts: [
      { // 质押金额
        abi, // 替换为你的合约 ABI
        address: STAKE_ADDRESS,
        functionName: 'getUserTotalStaked',
        args: [address],
      },
      { // 锁定金额
        abi,
        address: STAKE_ADDRESS,
        functionName: 'getCooldownAmount',
        args: [address],
      },
      { // 可提取金额
        abi,
        address: STAKE_ADDRESS,
        functionName: 'getWithdrawableAmount',
        args: [address],
      }
    ]
  });

  // 质押金额、锁定金额、可提取金额
  const [staked, cooldown, withdraw] = useMemo(() => {
    const [staked, cooldown, withdraw] = data || [];

    return [
      staked ? formatEther(staked.result as bigint, 'gwei') : 0,
      cooldown ? formatEther(cooldown.result as bigint, 'gwei') : 0,
      withdraw ? formatEther(withdraw.result as bigint, 'gwei') : 0,
    ];
  }, [data]);

  // 监听 StakeChanged 事件，实时更新质押金额
  useWatchContractEvent({
    address: STAKE_ADDRESS,
    abi,
    eventName: 'UnStaked',
    onLogs(logs) {
      console.log('UnStaked event:', logs);
      alert('UnStaked event: ' + JSON.stringify(logs));
    },
  })
  
  const { writeContract } = useWriteContract();

  /**
   * 解除质押
   */
  const handleUnstake = () => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first");
    }

    const amount = parseEther(`${unstakeAmount || 0}`, 'gwei');
    
    writeContract({
      abi,
      address: STAKE_ADDRESS, // 替换为你的合约地址
      functionName: 'unStakeETH',
      args: [amount],
    }, {
      onSuccess() {
        // 刷新相关金额
        refetch();
      },
    });
  }
  
  /**
   * 提取质押金额
   */
  const handleWithdraw = () => {
    console.log("User address:", address);
    console.log("Is connected:", isConnected);
    if (!isConnected) {
      throw new Error("Please connect your wallet first");
    }

    const amount = parseEther(`${withdrawAmount || 0}`, 'gwei');
    writeContract({
      abi,
      address: STAKE_ADDRESS, // 替换为你的合约地址
      functionName: 'withdrawUnStakedETH',
      args: [amount],
    }, {
      onSuccess: () => {
        console.log("解除质押成功")
      }
    });
  }

  return (<>
    <Row gutter={[16, 16]} style={{ marginTop: 30 }} >
      <Col span={8} className="text-center">
        <Statistic 
          value={staked} 
          title={<>
            <p className="text-blue-500 text-2xl">质押金额(Gwei)</p>
            <p className="text-sm text-gray-500 mt-1">质押金额是指您当前质押在合约中的总金额。</p>
          </>} 
        />
      </Col>
      <Col span={8} className="text-center">
        <Statistic
          value={cooldown} 
          title={<>
            <p className="text-blue-500 text-2xl font-weight-bold">锁定金额(Gwei)</p>
            <p className="text-sm text-gray-500 mt-1">锁定金额是指您解除质押后存在 20 min 的冷静期，冷静期内您无法提取该金额。</p>
          </>} 
        />
      </Col>
      <Col span={8} className="text-center">
        <Statistic 
          value={withdraw} 
          title={<>
            <p className="text-blue-500 text-2xl font-weight-bold">可提取金额(Gwei)</p>
            <p className="text-sm text-gray-500 mt-1">可提取金额是指解除质押后，超过冷静期的，可以立即提取的金额。</p>
          </>} 
        />
      </Col>
    </Row>

    <Row gutter={[16, 60]} className="mt-16" >
      <Col span={8}/>
      <Col span={12}>
        <InputNumber
          min={0}
          addonAfter="Gwei"
          style={{ width: "50%" }} 
          value={unstakeAmount}
          onChange={(value) => setUnstakeAmount(value)}
          placeholder="please input amount to unstake"
        />
        <Button type="primary" className="ml-4" onClick={handleUnstake}>Unstake</Button>
        <p className="mt-2">解除质押，需要等待 20 min 的锁定期，锁定期结束后，您可以提取您的质押金额。</p>
      </Col>
    </Row>
    
    <Row gutter={[16, 60]} className="mt-16" >
      <Col span={8}/>
      <Col span={12}>
        <InputNumber
          min={0}
          addonAfter="Gwei"
          style={{ width: "50%" }} 
          value={withdrawAmount}
          onChange={(value) => setWithdrawAmount(value)}
          placeholder="please input amount to Withdraw"
        />
        <Button type="primary" className="ml-4" onClick={handleWithdraw}>Withdraw</Button>
        <p className="mt-2">
          提取质押金额，提取后，您的质押金额将会减少，相应的锁定金额也会减少。
        </p>
      </Col>
    </Row>
  </>);
}
