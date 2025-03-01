// src/components/auction/AuctionCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import AuctionTypeTag from './AuctionTypeTag';
import Web3 from 'web3';

interface AuctionCardProps {
  auction: {
    id: string;
    title: string;
    imageUrl: string;
    currentBid: string; // in wei
    currency: string;
    endTime: number; // timestamp
    auctionType: 'english' | 'dutch' | 'sealed' | 'timed';
    seller: {
      address: string;
      name: string;
    };
    bidCount: number;
  };
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const {
    id,
    title,
    imageUrl,
    currentBid,
    currency,
    endTime,
    auctionType,
    seller,
    bidCount
  } = auction;

  // Convert Wei to ETH using Web3.js instead of ethers
  const formattedBid = parseFloat(Web3.utils.fromWei(currentBid, 'ether')).toFixed(3);

  return (
    <Link to={`/auction/${id}`}>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-purple-900/10 group">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          {/* Auction Type Tag */}
          <div className="absolute top-3 left-3 z-10">
            <AuctionTypeTag type={auctionType} />
          </div>

          {/* Main Image */}
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
          
          {/* Countdown */}
          <div className="absolute bottom-3 right-3">
            <CountdownTimer endTime={endTime} />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{title}</h3>
          
          <p className="text-xs text-gray-400 mb-3">
            Created by {seller.name || `${seller.address.substring(0, 6)}...`}
          </p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400">Current Bid</p>
              <div className="flex items-center">
                {/* Currency Icon */}
                <svg className="w-3 h-3 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                </svg>
                <span className="font-bold text-white">{formattedBid} {currency}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-400">Bids</p>
              <p className="font-medium text-gray-300">{bidCount}</p>
            </div>
          </div>
          
          {/* Action Button */}
          <button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all">
            View Auction
          </button>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;