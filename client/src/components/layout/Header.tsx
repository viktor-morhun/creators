// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WalletConnect from '../user/WalletConnect';
import { useWeb3 } from '../../hooks/useWeb3';

const Header: React.FC = () => {
  const { address: account } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-xl font-bold text-white">
              ChainAuction
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/auctions" className="text-sm text-gray-300 hover:text-white">
              Browse Auctions
            </Link>
            <Link to="/create" className="text-sm text-gray-300 hover:text-white">
              Create Auction
            </Link>
            {account && (
              <Link to="/profile" className="text-sm text-gray-300 hover:text-white">
                My Auctions
              </Link>
            )}
          </nav>
          
          {/* Wallet Connect */}
          <div className="flex items-center">
            <WalletConnect />
            
            {/* Mobile menu button */}
            <button 
              className="ml-4 md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mt-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/auctions" 
                className="text-sm text-gray-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Auctions
              </Link>
              <Link 
                to="/create" 
                className="text-sm text-gray-300 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Auction
              </Link>
              {account && (
                <Link 
                  to="/profile" 
                  className="text-sm text-gray-300 hover:text-white py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;