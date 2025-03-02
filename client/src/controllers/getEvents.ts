import { ethers } from 'ethers';
import { config } from '../config.ts';
import {getNFTMetadata, NFTMetadata, getERC20Metadata, ERC20Metadata} from "./getToken.ts";


// Define the Infura provider
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

// Event signatures for filtering
const AUCTION_CREATED_TOPIC = ethers.id('AuctionCreated(uint256,address,uint8,address)');
const BID_PLACED_TOPIC = ethers.id('BidPlaced(address,uint256)');
enum AssetType {
  ERC20 = 0,
  ERC721 = 1,
}

// Interface for AuctionCreated event
export interface AuctionCreatedEvent {
  auctionId: string;
  auctionAddress: string;
  auctionType: number; // 0 for English, 1 for Dutch
  seller: string;
  blockNumber: number;
}

// Interface for BidPlaced event
export interface BidPlacedEvent {
  bidder: string;
  amount: string; // In wei
  blockNumber: number;
}

// Interface for Auction Details from getAuctionDetails
export interface AuctionDetails {
  seller: string;
  highestBidder: string;
  highestBid: string; // In wei
  endTime: number; // Unix timestamp
  ended: boolean;
  assetAddress: string;
  assetType: AssetType;
  assetId: number;
  amount: string; // In wei
  paymentToken: string;
  type: number; // 0 for English, 1 for Dutch
  nft?: NFTMetadata; // Optional NFT metadata
  erc20?: ERC20Metadata; // Optional ERC20 metadata
}


async function checkApproval(
  assetType: AssetType,
  assetAddress: string,
  owner: string,
  target: string,
  assetId?: number, // Optional, required for ERC721 and
  amount?: string // Optional, required for ERC20 and in wei
): Promise<boolean> {
  try {
    if (assetType === AssetType.ERC20) {
      if (!amount) throw new Error('Amount is required for ERC20');
      const tokenContract = new ethers.Contract(assetAddress, config.erc20Abi, provider);
      const allowance = await tokenContract.allowance(owner, target);
      return allowance >= BigInt(amount); // Compare with required amount
    } else if (assetType === AssetType.ERC721) {
      if (assetId === undefined) throw new Error('assetId is required for ERC721');
      const nftContract = new ethers.Contract(assetAddress, config.erc721Abi, provider);
      const approvedAddress = await nftContract.getApproved(assetId);
      return approvedAddress.toLowerCase() === target.toLowerCase();
    } else {
      throw new Error('Unsupported asset type');
    }
  } catch (error) {
    console.error('Error checking approval:', error);
    return false; // Return false if there's an error (e.g., contract call fails)
  }
}


async function getAuctions(
    pageSize: number = 10,
    pageNumber: number = 0,
    fromBlock: number = 0,
    toBlock: number | 'latest' = 'latest'
    ): Promise<AuctionCreatedEvent[]> {
    // Filter for AuctionCreated events
    const filter = {
        address: config.contractAddress,
        topics: [AUCTION_CREATED_TOPIC],
        fromBlock,
        toBlock,
    };

    // Fetch logs from Infura
    const logs = await provider.getLogs(filter);

    // Parse logs into AuctionCreatedEvent objects
    const auctions: AuctionCreatedEvent[] = logs.map((log) => {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256', 'address', 'uint8', 'address'],
        log.data
        );
        return {
        auctionId: decoded[0].toString(),
        auctionAddress: decoded[1],
        auctionType: decoded[2],
        seller: decoded[3],
        blockNumber: log.blockNumber,
        };
    });

    // Sort by block number (newest first)
    auctions.sort((a, b) => b.blockNumber - a.blockNumber);

    // Apply pagination
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;
    return auctions.slice(startIndex, endIndex);
    }

async function getUserAuctions(
  sellerAddress: string,
  pageSize: number = 10,
  pageNumber: number = 0,
  fromBlock: number = 0,
  toBlock: number | 'latest' = 'latest'
): Promise<AuctionCreatedEvent[]> {
  // Filter for AuctionCreated events with seller address as the 4th topic
  const filter = {
    address: config.contractAddress,
    topics: [
      AUCTION_CREATED_TOPIC,
      null, // auctionId (not filtered)
      null, // auctionAddress (not filtered)
      ethers.zeroPadValue(sellerAddress, 32), // Filter by seller
    ],
    fromBlock,
    toBlock,
  };

  // Fetch logs from rpc
  const logs = await provider.getLogs(filter);

  // Parse logs into AuctionCreatedEvent objects
  const auctions: AuctionCreatedEvent[] = logs.map((log) => {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
      ['uint256', 'address', 'uint8', 'address'],
      log.data
    );
    return {
      auctionId: decoded[0].toString(),
      auctionAddress: decoded[1],
      auctionType: decoded[2],
      seller: decoded[3],
      blockNumber: log.blockNumber,
    };
  });

  // Sort by block number (newest first)
  auctions.sort((a, b) => b.blockNumber - a.blockNumber);

  // Apply pagination
  const startIndex = pageNumber * pageSize;
  const endIndex = startIndex + pageSize;
  return auctions.slice(startIndex, endIndex);
}

async function getAuctionBids(
  auctionAddress: string,
  pageSize: number = 10,
  pageNumber: number = 0,
  fromBlock: number = 0,
  toBlock: number | 'latest' = 'latest'
): Promise<BidPlacedEvent[]> {
  // Filter for BidPlaced events from the auction contract
  const filter = {
    address: auctionAddress,
    topics: [BID_PLACED_TOPIC],
    fromBlock,
    toBlock,
  };

  // Fetch logs from Infura
  const logs = await provider.getLogs(filter);

  // Parse logs into BidPlacedEvent objects
  const bids: BidPlacedEvent[] = logs.map((log) => {
    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['address', 'uint256'], log.data);
    return {
      bidder: decoded[0],
      amount: decoded[1].toString(),
      blockNumber: log.blockNumber,
    };
  });

  // Sort by block number (newest first)
  bids.sort((a, b) => b.blockNumber - a.blockNumber);

  // Apply pagination
  const startIndex = pageNumber * pageSize;
  const endIndex = startIndex + pageSize;
  return bids.slice(startIndex, endIndex);
}

async function getAuctionDetails(auctionAddress: string): Promise<AuctionDetails> {
  const auctionContract = new ethers.Contract(auctionAddress, config.IAuctionAbi, provider);
  const details = await auctionContract.getAuctionDetails();
  const result: AuctionDetails = {
    seller: details[0],
    highestBidder: details[1],
    highestBid: details[2].toString(),
    endTime: Number(details[3]),
    ended: details[4],
    assetAddress: details[5],
    assetType: Number(details[6]),  // 0 for ERC20, 1 for ERC721
    assetId: Number(details[7]),
    amount: details[8].toString(),
    paymentToken: details[9],
    type: details[10],
  };
  if (result.assetType === 1) { // ERC721 или ERC1155
    result.nft = await getNFTMetadata(result.assetAddress, result.assetId);
  } else {
    result.erc20 = await getERC20Metadata(result.assetAddress);
  }
    return result;
}

export {
  checkApproval,
  getUserAuctions,
  getAuctionBids,
  getAuctionDetails,
  getAuctions,
};