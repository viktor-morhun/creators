import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuctionGrid from '../components/auction/AuctionGrid';
import { AuctionDetails } from '../components/auction/AuctionCard';
import Web3 from 'web3';

const UserProfilePage: React.FC = () => {
  const { address: userAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  
  // Local state
  const [auctions, setAuctions] = useState<AuctionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert ETH to Wei
  const toWei = (eth: number): string => {
    return Web3.utils.toWei(eth.toString(), 'ether');
  };

  // Current timestamp and time constants for mock data
  const now = Date.now();
  const DAY = 86400000;
  const HOUR = 3600000;

  // Load user auctions
  useEffect(() => {
    const fetchUserAuctions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // MOCK DATA: Replace with actual API call
        const mockUserAuctions: AuctionDetails[] = [
          {
            id: '101',
            seller: userAddress || '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
            highestBidder: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            highestBid: toWei(0.75),
            endTime: now + (3 * DAY),
            ended: false,
            assetAddress: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
            assetId: 42,
            amount: toWei(1),
            paymentToken: '0x0000000000000000000000000000000000000000',
            type: 0 // English
          },
          {
            id: '102',
            seller: userAddress || '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
            highestBidder: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
            highestBid: toWei(1.2),
            endTime: now + (2 * DAY),
            ended: false,
            assetAddress: '0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3',
            assetId: 7,
            amount: toWei(1),
            paymentToken: '0x0000000000000000000000000000000000000000',
            type: 0 // English
          },
          {
            id: '103',
            seller: userAddress || '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
            highestBidder: '0x0000000000000000000000000000000000000000',
            highestBid: toWei(0.35),
            endTime: now + (12 * HOUR),
            ended: false,
            assetAddress: '0xC4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5',
            assetId: 19,
            amount: toWei(1),
            paymentToken: '0x0000000000000000000000000000000000000000',
            type: 1 // Dutch
          },
          {
            id: '104',
            seller: userAddress || '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
            highestBidder: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
            highestBid: toWei(2.5),
            endTime: now - (1 * DAY), // Ended auction
            ended: true,
            assetAddress: '0xD5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6',
            assetId: 103,
            amount: toWei(1),
            paymentToken: '0x0000000000000000000000000000000000000000',
            type: 0 // English
          }
        ];
        
        setAuctions(mockUserAuctions);
      } catch (err) {
        console.error('Error fetching user auctions:', err);
        setError('Failed to load user auctions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAuctions();
  }, [userAddress]);

  // Format address for display
  const formatAddress = (address: string | undefined): string => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-purple-400 hover:text-purple-300 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* User profile header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-6">
            {userAddress ? userAddress.substring(2, 4).toUpperCase() : 'UN'}
          </div>
          
          {/* User info */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              User Auctions
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-300 font-mono">{userAddress || 'Address not provided'}</p>
              {userAddress && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(userAddress);
                    // You could add a toast notification here
                  }}
                  className="text-gray-400 hover:text-gray-300"
                  title="Copy address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 p-4 rounded-lg mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Auctions grid */}
      <AuctionGrid 
        auctions={auctions} 
        loading={loading}
        title="User Auctions"
        emptyMessage="No auctions found for this user"
      />

      {/* Commented code below shows how to replace mock data with actual API call */}
      {/* 
      // Replace the useEffect with this when ready for real data:
      
      useEffect(() => {
        const fetchUserAuctions = async () => {
          setLoading(true);
          setError(null);
          
          try {
            // Replace with your actual API endpoint
            const response = await fetch(`/api/users/${userAddress}/auctions`);
            
            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            setAuctions(data.auctions);
          } catch (err) {
            console.error('Error fetching user auctions:', err);
            setError('Failed to load user auctions. Please try again.');
          } finally {
            setLoading(false);
          }
        };
        
        if (userAddress) {
          fetchUserAuctions();
        } else {
          setError('User address not provided');
          setLoading(false);
        }
      }, [userAddress]);
      */}
    </div>
  );
};

export default UserProfilePage;