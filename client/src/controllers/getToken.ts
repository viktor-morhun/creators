
import { ethers } from 'ethers';
import { config } from '../config.ts';


// Define the Infura provider
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

const cache = new Map<string, string>();  // Cache

export interface NFTMetadata {
  name?: string;
  description?: string;
  image: string;
  collection?: string | { name: string; contract?: string };
}

export interface ERC20Metadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

export async function getNFTMetadata(assetAddress: string, assetId: number): Promise<NFTMetadata> {
  try {
    const nftContract = new ethers.Contract(
      assetAddress,
      ['function tokenURI(uint256) view returns (string)'],
      provider
    );
    let tokenUri = await nftContract.tokenURI(assetId);

    if (tokenUri.startsWith('ipfs://')) {
      tokenUri = `https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', '')}`;
    }

    if (tokenUri.startsWith('data:application/json;base64,')) {
      const base64Data = tokenUri.split(',')[1];
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    }

    const response = await fetch(tokenUri);
    if (!response.ok) throw new Error('Failed to fetch token URI');
    const metadata = await response.json();

    // Убеждаемся, что есть image
    if (!metadata.image) {
      metadata.image = 'https://via.placeholder.com/300x200?text=NFT+Image+Not+Found';
    } else if (metadata.image.startsWith('ipfs://')) {
      metadata.image = `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`;
    }

    return metadata;
  } catch (error) {
    console.error(`Error fetching NFT metadata for ${assetAddress}/${assetId}:`, error);
    return {
      image: 'https://via.placeholder.com/300x200?text=NFT+Image+Not+Found',
    };
  }
}

async function getNFTImage(assetAddress: string, assetId: number): Promise<string> {
  try {
    const cacheKey = `${assetAddress}-${assetId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;


    const nftContract = new ethers.Contract(
      assetAddress,
      ['function tokenURI(uint256) view returns (string)'],
      provider
    );
    let tokenUri = await nftContract.tokenURI(assetId);

    if (tokenUri.startsWith('ipfs://')) {
      // use public IPFS
      tokenUri = `https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', '')}`;
    }

    // If the token URI is a data URL, return it directly
    if (tokenUri.startsWith('data:')) {
      return tokenUri;
    }

    // Загружаем метаданные через HTTP
    const response = await fetch(tokenUri);
    if (!response.ok) throw new Error('Failed to fetch token URI');
    const metadata = await response.json();

    // Проверяем наличие изображения
    if (metadata.image) {
      let imageUrl = metadata.image;
      // Если image — это IPFS-ссылка, преобразуем в HTTP
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = `https://ipfs.io/ipfs/${imageUrl.replace('ipfs://', '')}`;
      }
      cache.set(cacheKey, imageUrl);
      return imageUrl;
    } else {
      throw new Error('Image not found in metadata');
    }
  } catch (error) {
    console.error(`Error fetching NFT image for ${assetAddress}/${assetId}:`, error);
    // Fallback изображение
    return 'https://via.placeholder.com/300x200?text=NFT+Image+Not+Found';
  }
}

async function getERC20LogoFromCoinGecko(tokenAddress: string): Promise<string | undefined> {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}`);
  const data = await response.json();
  return data?.image?.large;
}

async function getERC20Metadata(tokenAddress: string): Promise<ERC20Metadata> {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function logoURI() view returns (string)' // Пример нестандартного метода
      ],
      provider
    );
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    const logo = await getERC20LogoFromCoinGecko(tokenAddress) || `https://via.placeholder.com/300x200?text=${symbol}`;
    return {
      name,
      symbol,
      decimals: Number(decimals),
      logo: logo
    };
  } catch (error) {
    console.error(`Error fetching ERC20 metadata for ${tokenAddress}:`, error);
    return {
      name: 'Unknown Token',
      symbol: 'UNK',
      decimals: 18,  // default to 18 decimals
      logo: 'https://via.placeholder.com/300x200?text=Unknown+Token'
    };
  }
}

export { getNFTImage, getERC20Metadata};