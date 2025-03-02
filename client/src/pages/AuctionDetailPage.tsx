import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchAuctionById } from "../store/slices/auctionsSlice";
import { getWeb3 } from "../store/slices/web3Slice";
import AuctionTypeTag from "../components/auction/AuctionTypeTag";
import CountdownTimer from "../components/auction/CountdownTimer";
import BidForm from "../components/auction/BidForm";
import BidHistory from "../components/auction/BidHistory";
import Web3 from "web3";

// Mock bid data for development
const mockBids = [
  {
    id: "bid1",
    bidder: {
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      name: "Crypto_Collector",
    },
    amount: Web3.utils.toWei("0.75", "ether"),
    timestamp: Date.now() - 3600000, // 1 hour ago
    txHash:
      "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234",
  },
  {
    id: "bid2",
    bidder: {
      address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    },
    amount: Web3.utils.toWei("0.7", "ether"),
    timestamp: Date.now() - 7200000, // 2 hours ago
    txHash:
      "0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcd",
  },
  {
    id: "bid3",
    bidder: {
      address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
      name: "DigitalArtFan",
    },
    amount: Web3.utils.toWei("0.65", "ether"),
    timestamp: Date.now() - 14400000, // 4 hours ago
    txHash:
      "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
  },
];

// Define the ABI interface type
interface AbiItem {
  inputs?: Array<{ name: string; type: string }>;
  name?: string;
  outputs?: Array<{ name: string; type: string }>;
  stateMutability?: string;
  type: string;
}

