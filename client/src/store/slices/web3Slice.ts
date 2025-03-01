import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { toast } from 'react-toastify';

// Define a simpler state type that avoids storing the full Web3 instance directly
interface Web3State {
  provider: any; // Store provider instead of Web3 instance
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const initialState: Web3State = {
  provider: null,
  address: null,
  chainId: null,
  networkName: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

// Networks config
const NETWORKS: {[key: number]: {name: string, currency: string}} = {
  1: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
  },
  5: {
    name: 'Goerli Testnet',
    currency: 'ETH',
  },
  137: {
    name: 'Polygon',
    currency: 'MATIC',
  },
  // Add other networks as needed
};

// Helper function to get web3 instance - outside of the Redux store
let web3Instance: Web3 | null = null;

export const getWeb3 = () => {
  if (!web3Instance && (window as any).ethereum) {
    web3Instance = new Web3((window as any).ethereum);
  }
  return web3Instance;
};

// Async thunks
export const connectWallet = createAsyncThunk(
  'web3/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      // Check if MetaMask is installed
      if (!(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const ethereum = (window as any).ethereum;
      
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Create Web3 instance but don't store in state
      const web3 = new Web3(ethereum);
      web3Instance = web3; // Store in module-level variable
      
      // Get chain ID and ensure it's a number
      const chainId = Number(await web3.eth.getChainId());
      
      // Get balance
      const balance = web3.utils.fromWei(
        await web3.eth.getBalance(address),
        'ether'
      );
      
      // Get network name
      const networkName = NETWORKS[chainId]?.name || 'Unknown Network';
      
      return { 
        provider: ethereum, // Store provider instead
        address, 
        chainId, 
        networkName, 
        balance
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
      return rejectWithValue(error.message || 'Failed to connect wallet');
    }
  }
);

export const switchNetwork = createAsyncThunk(
  'web3/switchNetwork',
  async (chainId: number, { rejectWithValue }) => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      return chainId;
    } catch (error: any) {
      toast.error('Failed to switch network');
      return rejectWithValue(error.message || 'Failed to connect wallet');
    }
  }
);

const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    disconnect: (state) => {
      web3Instance = null; // Clear module-level web3 instance
      Object.assign(state, initialState);
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.provider = action.payload.provider; // Store provider instead
        state.address = action.payload.address;
        state.chainId = action.payload.chainId;
        state.networkName = action.payload.networkName;
        state.balance = action.payload.balance;
        state.isConnected = true;
        state.isConnecting = false;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      })
      .addCase(switchNetwork.fulfilled, (state, action) => {
        state.chainId = action.payload;
        const networkName = NETWORKS[action.payload]?.name || 'Unknown Network';
        state.networkName = networkName;
      });
  },
});

export const { disconnect, updateBalance } = web3Slice.actions;
export default web3Slice.reducer;