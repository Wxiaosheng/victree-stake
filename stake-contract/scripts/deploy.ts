import { network } from "hardhat";

const main = async () => {
  const { viem } = await network.connect({
    network: "hardhatMainnet",
    chainType: "l1",
  });

  const victreeStake = await viem.deployContract("VictreeStake");

  console.log("VictreeStake deployed to:", victreeStake.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});