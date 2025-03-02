import contractAbi from "./abi/auction_factory.json";
import erc20abi from "./abi/ierc20.json";
import erc721abi from "./abi/ierc721.json";
import english_auction_abi from "./abi/english_auction.json";
import dutch_auction_abi from "./abi/dutch_auction.json";
import IAuctionAbi from "./abi/iauction.json";


interface Config {
  rpcUrl: string;
  contractAddress: string;
  contractAbi: any;
  erc20Abi: any;
  erc721Abi: any;
  englishAuctionAbi: any;
  dutchAuctionAbi: any;
  IAuctionAbi: any;
  apiUrl: string; // Added API URL
}

export const config: Config = {
  rpcUrl: import.meta.env.VITE_RPC_URL || '',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  contractAbi: contractAbi,
  erc20Abi: erc20abi,
  erc721Abi: erc721abi,
  englishAuctionAbi: english_auction_abi,
  dutchAuctionAbi: dutch_auction_abi,
  IAuctionAbi: IAuctionAbi,
  apiUrl: 'https://cleanly-engaging-pegasus.ngrok-free.app', // Server API URL
};


if (!config.rpcUrl || !config.contractAddress) {
  throw new Error('Missing required environment variables');
}

console.log("Loaded Config:", config);