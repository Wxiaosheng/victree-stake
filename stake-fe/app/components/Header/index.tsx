'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

/**
 * 质押系统头部
 */
const Header = () => {
  const router = useRouter();

  return <header className="flex justify-between p-1 border-b border-blue-500 bg-gray-100">
    <div className="flex items-center text-blue-400">Victree Stake</div>
    <div className="flex space-x-4 text-blue-500 items-center">
      <span className="cursor-pointer" onClick={() => router.push('/stake')}>stake</span>
      <span className="cursor-pointer" onClick={() => router.push('/withdraw')}>withdraw</span>
      <span className="cursor-pointer" onClick={() => router.push('/contract')}>contract</span>
    </div>
    <ConnectButton />
  </header>;
}

export default Header;
