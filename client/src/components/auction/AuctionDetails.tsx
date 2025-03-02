import { useState } from "react";
import { toast } from "react-toastify";
import CountdownTimer from "./CountdownTimer";
import Web3 from "web3";
import { useAppSelector } from "../../hooks/redux";
import { AuctionDetails as AuctionDetailsType } from "../../controllers/getEvents";

interface AuctionDetailsProps {
  auction: AuctionDetailsType;
  onPlaceBid?: (bidAmount: string) => Promise<void>;
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({
  auction,
  onPlaceBid,
}) => {
  const {
    seller,
    highestBidder,
    highestBid,
    endTime,
    ended,
    assetAddress,
    assetId,
    amount,
    assetType,
    paymentToken,
    type,
    erc20,
    nft,
  } = auction;

  // Get web3 state
  const { isConnected, address, networkName } = useAppSelector(
    (state) => state.web3
  );

  // Local state
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  // Format addresses for display
  const formatAddress = (addr: string): string => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000")
      return "None";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Format current bid from wei to ETH
  const formattedCurrentBid = Web3.utils.fromWei(highestBid, "ether");

  // Determine currency symbol based on payment token
  const currency =
    paymentToken === "0x0000000000000000000000000000000000000000"
      ? "ETH"
      : "TOKEN";

  // Calculate minimum bid (current bid + 10%)
  const minBidAmount = parseFloat(formattedCurrentBid) * 1.1;

  // Determine if the auction has ended
  const hasEnded = ended || Date.now() > endTime;

  // Determine if current user is the seller
  const isUserSeller =
    isConnected && address && address.toLowerCase() === seller.toLowerCase();

  // Determine if there are any bids (for English auctions)
  const hasBids =
    type === 0 &&
    highestBidder !== "0x0000000000000000000000000000000000000000";

  // Get auction type text
  const getAuctionTypeText = () => {
    switch (type) {
      case 0:
        return "English";
      case 1:
        return "Dutch";
      default:
        return "Unknown";
    }
  };

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

  if(false ) {
    //to ignore unused vars on deployment
    console.log (erc20, nft);
  }

  // Share auction
  const handleShareAuction = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info("Auction link copied to clipboard!");
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Image/Asset Display */}
        <div className="lg:col-span-3 relative">
          <div className="relative h-[400px] lg:h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
            {
              /* NFT Image */ assetType === 1 && (
                <img src="SRC for image" alt="nft image" />
              )
            }
            {/* NFT Information Display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4">
                #{assetId}
              </div>
              <div className="text-xl text-gray-300 mb-2">Asset Address:</div>
              <div className="font-mono text-sm text-gray-300 mb-4 px-6">
                {assetAddress}
              </div>
              <div className="inline-block bg-gray-900 bg-opacity-70 rounded-lg px-4 py-2">
                <div className="text-sm text-gray-400 mb-1">Token Amount</div>
                <div className="text-white font-medium">
                  {Web3.utils.fromWei(amount, "ether")}
                </div>
              </div>
            </div>

            {/* Auction Type Badge */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <div
                className={`px-2 py-1 rounded-lg text-sm font-medium ${
                  type === 0
                    ? "bg-purple-500 bg-opacity-70"
                    : "bg-blue-500 bg-opacity-70"
                }`}
              >
                {getAuctionTypeText()} Auction
              </div>
            </div>

            {/* Countdown Timer */}
            {!hasEnded && (
              <div className="absolute bottom-4 right-4">
                <CountdownTimer endTime={endTime} />
              </div>
            )}

            {/* Status Badge */}
            {hasEnded && (
              <div className="absolute top-4 right-4 bg-red-500 bg-opacity-70 px-3 py-1 rounded-lg text-sm font-medium">
                Ended
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">NFT #{assetId}</h1>

          <div className="flex items-center mb-4">
            <div className="mr-2 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">
              {seller.substring(2, 3).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-400">Listed by</p>
              <p className="text-sm font-medium text-white">
                {formatAddress(seller)}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">
              {type === 0 ? "Current bid" : "Starting price"}
            </p>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">
                {parseFloat(formattedCurrentBid).toFixed(4)}
              </span>
              <span className="ml-1 text-purple-400">{currency}</span>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-400">
                {hasBids
                  ? `Highest bidder: ${formatAddress(highestBidder)}`
                  : "No bids yet"}
              </p>
              <p className="text-sm text-gray-400">
                {networkName || "Ethereum"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <div className="text-gray-300 text-sm leading-relaxed">
              <p>
                This is an on-chain auction for NFT #{assetId} from collection{" "}
                {formatAddress(assetAddress)}.
              </p>
              <p className="mt-2">
                The auction will {hasEnded ? "ended" : "end"} at{" "}
                {new Date(endTime).toLocaleString()}.
              </p>
            </div>
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
              {hasBids ? (
                <p className="text-sm mt-2 text-gray-400">
                  Won by: {formatAddress(highestBidder)}
                </p>
              ) : (
                <p className="text-sm mt-2 text-gray-400">
                  No bids were placed
                </p>
              )}
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

      {/* Additional Information Tabs */}
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
              <h3 className="text-sm text-gray-400 mb-1">Asset ID</h3>
              <p className="text-white">#{assetId}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Auction Type</h3>
              <p className="text-white">{getAuctionTypeText()}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Seller Address</h3>
              <p className="text-white font-mono text-sm">{seller}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Asset Address</h3>
              <p className="text-white font-mono text-sm">{assetAddress}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Payment Token</h3>
              <p className="text-white font-mono text-sm">{paymentToken}</p>
            </div>
            {assetId && (
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Auction ID</h3>
                <p className="text-white font-mono text-sm">{assetId}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
