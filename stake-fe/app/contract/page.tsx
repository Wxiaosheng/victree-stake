'use client';

import { useMemo } from "react";
import { Card, Col, Row, Table } from "antd";
import { formatEther } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { STAKE_ADDRESS } from "../constant";
import abi from '../../abi/victreeStake.json';
import { formatDate } from "../utils";

// 列表时间统一处理
const renderTime = (v: unknown, record: unknown) => {
  const time = Number(record?.result?.[1]) * 1000;
  return formatDate(time);
}

/** 合约相关信息展示 */
const Contract = () => {
  const { address } = useAccount();

  const { data } = useReadContracts({
    contracts: [
      {
        abi, // 替换为你的合约 ABI
        address: STAKE_ADDRESS,
        functionName: 'getUserStakesLeng',
        args: [address],
      },
      {
        abi,
        address: STAKE_ADDRESS,
        functionName: 'getUserUnstakesLeng',
        args: [address],
      },
      {
        abi,
        address: STAKE_ADDRESS,
        functionName: 'ethStake',
        args: [],
      }
    ],
  });

  // 是否获取列表详情
  const getListDisable = useMemo(() => {
    return data?.[0]?.status !== "success";
  }, [data]);

    // ETH 质押总质押量
  const totalStaked = useMemo(() => {
    const ethStake = data?.[2];
    return ethStake?.result?.[0] || 0;
  }, [data?.[2]]);

  // ETH 质押冷静期
  const cooldown = useMemo(() => {
    const ethStake = data?.[2];
    return Number(ethStake?.result?.[1]) || 0;
  }, [data?.[2]]);

  // 质押列表
  const getStakesParams = useMemo(() => {
    const stakesLen = Number(data?.[0].result);
    return Array.from({ length: stakesLen }, (v, k) => ({
      abi,
      address: STAKE_ADDRESS,
      functionName: 'stakes',
      args: [address, k],
    }))
  }, [data?.[0]]);
  const { data: stakes } = useReadContracts({
    contracts: getStakesParams,
    disable: !getListDisable // 读取到列表长度后，再获取具体数据
  });

  // 解除质押列表
  const getUnstakesParams = useMemo(() => {
    const stakesLen = Number(data?.[1].result);
    return Array.from({ length: stakesLen }, (v, k) => ({
      abi,
      address: STAKE_ADDRESS,
      functionName: 'unStakes',
      args: [address, k],
    }))
  }, [data?.[1]]);
    const { data: unStakes } = useReadContracts({
    contracts: getUnstakesParams,
    disable: !getListDisable
  });

  console.log(data, stakes, unStakes, cooldown)

  return <>
    <Row style={{ marginTop: 16, marginBottom: 16 }}>
      <Col span="4" />
      <Col span="8" style={{ fontSize: 24, fontWeight: 600 }}>ETH 总质押量：{formatEther(totalStaked, 'gwei')} （Gwei）</Col>
      <Col span="12" style={{ fontSize: 24, fontWeight: 600 }}>ETH 冷静期：{Number(cooldown) / 60}（分）</Col>
    </Row>
    <Row>
      <Col key="stakes" span="12">
        <Card title="质押列表" variant="borderless">
          <Table
            columns={[
              { 
                title: '质押金额',  
                dataIndex: 'amount', 
                render: (v, record) => {
                  const result: any = record?.result || [];
                  return formatEther(result[0], 'gwei')
                }
              },
              {  title: '质押时间', dataIndex: 'time', render: renderTime },
              {  title: '是否已解除质押', dataIndex: 'flag', render: (v, record) => (record?.result as any)[2] ? '已解除质押' : '质押中' },
            ]}
            dataSource={stakes}
          />
        </Card>
      </Col>
      <Col key="unstakes" span="12">
        <Card title="解除质押列表" variant="borderless">
          <Table
            columns={[
              { 
                title: '解除质押金额',  
                dataIndex: 'amount', 
                render: (v, record) => {
                  const result: any = record?.result || [];
                  return formatEther(result[0], 'gwei')
                }
              },
              {  title: '解除质押时间', dataIndex: 'time', render: renderTime },
              {  title: '是否可提取', dataIndex: 'flag', render: (v, record) => {
                const isCool = (new Date()).getTime() / 1000 - Number((record?.result as any)[1]) < cooldown;

                return isCool ? '冷冻中' : (record?.result as any)[2] ? '已提取' : '可提取'
              } },
            ]}
            dataSource={unStakes}
          />
        </Card>
      </Col>
    </Row>
  </>
}

export default Contract;