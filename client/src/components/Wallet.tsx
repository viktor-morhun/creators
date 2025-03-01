import useMetaMask from "../hooks/useMetaMask";

const Wallet: React.FC = () => {
  const { account } = useMetaMask();

  if (!account) {
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-6 bg-gray-50 rounded-xl shadow-md">
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <svg
            className="w-16 h-16 mb-4"
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
          <h2 className="text-xl font-medium mb-1">Wallet Not Connected</h2>
          <p className="text-sm">Please connect your wallet to view details</p>
        </div>
      </div>
    );
  }

  // Mock data replace with actual data
  const mockBalance =  "0.42";
  const mockNetwork =  "Ethereum";
  const mockChainId =  "1";
  const mockTransactions = [
    {
      id: 1,
      type: "Received",
      amount: "0.05 ETH",
      from: "0x1234...5678",
      date: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "Sent",
      amount: "0.02 ETH",
      to: "0x8765...4321",
      date: "1 day ago",
      status: "completed",
    },
    {
      id: 3,
      type: "Pending",
      amount: "0.01 ETH",
      to: "0x9876...1234",
      date: "Just now",
      status: "pending",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Wallet</h2>
          <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
            {mockNetwork}
          </span>
        </div>
        <div className="mb-1">
          <span className="text-sm opacity-80">Balance</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{mockBalance}</span>
          <span className="ml-2 text-sm opacity-80">ETH</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">ACCOUNT</h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <div className="font-mono text-sm">{`${account.substring(
                  0,
                  6
                )}...${account.substring(account.length - 4)}`}</div>
                <div className="text-xs text-gray-500">
                  Chain ID: {mockChainId}
                </div>
              </div>
            </div>
            <button className="text-xs text-primary hover:underline focus:outline-none">
              Copy Address
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-gray-700 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span className="text-xs font-medium">Send</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-gray-700 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span className="text-xs font-medium">Receive</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-gray-700 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs font-medium">Copy</span>
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            RECENT TRANSACTIONS
          </h3>
          <div className="space-y-3">
            {mockTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    tx.type === "Received"
                      ? "bg-green-100 text-green-600"
                      : tx.type === "Sent"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {tx.type === "Received" ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  ) : tx.type === "Sent" ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{tx.type}</span>
                    <span className="font-medium text-sm">{tx.amount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}
                    </span>
                    <span className="text-xs text-gray-500">{tx.date}</span>
                  </div>
                </div>
                <div
                  className={`ml-3 text-xs px-2 py-1 rounded-full ${
                    tx.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {tx.status}
                </div>
              </div>
            ))}

            <button className="w-full mt-3 py-2 text-xs font-medium text-primary hover:underline focus:outline-none">
              View all transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
