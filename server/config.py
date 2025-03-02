import os
from dotenv import load_dotenv

load_dotenv()

# Blockchain config
RPC_URL = os.getenv("RPC_URL", "http://localhost:8545")
FACTORY_CONTRACT_ADDRESS = os.getenv(
    "FACTORY_CONTRACT_ADDRESS", "0x04b7ab1a9f98225f2d93c336a24c52e0fc718a49"
)
FACTORY_ABI_PATH = os.getenv("FACTORY_ABI_PATH", "./abis/factory_abi.json")
AUCTION_ABI_PATH = os.getenv("AUCTION_ABI_PATH", "./abis/auction_abi.json")
DUTCH_AUCTION_ABI_PATH = os.getenv(
    "DUTCH_AUCTION_ABI_PATH", "./abis/dutch_auction_abi.json"
)

# Database config
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auctions.db")

# Server config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Sync config
SYNC_INTERVAL = int(os.getenv("SYNC_INTERVAL", "30"))  # Seconds
