import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../hooks/redux";
import { toast } from "react-toastify";
import Web3 from "web3";

interface BidFormProps {
  auctionId: string;
  currentBid: string;
  minBidIncrement?: number; // percentage, e.g., 10 for 10%
  currency: string;
  endTime: number;
  onBidSubmit: (bidAmount: string) => Promise<void>;
}

const BidForm: React.FC<BidFormProps> = ({
  auctionId,
  currentBid,
  minBidIncrement = 10,
  currency,
  endTime,
  onBidSubmit,
}) => {
  // Local state
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redux state
  const { isConnected, balance,/* address*/ } = useAppSelector(
    (state) => state.web3
  );

  // Format current bid from wei to ETH
  const formattedCurrentBid = Web3.utils.fromWei(currentBid, "ether");
  
  // Calculate minimum bid amount (current bid + increment %)
  const minBidAmount = parseFloat(formattedCurrentBid) * (1 + minBidIncrement / 100);
  
  // Format the minimum bid for display
  const formattedMinBid = minBidAmount.toFixed(4);
  
  // Check if auction has ended
  const hasEnded = Date.now() > endTime;
  
  // Debug information
  console.log({
    isConnected,
    hasEnded,
    currentBid,
    minBidAmount,
    balance,
    showForm
  });
  
  // Reset form when auction changes
  useEffect(() => {
    setBidAmount("");
    setError(null);
    setShowForm(false);
  }, [auctionId]);
  
  // Validate bid amount on change
  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);
    
    if (value && parseFloat(value) < minBidAmount) {
      setError(`Minimum bid is ${formattedMinBid} ${currency}`);
    } else {
      setError(null);
    }
  };
  
  // Handle bid submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet to place a bid");
      return;
    }
    
    if (hasEnded) {
      toast.error("This auction has ended");
      return;
    }
    
    if (!bidAmount || parseFloat(bidAmount) < minBidAmount) {
      setError(`Minimum bid is ${formattedMinBid} ${currency}`);
      return;
    }
    
    // Check if user has enough balance
    if (balance) {
      const balanceEth = parseFloat(balance);
      const bidAmountEth = parseFloat(bidAmount);
      
      if (bidAmountEth > balanceEth) {
        toast.error(`Insufficient balance. You have ${balanceEth.toFixed(4)} ${currency}`);
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await onBidSubmit(bidAmount);
      
      toast.success("Bid placed successfully!");
      setBidAmount("");
      setShowForm(false);
    } catch (error: any) {
      setError(error.message || "Failed to submit bid");
      toast.error(error.message || "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If the auction has ended
  if (hasEnded) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-300">This auction has ended</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Current bid</p>
            <p className="text-xl font-bold text-white">
              {parseFloat(formattedCurrentBid).toFixed(4)} {currency}
            </p>
          </div>
          
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              disabled={!isConnected || hasEnded}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Place Bid
            </button>
          ) : (
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Your bid (Min. {formattedMinBid} {currency})
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="number"
                step="0.0001"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                placeholder={formattedMinBid}
                value={bidAmount}
                onChange={handleBidAmountChange}
                disabled={isSubmitting}
                min={minBidAmount}
                required
              />
              <div className="bg-gray-600 px-3 flex items-center justify-center rounded-r-md">
                <span className="text-gray-300">{currency}</span>
              </div>
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || !!error || !bidAmount}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-md hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Place Bid of ${bidAmount || formattedMinBid} ${currency}`
              )}
            </button>
            
            {isConnected && balance && (
              <p className="text-xs text-center text-gray-400">
                Your balance: {parseFloat(balance).toFixed(4)} {currency}
              </p>
            )}
            
            {!isConnected && (
              <p className="text-xs text-center text-yellow-400">
                Please connect your wallet to place a bid
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default BidForm;