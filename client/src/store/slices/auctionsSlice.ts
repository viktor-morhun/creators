import { createSlice, createAsyncThunk,  } from '@reduxjs/toolkit';
//PayloadAction
import { toast } from 'react-toastify';
import MOCK_AUCTIONS from '../mockData/auctions';

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: string; // in wei
  currency: string;
  endTime: number;
  auctionType: 'english' | 'dutch' | 'sealed' | 'timed';
  tokenType: 'ERC721' | 'ERC1155' | 'ERC20' | 'physical';
  seller: {
    address: string;
    name: string;
  };
  bidCount: number;
  chainId: number;
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
  async (id: string, { rejectWithValue }) => {
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const auction = MOCK_AUCTIONS.find(a => a.id === id);
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
        auction => auction.seller.address.toLowerCase() === address.toLowerCase()
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
          .sort((a, b) => b.bidCount - a.bidCount)
          .slice(0, 4);
          
        // Recent auctions - newest first based on ID (in a real app, use creation timestamp)
        state.recentAuctions = [...auctions]
          .sort((a, b) => parseInt(b.id) - parseInt(a.id))
          .slice(0, 4);
          
        // Ending soon - sort by end time
        const now = Date.now();
        state.endingSoonAuctions = [...auctions]
          .filter(a => a.endTime > now) // Only include active auctions
          .sort((a, b) => a.endTime - b.endTime)
          .slice(0, 4);
          
        // Popular auctions - highest bid count
        state.popularAuctions = [...auctions]
          .sort((a, b) => b.bidCount - a.bidCount)
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