import useMetaMask from "../hooks/useMetaMask";

const ConnectButton: React.FC = () => {
  const { connect, account } = useMetaMask();

  return (
    <div className="w-full max-w-sm mx-auto">
      <button
        onClick={connect}
        className="hidden md:flex items-center justify-center gap-2 w-full py-3 px-4 
                  bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary
                  text-white font-medium rounded-lg shadow-lg transition-all duration-300 
                  hover:shadow-xl transform hover:-translate-y-1"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.4 9.7h-2.3V7.3c0-.4-.3-.7-.7-.7h-4.7c-.4 0-.7.3-.7.7v2.3H8.7c-.4 0-.7.3-.7.7v4.7c0 .4.3.7.7.7h2.3v2.3c0 .4.3.7.7.7h4.7c.4 0 .7-.3.7-.7v-2.3h2.3c.4 0 .7-.3.7-.7v-4.7c.1-.3-.3-.6-.7-.6z" />
        </svg>
        {account ? (
          <>
            <span className="mr-2">Connected:</span>
            <span className="font-mono">{`${account.substring(
              0,
              6
            )}...${account.substring(account.length - 4)}`}</span>
          </>
        ) : (
          "Connect to MetaMask"
        )}
      </button>

      <button
        onClick={connect}
        className="flex md:hidden items-center justify-center w-full py-3 px-4 
                 bg-primary text-white font-medium rounded-full shadow 
                 transition-colors duration-300 hover:bg-secondary"
      >
        {account ? (
          <span className="font-mono text-sm">{`${account.substring(
            0,
            4
          )}...${account.substring(account.length - 4)}`}</span>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.4 9.7h-2.3V7.3c0-.4-.3-.7-.7-.7h-4.7c-.4 0-.7.3-.7.7v2.3H8.7c-.4 0-.7.3-.7.7v4.7c0 .4.3.7.7.7h2.3v2.3c0 .4.3.7.7.7h4.7c.4 0 .7-.3.7-.7v-2.3h2.3c.4 0 .7-.3.7-.7v-4.7c.1-.3-.3-.6-.7-.6z" />
            </svg>
            Connect
          </>
        )}
      </button>

      {account && (
        <div className="mt-2 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
            <span>Connected to Ethereum</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
