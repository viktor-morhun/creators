import { AuctionDetails } from '../../components/auction/AuctionCard';
import Web3 from 'web3';

// Calculate timestamps
const now = Date.now();
const DAY = 86400000;
const HOUR = 3600000;

// Helper to convert ETH to Wei
const toWei = (eth: number): string => {
  return Web3.utils.toWei(eth.toString(), 'ether');
};

export const MOCK_AUCTIONS: AuctionDetails[] = [
  {
    id: '1',
    seller: '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
    highestBidder: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    highestBid: toWei(0.75),
    endTime: now - HOUR, // 3 days from now
    ended: true,
    assetAddress: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
    assetId: 42,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '2',
    seller: '0xF5C6825A126623B5d84A4F96C90fbAe36276A12B',
    highestBidder: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    highestBid: toWei(1.2),
    endTime: now + (2 * DAY), // 2 days from now
    ended: false,
    assetAddress: '0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3',
    assetId: 7,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 1 // Dutch
  },
  {
    id: '3',
    seller: '0xD34db33F0000000000000000000000000000000',
    highestBidder: '0x0000000000000000000000000000000000000000', // No bidder yet
    highestBid: toWei(0.35),
    endTime: now - (12 * HOUR), // 12 hours from now
    ended: true,
    assetAddress: '0xC4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5',
    assetId: 19,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 1 // Dutch
  },
  {
    id: '4',
    seller: '0x3456789012345678901234567890123456789012',
    highestBidder: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
    highestBid: toWei(2.5),
    endTime: now + (4 * DAY), // 4 days from now
    ended: false,
    assetAddress: '0xD5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6',
    assetId: 103,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '5',
    seller: '0x7890123456789012345678901234567890123456',
    highestBidder: '0x2345678901234567890123456789012345678901',
    highestBid: toWei(0.85),
    endTime: now + (3 * DAY), // 3 days from now
    ended: false,
    assetAddress: '0xE6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7',
    assetId: 55,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 1 // Dutch
  },
  {
    id: '6',
    seller: '0x2468135790246813579024681357902468135790',
    highestBidder: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    highestBid: toWei(4.2),
    endTime: now + (6 * DAY), // 6 days from now
    ended: false,
    assetAddress: '0xF7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2',
    assetId: 87,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '7',
    seller: '0x1357924680135792468013579246801357924680',
    highestBidder: '0x54321ABCDE54321ABCDE54321ABCDE54321ABCDE',
    highestBid: toWei(1.1),
    endTime: now + (6 * HOUR), // 6 hours from now
    ended: false,
    assetAddress: '0x8A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B',
    assetId: 124,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '8',
    seller: '0x9876543210987654321098765432109876543210',
    highestBidder: '0x0000000000000000000000000000000000000000', // No bidder yet
    highestBid: toWei(0.45),
    endTime: now + (36 * HOUR), // 36 hours from now
    ended: false,
    assetAddress: '0x9A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B',
    assetId: 213,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 1 // Dutch
  },
  {
    id: '9',
    seller: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    highestBidder: '0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0',
    highestBid: toWei(3.2),
    endTime: now + (5 * DAY), // 5 days from now
    ended: false,
    assetAddress: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
    assetId: 67,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '10',
    seller: '0x54321ABCDE54321ABCDE54321ABCDE54321ABCDE',
    highestBidder: '0x1111222233334444555566667777888899990000',
    highestBid: toWei(1.8),
    endTime: now - (2 * HOUR), // 2 hours ago
    ended: true,
    assetAddress: '0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3',
    assetId: 89,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '11',
    seller: '0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0',
    highestBidder: '0x0000000000000000000000000000000000000000', // No bidder yet
    highestBid: toWei(0.6),
    endTime: now + (8 * HOUR), // 8 hours from now
    ended: false,
    assetAddress: '0xC4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5',
    assetId: 178,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 1 // Dutch
  },
  {
    id: '12',
    seller: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
    highestBidder: '0xFASHION123456789FASHION123456789FASHION12',
    highestBid: toWei(5.5),
    endTime: now + (7 * DAY), // 7 days from now
    ended: false,
    assetAddress: '0xD5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6',
    assetId: 299,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '13',
    seller: '0x1111222233334444555566667777888899990000',
    highestBidder: '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
    highestBid: toWei(0.95),
    endTime: now + (48 * HOUR), // 48 hours from now
    ended: false,
    assetAddress: '0xE6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7',
    assetId: 302,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '14',
    seller: '0xFASHION123456789FASHION123456789FASHION12',
    highestBidder: '0xF5C6825A126623B5d84A4F96C90fbAe36276A12B',
    highestBid: toWei(1.35),
    endTime: now + (4.5 * DAY), // 4.5 days from now
    ended: false,
    assetAddress: '0xF7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2',
    assetId: 84,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '15',
    seller: '0xHISTORY123456789HISTORY123456789HISTORY',
    highestBidder: '0xD34db33F0000000000000000000000000000000',
    highestBid: toWei(2.2),
    endTime: now + (60 * HOUR), // 60 hours from now
    ended: false,
    assetAddress: '0x8A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B',
    assetId: 427,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 0 // English
  },
  {
    id: '16',
    seller: '0xAI1234567890AI1234567890AI1234567890AI12',
    highestBidder: '0x3456789012345678901234567890123456789012',
    highestBid: toWei(0.85),
    endTime: now - (1 * DAY), // 1 day ago
    ended: true,
    assetAddress: '0x9A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B',
    assetId: 156,
    amount: toWei(1), // 1 token
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    type: 1 // Dutch
  }
];

export default MOCK_AUCTIONS;