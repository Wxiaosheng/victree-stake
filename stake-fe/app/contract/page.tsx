'use client';

import { useAccount, useReadContracts } from "wagmi";
import { STAKE_ADDRESS } from "../constant";
import abi from '../../abi/victreeStake.json';
import { useMemo } from "react";
import { Card, Table } from "antd";
import { formatEther } from "viem";

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
      }
    ],
  });

  // 是否获取列表详情
  const getListDisable = useMemo(() => {
    return data?.[0]?.status !== "success";
  }, [data]);

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

  return <div>
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
          {  title: '质押时间', dataIndex: 'time', render: (v, record) => (record?.result as any)[1] },
          {  title: '是否已解除质押', dataIndex: 'flag', render: (v, record) => (record?.result as any)[2] ? '已解除质押' : '质押中' },
        ]}
        dataSource={stakes}
      />
    </Card>
    
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
          {  title: '解除质押时间', dataIndex: 'time', render: (v, record) => (record?.result as any)[1] },
          {  title: '是否可提取', dataIndex: 'flag', render: (v, record) => (record?.result as any)[2] ? '可提取' : '冷冻中' },
        ]}
        dataSource={unStakes}
      />
    </Card>
  </div>
}

export default Contract;