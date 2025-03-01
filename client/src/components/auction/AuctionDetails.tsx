import React, { useState } from "react";
//import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CountdownTimer from "./CountdownTimer";
import AuctionTypeTag from "./AuctionTypeTag";
import Web3 from "web3";
import { useAppSelector, /*useAppDispatch */} from "../../hooks/redux";

interface AuctionDetailsProps {
  auction: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    currentBid: string; // in wei
    currency: string;
    endTime: number; // timestamp
    auctionType: "english" | "dutch" | "sealed" | "timed";
    tokenType: "ERC721" | "ERC1155" | "ERC20" | "physical";
    seller: {
      address: string;
      name: string;
    };
    bidCount: number;
    chainId: number;
  };
  onPlaceBid?: (bidAmount: string) => Promise<void>;
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({
  auction,
  onPlaceBid,
}) => {
  const {
    id,
    title,
    description,
    imageUrl,
    currentBid,
    currency,
    endTime,
    auctionType,
    tokenType,
    seller,
    bidCount,
    chainId,
  } = auction;

  // const navigate = useNavigate();
  // const dispatch = useAppDispatch();

  // Get web3 state
  const { isConnected, address, networkName } = useAppSelector(
    (state) => state.web3
  );

  // Local state
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  // Format current bid from wei to ETH
  const formattedCurrentBid = Web3.utils.fromWei(currentBid, "ether");

  // Calculate minimum bid (current bid + 10%)
  const minBidAmount = parseFloat(formattedCurrentBid) * 1.1;

  // Determine if the auction has ended
  const hasEnded = Date.now() > endTime;

  // Determine if current user is the seller
  const isUserSeller =
    isConnected &&
    address &&
    address.toLowerCase() === seller.address.toLowerCase();

  // Handle bid submission
  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet to place a bid");
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) < minBidAmount) {
      toast.error(
        `Bid must be at least ${minBidAmount.toFixed(4)} ${currency}`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (onPlaceBid) {
        await onPlaceBid(bidAmount);
        toast.success("Bid placed successfully!");
        setBidAmount("");
        setShowBidForm(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place bid");
      console.error("Bid error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Share auction
  const handleShareAuction = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info("Auction link copied to clipboard!");
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Image */}
        <div className="lg:col-span-3 relative">
          <div className="relative h-[400px] lg:h-full">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex space-x-2">
              <AuctionTypeTag type={auctionType} />
              <div className="bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg">
                {tokenType}
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              <CountdownTimer endTime={endTime} />
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>

          <div className="flex items-center mb-4">
            <div className="mr-2 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs">
              {seller.name ? seller.name.charAt(0) : "S"}
            </div>
            <div>
              <p className="text-sm text-gray-400">Created by</p>
              <p className="text-sm font-medium text-white">
                {seller.name ||
                  `${seller.address.substring(
                    0,
                    6
                  )}...${seller.address.substring(seller.address.length - 4)}`}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Current bid</p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">
                {parseFloat(formattedCurrentBid).toFixed(4)}
              </span>
              <span className="ml-1 text-purple-400">{currency}</span>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-400">{bidCount} bids</p>
              <p className="text-sm text-gray-400">
                On {networkName || `Chain ID: ${chainId}`}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {!hasEnded ? (
            <>
              {!isUserSeller ? (
                showBidForm ? (
                  <form onSubmit={handleSubmitBid} className="mb-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Your bid (min. {minBidAmount.toFixed(4)} {currency})
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          step="0.0001"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-2 text-white"
                          placeholder={`${minBidAmount.toFixed(4)}`}
                          min={minBidAmount}
                          required
                        />
                        <div className="bg-gray-600 px-3 py-2 rounded-r-lg flex items-center">
                          <span>{currency}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-2 rounded-lg hover:from-purple-700 hover:to-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Processing..." : "Place Bid"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBidForm(false)}
                        className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 rounded-lg hover:from-purple-700 hover:to-blue-600 mb-4"
                  >
                    Place a Bid
                  </button>
                )
              ) : (
                <div className="bg-gray-700 text-center p-4 rounded-lg mb-4">
                  <p className="text-gray-300">You created this auction</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-700 text-center p-4 rounded-lg mb-4">
              <p className="text-gray-300">This auction has ended</p>
            </div>
          )}

          <button
            onClick={handleShareAuction}
            className="w-full border border-gray-600 text-white font-medium py-3 rounded-lg hover:bg-gray-700"
          >
            Share Auction
          </button>
        </div>
      </div>

      {/* Additional Information Tabs (can be expanded later) */}
      <div className="border-t border-gray-700 p-6">
        <div className="flex space-x-4 border-b border-gray-700">
          <button className="pb-2 px-1 text-purple-400 border-b-2 border-purple-400 font-medium">
            Details
          </button>
          <button className="pb-2 px-1 text-gray-400 hover:text-gray-300">
            History
          </button>
          <button className="pb-2 px-1 text-gray-400 hover:text-gray-300">
            Bids
          </button>
        </div>

        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Token Standard</h3>
              <p className="text-white">{tokenType}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Auction Type</h3>
              <p className="text-white capitalize">{auctionType}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Creator Address</h3>
              <p className="text-white font-mono text-sm">{seller.address}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Auction ID</h3>
              <p className="text-white font-mono text-sm">{id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
