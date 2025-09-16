'use client';

import { Button, Col, InputNumber, Row, Statistic } from "antd";

export default function Stake() {

  const handleStake = () => {
    console.log("Stake clicked");
  }
  
  return (
    <Row gutter={16} style={{ marginTop: 30 }}>
      <Col span="4"/>
      <Col span="16">
        <Row style={{ marginBottom: 60 }}>
          <Col span="8"/>
          <Statistic title="Stake Amount(ETH)" value={112893} precision={2} />
        </Row>
        
        <Row>
          <Col span="24" >Amount to Stake</Col>
          <Col span="24" style={{ marginBottom: 20, marginTop: 10 }}>
            <InputNumber 
              addonAfter="ETH"
              style={{ width: "100%" }} 
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