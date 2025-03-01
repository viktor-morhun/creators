import { useState } from "react";
import { Link } from "react-router-dom";
//import { useWeb3 } from "../hooks/useWeb3";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuctionCreatePage: React.FC = () => {
  //const { account, connected } = useWeb3();
  //const account = "qdqwdwq";
  const navigate = useNavigate();
  const connected = true;

  // Form state
  const [auctionType, setAuctionType] = useState<string>("English");
  const [assetType, setAssetType] = useState<string>("ERC20");
  const [assetAddress, setAssetAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [bidAssetAddress, setBidAssetAddress] = useState<string>("");
  const [collectionAddress, setCollectionAddress] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [startBid, setStartBid] = useState<string>("");
  const [reservedPrice, setReservedPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("24"); // Default 24 hours
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const showError = (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const isValidAddress = (address: string) =>
      /^0x[a-fA-F0-9]{40}$/.test(address);
    const isValidNumber = (value: string) => /^[0-9]+(\.[0-9]+)?$/.test(value);

    if (assetType === "ERC20") {
      if (!assetAddress || !isValidAddress(assetAddress)) {
        errors.assetAddress =
          "Invalid asset address (must be a valid 0x... address).";
        showError("Invalid asset address (must be a valid 0x... address).");
      }
      if (!amount || !isValidNumber(amount)) {
        errors.amount = "Amount must be a valid number.";
        showError("Amount must be a valid number.");
      }
    }

    if (assetType === "ERC721") {
      if (!collectionAddress || !isValidAddress(collectionAddress)) {
        errors.collectionAddress =
          "Invalid collection address (must be a valid 0x... address).";
        showError(
          "Invalid collection address (must be a valid 0x... address)."
        );
      }
      if (!itemId || isNaN(Number(itemId))) {
        errors.itemId = "Item ID must be a valid number.";
        showError("Item ID must be a valid number.");
      }
    }

    if (!bidAssetAddress || !isValidAddress(bidAssetAddress)) {
      errors.bidAssetAddress =
        "Invalid bid asset address (must be a valid 0x... address).";
      showError("Invalid bid asset address (must be a valid 0x... address).");
    }

    if (auctionType === "Dutch") {
      if (!reservedPrice || !isValidNumber(reservedPrice)) {
        errors.reservedPrice = "Reserved price must be a valid number.";
        showError("Reserved price must be a valid number.");
      }
    } else {
      if (!startBid || !isValidNumber(startBid)) {
        errors.startBid = "Starting bid must be a valid number.";
        showError("Starting bid must be a valid number.");
      }
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      errors.duration = "Duration must be a positive number.";
      showError("Duration must be a positive number.");
    }

    return errors;
  };

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      console.error("Form validation errors:", validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log({
        auctionType,
        assetType,
        assetAddress,
        amount,
        bidAssetAddress,
        startBid,
        reservedPrice,
        duration,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Auction created successfully!");
      navigate("/auctions");
    } catch (error) {
      console.error("Error creating auction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create New Auction
          </h1>
          <p className="text-gray-300 mb-0">
            List your digital assets for auction on the blockchain
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700">
            {!connected ? (
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 mx-auto text-purple-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-400 mb-6">
                  You need to connect your wallet to create an auction
                </p>
                <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg px-6 py-3 hover:from-purple-700 hover:to-blue-600 transition-all">
                  Connect Wallet
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Auction Type */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Auction Type
                    </label>
                    <select
                      value={auctionType}
                      onChange={(e) => setAuctionType(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="English">English Auction</option>
                      <option value="Dutch">Dutch Auction</option>
                      <option value="SealedBid">Sealed-Bid Auction</option>
                      <option value="TimeBased">Time-Based Auction</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-400">
                      {auctionType === "English" &&
                        "Bidders place increasingly higher bids until auction ends."}
                      {auctionType === "Dutch" &&
                        "Price decreases over time until someone makes a purchase."}
                      {auctionType === "SealedBid" &&
                        "Bidders submit sealed bids, highest bid wins."}
                      {auctionType === "TimeBased" &&
                        "Fixed duration auction with time-based bidding rules."}
                    </p>
                  </div>

                  {/* Asset Type */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Asset Type
                    </label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="ERC20">ERC20 Token</option>
                      <option value="ERC721">NFT (ERC721)</option>
                    </select>
                  </div>

                  {/* Asset Details - ERC20 */}
                  {assetType === "ERC20" && (
                    <>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Asset Address
                        </label>
                        <input
                          type="text"
                          value={assetAddress}
                          onChange={(e) => setAssetAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Amount (in decimals)
                        </label>
                        <input
                          type="text"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Bid Asset Address
                        </label>
                        <input
                          type="text"
                          value={bidAssetAddress}
                          onChange={(e) => setBidAssetAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Asset Details - NFT */}
                  {assetType !== "ERC20" && (
                    <>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Collection Address
                        </label>
                        <input
                          type="text"
                          value={collectionAddress}
                          onChange={(e) => setCollectionAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Item ID
                        </label>
                        <input
                          type="text"
                          value={itemId}
                          onChange={(e) => setItemId(e.target.value)}
                          placeholder="Token ID"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Pricing */}
                  {auctionType === "Dutch" ? (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Reserved Price
                      </label>
                      <input
                        type="text"
                        value={reservedPrice}
                        onChange={(e) => setReservedPrice(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Starting Bid
                      </label>
                      <input
                        type="text"
                        value={startBid}
                        onChange={(e) => setStartBid(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  )}

                  {/* Duration */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min="1"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Link
                      to="/auctions"
                      className="mr-4 px-6 py-3 bg-transparent border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg px-6 py-3 hover:from-purple-700 hover:to-blue-600 transition-all"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Creating...
                        </div>
                      ) : (
                        "Create Auction"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">About Auctions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                <h3 className="text-xl font-semibold mb-3">
                  Benefits of Auctions
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Transparent price discovery</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Trustless execution with smart contracts</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Wider buyer reach for your assets</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600">
                <h3 className="text-xl font-semibold mb-3">Auction Types</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>
                      <b>English:</b> Ascending price, highest bidder wins
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>
                      <b>Dutch:</b> Descending price, first bidder wins
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>
                      <b>Sealed-Bid:</b> Private bids, revealed after deadline
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuctionCreatePage;