const AUCTION_ABI: AbiItem[] = [
  // Place your smart contract ABI here
  // Example: { "inputs": [], "name": "placeBid", "outputs": [], "stateMutability": "payable", "type": "function" }
];

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //fetch auction data here
  const { currentAuction, loading, error } = useAppSelector(
    (state) => state.auctions
  );
  const { isConnected, address } = useAppSelector(
    (state) => state.web3
  );

  const [contractInstance, setContractInstance] = useState<any>(null);
  const [bids, setBids] = useState(mockBids); // In a real app, this would be fetched from the blockchain
  const [loadingBids, setLoadingBids] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [shareTooltip, setShareTooltip] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAuctionById(Number(id)));
    }
  }, [dispatch, id]);

  // Initialize contract when auction data is available
  useEffect(() => {
    const initializeContract = async () => {
      if (currentAuction && isConnected) {
        try {
          const web3 = getWeb3();
          if (!web3) return;

          // In production, you would get this address from your auction data
          const mockContractAddress =
            "0x1234567890123456789012345678901234567890";

          // Create contract instance
          const auctionContract = new web3.eth.Contract(
            AUCTION_ABI as any,
            mockContractAddress
          );

          setContractInstance(auctionContract);
        } catch (error) {
          console.error("Failed to initialize contract:", error);
        }
      }
    };

    initializeContract();
  }, [currentAuction, isConnected]);

  // // Check if user is on the correct chain
  // useEffect(() => {
  //   if (isConnected && currentAuction && chainId !== currentAuction.chainId) {
  //     toast.warning(
  //       `This auction is on a different network. Please switch to ${getNetworkName(
  //         currentAuction.chainId
  //       )}.`
  //     );
  //   }
  // }, [isConnected, currentAuction, chainId]);

  // Auto-hide share tooltip after showing
  useEffect(() => {
    if (shareTooltip) {
      const timer = setTimeout(() => {
        setShareTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shareTooltip]);

  // // Helper function to get network name from chain ID
  // const getNetworkName = (id: number) => {
  //   switch (id) {
  //     case 1:
  //       return "Ethereum Mainnet";
  //     case 137:
  //       return "Polygon";
  //     case 42161:
  //       return "Arbitrum";
  //     default:
  //       return `Network ID ${id}`;
  //   }
  // };

  // Handle share auction
  const handleShareAuction = () => {
    const url = window.location.href;

    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: "Auction Details",
          text: `Check out this auction: Lot#${currentAuction?.assetId}`,
          url: url,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => {
          console.error("Error sharing:", error);
          fallbackShare(url);
        });
    } else {
      fallbackShare(url);
    }
  };

  // Fallback share method using clipboard
  const fallbackShare = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareTooltip(true);
        toast.success("Auction link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        toast.error("Failed to copy URL to clipboard");
      });
  };

  // Mock function to fetch bids - in a real app, this would query the blockchain
  const fetchBids = async () => {
    setLoadingBids(true);
    try {
      // In a real app, you would call your contract or API here
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      toast.error("Failed to load bid history");
      console.error(error);
    } finally {
      setLoadingBids(false);
    }
  };

  // Handle place bid
  const handlePlaceBid = async (bidAmount: string) => {
    if (!isConnected || !address || !contractInstance) {
      toast.error("Please connect your wallet to place a bid");
      return Promise.reject(new Error("Wallet not connected"));
    }

    if (!currentAuction) {
      return Promise.reject(new Error("Auction data not available"));
    }

    try {
      // Convert ETH to Wei
      const bidAmountWei = Web3.utils.toWei(bidAmount, "ether");

      // In an actual implementation, you would call your smart contract
      // await contractInstance.methods.placeBid().send({
      //   from: address,
      //   value: bidAmountWei
      // });

      // For development, simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(
        `Placed bid of ${bidAmount} ETH (${bidAmountWei} Wei) on auction ${id}`
      );

      // Add the new bid to the local state
      const newBid = {
        id: `bid-${Date.now()}`,
        bidder: {
          address: address,
          name: "You",
        },
        amount: bidAmountWei,
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };

      setBids([newBid, ...bids]);

      // Refresh auction data after successful bid
      dispatch(fetchAuctionById(Number(id!)));

      // Show success message
      toast.success("Bid placed successfully!");

      return Promise.resolve();
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast.error(error.message || "Failed to place bid");
      return Promise.reject(new Error(error.message || "Failed to place bid"));
    }
  };

  // Show loading, error, or auction not found states
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-20">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-purple-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg text-gray-300">
            Loading auction details...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500 bg-opacity-20 border border-red-600 text-red-200 rounded-lg p-4 mb-6">
          <p>Error loading auction: {error}</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!currentAuction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-500 bg-opacity-20 border border-yellow-600 text-yellow-200 rounded-lg p-4 mb-6">
          <p>Auction not found</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-purple-400 hover:text-purple-300 font-medium"
        >
          ← Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main auction details */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-6">
            {/* Image Container */}
            <div className="relative">
              <div className="w-full h-[400px] bg-gradient-to-br from-purple-900 via-gray-800 to-black flex items-center justify-center"></div>
              <div className="absolute top-4 left-4 flex space-x-2">
                <AuctionTypeTag type={currentAuction.type} />
                <div className="bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg">
                  {currentAuction.paymentToken}
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <CountdownTimer endTime={currentAuction.endTime} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                LOT#{currentAuction.assetId}
              </h1>

              <div className="flex items-center mb-4">
                <div className="mr-2 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs">
                  {currentAuction.seller
                    ? currentAuction.seller.charAt(0)
                    : "S"}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="text-sm font-medium text-white">
                    {`${currentAuction.seller.substring(
                      0,
                      6
                    )}...${currentAuction.seller.substring(
                      currentAuction.seller.length - 4
                    )}`}
                  </p>
                </div>
              </div>

              {/* Tab navigation */}
              <div className="border-b border-gray-700 mb-4">
                <div className="flex space-x-6">
                  <button
                    className={`pb-3 px-1 font-medium ${
                      activeTab === "details"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>
                  <button
                    className={`pb-3 px-1 font-medium ${
                      activeTab === "bids"
                        ? "text-purple-400 border-b-2 border-purple-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("bids")}
                  >
                    Bids ({bids.length})
                  </button>
                </div>
              </div>

              {/* Tab content */}
              {activeTab === "details" ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">
                        Token Standard
                      </h3>
                      <p className="text-white">{`currentAuction ЗАМІНИТИ `}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">
                        Auction Type
                      </h3>
                      <p className="text-white capitalize">
                        {currentAuction.type ? "Dutch" : "English"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-400 mb-1">
                        Creator Address
                      </h3>
                      <p className="text-white font-mono text-sm">
                        {currentAuction.seller}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={handleShareAuction}
                      className="w-full border border-gray-600 text-white font-medium py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share Auction
                    </button>

                    {shareTooltip && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 bg-purple-500 text-white text-sm py-2 px-3 rounded-lg">
                        Link copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <BidHistory
                  auctionId={`${currentAuction.assetId}`}
                  currency={currentAuction.paymentToken}
                  bids={bids}
                  isLoading={loadingBids}
                  fetchBids={fetchBids}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Bid area */}
        <div className="lg:col-span-1">
          <BidForm
            auctionId={`${currentAuction.assetId}`}
            currentBid={currentAuction.highestBid}
            minBidIncrement={10}
            currency={currentAuction.paymentToken}
            endTime={currentAuction.endTime}
            onBidSubmit={handlePlaceBid}
          />

          {/* Creator Info */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              About Creator
            </h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl mr-4">
                {currentAuction.seller ? currentAuction.seller.charAt(0) : "S"}
              </div>
              <div>
                <h4 className="font-medium text-base w-[280px] block truncate text-white">
                  {currentAuction.seller ||
                  `${currentAuction.seller.substring(0, 6)}...`}
                </h4>
                <p className="text-sm text-gray-400">Creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
