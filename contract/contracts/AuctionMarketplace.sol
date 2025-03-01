// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AuctionMarketplace
 * @dev On-Chain Auction Marketplace for digital assets (ERC20 tokens and ERC721 NFTs)
 */
contract AuctionMarketplace is Ownable, ReentrancyGuard {
    // Enum to track the state of an auction
    enum AuctionState { Active, Ended, Canceled }
    
    // Enum to define the type of asset being auctioned
    enum AssetType { ERC721, ERC20 }
    
    // Structure to store auction details
    struct Auction {
        address seller;
        AssetType assetType;
        address assetContract;
        uint256 tokenId;       // Used for ERC721
        uint256 tokenAmount;   // Used for ERC20
        uint256 startingPrice;
        uint256 reservePrice;  // Minimum price that the seller will accept
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        AuctionState state;
    }
    
    // Track auctions by ID
    mapping(uint256 => Auction) public auctions;
    uint256 public nextAuctionId;
    
    // Track the bids placed per auction
    mapping(uint256 => mapping(address => uint256)) public bidsPerAuction;
    
    // Platform fee percentage (x100 for precision, e.g., 250 = 2.5%)
    uint256 public platformFeePercent = 250;
    
    // Events for tracking auction activities
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address assetContract,
        uint256 tokenId,
        uint256 tokenAmount,
        AssetType assetType,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 bidAmount
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );
    
    event AuctionCanceled(uint256 indexed auctionId);
    
    event WithdrawalSuccessful(address indexed bidder, uint256 amount);
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new auction for an ERC721 token (NFT)
     */
    function createNFTAuction(
        address _nftContract,
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _reservePrice,
        uint256 _duration
    ) external returns (uint256) {
        require(_duration > 0, "Duration must be greater than 0");
        require(_startingPrice > 0, "Starting price must be greater than 0");
        require(_reservePrice >= _startingPrice, "Reserve price must be >= starting price");
        
        // Check that seller owns the NFT and has given approval to this contract
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the owner of this NFT");
        require(nft.getApproved(_tokenId) == address(this) || 
                nft.isApprovedForAll(msg.sender, address(this)), 
                "Contract not approved to transfer NFT");
        
        uint256 auctionId = nextAuctionId++;
        
        auctions[auctionId] = Auction({
            seller: msg.sender,
            assetType: AssetType.ERC721,
            assetContract: _nftContract,
            tokenId: _tokenId,
            tokenAmount: 0, // Not used for NFTs
            startingPrice: _startingPrice,
            reservePrice: _reservePrice,
            endTime: block.timestamp + _duration,
            highestBidder: address(0),
            highestBid: 0,
            state: AuctionState.Active
        });
        
        emit AuctionCreated(
            auctionId,
            msg.sender,
            _nftContract,
            _tokenId,
            0,
            AssetType.ERC721,
            _startingPrice,
            _reservePrice,
            auctions[auctionId].endTime
        );
        
        return auctionId;
    }
    
    /**
     * @dev Create a new auction for an ERC20 token
     */
    function createTokenAuction(
        address _tokenContract,
        uint256 _tokenAmount,
        uint256 _startingPrice,
        uint256 _reservePrice,
        uint256 _duration
    ) external returns (uint256) {
        require(_duration > 0, "Duration must be greater than 0");
        require(_startingPrice > 0, "Starting price must be greater than 0");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(_reservePrice >= _startingPrice, "Reserve price must be >= starting price");
        
        // Check that seller has sufficient tokens and has given approval to this contract
        IERC20 token = IERC20(_tokenContract);
        require(token.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= _tokenAmount, 
                "Contract not approved to transfer tokens");
        
        // Transfer tokens to the contract
        bool success = token.transferFrom(msg.sender, address(this), _tokenAmount);
        require(success, "Failed to transfer tokens to contract");
        
        uint256 auctionId = nextAuctionId++;
        
        auctions[auctionId] = Auction({
            seller: msg.sender,
            assetType: AssetType.ERC20,
            assetContract: _tokenContract,
            tokenId: 0, // Not used for ERC20 tokens
            tokenAmount: _tokenAmount,
            startingPrice: _startingPrice,
            reservePrice: _reservePrice,
            endTime: block.timestamp + _duration,
            highestBidder: address(0),
            highestBid: 0,
            state: AuctionState.Active
        });
        
        emit AuctionCreated(
            auctionId,
            msg.sender,
            _tokenContract,
            0,
            _tokenAmount,
            AssetType.ERC20,
            _startingPrice,
            _reservePrice,
            auctions[auctionId].endTime
        );
        
        return auctionId;
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 _auctionId) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.state == AuctionState.Active, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.sender != auction.seller, "Seller cannot bid on own auction");
        
        uint256 newBid = bidsPerAuction[_auctionId][msg.sender] + msg.value;
        
        // For the first bid, must be at least the starting price
        if (auction.highestBid == 0) {
            require(newBid >= auction.startingPrice, "Bid must be at least the starting price");
        } else {
            // For subsequent bids, must be higher than the current highest bid
            require(newBid > auction.highestBid, "Bid must be higher than current highest bid");
        }
        
        // Update bidder's total bid amount
        bidsPerAuction[_auctionId][msg.sender] = newBid;
        
        // If this is the new highest bid, update auction status
        if (newBid > auction.highestBid) {
            auction.highestBidder = msg.sender;
            auction.highestBid = newBid;
        }
        
        emit BidPlaced(_auctionId, msg.sender, newBid);
    }
    
    /**
     * @dev End an auction and settle the transaction
     */
    function endAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.state == AuctionState.Active, "Auction is not active");
        require(block.timestamp >= auction.endTime || msg.sender == auction.seller, 
                "Auction has not ended yet and caller is not the seller");
        
        auction.state = AuctionState.Ended;
        
        // If there were no bids or reserve price wasn't met
        if (auction.highestBidder == address(0) || auction.highestBid < auction.reservePrice) {
            // Return the asset to the seller
            if (auction.assetType == AssetType.ERC721) {
                IERC721(auction.assetContract).transferFrom(address(this), auction.seller, auction.tokenId);
            } else if (auction.assetType == AssetType.ERC20) {
                IERC20(auction.assetContract).transfer(auction.seller, auction.tokenAmount);
            }
            
            emit AuctionEnded(_auctionId, address(0), 0);
            return;
        }
        
        // Calculate platform fee
        uint256 platformFee = (auction.highestBid * platformFeePercent) / 10000;
        uint256 sellerAmount = auction.highestBid - platformFee;
        
        // Transfer funds to seller
        (bool sellerTransferSuccess, ) = payable(auction.seller).call{value: sellerAmount}("");
        require(sellerTransferSuccess, "Failed to send funds to seller");
        
        // Transfer platform fee to contract owner
        (bool feeTransferSuccess, ) = payable(owner()).call{value: platformFee}("");
        require(feeTransferSuccess, "Failed to send platform fee");
        
        // Transfer the asset to the highest bidder
        if (auction.assetType == AssetType.ERC721) {
            IERC721(auction.assetContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);
        } else if (auction.assetType == AssetType.ERC20) {
            IERC20(auction.assetContract).transfer(auction.highestBidder, auction.tokenAmount);
        }
        
        emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
    }
    
    /**
     * @dev Cancel an auction if there are no bids yet
     */
    function cancelAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        
        require(msg.sender == auction.seller || msg.sender == owner(), "Only seller or owner can cancel");
        require(auction.state == AuctionState.Active, "Auction is not active");
        require(auction.highestBid == 0, "Cannot cancel auction with bids");
        
        auction.state = AuctionState.Canceled;
        
        // Return the asset to the seller
        if (auction.assetType == AssetType.ERC721) {
            IERC721(auction.assetContract).transferFrom(address(this), auction.seller, auction.tokenId);
        } else if (auction.assetType == AssetType.ERC20) {
            IERC20(auction.assetContract).transfer(auction.seller, auction.tokenAmount);
        }
        
        emit AuctionCanceled(_auctionId);
    }
    
    /**
     * @dev Withdraw funds for non-winning bids
     */
    function withdrawBids(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.state != AuctionState.Active, "Auction still active");
        require(msg.sender != auction.highestBidder || auction.highestBid < auction.reservePrice, 
                "Winner cannot withdraw winning bid");
        
        uint256 amount = bidsPerAuction[_auctionId][msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        // Reset bidder's amount before transfer to prevent reentrancy
        bidsPerAuction[_auctionId][msg.sender] = 0;
        
        // Transfer funds back to the bidder
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Failed to send funds to bidder");
        
        emit WithdrawalSuccessful(msg.sender, amount);
    }
    
    /**
     * @dev Update platform fee percentage (owner only)
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _newFeePercent;
    }
    
    /**
     * @dev Get auction details
     */
    function getAuction(uint256 _auctionId) external view returns (
        address seller,
        AssetType assetType,
        address assetContract,
        uint256 tokenId,
        uint256 tokenAmount,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 endTime,
        address highestBidder,
        uint256 highestBid,
        AuctionState state
    ) {
        Auction storage auction = auctions[_auctionId];
        return (
            auction.seller,
            auction.assetType,
            auction.assetContract,
            auction.tokenId,
            auction.tokenAmount,
            auction.startingPrice,
            auction.reservePrice,
            auction.endTime,
            auction.highestBidder,
            auction.highestBid,
            auction.state
        );
    }
    
    /**
     * @dev Extend auction time (owner only, for emergency situations)
     */
    function extendAuctionTime(uint256 _auctionId, uint256 _additionalTime) external onlyOwner {
        Auction storage auction = auctions[_auctionId];
        require(auction.state == AuctionState.Active, "Auction is not active");
        
        auction.endTime += _additionalTime;
    }
    
    /**
     * @dev Check if a specific auction has ended but hasn't been processed
     */
    function isAuctionExpired(uint256 _auctionId) external view returns (bool) {
        Auction storage auction = auctions[_auctionId];
        return auction.state == AuctionState.Active && block.timestamp >= auction.endTime;
    }
}