import asyncio
import logging
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
from pydantic import BaseModel
from web3 import Web3
from db_models import Auction, Bid, NFTMetadata, TokenMetadata, get_db
from blockchain_listener import BlockchainListener
from config import SYNC_INTERVAL, HOST, PORT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Auction Caching Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create updated response models with enhanced metadata fields
class AuctionResponse(BaseModel):
    id: str
    auctionId: str
    auctionAddress: str
    auctionType: int
    seller: str
    highestBidder: str
    highestBid: str
    endTime: int
    ended: bool
    assetAddress: str
    assetId: int
    amount: str
    paymentToken: str
    status: str
    bidCount: int
    currency: str
    imageUrl: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    currencySymbol: Optional[str] = None
    currencyName: Optional[str] = None
    currencyImageUrl: Optional[str] = None
    currencyDecimals: Optional[int] = None
    reservePrice: Optional[str] = None  # Dutch auction reserve price
    currentPrice: Optional[str] = None  # Dutch auction current price


class BidResponse(BaseModel):
    bidder: str
    amount: str
    blockNumber: int
    timestamp: int


# API endpoints
@app.get("/")
def read_root():
    return {"message": "Auction caching server is running"}


@app.get("/auctions", response_model=List[AuctionResponse])
def get_auctions(
    status: Optional[str] = Query(
        None, description="Filter by auction status (active/ended)"
    ),
    auction_type: Optional[int] = Query(
        None, description="Filter by auction type (0=English, 1=Dutch)"
    ),
    seller: Optional[str] = Query(None, description="Filter by seller address"),
    page: int = Query(0, description="Page number for pagination"),
    page_size: int = Query(10, description="Items per page"),
    sort_by: str = Query("endTime", description="Field to sort by"),
    sort_desc: bool = Query(False, description="Sort in descending order"),
    db: Session = Depends(get_db),
):
    # Base query
    query = db.query(Auction)

    # Apply filters
    if status:
        query = query.filter(Auction.status == status)
    if auction_type is not None:
        query = query.filter(Auction.auction_type == auction_type)
    if seller:
        query = query.filter(Auction.seller.ilike(f"%{seller}%"))

    # Apply sorting
    if sort_by == "endTime":
        query = query.order_by(
            Auction.end_time.desc() if sort_desc else Auction.end_time
        )
    elif sort_by == "highestBid":
        # This is a simplified sort - in reality you'd need to convert to numeric
        query = query.order_by(
            Auction.highest_bid.desc() if sort_desc else Auction.highest_bid
        )
    elif sort_by == "created":
        query = query.order_by(
            Auction.created_at.desc() if sort_desc else Auction.created_at
        )

    # Get count before pagination
    total_count = query.count()

    # Apply pagination
    auctions = query.offset(page * page_size).limit(page_size).all()

    # Load metadata for tokens and NFTs
    result = []
    for auction in auctions:
        auction_dict = auction.to_dict()

        # Add title, description and image URL based on asset type
        if auction.amount == "0":  # ERC721
            nft_metadata = (
                db.query(NFTMetadata)
                .filter_by(
                    asset_address=auction.asset_address, asset_id=auction.asset_id
                )
                .first()
            )

            if nft_metadata:
                auction_dict["imageUrl"] = nft_metadata.image_url
                auction_dict["title"] = nft_metadata.name
                auction_dict["description"] = nft_metadata.description
            else:
                auction_dict["imageUrl"] = (
                    f"https://via.placeholder.com/300x200?text=NFT+{auction.asset_id}"
                )
                auction_dict["title"] = f"NFT #{auction.asset_id}"
                auction_dict["description"] = "Metadata not available"
        else:  # ERC20
            token_metadata = (
                db.query(TokenMetadata)
                .filter_by(token_address=auction.asset_address)
                .first()
            )

            if token_metadata:
                auction_dict["imageUrl"] = "http://placehold.it/350x50"
                auction_dict["title"] = (
                    f"{token_metadata.name} ({token_metadata.symbol})"
                )
                auction_dict["description"] = (
                    f"{auction.amount} {token_metadata.symbol} tokens"
                )
            else:
                auction_dict["imageUrl"] = (
                    f"https://via.placeholder.com/128x128?text=Token"
                )
                auction_dict["title"] = "Unknown Token"
                auction_dict["description"] = f"{auction.amount} tokens"

        # Add payment token info
        payment_token = (
            db.query(TokenMetadata)
            .filter_by(token_address=auction.payment_token)
            .first()
        )

        if payment_token:
            auction_dict["currencySymbol"] = payment_token.symbol
            auction_dict["currencyName"] = payment_token.name
            auction_dict["currencyImageUrl"] = payment_token.image_url
            auction_dict["currencyDecimals"] = payment_token.decimals

        result.append(auction_dict)

    return result


