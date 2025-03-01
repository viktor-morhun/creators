import { useState, useEffect, useCallback } from 'react';
import useWeb3 from './useWeb3';

// Auction types
export interface AuctionItem {
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

// Hook return type
interface UseAuctionsReturn {
  allAuctions: AuctionItem[];
  featuredAuctions: AuctionItem[];
  recentAuctions: AuctionItem[];
  popularAuctions: AuctionItem[];
  endingSoonAuctions: AuctionItem[];
  myBids: AuctionItem[];
  myCreatedAuctions: AuctionItem[];
  myWonAuctions: AuctionItem[];
  loading: boolean;
  error: string | null;
  fetchAuctions: () => Promise<void>;
  fetchAuction: (id: string) => Promise<AuctionItem | null>;
  refreshAuction: (id: string) => Promise<void>;
  searchAuctions: (query: string) => Promise<AuctionItem[]>;
  filterAuctions: (filters: AuctionFilters) => Promise<AuctionItem[]>;
}

interface AuctionFilters {
  type?: 'english' | 'dutch' | 'sealed' | 'timed';
  tokenType?: 'ERC721' | 'ERC1155' | 'ERC20' | 'physical';
  minPrice?: number;
  maxPrice?: number;
  status?: 'active' | 'ended' | 'upcoming';
  chainId?: number;
}

// Mock data for development
const MOCK_AUCTIONS: AuctionItem[] = [
  {
    id: '1',
    title: 'Cosmic Dreamscape #42',
    description: 'A stunning digital artwork depicting the dreams of the cosmos. This unique NFT combines elements of fantasy and space to create a mesmerizing visual experience.',
    imageUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2070',
    currentBid: 0.75,
    currency: 'ETH',
    endTime: new Date(Date.now() + 86400000), // 24h from now
    creator: {
      name: 'DigitalArtist',
      address: '0x1234...5678',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    bidCount: 8,
    auctionType: 'english',
    tokenType: 'ERC721',
    chainId: 1
  },
  {
    id: '2',
    title: 'Neon Genesis Collection',
    description: 'A collection inspired by the iconic anime series. This digital collectible pays homage to the groundbreaking animation and storytelling of the original show.',
    imageUrl: 'https://images.unsplash.com/photo-1633540190277-29aca58cc587?q=80&w=1642',
    currentBid: 1.2,
    currency: 'ETH',
    endTime: new Date(Date.now() + 172800000), // 48h from now
    creator: {
      name: 'CryptoCreator',
      address: '0x5678...9012',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    bidCount: 12,
    auctionType: 'timed',
    tokenType: 'ERC1155',
    chainId: 137
  },
  {
    id: '3',
    title: 'Abstract Dimensions #7',
    description: 'An exploration of geometric shapes and vibrant colors that push the boundaries of digital art. This NFT is part of a limited series exploring mathematical concepts through visual art.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964',
    currentBid: 0.35,
    currency: 'ETH',
    endTime: new Date(Date.now() + 43200000), // 12h from now
    creator: {
      name: 'BlockchainArtist',
      address: '0x9012...3456',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    bidCount: 5,
    auctionType: 'dutch',
    tokenType: 'ERC721',
    chainId: 1
  },
  {
    id: '4',
    title: 'Digital Relic #003',
    description: 'A digital artifact representing the early days of cryptocurrency. This unique token combines historical elements with futuristic design motifs.',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974',
    currentBid: 2.5,
    currency: 'ETH',
    endTime: new Date(Date.now() + 345600000), // 4 days from now
    creator: {
      name: 'Web3Pioneer',
      address: '0x3456...7890',
      avatar: 'https://randomuser.me/api/portraits/men/21.jpg'
    },
    bidCount: 18,
    auctionType: 'english',
    tokenType: 'ERC721',
    chainId: 42161
  },
  {
    id: '5',
    title: 'Quantum State',
    description: 'A visualization of quantum computing concepts represented through abstract digital art. This piece explores the fascinating world of quantum mechanics through vibrant colors and shapes.',
    imageUrl: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=2070',
    currentBid: 0.85,
    currency: 'ETH',
    endTime: new Date(Date.now() + 259200000), // 3 days from now
    creator: {
      name: 'QuantumCreator',
      address: '0x7890...1234',
      avatar: 'https://randomuser.me/api/portraits/women/54.jpg'
    },
    bidCount: 7,
    auctionType: 'sealed',
    tokenType: 'ERC721',
    chainId: 1
  },
  {
    id: '6',
    title: 'Metaverse Property Alpha',
    description: 'Prime virtual real estate in the growing metaverse. This digital property is located in a high-traffic area with significant development potential.',
    imageUrl: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=2070',
    currentBid: 4.2,
    currency: 'ETH',
    endTime: new Date(Date.now() + 518400000), // 6 days from now
    creator: {
      name: 'MetaBuilder',
      address: '0x2468...1357',
      avatar: 'https://randomuser.me/api/portraits/men/76.jpg'
    },
    bidCount: 25,
    auctionType: 'english',
    tokenType: 'ERC1155',
    chainId: 137
  },
  {
    id: '7',
    title: 'Crypto Punk Derivative #38',
    description: 'A unique interpretation inspired by the iconic CryptoPunks collection. This artwork pays homage to one of the pioneering NFT projects while adding a fresh artistic perspective.',
    imageUrl: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=80&w=1964',
    currentBid: 1.1,
    currency: 'ETH',
    endTime: new Date(Date.now() + 21600000), // 6 hours from now
    creator: {
      name: 'NFTRemixer',
      address: '0x1357...2468',
      avatar: 'https://randomuser.me/api/portraits/women/15.jpg'
    },
    bidCount: 9,
    auctionType: 'timed',
    tokenType: 'ERC721',
    chainId: 1
  },
  {
    id: '8',
    title: 'Digital Soundwave Collection',
    description: 'A multimedia NFT that combines visual art with an original audio composition. This unique digital asset is a feast for both the eyes and ears.',
    imageUrl: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=2128',
    currentBid: 0.45,
    currency: 'ETH',
    endTime: new Date(Date.now() + 129600000), // 36 hours from now
    creator: {
      name: 'AudioVisualArtist',
      address: '0x9876...5432',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
    },
    bidCount: 4,
    auctionType: 'dutch',
    tokenType: 'ERC721',
    chainId: 42161
  }
];

// The hook
export const useAuctions = (): UseAuctionsReturn => {
  const { address, isConnected } = useWeb3();
  //web3 use it
  const [allAuctions, setAllAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all auctions
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In a production environment, this would be an API or blockchain call
      // For now, we're using mock data with a simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAllAuctions(MOCK_AUCTIONS);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Failed to load auctions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single auction by ID
  const fetchAuction = useCallback(async (id: string): Promise<AuctionItem | null> => {
    try {
      // In production, this would be an API or blockchain call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const auction = MOCK_AUCTIONS.find(auction => auction.id === id);
      return auction || null;
    } catch (err) {
      console.error(`Error fetching auction ${id}:`, err);
      setError('Failed to load auction details.');
      return null;
    }
  }, []);

  // Refresh a single auction
  const refreshAuction = useCallback(async (id: string): Promise<void> => {
    try {
      // In production, this would refresh from the blockchain
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For mock purposes, we're not actually changing anything
      // In a real implementation, you'd update the specific auction in state
    } catch (err) {
      console.error(`Error refreshing auction ${id}:`, err);
      setError('Failed to refresh auction data.');
    }
  }, []);

  // Search auctions by query string
  const searchAuctions = useCallback(async (query: string): Promise<AuctionItem[]> => {
    if (!query.trim()) return allAuctions;

    const lowercaseQuery = query.toLowerCase();
    return allAuctions.filter(auction => 
      auction.title.toLowerCase().includes(lowercaseQuery) || 
      auction.description.toLowerCase().includes(lowercaseQuery) ||
      auction.creator.name.toLowerCase().includes(lowercaseQuery)
    );
  }, [allAuctions]);

  // Filter auctions by criteria
  const filterAuctions = useCallback(async (filters: AuctionFilters): Promise<AuctionItem[]> => {
    return allAuctions.filter(auction => {
      // Filter by auction type
      if (filters.type && auction.auctionType !== filters.type) {
        return false;
      }
      
      // Filter by token type
      if (filters.tokenType && auction.tokenType !== filters.tokenType) {
        return false;
      }
      
      // Filter by price range
      if (filters.minPrice !== undefined && auction.currentBid < filters.minPrice) {
        return false;
      }
      
      if (filters.maxPrice !== undefined && auction.currentBid > filters.maxPrice) {
        return false;
      }
      
      // Filter by chain ID
      if (filters.chainId !== undefined && auction.chainId !== filters.chainId) {
        return false;
      }
      
      // Filter by status
      if (filters.status) {
        const now = new Date();
        
        if (filters.status === 'active' && auction.endTime <= now) {
          return false;
        }
        
        if (filters.status === 'ended' && auction.endTime > now) {
          return false;
        }
        
        // For 'upcoming', we'd need an additional field like startTime
        // This is just a placeholder implementation
      }
      
      return true;
    });
  }, [allAuctions]);

  // Load auctions initially
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Derived state
  const featuredAuctions = allAuctions
    .filter(auction => auction.bidCount > 5)
    .slice(0, 4);

  const recentAuctions = [...allAuctions]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  const popularAuctions = [...allAuctions]
    .sort((a, b) => b.bidCount - a.bidCount)
    .slice(0, 4);

  const endingSoonAuctions = [...allAuctions]
    .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
    .slice(0, 4);
  
  // For the user's auctions (in a real implementation, these would filter based on the user's address)
  const myBids = isConnected ? allAuctions.slice(0, 2) : [];
  
  const myCreatedAuctions = isConnected 
    ? allAuctions.filter(auction => 
        auction.creator.address.toLowerCase() === address?.toLowerCase()
      )
    : [];
  
  const myWonAuctions = isConnected ? allAuctions.slice(2, 3) : [];

  return {
    allAuctions,
    featuredAuctions,
    recentAuctions,
    popularAuctions,
    endingSoonAuctions,
    myBids,
    myCreatedAuctions,
    myWonAuctions,
    loading,
    error,
    fetchAuctions,
    fetchAuction,
    refreshAuction,
    searchAuctions,
    filterAuctions
  };
};

export default useAuctions;