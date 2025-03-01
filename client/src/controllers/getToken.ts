
import { ethers } from 'ethers';
import { config } from '../config.ts';


// Define the Infura provider
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

async function getNFTImage(assetAddress: string, assetId: number): Promise<string> {
  const nftContract = new ethers.Contract(assetAddress, ['function tokenURI(uint256) view returns (string)'], provider);
  const tokenUri = await nftContract.tokenURI(assetId);
  const response = await fetch(tokenUri);
  const metadata = await response.json();
  return metadata.image;
}

async function getTokenSymbol(paymentToken: string): Promise<string> {
  const tokenContract = new ethers.Contract(paymentToken, ['function symbol() view returns (string)'], provider);
  return await tokenContract.symbol();
}

export { getNFTImage, getTokenSymbol };