@app.get("/auctions/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: str, db: Session = Depends(get_db)):
    auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()

    if not auction:
        raise HTTPException(status_code=404, detail=f"Auction {auction_id} not found")

    auction_dict = auction.to_dict()

    # Add title, description and image URL based on asset type
    if auction.amount == "0":  # ERC721
        nft_metadata = (
            db.query(NFTMetadata)
            .filter_by(asset_address=auction.asset_address, asset_id=auction.asset_id)
            .first()
        )

        if nft_metadata:
            auction_dict["imageUrl"] = nft_metadata.image_url
            auction_dict["title"] = nft_metadata.name
            auction_dict["description"] = nft_metadata.description
        else:
            auction_dict["imageUrl"] = (
                f"https://via.placeholder.com/300x200?text=NFT+{auction.asset_id}"
            )
            auction_dict["title"] = f"NFT #{auction.asset_id}"
            auction_dict["description"] = "Metadata not available"
    else:  # ERC20
        token_metadata = (
            db.query(TokenMetadata)
            .filter_by(token_address=auction.asset_address)
            .first()
        )

        if token_metadata:
            auction_dict["imageUrl"] = token_metadata.image_url
            auction_dict["title"] = f"{Web3.from_wei(int(auction.amount), 'ether')} {token_metadata.name} ({token_metadata.symbol})"
            auction_dict["description"] = (
                f"{Web3.from_wei(int(auction.amount), 'ether')} {token_metadata.symbol} tokens"
            )
        else:
            auction_dict["imageUrl"] = f"https://via.placeholder.com/128x128?text=Token"
            auction_dict["title"] = "Unknown Token"
            auction_dict["description"] = f"{Web3.from_wei(int(auction.amount), 'ether')} tokens"

    # Add payment token info
    payment_token = (
        db.query(TokenMetadata).filter_by(token_address=auction.payment_token).first()
    )

    if payment_token:
        auction_dict["currencySymbol"] = payment_token.symbol
        auction_dict["currencyName"] = payment_token.name
        auction_dict["currencyImageUrl"] = payment_token.image_url
        auction_dict["currencyDecimals"] = payment_token.decimals

    return auction_dict


@app.get("/auctions/{auction_id}/bids", response_model=List[BidResponse])
def get_auction_bids(
    auction_id: str,
    page: int = Query(0, description="Page number for pagination"),
    page_size: int = Query(10, description="Items per page"),
    db: Session = Depends(get_db),
):
    # First get the auction to check it exists and get its address
    auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()

    if not auction:
        raise HTTPException(status_code=404, detail=f"Auction {auction_id} not found")

    # Now get the bids
    bids = (
        db.query(Bid)
        .filter(Bid.auction_address == auction.auction_address)
        .order_by(Bid.block_number.desc())
        .offset(page * page_size)
        .limit(page_size)
        .all()
    )

    return [bid.to_dict() for bid in bids]


@app.get("/auctions/count", response_model=dict)
def get_auction_counts(db: Session = Depends(get_db)):
    # Get counts of active and ended auctions
    active_count = db.query(Auction).filter(Auction.status == "active").count()
    ended_count = db.query(Auction).filter(Auction.status == "ended").count()
    total_count = db.query(Auction).count()

    return {"active": active_count, "ended": ended_count, "total": total_count}


@app.get("/tokens", response_model=List[dict])
def get_tokens(db: Session = Depends(get_db)):
    """Get all token metadata in the database"""
    tokens = db.query(TokenMetadata).all()
    return [token.to_dict() for token in tokens]


@app.get("/nfts", response_model=List[dict])
def get_nfts(db: Session = Depends(get_db)):
    """Get all NFT metadata in the database"""
    nfts = db.query(NFTMetadata).all()
    return [nft.to_dict() for nft in nfts]
