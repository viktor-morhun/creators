import { useState } from "react";
import { Link } from "react-router-dom";
import AuctionCard, { AuctionDetails } from "./AuctionCard";

interface AuctionGridProps {
  auctions: AuctionDetails[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
}

const AuctionGrid: React.FC<AuctionGridProps> = ({
  auctions,
  title = "Explore Auctions",
  loading = false,
  emptyMessage = "No auctions found",
}) => {
  // Changed filter type to handle both "all" string and numbers (0, 1)
  const [filter, setFilter] = useState<string | number>("all");

  // Filter auctions based on selected filter
  const filteredAuctions =
    filter === "all"
      ? auctions
      : auctions.filter((auction) => auction.type === filter);

  return (
    <div className="w-full">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>

        {/* Filter buttons - updated to use numeric types matching your data */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter(0)} // Type 0 = English
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${
                filter === 0
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
          >
            English
          </button>
          <button
            onClick={() => setFilter(1)} // Type 1 = Dutch
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
              ${
                filter === 1
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
          >
            Dutch
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse"
            >
              <div className="h-48 bg-gray-700"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/4 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAuctions.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-400">
            {emptyMessage}
          </h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}

      {/* Auction grid - Fixed index value to be consistent */}
      {!loading && filteredAuctions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAuctions.map((auction, index) => (
            <AuctionCard
              key={auction.id || `auction-${index}`}
              index={index}
              auction={auction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionGrid;