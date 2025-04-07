/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  10143: {
    YourContract: {
      address: "0x008177c9f3fb89b367bd4b3e1353d24d372dde8a",
      abi: [
        {
          type: "fallback",
          stateMutability: "payable",
        },
        {
          type: "receive",
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "counter",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "increment",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1742920047.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
  20143: {
    YourContract: {
      address: "0x927d45fb81b1b14dc4e8de8f62930d5c33a43d22",
      abi: [
        {
          type: "fallback",
          stateMutability: "payable",
        },
        {
          type: "receive",
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "counter",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "increment",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1738056711.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
