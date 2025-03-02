import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuctionGrid from "../components/auction/AuctionGrid";
import { AuctionDetails } from "../controllers/getEvents";
import Web3 from "web3";

const UserProfilePage: React.FC = () => {
  const { address: userAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();

  // Local state
  const [auctions, setAuctions] = useState<AuctionDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert ETH to Wei
  const toWei = (eth: number): string => {
    return Web3.utils.toWei(eth.toString(), "ether");
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // MOCK DATA: Replace with actual API call
        const mockUserAuctions: AuctionDetails[] = [
          {
            assetType: 0,
            seller: "0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD",
            highestBidder: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            highestBid: toWei(0.75),
            endTime: now - HOUR, // 3 days from now
            ended: true,
            assetAddress: "0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2",
            assetId: 42,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 0, // English
          },
          {
            assetType: 0,
            seller: "0xF5C6825A126623B5d84A4F96C90fbAe36276A12B",
            highestBidder: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
            highestBid: toWei(1.2),
            endTime: now + 2 * DAY, // 2 days from now
            ended: false,
            assetAddress: "0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3",
            assetId: 7,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 1, // Dutch
          },
          {
            assetType: 1,

            seller: "0xD34db33F0000000000000000000000000000000",
            highestBidder: "0x0000000000000000000000000000000000000000", // No bidder yet
            highestBid: toWei(0.35),
            endTime: now - 12 * HOUR, // 12 hours from now
            ended: true,
            assetAddress: "0xC4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5",
            assetId: 19,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 1, // Dutch
          },
          {
            assetType: 0,
            seller: "0x3456789012345678901234567890123456789012",
            highestBidder: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
            highestBid: toWei(2.5),
            endTime: now + 4 * DAY, // 4 days from now
            ended: false,
            assetAddress: "0xD5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6",
            assetId: 103,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 0, // English
          },
          {
            assetType: 1,
            seller: "0x7890123456789012345678901234567890123456",
            highestBidder: "0x2345678901234567890123456789012345678901",
            highestBid: toWei(0.85),
            endTime: now + 3 * DAY, // 3 days from now
            ended: false,
            assetAddress: "0xE6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7",
            assetId: 55,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 1, // Dutch
          },
          {
            assetType: 1,
            seller: "0x2468135790246813579024681357902468135790",
            highestBidder: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
            highestBid: toWei(4.2),
            endTime: now + 6 * DAY, // 6 days from now
            ended: false,
            assetAddress: "0xF7A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2",
            assetId: 87,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 0, // English
          },
          {
            assetType: 0,
            seller: "0x1357924680135792468013579246801357924680",
            highestBidder: "0x54321ABCDE54321ABCDE54321ABCDE54321ABCDE",
            highestBid: toWei(1.1),
            endTime: now + 6 * HOUR, // 6 hours from now
            ended: false,
            assetAddress: "0x8A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B",
            assetId: 124,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 0, // English
          },
          {
            assetType: 1,
            seller: "0x9876543210987654321098765432109876543210",
            highestBidder: "0x0000000000000000000000000000000000000000", // No bidder yet
            highestBid: toWei(0.45),
            endTime: now + 36 * HOUR, // 36 hours from now
            ended: false,
            assetAddress: "0x9A2B3C4D5E6F7A2B3C4D5E6F7A2B3C4D5E6F7A2B",
            assetId: 213,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 1, // Dutch
          },
          {
            assetType: 0,
            seller: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
            highestBidder: "0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0",
            highestBid: toWei(3.2),
            endTime: now + 5 * DAY, // 5 days from now
            ended: false,
            assetAddress: "0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2",
            assetId: 67,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 0, // English
          },
          {
            assetType: 1,
            seller: "0x54321ABCDE54321ABCDE54321ABCDE54321ABCDE",
            highestBidder: "0x1111222233334444555566667777888899990000",
            highestBid: toWei(1.8),
            endTime: now - 2 * HOUR, // 2 hours ago
            ended: true,
            assetAddress: "0xB2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3",
            assetId: 89,
            amount: toWei(1), // 1 token
            paymentToken: "0x0000000000000000000000000000000000000000", // ETH
            type: 0, // English
          },
        ];

        setAuctions(mockUserAuctions);
      } catch (err) {
        console.error("Error fetching user auctions:", err);
        setError("Failed to load user auctions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAuctions();
  }, [userAddress]);

  // Format address for display
  const formatAddress = (address: string | undefined): string => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-400 hover:text-purple-300 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
      </div>

      {/* User profile header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-6">
            {userAddress ? userAddress.substring(2, 4).toUpperCase() : "UN"}
          </div>

          {/* User info */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              User Auctions
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-300 font-mono">
                {userAddress || "Address not provided"}
              </p>
              {userAddress && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userAddress);
                    // You could add a toast notification here
                  }}
                  className="text-gray-400 hover:text-gray-300"
                  title="Copy address"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
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
