import { AuctionItem } from '../slices/auctionsSlice';

// Helper to convert ETH to Wei
const toWei = (eth: number): string => {
  return (eth * 1e18).toString();
};

// Calculate timestamps
const now = Date.now();
const DAY = 86400000;
const HOUR = 3600000;

export const MOCK_AUCTIONS: AuctionItem[] = [
  {
    id: '1',
    title: 'Cosmic Dreamscape #42',
    description: 'A stunning digital artwork depicting the dreams of the cosmos. This unique NFT combines elements of fantasy and space to create a mesmerizing visual experience.',
    imageUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2070',
    currentBid: toWei(0.75),
    currency: 'ETH',
    endTime: now + (3 * DAY), // 3 days from now
    tokenType: 'ERC721',
    auctionType: 'english',
    seller: {
      address: '0x8C3bEf2fD9C3e0E18b22d88a2AD9875A36458CbD',
      name: 'DigitalArtist',
    },
    bidCount: 8,
    chainId: 1
  },
  {
    id: '2',
    title: 'Neon Genesis Collection',
    description: 'A collection inspired by the iconic anime series. This digital collectible pays homage to the groundbreaking animation and storytelling of the original show.',
    imageUrl: 'https://images.unsplash.com/photo-1633540190277-29aca58cc587?q=80&w=1642',
    currentBid: toWei(1.2),
    currency: 'ETH',
    endTime: now + (2 * DAY), // 2 days from now
    tokenType: 'ERC1155',
    auctionType: 'timed',
    seller: {
      address: '0xF5C6825A126623B5d84A4F96C90fbAe36276A12B',
      name: 'CryptoCreator',
    },
    bidCount: 12,
    chainId: 137
  },
  {
    id: '3',
    title: 'Abstract Dimensions #7',
    description: 'An exploration of geometric shapes and vibrant colors that push the boundaries of digital art. This NFT is part of a limited series exploring mathematical concepts through visual art.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964',
    currentBid: toWei(0.35),
    currency: 'ETH',
    endTime: now + (12 * HOUR), // 12 hours from now
    tokenType: 'ERC721',
    auctionType: 'dutch',
    seller: {
      address: '0xD34db33F0000000000000000000000000000000',
      name: 'BlockchainArtist',
    },
    bidCount: 5,
    chainId: 1
  },
  {
    id: '4',
    title: 'Digital Relic #003',
    description: 'A digital artifact representing the early days of cryptocurrency. This unique token combines historical elements with futuristic design motifs.',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974',
    currentBid: toWei(2.5),
    currency: 'ETH',
    endTime: now + (4 * DAY), // 4 days from now
    tokenType: 'ERC721',
    auctionType: 'english',
    seller: {
      address: '0x3456789012345678901234567890123456789012',
      name: 'Web3Pioneer',
    },
    bidCount: 18,
    chainId: 42161
  },
  {
    id: '5',
    title: 'Quantum State',
    description: 'A visualization of quantum computing concepts represented through abstract digital art. This piece explores the fascinating world of quantum mechanics through vibrant colors and shapes.',
    imageUrl: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=2070',
    currentBid: toWei(0.85),
    currency: 'ETH',
    endTime: now + (3 * DAY), // 3 days from now
    tokenType: 'ERC721',
    auctionType: 'sealed',
    seller: {
      address: '0x7890123456789012345678901234567890123456',
      name: 'QuantumCreator',
    },
    bidCount: 7,
    chainId: 1
  },
  {
    id: '6',
    title: 'Metaverse Property Alpha',
    description: 'Prime virtual real estate in the growing metaverse. This digital property is located in a high-traffic area with significant development potential.',
    imageUrl: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=2070',
    currentBid: toWei(4.2),
    currency: 'ETH',
    endTime: now + (6 * DAY), // 6 days from now
    tokenType: 'ERC1155',
    auctionType: 'english',
    seller: {
      address: '0x2468135790246813579024681357902468135790',
      name: 'MetaBuilder',
    },
    bidCount: 25,
    chainId: 137
  },
  {
    id: '7',
    title: 'Crypto Punk Derivative #38',
    description: 'A unique interpretation inspired by the iconic CryptoPunks collection. This artwork pays homage to one of the pioneering NFT projects while adding a fresh artistic perspective.',
    imageUrl: 'https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=80&w=1964',
    currentBid: toWei(1.1),
    currency: 'ETH',
    endTime: now + (6 * HOUR), // 6 hours from now
    tokenType: 'ERC721',
    auctionType: 'timed',
    seller: {
      address: '0x1357924680135792468013579246801357924680',
      name: 'NFTRemixer',
    },
    bidCount: 9,
    chainId: 1
  },
  {
    id: '8',
    title: 'Digital Soundwave Collection',
    description: 'A multimedia NFT that combines visual art with an original audio composition. This unique digital asset is a feast for both the eyes and ears.',
    imageUrl: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=2128',
    currentBid: toWei(0.45),
    currency: 'ETH',
    endTime: now + (36 * HOUR), // 36 hours from now
    tokenType: 'ERC721',
    auctionType: 'dutch',
    seller: {
      address: '0x9876543210987654321098765432109876543210',
      name: 'AudioVisualArtist',
    },
    bidCount: 4,
    chainId: 42161
  },
  {
    id: '9',
    title: 'Virtual Reality Experience',
    description: 'An immersive digital environment token with full VR capabilities. This token grants access to a specially designed virtual world with exclusive features.',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=2070',
    currentBid: toWei(3.2),
    currency: 'ETH',
    endTime: now + (5 * DAY), // 5 days from now
    tokenType: 'ERC1155',
    auctionType: 'english',
    seller: {
      address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
      name: 'VRCreator',
    },
    bidCount: 15,
    chainId: 1
  },
  {
    id: '10',
    title: 'Blockchain Cityscapes',
    description: 'A series depicting major cities reimagined as blockchain-powered metropolises of the future. Each piece represents the fusion of urban life with decentralized technology.',
    imageUrl: 'https://images.unsplash.com/photo-1569585723035-0e9be4e41807?q=80&w=2070',
    currentBid: toWei(1.8),
    currency: 'ETH',
    endTime: now - (2 * HOUR), // 2 hours ago (ended)
    tokenType: 'ERC721',
    auctionType: 'timed',
    seller: {
      address: '0x54321ABCDE54321ABCDE54321ABCDE54321ABCDE',
      name: 'UrbanTokenist',
    },
    bidCount: 22,
    chainId: 137
  },
  {
    id: '11',
    title: 'Algorithmic Landscape',
    description: 'Computer-generated landscapes that evolve according to predefined algorithms. This generative art piece changes appearance based on blockchain activity.',
    imageUrl: 'https://images.unsplash.com/photo-1566908829550-e6551b00979b?q=80&w=2069',
    currentBid: toWei(0.6),
    currency: 'ETH',
    endTime: now + (8 * HOUR), // 8 hours from now
    tokenType: 'ERC721',
    auctionType: 'dutch',
    seller: {
      address: '0xF0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0',
      name: 'AlgoArtist',
    },
    bidCount: 6,
    chainId: 1
  },
  {
    id: '12',
    title: 'Tokenized Physical Painting',
    description: 'A physical oil painting with a corresponding NFT certificate of authenticity. The winning bidder receives both the physical artwork and its digital twin.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2045',
    currentBid: toWei(5.5),
    currency: 'ETH',
    endTime: now + (7 * DAY), // 7 days from now
    tokenType: 'physical',
    auctionType: 'english',
    seller: {
      address: '0xA1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
      name: 'TraditionalArtist',
    },
    bidCount: 14,
    chainId: 1
  },
  {
    id: '13',
    title: 'Crypto Gaming Asset Bundle',
    description: 'A collection of rare in-game items for a popular blockchain game. This bundle includes exclusive weapons, skins, and power-ups with proven scarcity.',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2057',
    currentBid: toWei(0.95),
    currency: 'ETH',
    endTime: now + (48 * HOUR), // 48 hours from now
    tokenType: 'ERC1155',
    auctionType: 'sealed',
    seller: {
      address: '0x1111222233334444555566667777888899990000',
      name: 'GameAssetCreator',
    },
    bidCount: 19,
    chainId: 137
  },
  {
    id: '14',
    title: 'Digital Fashion Wearable',
    description: 'A high-fashion digital garment that can be worn by avatars in various metaverse platforms. Designed by a renowned digital fashion house with limited availability.',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2069',
    currentBid: toWei(1.35),
    currency: 'ETH',
    endTime: now + (4.5 * DAY), // 4.5 days from now
    tokenType: 'ERC1155',
    auctionType: 'timed',
    seller: {
      address: '0xFASHION123456789FASHION123456789FASHION12',
      name: 'MetaFashionista',
    },
    bidCount: 11,
    chainId: 42161
  },
  {
    id: '15',
    title: 'Historical NFT Moment',
    description: 'A tokenized representation of a significant moment in cryptocurrency history. This NFT includes exclusive video content and historical documentation.',
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2032',
    currentBid: toWei(2.2),
    currency: 'ETH',
    endTime: now + (60 * HOUR), // 60 hours from now
    tokenType: 'ERC721',
    auctionType: 'english',
    seller: {
      address: '0xHISTORY123456789HISTORY123456789HISTORY',
      name: 'CryptoHistorian',
    },
    bidCount: 17,
    chainId: 1
  },
  {
    id: '16',
    title: 'Neural Network Creation #42',
    description: 'Art generated by an advanced neural network trained on thousands of classic masterpieces. This piece represents the intersection of classical art and cutting-edge AI.',
    imageUrl: 'https://images.unsplash.com/photo-1608501078713-8e445a709b39?q=80&w=2070',
    currentBid: toWei(0.85),
    currency: 'ETH',
    endTime: now - (1 * DAY), // 1 day ago (ended)
    tokenType: 'ERC721',
    auctionType: 'dutch',
    seller: {
      address: '0xAI1234567890AI1234567890AI1234567890AI12',
      name: 'AIArtLab',
    },
    bidCount: 13,
    chainId: 1
  }
];

export default MOCK_AUCTIONS;