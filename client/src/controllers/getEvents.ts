import { ethers } from 'ethers';
import { config } from '../config.ts';

// Define the provider (still needed for some operations like approval checking)
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

// API server URL
const API_URL = config.apiUrl;
const apiHeaders = {
  'ngrok-skip-browser-warning': 'true'
};

// Enums and static values
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
  status?: 'active' | 'ended';
  imageUrl?: string;
  title?: string;
  description?: string;
  currencySymbol?: string;
  currencyImageUrl?: string;
  highestBid?: string;
  highestBidder?: string;
  endTime?: number;
}

// Interface for BidPlaced event
export interface BidPlacedEvent {
  bidder: string;
  amount: string; // In wei
  blockNumber: number;
  timestamp?: number;
}

// Interface for Auction Details from getAuctionDetails
export interface AuctionDetails {
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
  status?: 'active' | 'ended';
  imageUrl?: string;
  title?: string;
  description?: string;
  currencySymbol?: string;
  currencyName?: string;
  currencyImageUrl?: string;
  currencyDecimals?: number;
  bidCount?: number;
  reservePrice?: string; // For Dutch auctions
  currentPrice?: string; // For Dutch auctions
}

/**
 * Get auctions from the server API
 * @param pageSize Number of auctions per page
 * @param pageNumber Page number (0-indexed)
 * @param status Optional filter by status ('active' or 'ended')
 * @returns Promise<AuctionCreatedEvent[]>
 */
async function getAuctions(
  pageSize: number = 10,
  pageNumber: number = 0,
  status?: 'active' | 'ended'
): Promise<AuctionCreatedEvent[]> {
  try {
    let url = `${API_URL}/auctions?page=${pageNumber}&page_size=${pageSize}`;
    
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, { headers: apiHeaders });
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    const auctions = await response.json();
    return auctions.map((auction: any) => ({
      auctionId: auction.auctionId,
      auctionAddress: auction.auctionAddress,
      auctionType: auction.auctionType,
      seller: auction.seller,
      blockNumber: auction.blockNumber || 0,
      status: auction.status,
      imageUrl: auction.imageUrl,
      title: auction.title,
      description: auction.description,
      currencySymbol: auction.currencySymbol,
      currencyImageUrl: auction.currencyImageUrl
    }));
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return [];
  }
}

/**
 * Get auctions count from the server
 */
async function getAuctionsCount(): Promise<{ total: number, active: number, ended: number }> {
  try {
    const response = await fetch(`${API_URL}/auctions/count`, { headers: apiHeaders });
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching auction counts:', error);
    return { total: 0, active: 0, ended: 0 };
  }
}

/**
 * Get auctions from a specific seller
 */
async function getUserAuctions(
  sellerAddress: string,
  pageSize: number = 10,
  pageNumber: number = 0
): Promise<AuctionCreatedEvent[]> {
  try {
    const response = await fetch(
      `${API_URL}/auctions?seller=${sellerAddress}&page=${pageNumber}&page_size=${pageSize}`,
      { headers: apiHeaders }
    );
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    const auctions = await response.json();
    return auctions.map((auction: any) => ({
      auctionId: auction.auctionId,
      auctionAddress: auction.auctionAddress,
      auctionType: auction.auctionType,
      seller: auction.seller,
      blockNumber: auction.blockNumber || 0,
      status: auction.status,
      imageUrl: auction.imageUrl,
      title: auction.title,
      description: auction.description,
      currencySymbol: auction.currencySymbol,
      currencyImageUrl: auction.currencyImageUrl
    }));
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    return [];
  }
}

/**
 * Get bids for a specific auction
 */
async function getAuctionBids(
  auctionId: string,
  pageSize: number = 10,
  pageNumber: number = 0
): Promise<BidPlacedEvent[]> {
  try {
    const response = await fetch(
      `${API_URL}/auctions/${auctionId}/bids?page=${pageNumber}&page_size=${pageSize}`,
      { headers: apiHeaders }
    );
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    const bids = await response.json();
    return bids.map((bid: any) => ({
      bidder: bid.bidder,
      amount: bid.amount,
      blockNumber: bid.blockNumber,
      timestamp: bid.timestamp
    }));
  } catch (error) {
    console.error('Error fetching auction bids:', error);
    return [];
  }
}

/**
 * Get details about a specific auction
 */
async function getAuctionDetails(auctionId: string): Promise<AuctionDetails> {
  try {
    const response = await fetch(`${API_URL}/auctions/${auctionId}`, { headers: apiHeaders });
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    const auction = await response.json();
    
    return {
      seller: auction.seller,
      highestBidder: auction.highestBidder,
      highestBid: auction.highestBid,
      endTime: auction.endTime,
      ended: auction.ended,
      assetAddress: auction.assetAddress,
      assetId: auction.assetId,
      amount: auction.amount,
      paymentToken: auction.paymentToken,
      type: auction.auctionType,
      status: auction.status,
      imageUrl: auction.imageUrl,
      title: auction.title,
      description: auction.description,
      currencySymbol: auction.currencySymbol,
      currencyName: auction.currencyName,
      currencyImageUrl: auction.currencyImageUrl,
      currencyDecimals: auction.currencyDecimals,
      bidCount: auction.bidCount,
      // Dutch auction specific fields
      reservePrice: auction.reservePrice,
      currentPrice: auction.currentPrice
    };
  } catch (error) {
    console.error('Error fetching auction details:', error);
    // Default return to avoid breaking the UI
    return {
      seller: '',
      highestBidder: '',
      highestBid: '0',
      endTime: 0,
      ended: false,
      assetAddress: '',
      assetId: 0,
      amount: '0',
      paymentToken: '',
      type: 0
    };
  }
}

// Keep the checkApproval function as is since it still needs direct blockchain access
async function checkApproval(
  assetType: AssetType,
  assetAddress: string,
  owner: string,
  target: string,
  assetId?: number,
  amount?: string
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

// Add a function to get active auctions
async function getActiveAuctions(
  pageSize: number = 10,
  pageNumber: number = 0
): Promise<AuctionCreatedEvent[]> {
  return getAuctions(pageSize, pageNumber, 'active');
}

// Add a function to get ended auctions
async function getEndedAuctions(
  pageSize: number = 10,
  pageNumber: number = 0
): Promise<AuctionCreatedEvent[]> {
  return getAuctions(pageSize, pageNumber, 'ended');
}

export {
  checkApproval,
  getAuctions,
  getActiveAuctions,
  getEndedAuctions,
  getUserAuctions,
  getAuctionBids,
  getAuctionDetails,
  getAuctionsCount,
};