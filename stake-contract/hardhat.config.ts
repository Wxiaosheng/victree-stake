import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      // private key: 0x0f2462d6a79cac43ea6ab6a925bf21f7065c79e6760539639550cb576914f7e1
      // address: 0xD1E6059628422DB5093f9862C1a007a71748Cb40
      accounts: ["0x0f2462d6a79cac43ea6ab6a925bf21f7065c79e6760539639550cb576914f7e1"],
    },
  },
};

export default config;
