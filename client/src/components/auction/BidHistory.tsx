import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import Web3 from 'web3';

interface Bid {
  id: string;
  bidder: {
    address: string;
    name?: string;
  };
  amount: string; // in wei
  timestamp: number;
  txHash: string;
}

interface BidHistoryProps {
  auctionId: string;
  currency: string;
  bids?: Bid[];
  isLoading?: boolean;
  fetchBids?: () => Promise<void>;
}

const BidHistory: React.FC<BidHistoryProps> = ({
  auctionId,
  currency,
  bids = [],
  isLoading = false,
  fetchBids
}) => {
  const [sortedBids, setSortedBids] = useState<Bid[]>([]);
  const { address } = useAppSelector(state => state.web3);
  
  // Fetch bids on component mount
  useEffect(() => {
    if (fetchBids) {
      fetchBids();
    }
  }, [fetchBids, auctionId]);
  
  // Sort bids by timestamp (newest first)
  useEffect(() => {
    const sorted = [...bids].sort((a, b) => b.timestamp - a.timestamp);
    setSortedBids(sorted);
  }, [bids]);
  
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper function to format address
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Helper to convert wei to ETH
  const formatAmount = (amount: string): string => {
    return parseFloat(Web3.utils.fromWei(amount, 'ether')).toFixed(4);
  };
  
  // If loading
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Bid History</h3>
        <div className="flex justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }
  
  // If no bids
  if (sortedBids.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Bid History</h3>
        <div className="text-center py-6">
          <p className="text-gray-400">No bids have been placed yet.</p>
          <p className="text-gray-500 mt-1 text-sm">Be the first to place a bid on this auction!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Bid History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bidder</th>
              <th className="py-2 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="py-2 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedBids.map((bid) => {
              const isCurrentUser = address && bid.bidder.address.toLowerCase() === address.toLowerCase();
              
              return (
                <tr 
                  key={bid.id} 
                  className={`hover:bg-gray-750 ${isCurrentUser ? 'bg-purple-900 bg-opacity-20' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isCurrentUser ? 'bg-purple-500' : 'bg-gray-500'}`}></div>
                      <span className="font-medium text-sm">
                        {bid.bidder.name || formatAddress(bid.bidder.address)}
                        {isCurrentUser && <span className="ml-2 text-xs text-purple-400">(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatAmount(bid.amount)} {currency}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-400">
                    {formatTimestamp(bid.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Link to view on blockchain explorer */}
      <div className="mt-4 text-center">
        <a 
          href={`https://etherscan.io/address/${auctionId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          View all bids on block explorer
        </a>
      </div>
    </div>
  );
};

export default BidHistory;