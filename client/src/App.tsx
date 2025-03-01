import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';

// Layout component
import Layout from './components/layout/Layout';

// Page components
import HomePage from './pages/HomePage';
 import AuctionDetailsPage from './pages/AuctionDetailPage';
 import AuctionListPage from './pages/AuctionListPage';
 import CreateAuctionPage from './pages/CreateAuctionPage';
// import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// In your index.tsx or App.tsx
import { store } from './store/store';
import { initializeWeb3 } from './store/slices/web3Slice';

// Initialize web3 connection listeners
initializeWeb3(store.dispatch);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    // Initial app setup and loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-white">Loading On-Chain Auction Marketplace...</h2>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            {/* All Routes (no protected routes) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auction/:id" element={<AuctionDetailsPage />} />
            <Route path="/create" element={<CreateAuctionPage />} />
            <Route path="/auctions" element={<AuctionListPage />} />
          {/*  <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-bids" element={<MyBidsPage />} />
            <Route path="/my-auctions" element={<MyAuctionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} /> */}
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        
        {/* Toast notifications */}
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </Provider>
  );
}

export default App;