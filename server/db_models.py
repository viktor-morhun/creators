from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    create_engine,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import DATABASE_URL

Base = declarative_base()


class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True)
    auction_id = Column(String, unique=True, index=True)
    auction_address = Column(String, unique=True)
    auction_type = Column(Integer)  # 0 for English, 1 for Dutch
    seller = Column(String)
    highest_bidder = Column(String)
    highest_bid = Column(String)
    end_time = Column(Integer)
    ended = Column(Boolean, default=False)
    asset_address = Column(String)
    asset_id = Column(Integer)
    amount = Column(String)
    payment_token = Column(String)
    created_at = Column(Integer)  # Block number
    status = Column(String)  # 'active' or 'ended'
    token_symbol = Column(String, default="ETH")

    # Dutch auction specific fields
    reserve_price = Column(String)  # Minimum price for Dutch auction
    current_price = Column(String)  # Current price in Dutch auction

    # Relationship with bids
    bids = relationship("Bid", back_populates="auction")

    def to_dict(self):
        result = {
            "id": self.auction_id,
            "auctionId": self.auction_id,
            "auctionAddress": self.auction_address,
            "auctionType": self.auction_type,
            "seller": self.seller,
            "highestBidder": self.highest_bidder,
            "highestBid": self.highest_bid,
            "endTime": self.end_time,
            "ended": self.ended,
            "assetAddress": self.asset_address,
            "assetId": self.asset_id,
            "amount": self.amount,
            "paymentToken": self.payment_token,
            "blockNumber": self.created_at,
            "status": self.status,
            "bidCount": len(self.bids),
            "currency": self.token_symbol,
        }

        # Add Dutch auction specific fields if available
        if self.auction_type == 1:  # Dutch auction
            if self.reserve_price:
                result["reservePrice"] = self.reserve_price
            if self.current_price:
                result["currentPrice"] = self.current_price

        return result


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True)
    auction_address = Column(String, ForeignKey("auctions.auction_address"))
    bidder = Column(String)
    amount = Column(String)
    block_number = Column(Integer)
    timestamp = Column(Integer)

    # Relationship with auction
    auction = relationship("Auction", back_populates="bids")

    def to_dict(self):
        return {
            "bidder": self.bidder,
            "amount": self.amount,
            "blockNumber": self.block_number,
            "timestamp": self.timestamp,
        }


class NFTMetadata(Base):
    __tablename__ = "nft_metadata"

    id = Column(Integer, primary_key=True)
    asset_address = Column(String)
    asset_id = Column(Integer)
    image_url = Column(String)
    name = Column(String)
    description = Column(String)
    last_updated = Column(Integer)  # Unix timestamp

    def to_dict(self):
        return {
            "assetAddress": self.asset_address,
            "assetId": self.asset_id,
            "imageUrl": self.image_url,
            "name": self.name,
            "description": self.description,
        }


# New model for ERC20 token metadata
class TokenMetadata(Base):
    __tablename__ = "token_metadata"

    id = Column(Integer, primary_key=True)
    token_address = Column(String, unique=True, index=True)
    symbol = Column(String)
    name = Column(String)
    image_url = Column(String)
    decimals = Column(Integer, default=18)
    last_updated = Column(Integer)  # Unix timestamp

    def to_dict(self):
        return {
            "tokenAddress": self.token_address,
            "symbol": self.symbol,
            "name": self.name,
            "imageUrl": self.image_url,
            "decimals": self.decimals,
        }


# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
