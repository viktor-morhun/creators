// src/components/user/WalletConnect.tsx
import { useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
//import { useAppDispatch } from '../../hooks/redux';

const WalletConnect: React.FC = () => {
  const { address: account, connect, disconnect } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed", error);
    }
    setIsConnecting(false);
  };


  if (account) {
    
    return (
      <div className="flex items-center">
        <div className="hidden md:block mr-3">
          <div className="bg-gray-800 rounded-full py-1 px-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-gray-300">
              {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
            </span>
          </div>
        </div>
        <button 
          onClick={disconnect}
          className="text-xs border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center"
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
};

export default WalletConnect;