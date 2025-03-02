import { createSlice, createAsyncThunk,  } from '@reduxjs/toolkit';
//PayloadAction
import { toast } from 'react-toastify';
import MOCK_AUCTIONS from '../mockData/auctions';
import {NFTMetadata, ERC20Metadata} from "../../controllers/getToken";
enum AssetType {
  ERC20 = 0,
  ERC721 = 1,
}

export interface AuctionItem {
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
  erc20?: ERC20Metadata;
}

interface AuctionsState {
  allAuctions: AuctionItem[];
  featuredAuctions: AuctionItem[];
  recentAuctions: AuctionItem[];
  endingSoonAuctions: AuctionItem[];
  popularAuctions: AuctionItem[];
  userAuctions: AuctionItem[];
  userBids: AuctionItem[];
  currentAuction: AuctionItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuctionsState = {
  allAuctions: [],
  featuredAuctions: [],
  recentAuctions: [],
  endingSoonAuctions: [],
  popularAuctions: [],
  userAuctions: [],
  userBids: [],
  currentAuction: null,
  loading: false,
  error: null,
};

export const fetchAllAuctions = createAsyncThunk(
  'auctions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return MOCK_AUCTIONS;
    } catch (error: any) {
      toast.error('Failed to load auctions');
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuctionById = createAsyncThunk(
  'auctions/fetchById',
  async (assetId: number, { rejectWithValue }) => {
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const auction = MOCK_AUCTIONS.find(a => a.assetId === assetId);
      if (!auction) {
        throw new Error('Auction not found');
      }
      return auction;
    } catch (error: any) {
      toast.error('Failed to load auction details');
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserAuctions = createAsyncThunk(
  'auctions/fetchUserAuctions',
  async (address: string, { rejectWithValue }) => {
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Filter auctions created by the user
      const userAuctions = MOCK_AUCTIONS.filter(
        auction => auction.seller.toLowerCase() === address.toLowerCase()
      );
      
      return userAuctions;
    } catch (error: any) {
      toast.error('Failed to load your auctions');
      return rejectWithValue(error.message);
    }
  }
);

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAuctions.fulfilled, (state, action) => {
        const auctions = action.payload;
        state.allAuctions = auctions;
        
        // Featured auctions - those with high bid counts
        state.featuredAuctions = [...auctions]
          .sort((a, b) => parseInt(b.highestBid) - parseInt(a.highestBid))
          .slice(0, 4);
          
        // Recent auctions - newest first based on ID (in a real app, use creation timestamp)
        state.recentAuctions = [...auctions]
          .sort((a, b) =>b.assetId - a.assetId)
          .slice(0, 4);
          
        // Ending soon - sort by end time
        const now = Date.now();
        state.endingSoonAuctions = [...auctions]
          .filter(a => a.endTime > now) // Only include active auctions
          .sort((a, b) => a.endTime - b.endTime)
          .slice(0, 4);
          
        // Popular auctions - highest bid count
        state.popularAuctions = [...auctions]
          .sort((a, b) => parseInt(b.highestBid) - parseInt(a.highestBid))
          .slice(0, 8);
          
        state.loading = false;
      })
      .addCase(fetchAllAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAuctionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.currentAuction = action.payload;
        state.loading = false;
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAuctions.fulfilled, (state, action) => {
        state.userAuctions = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default auctionsSlice.reducer;