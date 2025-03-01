import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { toast } from 'react-toastify';
//import { useAppDispatch, useAppSelector } from '../hooks/redux';

// Types
export interface Web3State {
  web3: Web3 | null;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Supported networks configuration
const NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/your-infura-id'
  },
  5: {
    name: 'Goerli Testnet',
    currency: 'ETH',
    explorerUrl: 'https://goerli.etherscan.io',
    rpcUrl: 'https://goerli.infura.io/v3/your-infura-id'
  },
  137: {
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  },
  80001: {
    name: 'Mumbai Testnet',
    currency: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com'
  },
  42161: {
    name: 'Arbitrum One',
    currency: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  }
};

const initialState: Web3State = {
  web3: null,
  address: null,
  chainId: null,
  networkName: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  error: null
};

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>(initialState);
  //const dispatch = useAppDispatch();
  //const web3State = useAppSelector(state => state.web3);

  // Helper to update state
  const updateState = useCallback((newState: Partial<Web3State>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  }, []);

  // Check if MetaMask is installed
  const checkIfMetaMaskInstalled = useCallback(() => {
    const { ethereum } = window as any;
    return Boolean(ethereum && ethereum.isMetaMask);
  }, []);

  // Get current account
  const getCurrentAccount = useCallback(async () => {
    try {
      const { ethereum } = window as any;
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }, []);

  // Get account data (balance, chainId, etc.)
  const getAccountData = useCallback(async (web3: Web3, address: string) => {
    try {
      const balance = web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
      const chainId = await web3.eth.getChainId();
      const chainIdNumber = Number(chainId);
      const networkName = NETWORKS[chainIdNumber as keyof typeof NETWORKS]?.name || 'Unknown Network';
      
      return { balance, chainId: chainIdNumber, networkName };
    } catch (error) {
      console.error('Error getting account data:', error);
      throw error;
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!checkIfMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      updateState({ 
        isConnecting: false, 
        error: 'MetaMask is not installed.' 
      });
      return false;
    }

    try {
      updateState({ isConnecting: true, error: null });
      const { ethereum } = window as any;

      // Request accounts
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Initialize Web3
      const web3 = new Web3(ethereum);
      
      // Get additional account data
      const { balance, chainId, networkName } = await getAccountData(web3, address);
      updateState({
        web3,
        address,
        chainId,
        networkName,
        balance,
        isConnected: true,
        isConnecting: false
      });


      // Setup event listeners
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleDisconnect);

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      updateState({ 
        isConnecting: false, 
        error: 'Failed to connect wallet. Please try again.' 
      });
      return false;
    }
  }, [checkIfMetaMaskInstalled, getAccountData, updateState]);

  // Handle accounts changed
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
      return;
    }

    updateState({
      address: accounts[0]
    });
    refreshState();
  }, [updateState]);

  // Handle chain changed
  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnect();
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    const { ethereum } = window as any;
    
    if (ethereum) {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('disconnect', handleDisconnect);
    }

    updateState({ ...initialState });
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect, updateState]);

  // Refresh state
  const refreshState = useCallback(async () => {
    if (!state.web3 || !state.address) return;

    try {
      const { balance, chainId, networkName } = await getAccountData(state.web3, state.address);
      
      updateState({
        balance,
        chainId,
        networkName
      });
    } catch (error) {
      console.error('Error refreshing state:', error);
      disconnect();
    }
  }, [state.web3, state.address, getAccountData, disconnect, updateState]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number) => {
    if (!state.web3) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      const network = NETWORKS[chainId as keyof typeof NETWORKS];
      if (!network) {
        toast.error('Unsupported network');
        return false;
      }

      const { ethereum } = window as any;
      
      if (ethereum) {
        try {
          // Try switching to the network
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }]
          });
          return true;
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.currency,
                    symbol: network.currency,
                    decimals: 18
                  },
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.explorerUrl]
                }]
              });
              return true;
            } catch (addError) {
              toast.error('Failed to add network to your wallet');
              return false;
            }
          }
          toast.error('Failed to switch network');
          return false;
        }
      } else {
        toast.error('MetaMask is not installed');
        return false;
      }
    } catch (error) {
      console.error('Error switching network:', error);
      toast.error('Failed to switch network');
      return false;
    }
  }, [state.web3]);

  // Check if current network is supported
  const isNetworkSupported = useCallback(() => {
    if (!state.chainId) return false;
    return !!NETWORKS[state.chainId as keyof typeof NETWORKS];
  }, [state.chainId]);

  // Get current network's currency symbol
  const getCurrencySymbol = useCallback(() => {
    if (!state.chainId) return 'ETH';
    return NETWORKS[state.chainId as keyof typeof NETWORKS]?.currency || 'ETH';
  }, [state.chainId]);

  // Auto connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const account = await getCurrentAccount();
      if (account) {
        connect();
      }
    };
    
    autoConnect();
  }, [connect, getCurrentAccount]);

  // Format address for display (0x1234...5678)
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

  // Execute contract call (read)
  const readContract = useCallback(async (
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = []
  ) => {
    if (!state.web3) {
      throw new Error('No web3 instance connected');
    }

    try {
      const contract = new state.web3.eth.Contract(abi, contractAddress);
      return await contract.methods[methodName](...args).call();
    } catch (error) {
      console.error(`Error calling ${methodName}:`, error);
      throw error;
    }
  }, [state.web3]);

  // Execute contract call (write)
  const writeContract = useCallback(async (
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = [],
    options = {}
  ) => {
    if (!state.web3 || !state.address) {
      throw new Error('No web3 instance or address connected');
    }

    try {
      const contract = new state.web3.eth.Contract(abi, contractAddress);
      
      const tx = await contract.methods[methodName](...args).send({
        from: state.address,
        ...options
      });

      return {
        hash: tx.transactionHash,
        receipt: tx
      };
    } catch (error) {
      console.error(`Error calling ${methodName}:`, error);
      throw error;
    }
  }, [state.web3, state.address]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    isNetworkSupported,
    getCurrencySymbol,
    formatAddress,
    readContract,
    writeContract,
    NETWORKS
  };
};

export default useWeb3;