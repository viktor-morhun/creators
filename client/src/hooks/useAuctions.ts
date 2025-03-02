import { useState, useEffect, useCallback } from "react";
import useWeb3 from "./useWeb3";
//import Web3 from "web3";
import MOCK_AUCTIONS from "../store/mockData/auctions";
import { AuctionDetails } from "../controllers/getEvents";
// Hook return type with updated AuctionDetails type
interface UseAuctionsReturn {
  allAuctions: AuctionDetails[];
  featuredAuctions: AuctionDetails[];
  recentAuctions: AuctionDetails[];
  popularAuctions: AuctionDetails[];
  endingSoonAuctions: AuctionDetails[];
  myBids: AuctionDetails[];
  myCreatedAuctions: AuctionDetails[];
  myWonAuctions: AuctionDetails[];
  loading: boolean;
  error: string | null;
  fetchAuctions: () => Promise<void>;
  fetchAuction: (id: string) => Promise<AuctionDetails | null>;
  refreshAuction: (id: string) => Promise<void>;
  searchAuctions: (query: string) => Promise<AuctionDetails[]>;
  filterAuctions: (filters: AuctionFilters) => Promise<AuctionDetails[]>;
}

interface AuctionFilters {
  type?: number; // Updated to match the actual type (0 for English, 1 for Dutch)
  minPrice?: string; // Changed to string to match wei format
  maxPrice?: string;
  status?: "active" | "ended";
}
/*
// Helper to convert ETH to Wei
const toWei = (eth: number): string => {
  return Web3.utils.toWei(eth.toString(), 'ether');
};

// Helper to get current timestamp
const now = Date.now();
const DAY = 86400000;
const HOUR = 3600000;
*/

// The hook
export const useAuctions = (): UseAuctionsReturn => {
  const { address, isConnected } = useWeb3();
  const [allAuctions, setAllAuctions] = useState<AuctionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all auctions
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In a production environment, this would be an API or blockchain call
      // For now, we're using mock data with a simulated delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAllAuctions(MOCK_AUCTIONS);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setError("Failed to load auctions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single auction by ID
  const fetchAuction = useCallback(
    async (id: string): Promise<AuctionDetails | null> => {
      try {
        // In production, this would be an API or blockchain call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const auction = MOCK_AUCTIONS.find((auction) => auction.assetId === Number(id));
        return auction || null;
      } catch (err) {
        console.error(`Error fetching auction ${id}:`, err);
        setError("Failed to load auction details.");
        return null;
      }
    },
    []
  );

  // Refresh a single auction
  const refreshAuction = useCallback(async (id: string): Promise<void> => {
    try {
      // In production, this would refresh from the blockchain
      await new Promise((resolve) => setTimeout(resolve, 300));

      // For mock purposes, we're not actually changing anything
    } catch (err) {
      console.error(`Error refreshing auction ${id}:`, err);
      setError("Failed to refresh auction data.");
    }
  }, []);

  // Search auctions by assetId or seller address
  const searchAuctions = useCallback(
    async (query: string): Promise<AuctionDetails[]> => {
      if (!query.trim()) return allAuctions;

      const lowercaseQuery = query.toLowerCase();
      return allAuctions.filter(
        (auction) =>
          auction.assetId.toString().includes(lowercaseQuery) ||
          auction.seller.toLowerCase().includes(lowercaseQuery)
        // || (auction.id && auction.id.toLowerCase().includes(lowercaseQuery))
      );
    },
    [allAuctions]
  );

  // Filter auctions by criteria
  const filterAuctions = useCallback(
    async (filters: AuctionFilters): Promise<AuctionDetails[]> => {
      return allAuctions.filter((auction) => {
        // Filter by auction type
        if (filters.type !== undefined && auction.type !== filters.type) {
          return false;
        }

        // Filter by price range
        if (filters.minPrice !== undefined) {
          // Convert both to BigInt for proper comparison of wei values
          const bidValue = BigInt(auction.highestBid);
          const minValue = BigInt(filters.minPrice);
          if (bidValue < minValue) {
            return false;
          }
        }

        if (filters.maxPrice !== undefined) {
          // Convert both to BigInt for proper comparison of wei values
          const bidValue = BigInt(auction.highestBid);
          const maxValue = BigInt(filters.maxPrice);
          if (bidValue > maxValue) {
            return false;
          }
        }

        // Filter by status
        if (filters.status) {
          if (filters.status === "active" && auction.ended) {
            return false;
          }

          if (filters.status === "ended" && !auction.ended) {
            return false;
          }
        }

        return true;
      });
    },
    [allAuctions]
  );

  // Load auctions initially
  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Derived state - Now based on the AuctionDetails structure
  // Featured auctions - those with non-zero highest bid
  const featuredAuctions = allAuctions
    .filter(
      (auction) =>
        auction.highestBidder !== "0x0000000000000000000000000000000000000000"
    )
    .slice(0, 4);

  // Recent auctions - sorted by ID (as a proxy for creation time since we don't have that field)
  const recentAuctions = [...allAuctions]
    .sort((a, b) =>
      (b.assetId.toString() || "").localeCompare(a.assetId.toString() || "")
    )
    .slice(0, 4);

  // Popular auctions - highest bids
  const popularAuctions = [...allAuctions]
    .sort((a, b) => {
      const bidA = BigInt(a.highestBid);
      const bidB = BigInt(b.highestBid);
      return bidA < bidB ? 1 : bidA > bidB ? -1 : 0;
    })
    .slice(0, 4);

  // Ending soon auctions
  const endingSoonAuctions = [...allAuctions]
    .filter((auction) => !auction.ended)
    .sort((a, b) => a.endTime - b.endTime)
    .slice(0, 4);

  // User's auctions (in a real implementation, these would filter based on user's address)
  const myBids = isConnected
    ? allAuctions.filter(
        (auction) =>
          !auction.ended &&
          auction.highestBidder.toLowerCase() === address?.toLowerCase()
      )
    : [];

  const myCreatedAuctions = isConnected
    ? allAuctions.filter(
        (auction) => auction.seller.toLowerCase() === address?.toLowerCase()
      )
    : [];

  const myWonAuctions = isConnected
    ? allAuctions.filter(
        (auction) =>
          auction.ended &&
          auction.highestBidder.toLowerCase() === address?.toLowerCase()
      )
    : [];

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
    filterAuctions,
  };
};

export default useAuctions;
