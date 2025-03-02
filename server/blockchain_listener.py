import json
import time
import logging
import requests
from web3 import Web3
from web3.exceptions import ContractLogicError
from sqlalchemy import func
import asyncio

from config import (
    RPC_URL,
    FACTORY_CONTRACT_ADDRESS,
    FACTORY_ABI_PATH,
    AUCTION_ABI_PATH,
    DUTCH_AUCTION_ABI_PATH,
)
from db_models import Auction, Bid, NFTMetadata, TokenMetadata, init_db, SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Load contract ABIs
with open(FACTORY_ABI_PATH) as f:
    factory_abi = json.load(f)

with open(AUCTION_ABI_PATH) as f:
    auction_abi = json.load(f)

with open(DUTCH_AUCTION_ABI_PATH) as f:
    dutch_auction_abi = json.load(f)

# Initialize contract with checksum address
factory_contract = w3.eth.contract(
    address=Web3.to_checksum_address(FACTORY_CONTRACT_ADDRESS), abi=factory_abi
)

# Create a combined ABI for auction contracts that includes both English and Dutch auction functions
combined_auction_abi = auction_abi.copy()
for entry in dutch_auction_abi:
    # Only add entries that aren't already in the combined ABI
    if not any(
        e.get("name") == entry.get("name")
        for e in combined_auction_abi
        if "name" in e and "name" in entry
    ):
        combined_auction_abi.append(entry)

# Event signatures
AUCTION_CREATED_EVENT = Web3.keccak(
    text="AuctionCreated(uint256,address,uint8,address)"
).hex()
BID_PLACED_EVENT = "BidPlaced(address,uint256)"  # This will be used directly with specific auction contracts


