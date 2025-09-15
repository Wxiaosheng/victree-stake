import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Stake() {
  return (
    <div>
      <header className="flex justify-between p-4 border-b">
        <div className="flex items-center">Victree Stake</div>
        <ConnectButton />
      </header>
    </div>
  );
}