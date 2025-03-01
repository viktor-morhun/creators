import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import Web3 from 'web3';

// Updated interface to match your data structure
export interface AuctionDetails {
  id?: string; // Adding optional id for routing
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

interface AuctionCardProps {
  auction: AuctionDetails;
  index: number; // For generating fallback IDs if needed
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction, index }) => {
  const {
    id,
    seller,
    highestBidder,
    highestBid,
    endTime,
    ended,
    assetAddress,
    assetId,
    amount,
    paymentToken,
    type
  } = auction;

  // Generate a unique ID if one isn't provided
  const auctionId = id || `auction-${index}-${assetId}`;
  
  // Safe formatting functions with error handling
  const formatWei = (weiAmount: string): string => {
    try {
      if (!weiAmount) return '0.000';
      return parseFloat(Web3.utils.fromWei(weiAmount, 'ether')).toFixed(3);
    } catch (error) {
      console.warn(`Error formatting wei amount:`, error);
      return '0.000';
    }
  };
  
  const formatAddress = (address: string | undefined): string => {
    try {
      if (!address || typeof address !== 'string') {
        return 'Unknown';
      }
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    } catch (error) {
      console.warn(`Error formatting address:`, error);
      return 'Unknown';
    }
  };

  // Use the safe formatting functions
  const formattedBid = formatWei(highestBid);
  const shortSellerAddress = formatAddress(seller);
  const shortAssetAddress = formatAddress(assetAddress);
  
  // Determine auction type text
  const auctionTypeText = type === 0 ? 'English' : 'Dutch';
  
  // Check if auction has bids (English auction)
  const hasBids = type === 0 && highestBidder !== '0x0000000000000000000000000000000000000000';
  
  // Determine payment token symbol - default to ETH if the zero address is used (native token)
  const currencySymbol = paymentToken === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'TOKEN';

  return (
    <Link to={`/auction/${auctionId}`}>
      <div className="bg-gray-800 h-[400px] rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-purple-900/10 group">
        {/* Image Container - Using NFT placeholder since we don't have imageUrl */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900">
          {/* Auction Type Tag */}
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${
              type === 0 ? 'bg-purple-500 bg-opacity-80' : 'bg-blue-500 bg-opacity-80'
            }`}>
              {auctionTypeText}
            </div>
          </div>

          {/* NFT Placeholder - showing asset ID since we don't have an image */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">#{assetId || '?'}</div>
              <div className="text-sm text-gray-300">
                {shortAssetAddress}
              </div>
            </div>
          </div>
          
          {/* Status badge */}
          {ended && (
            <div className="absolute top-3 right-3 bg-red-500 bg-opacity-80 px-2 py-1 rounded-md text-xs font-medium">
              Ended
            </div>
          )}
          
          {/* Countdown */}
          {!ended && endTime && (
            <div className="absolute bottom-3 right-3">
              <CountdownTimer endTime={endTime} />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
            LOT #{assetId || '?'}
          </h3>
          
          <p className="text-xs text-gray-400 mb-3">
            Seller: {shortSellerAddress}
          </p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400">
                {type === 0 ? 'Current Bid' : 'Starting Price'}
              </p>
              <div className="flex items-center">
                {/* Currency Icon */}
                <svg className="w-3 h-3 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                </svg>
                <span className="font-bold text-white">{formattedBid} {currencySymbol}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-400">Status</p>
              <p className={`font-medium ${ended ? 'text-red-400' : 'text-green-400'}`}>
                {ended ? 'Ended' : 'Active'}
              </p>
            </div>
          </div>
          
          {/* Additional info for English auctions */}
          {type === 0 ? (
            <div className="mt-2 text-xs text-gray-400">
              {hasBids ? (
                <p>Highest bidder: {formatAddress(highestBidder)}</p>
              ) : (
                <p>No bids yet</p>
              )}
            </div>
          ) : (
            <div className="mt-6 text-xs text-gray-400">
            </div>
          )}
          
          {/* Action Button */}
          <button className='mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all'>
            {ended ? 'View Results' : 'View Auction'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;