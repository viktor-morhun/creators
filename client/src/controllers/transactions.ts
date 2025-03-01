import { ethers } from "ethers";

import { config } from "../config";



async function sendTransactionToMetamask(
  txRequest: ethers.TransactionRequest
): Promise<ethers.TransactionResponse> {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  try {
    const tx = await signer.sendTransaction(txRequest);
    console.log("🚀 Transaction sent:", tx.hash);
    return tx;
  } catch (error: any) {
    throw new Error(`❌ Error sending transaction: ${error.message}`);
  }
}

enum AssetType {
  ERC20 = 0,
  ERC721 = 1,
}



async function approveAsset(
  assetType: AssetType,
  assetAddress: string,
  assetId: number | undefined, // for ERC721 !!!
  amount: string, // in WEI for ERC20 !!!
  to: string // address AuctionFactory
): Promise<ethers.TransactionResponse> {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  if (assetType === AssetType.ERC20) {
    const tokenContract = new ethers.Contract(assetAddress, config.erc20Abi, signer);
    const data = tokenContract.interface.encodeFunctionData('approve', [to, amount]);
    const txRequest: ethers.TransactionRequest = { to: assetAddress, data };
    return sendTransactionToMetamask(txRequest);
  } else if (assetType === AssetType.ERC721) {
    if (assetId === undefined) throw new Error('assetId required for ERC721');
    const nftContract = new ethers.Contract(assetAddress, config.erc721Abi, signer);
    const data = nftContract.interface.encodeFunctionData('approve', [to, assetId]);
    const txRequest: ethers.TransactionRequest = { to: assetAddress, data };
    return sendTransactionToMetamask(txRequest);
  } else {
    throw new Error('Not supported asset type');
  }
}

async function createEnglishAuctionTx(
  assetType: AssetType,
  assetAddress: string,
  assetId: number,
  amount: string, // В wei для ERC20/ERC1155
  paymentToken: string,
  duration: number, // В секундах
  startingPrice: string // В wei
): Promise<ethers.TransactionResponse> {
  const factoryInterface = new ethers.Interface(config.contractAbi);
  const data = factoryInterface.encodeFunctionData('createEnglishAuction', [
    assetType,
    assetAddress,
    assetId,
    ethers.parseEther(amount), // Преобразуем в wei
    paymentToken,
    duration,
    ethers.parseEther(startingPrice), // Преобразуем в wei
  ]);

  const txRequest: ethers.TransactionRequest = {
    to: config.contractAddress,
    data,
  };

  return sendTransactionToMetamask(txRequest);
}

async function createDutchAuctionTx(
  assetType: AssetType,
  assetAddress: string,
  assetId: number,
  amount: string, // in wei for ERC20
  paymentToken: string,
  duration: number, // in seconds
  startingPrice: string, // to wei
  reservePrice: string // to wei
): Promise<ethers.TransactionResponse> {
  const factoryInterface = new ethers.Interface(config.contractAbi);
  const data = factoryInterface.encodeFunctionData('createDutchAuction', [
    assetType,
    assetAddress,
    assetId,
    ethers.parseEther(amount), // convert to wei
    paymentToken,
    duration,
    ethers.parseEther(startingPrice), // convert to wei
    ethers.parseEther(reservePrice), // convert to wei
  ]);

  const txRequest: ethers.TransactionRequest = {
    to: config.contractAbi,
    data,
  };

  return sendTransactionToMetamask(txRequest);
}


async function approvePaymentToken(
  paymentToken: string,
  auctionAddress: string,
  amount: string // in wei
): Promise<ethers.TransactionResponse> {
  const tokenContract = new ethers.Contract(paymentToken, config.erc20Abi, await new ethers.BrowserProvider(window.ethereum).getSigner());
  const data = tokenContract.interface.encodeFunctionData('approve', [auctionAddress, ethers.parseEther(amount)]);
  const txRequest: ethers.TransactionRequest = { to: paymentToken, data };
  return sendTransactionToMetamask(txRequest);
}

async function placeBidTx(
  auctionAddress: string,
  bidAmount: string // В wei
): Promise<ethers.TransactionResponse> {
  const auctionInterface = new ethers.Interface(config.IAuctionAbi);
  const data = auctionInterface.encodeFunctionData('placeBid', [ethers.parseEther(bidAmount)]);

  const txRequest: ethers.TransactionRequest = {
    to: auctionAddress,
    data,
  };

  return sendTransactionToMetamask(txRequest);
}

async function endAuctionTx(
  auctionAddress: string
): Promise<ethers.TransactionResponse> {
  const auctionInterface = new ethers.Interface(config.IAuctionAbi);
  const data = auctionInterface.encodeFunctionData('endAuction');

  const txRequest: ethers.TransactionRequest = {
    to: auctionAddress,
    data,
  };

  return sendTransactionToMetamask(txRequest);
}

async function getAuctionDetails(auctionAddress: string): Promise<{
  seller: string;
  highestBidder: string;
  highestBid: string; // in wei
  endTime: number;
  ended: boolean;
  assetAddress: string;
  assetId: number;
  amount: string; // in wei
  paymentToken: string;
}> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const auctionContract = new ethers.Contract(auctionAddress, config.IAuctionAbi, provider);
  const details = await auctionContract.getAuctionDetails();
  return {
    seller: details[0],
    highestBidder: details[1],
    highestBid: details[2].toString(),
    endTime: Number(details[3]),
    ended: details[4],
    assetAddress: details[5],
    assetId: Number(details[6]),
    amount: details[7].toString(),
    paymentToken: details[8],
  };
}

export {
    approveAsset,
    createEnglishAuctionTx,
    createDutchAuctionTx,
    approvePaymentToken,
    placeBidTx,
    endAuctionTx,
    getAuctionDetails,
}