// src/pages/HomePage.tsx
import React from 'react';
import AuctionGrid from '../components/auction/AuctionGrid';
import { Link } from 'react-router-dom';
import { useAuctions } from '../hooks/useAuctions';

const HomePage: React.FC = () => {
  const { featuredAuctions, recentAuctions, loading } = useAuctions();

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-blue-900 opacity-30"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Decentralized Auctions for the Digital Age
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Secure, transparent, and trustless auctions for digital and physical assets on the blockchain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auctions" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg text-lg px-8 py-3 hover:from-purple-700 hover:to-blue-600 transition-all">
                Explore Auctions
              </Link>
              <Link to="/create" className="bg-transparent border border-white text-white font-medium rounded-lg text-lg px-8 py-3 hover:bg-white hover:bg-opacity-10 transition-all">
                Create Auction
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Our Platform?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "On-Chain Transparency",
                description: "All auction data and transactions are recorded immutably on the blockchain.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Multiple Auction Types",
                description: "Support for English, Dutch, sealed-bid, and time-based auction formats.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )
              },
              {
                title: "Smart Contract Automation",
                description: "Automated bidding, payments, and asset transfers without intermediaries.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                )
              },
              {
                title: "Trustless Escrow",
                description: "Funds are locked in smart contracts until auction completion for security.",
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="text-purple-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Auctions</h2>
            <Link to="/auctions" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <AuctionGrid auctions={featuredAuctions} />
          )}
        </div>
      </section>

      {/* Recent Auctions */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Recent Auctions</h2>
            <Link to="/auctions" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <AuctionGrid auctions={recentAuctions} />
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Connect Your Wallet",
                description: "Link your Ethereum wallet to start participating in auctions on our platform."
              },
              {
                step: "2",
                title: "Create or Bid",
                description: "List your assets for auction or place bids on items that interest you."
              },
              {
                step: "3",
                title: "Complete Transactions",
                description: "Smart contracts automatically handle payments and transfers when auctions end."
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-700 p-8 rounded-xl text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-800 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join the future of decentralized commerce with our blockchain auction platform.
          </p>
          <Link to="/auctions" className="bg-white text-purple-800 font-medium rounded-lg text-lg px-8 py-3 hover:bg-gray-100 transition-all">
            Explore Auctions
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;