class BlockchainListener:
    def __init__(self):
        self.db = SessionLocal()
        self.last_block_processed = self.get_last_processed_block()

    def get_last_processed_block(self):
        """Get the last block we processed from the database or start from current block"""
        last_auction = self.db.query(func.max(Auction.created_at)).scalar()
        if last_auction:
            return last_auction
        return w3.eth.block_number - 1000  # Start from 1000 blocks ago if no data

    def fetch_auction_details(self, auction_address):
        """Fetch detailed information about an auction from the blockchain"""
        try:
            # Use combined ABI that works for both auction types
            auction_contract = w3.eth.contract(
                address=auction_address, abi=combined_auction_abi
            )

            # Get auction details
            details = auction_contract.functions.getAuctionDetails().call()

            # Get auction type
            try:
                auction_type = auction_contract.functions.auctionType().call()
            except (ContractLogicError, AttributeError):
                # If auctionType() doesn't exist, determine by checking if it has Dutch-specific functions
                try:
                    # Try to call getCurrentPrice - a function unique to DutchAuction
                    auction_contract.functions.getCurrentPrice().call()
                    auction_type = 1  # Dutch auction
                except (ContractLogicError, AttributeError):
                    auction_type = 0  # Default to English auction

            # Get token symbol
            try:
                token_contract = w3.eth.contract(
                    address=details[8],  # Payment token address
                    abi=[
                        {
                            "constant": True,
                            "inputs": [],
                            "name": "symbol",
                            "outputs": [{"name": "", "type": "string"}],
                            "payable": False,
                            "stateful": False,
                            "type": "function",
                        }
                    ],
                )
                token_symbol = token_contract.functions.symbol().call()
            except Exception:
                token_symbol = "ETH"  # Default to ETH

            # Get Dutch auction specific data if applicable
            dutch_data = {}
            if auction_type == 1:  # Dutch Auction
                try:
                    dutch_data["reservePrice"] = str(
                        auction_contract.functions.reservePrice().call()
                    )
                    dutch_data["currentPrice"] = str(
                        auction_contract.functions.getCurrentPrice().call()
                    )
                    dutch_data["duration"] = (
                        auction_contract.functions.duration().call()
                    )
                except (ContractLogicError, AttributeError) as e:
                    logger.warning(f"Error getting Dutch auction data: {e}")

            # Current time to determine if auction is active or ended
            current_time = int(time.time())
            status = (
                "active" if not details[4] and details[3] > current_time else "ended"
            )

            result = {
                "seller": details[0],
                "highest_bidder": details[1],
                "highest_bid": str(details[2]),
                "end_time": details[3],
                "ended": details[4],
                "asset_address": details[5],
                "asset_id": details[6],
                "amount": str(details[7]),
                "payment_token": details[8],
                "auction_type": auction_type,
                "status": status,
                "token_symbol": token_symbol,
            }

            # Add Dutch auction data if available
            if dutch_data:
                result.update(dutch_data)

            return result

        except Exception as e:
            logger.error(f"Error fetching auction details for {auction_address}: {e}")
            return None

    def fetch_nft_metadata(self, asset_address, asset_id):
        """Fetch enhanced metadata for an NFT including image, title and description"""
        try:
            # Check if we already have this metadata
            existing = (
                self.db.query(NFTMetadata)
                .filter_by(asset_address=asset_address, asset_id=asset_id)
                .first()
            )

            # If it's recent (less than a day old), use cached version
            if existing and (int(time.time()) - existing.last_updated) < 86400:
                return existing

            # Try to get tokenURI
            nft_contract = w3.eth.contract(
                address=asset_address,
                abi=[
                    {
                        "inputs": [
                            {
                                "internalType": "uint256",
                                "name": "tokenId",
                                "type": "uint256",
                            }
                        ],
                        "name": "tokenURI",
                        "outputs": [
                            {"internalType": "string", "name": "", "type": "string"}
                        ],
                        "stateMutability": "view",
                        "type": "function",
                    }
                ],
            )

            token_uri = nft_contract.functions.tokenURI(asset_id).call()

            # Fetch metadata from the URI
            if token_uri.startswith("ipfs://"):
                token_uri = f"https://ipfs.io/ipfs/{token_uri[7:]}"

            response = requests.get(token_uri)
            if response.status_code == 200:
                metadata = response.json()

                # Extract metadata fields
                image_url = metadata.get("image", "")
                name = metadata.get("name", f"NFT #{asset_id}")
                description = metadata.get("description", "No description available")

                # Handle IPFS image URL
                if image_url.startswith("ipfs://"):
                    image_url = f"https://ipfs.io/ipfs/{image_url[7:]}"

                if existing:
                    # Update existing record
                    existing.image_url = image_url
                    existing.name = name
                    existing.description = description
                    existing.last_updated = int(time.time())
                    self.db.commit()
                    logger.info(
                        f"Updated NFT metadata for {asset_address}/{asset_id}: {name}"
                    )
                    return existing
                else:
                    # Create new record
                    nft_metadata = NFTMetadata(
                        asset_address=asset_address,
                        asset_id=asset_id,
                        image_url=image_url,
                        name=name,
                        description=description,
                        last_updated=int(time.time()),
                    )
                    self.db.add(nft_metadata)
                    self.db.commit()
                    logger.info(
                        f"Added NFT metadata for {asset_address}/{asset_id}: {name}"
                    )
                    return nft_metadata
        except Exception as e:
            logger.error(
                f"Error fetching NFT metadata for {asset_address}/{asset_id}: {e}"
            )

        # If we couldn't get metadata, return a default
        return NFTMetadata(
            asset_address=asset_address,
            asset_id=asset_id,
            image_url=f"https://via.placeholder.com/300x200?text=NFT+{asset_id}",
            name=f"NFT #{asset_id}",
            description="Metadata not available",
            last_updated=int(time.time()),
        )

    def fetch_token_metadata(self, token_address):
        """Fetch metadata for an ERC20 token including symbol, name and logo"""
        try:
            # Check if we already have this token metadata
            existing = (
                self.db.query(TokenMetadata)
                .filter_by(token_address=token_address)
                .first()
            )

            # If it's recent (less than a day old), use cached version
            if existing and (int(time.time()) - existing.last_updated) < 86400:
                return existing

            # Get basic token info from contract
            token_contract = w3.eth.contract(
                address=token_address,
                abi=[
                    {
                        "constant": True,
                        "inputs": [],
                        "name": "symbol",
                        "outputs": [{"name": "", "type": "string"}],
                        "payable": False,
                        "stateful": False,
                        "type": "function",
                    },
                    {
                        "constant": True,
                        "inputs": [],
                        "name": "name",
                        "outputs": [{"name": "", "type": "string"}],
                        "payable": False,
                        "stateful": False,
                        "type": "function",
                    },
                    {
                        "constant": True,
                        "inputs": [],
                        "name": "decimals",
                        "outputs": [{"name": "", "type": "uint8"}],
                        "payable": False,
                        "stateful": False,
                        "type": "function",
                    },
                ],
            )

            symbol = "Unknown"
            name = "Unknown Token"
            decimals = 18

            try:
                symbol = token_contract.functions.symbol().call()
                name = token_contract.functions.name().call()
                decimals = token_contract.functions.decimals().call()
            except Exception as e:
                logger.warning(
                    f"Couldn't get all token details for {token_address}: {e}"
                )

            # Try to get logo from Coingecko or similar API
            # Note: In a production environment, you should use a more reliable API with proper rate limiting
            image_url = f"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{token_address}/logo.png"

            # Alternative image fallback
            fallback_image = f"https://via.placeholder.com/128x128?text={symbol}"

            # Check if the image exists
            try:
                img_response = requests.head(image_url)
                if img_response.status_code != 200:
                    image_url = fallback_image
            except:
                image_url = fallback_image

            if existing:
                # Update existing record
                existing.symbol = symbol
                existing.name = name
                existing.image_url = image_url
                existing.decimals = decimals
                existing.last_updated = int(time.time())
                self.db.commit()
                logger.info(f"Updated token metadata for {token_address}: {symbol}")
                return existing
            else:
                # Create new record
                token_metadata = TokenMetadata(
                    token_address=token_address,
                    symbol=symbol,
                    name=name,
                    image_url=image_url,
                    decimals=decimals,
                    last_updated=int(time.time()),
                )
                self.db.add(token_metadata)
                self.db.commit()
                logger.info(f"Added token metadata for {token_address}: {symbol}")
                return token_metadata

        except Exception as e:
            logger.error(f"Error fetching token metadata for {token_address}: {e}")

            # Return default metadata if we couldn't fetch it
            return TokenMetadata(
                token_address=token_address,
                symbol="Unknown",
                name="Unknown Token",
                image_url=f"https://via.placeholder.com/128x128?text=?",
                decimals=18,
                last_updated=int(time.time()),
            )

    def process_auction_created_event(self, event):
        """Process an AuctionCreated event"""
        try:
            # Get auction details from event
            auction_id = event["args"]["auctionId"]
            auction_address = event["args"]["auctionAddress"]
            auction_type = event["args"]["auctionType"]
            seller = event["args"]["seller"] if len(event["args"]) > 3 else None

            # Check if we already have this auction
            existing = (
                self.db.query(Auction).filter_by(auction_id=str(auction_id)).first()
            )
            if existing:
                return

            # Get more details from the auction contract
            details = self.fetch_auction_details(auction_address)
            if not details:
                return

            # If seller wasn't in the event, get it from details
            if not seller:
                seller = details["seller"]

            # Create new auction in database
            auction = Auction(
                auction_id=str(auction_id),
                auction_address=auction_address,
                auction_type=auction_type,
                seller=seller,
                highest_bidder=details["highest_bidder"],
                highest_bid=details["highest_bid"],
                end_time=details["end_time"],
                ended=details["ended"],
                asset_address=details["asset_address"],
                asset_id=details["asset_id"],
                amount=details["amount"],
                payment_token=details["payment_token"],
                created_at=event["blockNumber"],
                status=details["status"],
                token_symbol=details["token_symbol"],
            )

            # Add Dutch auction specific fields if available
            if "reservePrice" in details:
                auction.reserve_price = details["reservePrice"]
            if "currentPrice" in details:
                auction.current_price = details["currentPrice"]

            self.db.add(auction)
            self.db.commit()

            # Fetch asset metadata based on type
            if details["amount"] == "0":  # ERC721 token
                self.fetch_nft_metadata(details["asset_address"], details["asset_id"])
            else:  # ERC20 token
                self.fetch_token_metadata(details["asset_address"])

            # Also fetch payment token metadata
            self.fetch_token_metadata(details["payment_token"])

            logger.info(f"Added new auction {auction_id} at address {auction_address}")

        except Exception as e:
            logger.error(f"Error processing auction created event: {e}")
            self.db.rollback()

    def process_bid_placed_event(self, event, auction_address):
        """Process a BidPlaced event"""
        try:
            bidder = event["args"]["bidder"]
            amount = str(event["args"]["amount"])

            # Find the auction
            auction = (
                self.db.query(Auction)
                .filter_by(auction_address=auction_address)
                .first()
            )
            if not auction:
                logger.warning(f"Received bid for unknown auction: {auction_address}")
                return

            # Create new bid in database
            bid = Bid(
                auction_address=auction_address,
                bidder=bidder,
                amount=amount,
                block_number=event["blockNumber"],
                timestamp=w3.eth.get_block(event["blockNumber"])["timestamp"],
            )

            self.db.add(bid)

            # Update auction's highest bid
            auction.highest_bidder = bidder
            auction.highest_bid = amount

            self.db.commit()
            logger.info(f"Added new bid from {bidder} for auction {auction_address}")

        except Exception as e:
            logger.error(f"Error processing bid placed event: {e}")
            self.db.rollback()

    def update_auction_statuses(self):
        """Update the status of all auctions based on current time"""
        try:
            current_time = int(time.time())

            # Find all active auctions that should have ended
            expired_auctions = (
                self.db.query(Auction)
                .filter(
                    ~Auction.ended,
                    Auction.status == "active",
                    Auction.end_time < current_time,
                )
                .all()
            )

            for auction in expired_auctions:
                # Get latest status from blockchain
                details = self.fetch_auction_details(auction.auction_address)
                if details:
                    auction.ended = details["ended"]
                    auction.status = details["status"]
                    auction.highest_bidder = details["highest_bidder"]
                    auction.highest_bid = details["highest_bid"]
                else:
                    # If we can't get details, assume it's ended based on time
                    auction.status = "ended"

            self.db.commit()
            logger.info(
                f"Updated statuses for {len(expired_auctions)} expired auctions"
            )

        except Exception as e:
            logger.error(f"Error updating auction statuses: {e}")
            self.db.rollback()

    def sync_auctions_from_contract(self):
        """Sync all auctions from the factory contract's mapping"""
        try:
            # Get total auction count
            auction_count = factory_contract.functions.auctionCount().call()
            logger.info(f"Total auctions in contract: {auction_count}")

            # Get current auctions in DB
            db_auctions = self.db.query(Auction.auction_id).all()
            db_auction_ids = {a[0] for a in db_auctions}

            # Process in batches to avoid overloading
            batch_size = 50
            for i in range(1, auction_count + 1, batch_size):
                batch_end = min(i + batch_size, auction_count + 1)
                logger.info(f"Syncing auctions {i} to {batch_end - 1}")

                for auction_id in range(i, batch_end):
                    if str(auction_id) in db_auction_ids:
                        continue

                    try:
                        # Get auction address from factory
                        auction_address = factory_contract.functions.auctions(
                            auction_id
                        ).call()

                        # Get auction details
                        details = self.fetch_auction_details(auction_address)
                        if not details:
                            continue

                        # Create auction in DB
                        auction = Auction(
                            auction_id=str(auction_id),
                            auction_address=auction_address,
                            auction_type=details["auction_type"],
                            seller=details["seller"],
                            highest_bidder=details["highest_bidder"],
                            highest_bid=details["highest_bid"],
                            end_time=details["end_time"],
                            ended=details["ended"],
                            asset_address=details["asset_address"],
                            asset_id=details["asset_id"],
                            amount=details["amount"],
                            payment_token=details["payment_token"],
                            created_at=0,  # We don't know the block number
                            status=details["status"],
                            token_symbol=details["token_symbol"],
                        )

                        self.db.add(auction)
                        logger.info(f"Added auction {auction_id} from contract sync")

                        # Fetch metadata based on asset type
                        if details["amount"] == "0":  # ERC721 token
                            self.fetch_nft_metadata(
                                details["asset_address"], details["asset_id"]
                            )
                        else:  # ERC20 token
                            self.fetch_token_metadata(details["asset_address"])

                        # Also fetch payment token metadata
                        self.fetch_token_metadata(details["payment_token"])

                    except Exception as e:
                        logger.error(f"Error syncing auction {auction_id}: {e}")
                        continue

                # Commit batch
                self.db.commit()

            logger.info("Auction sync completed")

        except Exception as e:
            logger.error(f"Error syncing auctions: {e}")
            self.db.rollback()

    def listen_for_events(self):
        """Listen for events from the last processed block"""
        try:
            current_block = w3.eth.block_number

            if current_block <= self.last_block_processed:
                logger.info("No new blocks to process")
                return

            # Process new blocks
            logger.info(
                f"Processing blocks {self.last_block_processed + 1} to {current_block}"
            )

            # Listen for AuctionCreated events
            auction_created_filter = {
                "fromBlock": self.last_block_processed + 1,
                "toBlock": current_block,
                "address": Web3.to_checksum_address(FACTORY_CONTRACT_ADDRESS),
                "topics": ["0x" + AUCTION_CREATED_EVENT],  # Add the 0x prefix here
            }

            auction_events = w3.eth.get_logs(auction_created_filter)

            for event_log in auction_events:
                # Parse the event
                event = factory_contract.events.AuctionCreated().process_log(event_log)
                self.process_auction_created_event(event)

            # Listen for BidPlaced events for all known auctions
            auctions = self.db.query(Auction.auction_address).all()

            for auction_address in [a[0] for a in auctions]:
                auction_contract = w3.eth.contract(
                    address=auction_address, abi=auction_abi
                )
                bid_event_signature = w3.keccak(text=BID_PLACED_EVENT).hex()

                bid_filter = {
                    "toBlock": current_block,
                    "address": auction_address,
                    "topics": ["0x" + bid_event_signature],  # Add the 0x prefix here
                }

                try:
                    bid_events = w3.eth.get_logs(bid_filter)

                    for event_log in bid_events:
                        # Parse the event
                        event = auction_contract.events.BidPlaced().process_log(
                            event_log
                        )
                        self.process_bid_placed_event(event, auction_address)
                except Exception as e:
                    logger.error(f"Error getting bid events for {auction_address}: {e}")

            # Update last processed block
            self.last_block_processed = current_block

            # Update auction statuses
            self.update_auction_statuses()

            logger.info(
                f"Processed {len(auction_events)} new auctions and updated statuses"
            )

        except Exception as e:
            logger.error(f"Error in event listener: {e}", exc_info=True)
            raise e

    async def start_listening(self, interval=30):
        """Start listening for events with a polling interval"""
        logger.info("Starting blockchain listener...")

        # Do an initial sync from contract
        self.sync_auctions_from_contract()

        try:
            while True:
                try:
                    self.listen_for_events()
                except Exception as e:
                    logger.error(f"Error in listener loop: {e}")

                await asyncio.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Received shutdown signal, closing...")
            self.db.close()
            logger.info("Blockchain listener stopped")


# Initialize database
init_db()
