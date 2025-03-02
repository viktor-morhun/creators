import React, { useState, useEffect } from "react";
import AuctionCard from "../components/auction/AuctionCard";
import { Link } from "react-router-dom";
import {
  getAuctions,
  getAuctionBids,
  getAuctionDetails,
  AuctionCreatedEvent,
  AuctionDetails,
} from "../controllers/getEvents";

// Filter options
type FilterOption = {
  label: string;
  value: string;
};

const AUCTION_TYPE_FILTERS: FilterOption[] = [
  { label: "All Types", value: "all" },
  { label: "English", value: "0" },
  { label: "Dutch", value: "1" },
];

const SORT_OPTIONS: FilterOption[] = [
  { label: "Ending Soon", value: "ending-soon" },
  { label: "Recently Listed", value: "recent" },
  { label: "Highest Bid: Low to High", value: "price-asc" },
  { label: "Highest Bid: High to Low", value: "price-desc" },
  { label: "Most Bids", value: "bids" },
];

const AuctionsListPage: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionCreatedEvent[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<AuctionCreatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [auctionTypeFilter, setAuctionTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("ending-soon");
  const [visibleCount, setVisibleCount] = useState(8);
  if (false) console.log(imageUrls, currencies);

  // Fetch auctions on mount
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const fetchedAuctions = await getAuctions(16); // Fetch 16 auctions initially
        setAuctions(fetchedAuctions);
        setFilteredAuctions(fetchedAuctions);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...auctions];

    // Apply search filter (by seller address)
    if (searchTerm) {
      result = result.filter((auction) =>
        auction.seller.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply auction type filter
    if (auctionTypeFilter !== "all") {
      result = result.filter(
        (auction) => auction.auctionType === Number(auctionTypeFilter)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "ending-soon":
        // This requires endTime which we don't have in the basic auction list
        // We'll leave it for now - in a real app we'd fetch this data
        break;
      case "recent":
        result.sort((a, b) => b.blockNumber - a.blockNumber);
        break;
      case "price-asc":
        // Sort by highestBid if available
        result.sort((a, b) => {
          const aBid = a.highestBid ? Number(a.highestBid) : 0;
          const bBid = b.highestBid ? Number(b.highestBid) : 0;
          return aBid - bBid;
        });
        break;
      case "price-desc":
        // Sort by highestBid if available
        result.sort((a, b) => {
          const aBid = a.highestBid ? Number(a.highestBid) : 0;
          const bBid = b.highestBid ? Number(b.highestBid) : 0;
          return bBid - aBid;
        });
        break;
      default:
        break;
    }

    setFilteredAuctions(result);
  }, [auctions, searchTerm, auctionTypeFilter, sortOption]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Auctions
          </h1>
          <p className="text-gray-300 mb-0">
            Discover unique digital assets and place your bids
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search */}
            <div className="w-full md:w-auto relative">
              <input
                type="text"
                placeholder="Search by seller address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
              {/* Auction Type Filter */}
              <div className="relative">
                <select
                  value={auctionTypeFilter}
                  onChange={(e) => setAuctionTypeFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-4 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                >
                  {AUCTION_TYPE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Sort Option */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-4 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <Link
                to="/create"
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg py-2 px-4 font-medium transition-all flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Auction
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
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
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Auctions Found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                We couldn't find any auctions matching your search criteria. Try
                adjusting your filters or create a new auction.
              </p>
              <Link
                to="/create"
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg py-3 px-6 font-medium transition-all inline-block"
              >
                Create Auction
              </Link>
            </div>
          ) : (
            <>
              {/* Results Counter */}
              <div className="mb-6 text-gray-400">
                Showing {Math.min(filteredAuctions.length, visibleCount)} of{" "}
                {filteredAuctions.length} auctions
              </div>

              {/* Auction Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAuctions.slice(0, visibleCount).map((auction) => (
                  <AuctionCard
                    key={auction.auctionId}
                    auction={{
                      auctionAddress: auction.auctionAddress,
                      seller: auction.seller,
                      currentBid: auction.highestBid || '0',
                      highestBidder: auction.highestBidder || '',
                      endTime: 0, // This will be populated in the full detail view
                      type: auction.auctionType,
                      imageUrl: auction.imageUrl,
                      title: auction.title || `Auction #${auction.auctionId}`,
                      ended: auction.status === 'ended',
                      bidCount: 0, // Will be populated in full detail view
                      currency: auction.currencySymbol || 'ETH',
                      currencyImageUrl: auction.currencyImageUrl,
                      status: auction.status || 'active'
                    }}
                    index={auction.auctionId}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {filteredAuctions.length > visibleCount && (
                <div className="mt-10 text-center">
                  <button
                    onClick={loadMore}
                    className="bg-gray-800 border border-gray-700 hover:border-gray-600 text-white rounded-lg py-3 px-8 font-medium transition-all"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold mb-6">
                Understanding Our Auction Types
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-5 rounded-xl border border-gray-600">
                  <div className="flex items-start">
                    <div className="bg-purple-600/20 p-2 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        English Auction
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Bids increase over time, with the highest bidder winning
                        when the auction ends.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-5 rounded-xl border border-gray-600">
                  <div className="flex items-start">
                    <div className="bg-blue-600/20 p-2 rounded-lg mr-4">
                      <svg
                        className="w-6 h-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Dutch Auction
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Price decreases over time until someone agrees to buy at
                        the current price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold mb-6">Auction FAQ</h2>
              <div className="bg-gray-700 rounded-xl border border-gray-600 divide-y divide-gray-600">
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    How do I place a bid?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Connect your wallet, navigate to the auction page, and enter
                    your bid amount. Make sure you have enough funds to cover
                    your bid.
                  </p>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    When do I receive my item?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Digital assets are transferred automatically to your wallet
                    after the auction ends and payment is confirmed through the
                    smart contract.
                  </p>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    What happens if I'm outbid?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Your funds are automatically returned to your wallet. You'll
                    receive a notification and can place a new bid if the
                    auction is still active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuctionsListPage;