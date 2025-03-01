import { useState } from 'react';
import { Link } from 'react-router-dom';

// Types for our auction items
interface AuctionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  currency: string;
  endTime: Date;
  creator: {
    name: string;
    address: string;
    avatar?: string;
  };
  bidCount: number;
  auctionType: 'english' | 'dutch' | 'sealed' | 'timed';
  tokenType: 'ERC721' | 'ERC1155' | 'ERC20' | 'physical';
  chainId: number;
}

interface AuctionGridProps {
  auctions: AuctionItem[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
}

const AuctionGrid: React.FC<AuctionGridProps> = ({
  auctions,
  title = "Explore Auctions",
  loading = false,
  emptyMessage = "No auctions found"
}) => {
  const [filter, setFilter] = useState<string>('all');
  
  // Get auction type badge color
  const getAuctionTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'english': return 'bg-blue-100 text-blue-800';
      case 'dutch': return 'bg-orange-100 text-orange-800';
      case 'sealed': return 'bg-purple-100 text-purple-800';
      case 'timed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get token type badge color
  const getTokenTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'ERC721': return 'bg-indigo-100 text-indigo-800';
      case 'ERC1155': return 'bg-pink-100 text-pink-800';
      case 'ERC20': return 'bg-cyan-100 text-cyan-800';
      case 'physical': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get chain badge by chainId
  const getChainBadge = (chainId: number) => {
    switch(chainId) {
      case 1: return { name: 'Ethereum', color: 'bg-blue-100 text-blue-800' };
      case 137: return { name: 'Polygon', color: 'bg-purple-100 text-purple-800' };
      case 56: return { name: 'BSC', color: 'bg-yellow-100 text-yellow-800' };
      case 42161: return { name: 'Arbitrum', color: 'bg-blue-100 text-blue-800' };
      default: return { name: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Filter auctions based on selected filter
  const filteredAuctions = filter === 'all' 
    ? auctions 
    : auctions.filter(auction => auction.auctionType === filter);

  // Format time remaining
  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    if (endTime < now) return 'Ended';
    
    const diffMs = endTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHrs}h`;
    if (diffHrs > 0) return `${diffHrs}h ${diffMins}m`;
    return `${diffMins}m`;
  };

  return (
    <div className="w-full">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('english')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${filter === 'english'
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
          >
            English
          </button>
          <button 
            onClick={() => setFilter('dutch')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${filter === 'dutch'
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
          >
            Dutch
          </button>
          <button 
            onClick={() => setFilter('sealed')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${filter === 'sealed'
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
          >
            Sealed
          </button>
          <button 
            onClick={() => setFilter('timed')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${filter === 'timed'
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
          >
            Timed
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAuctions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">{emptyMessage}</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-500">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Auction grid */}
      {!loading && filteredAuctions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <Link 
              to={`/auction/${auction.id}`} 
              key={auction.id}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image container */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={auction.imageUrl} 
                  alt={auction.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
                
                {/* Time remaining badge */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white">
                  {formatTimeRemaining(auction.endTime)}
                </div>
                
                {/* Chain badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getChainBadge(auction.chainId).color}`}>
                  {getChainBadge(auction.chainId).name}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAuctionTypeBadgeColor(auction.auctionType)}`}>
                    {auction.auctionType.charAt(0).toUpperCase() + auction.auctionType.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTokenTypeBadgeColor(auction.tokenType)}`}>
                    {auction.tokenType}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{auction.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{auction.description}</p>
                
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Bid</p>
                    <div className="flex items-center">
                      {auction.currency === 'ETH' && (
                        <svg className="w-3 h-3 mr-1 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                        </svg>
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {auction.currentBid} {auction.currency}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span className="text-xs">{auction.bidCount} bids</span>
                  </div>
                </div>
                
                {/* Creator info */}
                <div className="flex items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden mr-2">
                    {auction.creator.avatar ? (
                      <img 
                        src={auction.creator.avatar} 
                        alt={auction.creator.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-bold">
                        {auction.creator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    by <span className="font-medium text-gray-700 dark:text-gray-300">{auction.creator.name}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionGrid;