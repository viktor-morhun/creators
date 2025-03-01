import { ethers } from "ethers";

import { config } from "../config.ts";

const provider = new ethers.JsonRpcProvider(config.rpcUrl);

const FactoryContract = new ethers.Contract(
  config.contractAddress,
  config.contractAbi,
  provider
);


// Auction types
export interface AuctionItem {
  id: string;
  auction_address: string;
  owner_address: string;
  asset_address: string;
  currentBid: number;
  auctionType: 'english' | 'dutch' | 'sealed' | 'timed';
  tokenType: 'ERC721' | 'ERC1155' | 'ERC20' | 'physical';
  endTime: string;
}


async function getAllAuctions(
  limit: number
): Promise<SubmissionStatus> {
  try {

    const auctions: SubmissionStatus = await contract.getAllAuctions();
    return status;
  } catch (error) {
    console.error("Error getting all auctions:", error);
    throw new Error("Failed to get all auctions");
  }
}
