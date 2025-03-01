import './App.css'
import ConnectButton from './components/ConnectButton'
import Wallet from './components/Wallet'
import { useState } from 'react'

function App() {
  // Mock auction data
  const [auctions] = useState([
    {
      id: 1,
      title: "Cosmic Dreamscape #42",
      artist: "DigitalArtist",
      image: "https://wallpapers.com/images/featured/this-is-fine-lr4rvhyztrd9s3b7.jpg",
      currentBid: 0.75,
      currency: "ETH",
      endTime: new Date(Date.now() + 86400000).toISOString(), // 24h from now
      bids: 8
    },
    {
      id: 2,
      title: "Neon Genesis Collection",
      artist: "CryptoCreator",
      image: "https://www.indiewire.com/wp-content/uploads/2019/06/end-of-evangelion.jpg?w=350",
      currentBid: 1.2,
      currency: "ETH",
      endTime: new Date(Date.now() + 172800000).toISOString(), // 48h from now
      bids: 12
    },
    {
      id: 3,
      title: "Abstract Dimensions #7",
      artist: "BlockchainArtist",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964",
      currentBid: 0.35,
      currency: "ETH",
      endTime: new Date(Date.now() + 43200000).toISOString(), // 12h from now
      bids: 5
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-xl font-bold">NFT Auction House</h1>
          </div>
          
          <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-white">Auctions</a>
            <a href="#" className="hover:text-white">Create</a>
            <a href="#" className="hover:text-white">My Bids</a>
            <a href="#" className="hover:text-white">Collections</a>
            <a href="#" className="hover:text-white">Help</a>
          </div>

          <div className="w-36">
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center md:text-left md:flex items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8 md:max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover, Collect, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Bid</span> on Digital Art
            </h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to bid on exclusive digital collectibles and NFTs from top artists around the world.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <button className="px-5 py-3 bg-primary hover:bg-opacity-90 rounded-lg font-medium transition-all">
                Explore Auctions
              </button>
              <button className="px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all">
                Create Auction
              </button>
            </div>
          </div>
          <div className="hidden md:block w-full max-w-md">
            <img
              src="https://static1.srcdn.com/wordpress/wp-content/uploads/2024/01/guts-on-a-berserk-cover.jpg"
              alt="NFT Auction Illustration"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Live Auctions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map(auction => (
              <div key={auction.id} className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all">
                <div className="h-48 overflow-hidden relative">
                  <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 px-2 py-1 rounded-full text-xs font-medium">
                    {new Date(auction.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1">{auction.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">by {auction.artist}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xs text-gray-400">Current Bid</span>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                        </svg>
                        <span className="font-medium">{auction.currentBid} {auction.currency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Ending In</span>
                      <div className="text-sm font-medium text-primary">
                        {new Date(auction.endTime) > new Date() 
                          ? `${Math.floor((new Date(auction.endTime).getTime() - new Date().getTime()) / 3600000)}h ${Math.floor(((new Date(auction.endTime).getTime() - new Date().getTime()) % 3600000) / 60000)}m` 
                          : 'Ended'}
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 bg-primary hover:bg-opacity-90 rounded-lg font-medium transition-all">
                    Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-lg text-sm font-medium transition-all">
              View All Auctions
            </button>
          </div>
        </div>

        <div className="py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Wallet</h2>
          <Wallet />
        </div>

        <div className="py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Connect Wallet',
                desc: 'Link your Ethereum wallet to start making bids on NFTs and digital collectibles.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                title: 'Place Bids',
                desc: 'Browse the auction house and place competitive bids on your favorite digital art.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                )
              },
              {
                title: 'Win & Collect',
                desc: 'If you win, the NFT is automatically transferred to your wallet upon auction completion.',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((step, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary mr-3">
                    {index + 1}
                  </div>
                  <div className="text-primary">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-semibold">NFT Auction House</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                © {new Date().getFullYear()} NFT Auction House. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <a href="#" className="hover:underline hover:text-white">Home</a>
            <a href="#" className="hover:underline hover:text-white">About</a>
            <a href="#" className="hover:underline hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:underline hover:text-white">Terms of Service</a>
            <a href="#" className="hover:underline hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App