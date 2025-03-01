import { ethers } from 'ethers';
import { config } from '../config.ts';


// Define the Infura provider
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

// Event signatures for filtering
const AUCTION_CREATED_TOPIC = ethers.id('AuctionCreated(uint256,address,uint8,address)');
const BID_PLACED_TOPIC = ethers.id('BidPlaced(address,uint256)');

// Interface for AuctionCreated event
interface AuctionCreatedEvent {
  auctionId: string;
  auctionAddress: string;
  auctionType: number; // 0 for English, 1 for Dutch
  seller: string;
  blockNumber: number;
}

// Interface for BidPlaced event
interface BidPlacedEvent {
  bidder: string;
  amount: string; // In wei
  blockNumber: number;
}

// Interface for Auction Details from getAuctionDetails
interface AuctionDetails {
  seller: string;
  highestBidder: string;
  highestBid: string; // In wei
  endTime: number; // Unix timestamp
  ended: boolean;
  assetAddress: string;
  assetId: number;
  amount: string; // In wei
  paymentToken: string;
  type: number; // 0 for English, 1 for Dutch
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
  return {
    seller: details[0],
    highestBidder: details[1],
    highestBid: details[2].toString(),
    endTime: Number(details[3]),
    ended: details[4],
    assetAddress: details[5],
    assetId: Number(details[6]),
    amount: details[7].toString(),
    paymentToken: details[8],
    type: details[9],
  };
}