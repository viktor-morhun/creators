import Web3 from 'web3';

let web3: Web3 | null = null;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3;
    } catch (error) {
      console.error("User denied account access");
      return null;
    }
  } else {
    console.error("MetaMask is not installed");
    return null;
  }
};

export const getWeb3Instance = () => {
  return web3;
};