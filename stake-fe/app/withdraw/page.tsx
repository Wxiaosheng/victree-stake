'use client';

import { useState } from "react";
import { Button, Col, InputNumber, Row, Statistic } from "antd";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

export default function Withdraw() {
  const { address, isConnected } = useAccount();
  const [unstakeAmount, setUnstakeAmount] = useState<number | null>();
  const [withdrawAmount, setWithdrawAmount] = useState<number | null>();

  const handleUnstake = () => {
    console.log("User address:", address);
    console.log("Is connected:", isConnected);
    if (!isConnected) {
      throw new Error("Please connect your wallet first");
    }

    const amount = parseEther(`${unstakeAmount || 0}`);
    console.log("Unstake clicked", amount);
  }
  
  const handleWithdraw = () => {
    console.log("User address:", address);
    console.log("Is connected:", isConnected);
    if (!isConnected) {
      throw new Error("Please connect your wallet first");
    }

    const amount = parseEther(`${withdrawAmount || 0}`);
    console.log("Withdraw clicked", amount);
  }

  return (<>
    <Row gutter={[16, 16]} style={{ marginTop: 30 }} >
      <Col span={8} className="text-center">
        <Statistic 
          value={112893} 
          precision={2} 
          title={<>
            <p className="text-blue-500 text-2xl">质押金额(ETH)</p>
            <p className="text-sm text-gray-500 mt-1">质押金额是指您当前质押在合约中的总金额。</p>
          </>} 
        />
      </Col>
      <Col span={8} className="text-center">
        <Statistic
          value={112893} 
          precision={2} 
          title={<>
            <p className="text-blue-500 text-2xl font-weight-bold">锁定金额(ETH)</p>
            <p className="text-sm text-gray-500 mt-1">锁定金额是指您解除质押后存在 20 min 的冷静期，冷静期内您无法提取该金额。</p>
          </>} 
        />
      </Col>
      <Col span={8} className="text-center">
        <Statistic 
          value={112893} 
          precision={2} 
          title={<>
            <p className="text-blue-500 text-2xl font-weight-bold">可提取金额(ETH)</p>
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
          addonAfter="ETH"
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
          addonAfter="ETH"
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
