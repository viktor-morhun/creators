// This file exports TypeScript types and interfaces used throughout the application.

export type WalletAddress = string;

export interface ConnectionState {
  isConnected: boolean;
  address?: WalletAddress;
}

export interface MetaMaskProvider {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isMetaMaskInstalled: () => boolean;
}