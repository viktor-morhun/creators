import contractAbi from "./abi/chain_contract.json";

interface Config {
  rpcUrl: string;
  contractAddress: string;
  contractAbi: any;
}

export const config: Config = {
  rpcUrl: import.meta.env.VITE_RPC_URL || '',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  contractAbi: contractAbi,
};


if (!config.rpcUrl || !config.contractAddress) {
  throw new Error('Missing required environment variables');
}

console.log("Loaded Config:", config);