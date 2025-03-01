// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAuction {
    function placeBid(uint256 bidAmount) external;
    function endAuction() external;
    function getAuctionDetails() external view returns (
        address seller,
        address highestBidder,
        uint256 highestBid,
        uint256 endTime,
        bool ended,
        address assetAddress,
        uint256 assetId,
        uint256 amount,
        address paymentToken
    );
}

contract AuctionFactory is Ownable {
    enum AssetType { ERC20, ERC721, ERC1155 }
    enum AuctionType { English, Dutch }

    mapping(uint256 => address) public auctions;
    uint256 public auctionCount;

    event AuctionCreated(uint256 auctionId, address auctionAddress, AuctionType auctionType);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createEnglishAuction(
        AssetType _assetType,
        address _assetAddress,
        uint256 _assetId,
        uint256 _amount,
        address _paymentToken,
        uint256 _duration,
        uint256 _startingPrice,
        uint256 _reservePrice
    ) external returns (address) {
        require(_assetAddress != address(0), "Invalid asset address");
        require(_duration > 0, "Duration must be greater than 0");

        auctionCount++;
        address newAuction = address(
            new EnglishAuction(
                msg.sender,
                _assetType,
                _assetAddress,
                _assetId,
                _amount,
                _paymentToken,
                _duration,
                _startingPrice,
                _reservePrice
            )
        );
        auctions[auctionCount] = newAuction;
        emit AuctionCreated(auctionCount, newAuction, AuctionType.English);
        return newAuction;
    }

    function createDutchAuction(
        AssetType _assetType,
        address _assetAddress,
        uint256 _assetId,
        uint256 _amount,
        address _paymentToken,
        uint256 _duration,
        uint256 _startingPrice,
        uint256 _reservePrice
    ) external returns (address) {
        require(_assetAddress != address(0), "Invalid asset address");
        require(_duration > 0, "Duration must be greater than 0");

        auctionCount++;
        address newAuction = address(
            new DutchAuction(
                msg.sender,
                _assetType,
                _assetAddress,
                _assetId,
                _amount,
                _paymentToken,
                _duration,
                _startingPrice,
                _reservePrice
            )
        );
        auctions[auctionCount] = newAuction;
        emit AuctionCreated(auctionCount, newAuction, AuctionType.Dutch);
        return newAuction;
    }

    function getAuction(uint256 _auctionId) external view returns (address) {
        require(_auctionId <= auctionCount, "Auction does not exist");
        return auctions[_auctionId];
    }
}

contract EnglishAuction is IAuction, ReentrancyGuard, IERC1155Receiver {
    address public seller;
    address public highestBidder;
    uint256 public highestBid;
    uint256 public endTime;
    bool public ended;
    AuctionFactory.AssetType public assetType;
    address public assetAddress;
    uint256 public assetId;
    uint256 public amount;
    address public paymentToken;
    uint256 public startingPrice;
    uint256 public reservePrice;

    event BidPlaced(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(
        address _seller,
        AuctionFactory.AssetType _assetType,
        address _assetAddress,
        uint256 _assetId,
        uint256 _amount,
        address _paymentToken,
        uint256 _duration,
        uint256 _startingPrice,
        uint256 _reservePrice
    ) {
        seller = _seller;
        assetType = _assetType;
        assetAddress = _assetAddress;
        assetId = _assetId;
        amount = _amount;
        paymentToken = _paymentToken;
        endTime = block.timestamp + _duration;
        startingPrice = _startingPrice;
        reservePrice = _reservePrice;

        transferAssetToContract(_seller, _assetAddress, _assetType, _assetId, _amount);
    }

    function placeBid(uint256 _bidAmount) external override nonReentrant {
        require(!ended, "Auction already ended");
        require(block.timestamp < endTime, "Auction time expired");
        require(_bidAmount >= reservePrice, "Bid below reserve price");
        require(_bidAmount > highestBid, "Bid must exceed current highest bid");
        require(IERC20(paymentToken).allowance(msg.sender, address(this)) >= _bidAmount, "Insufficient token allowance");

        if (highestBidder != address(0)) {
            IERC20(paymentToken).transfer(highestBidder, highestBid);
        }
        IERC20(paymentToken).transferFrom(msg.sender, address(this), _bidAmount);

        highestBidder = msg.sender;
        highestBid = _bidAmount;
        emit BidPlaced(msg.sender, _bidAmount);
    }

    function endAuction() external override nonReentrant {
        require(block.timestamp >= endTime || msg.sender == seller, "Auction not yet ended");
        require(!ended, "Auction already ended");
        ended = true;
        finalizeAuction();
    }

    function getAuctionDetails() external view override returns (
        address, address, uint256, uint256, bool, address, uint256, uint256, address
    ) {
        return (
            seller, highestBidder, highestBid, endTime, ended,
            assetAddress, assetId, amount, paymentToken
        );
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function transferAssetToContract(
        address _from,
        address _assetAddress,
        AuctionFactory.AssetType _assetType,
        uint256 _assetId,
        uint256 _amount
    ) internal {
        if (_assetType == AuctionFactory.AssetType.ERC721) {
            require(IERC721(_assetAddress).getApproved(_assetId) == address(this), "Contract not approved for ERC721");
            IERC721(_assetAddress).transferFrom(_from, address(this), _assetId);
        } else if (_assetType == AuctionFactory.AssetType.ERC20) {
            require(IERC20(_assetAddress).allowance(_from, address(this)) >= _amount, "Insufficient ERC20 allowance");
            IERC20(_assetAddress).transferFrom(_from, address(this), _amount);
        } else if (_assetType == AuctionFactory.AssetType.ERC1155) {
            require(IERC1155(_assetAddress).isApprovedForAll(_from, address(this)), "Contract not approved for ERC1155");
            IERC1155(_assetAddress).safeTransferFrom(_from, address(this), _assetId, _amount, "");
        }
    }

    function finalizeAuction() internal {
        if (highestBidder != address(0)) {
            IERC20(paymentToken).transfer(seller, highestBid);
            if (assetType == AuctionFactory.AssetType.ERC721) {
                IERC721(assetAddress).transferFrom(address(this), highestBidder, assetId);
            } else if (assetType == AuctionFactory.AssetType.ERC20) {
                IERC20(assetAddress).transfer(highestBidder, amount);
            } else if (assetType == AuctionFactory.AssetType.ERC1155) {
                IERC1155(assetAddress).safeTransferFrom(address(this), highestBidder, assetId, amount, "");
            }
            emit AuctionEnded(highestBidder, highestBid);
        } else {
            if (assetType == AuctionFactory.AssetType.ERC721) {
                IERC721(assetAddress).transferFrom(address(this), seller, assetId);
            } else if (assetType == AuctionFactory.AssetType.ERC20) {
                IERC20(assetAddress).transfer(seller, amount);
            } else if (assetType == AuctionFactory.AssetType.ERC1155) {
                IERC1155(assetAddress).safeTransferFrom(address(this), seller, assetId, amount, "");
            }
            emit AuctionEnded(address(0), 0);
        }
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}

contract DutchAuction is IAuction, ReentrancyGuard, IERC1155Receiver {
    address public seller;
    address public highestBidder;
    uint256 public highestBid;
    uint256 public endTime;
    bool public ended;
    AuctionFactory.AssetType public assetType;
    address public assetAddress;
    uint256 public assetId;
    uint256 public amount;
    address public paymentToken;
    uint256 public startingPrice;
    uint256 public reservePrice;
    uint256 public duration;

    event BidPlaced(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(
        address _seller,
        AuctionFactory.AssetType _assetType,
        address _assetAddress,
        uint256 _assetId,
        uint256 _amount,
        address _paymentToken,
        uint256 _duration,
        uint256 _startingPrice,
        uint256 _reservePrice
    ) {
        seller = _seller;
        assetType = _assetType;
        assetAddress = _assetAddress;
        assetId = _assetId;
        amount = _amount;
        paymentToken = _paymentToken;
        endTime = block.timestamp + _duration;
        startingPrice = _startingPrice;
        reservePrice = _reservePrice;
        duration = _duration;

        transferAssetToContract(_seller, _assetAddress, _assetType, _assetId, _amount);
    }

    function getCurrentPrice() public view returns (uint256) {
        if (block.timestamp >= endTime) return reservePrice;
        uint256 timeElapsed = block.timestamp - (endTime - duration);
        uint256 priceDrop = (startingPrice - reservePrice) * timeElapsed / duration;
        return startingPrice - priceDrop;
    }

    function placeBid(uint256 _bidAmount) external override nonReentrant {
        require(!ended, "Auction already ended");
        require(block.timestamp < endTime, "Auction time expired");
        uint256 currentPrice = getCurrentPrice();
        require(_bidAmount >= currentPrice, "Bid below current price");
        require(IERC20(paymentToken).allowance(msg.sender, address(this)) >= _bidAmount, "Insufficient token allowance");

        IERC20(paymentToken).transferFrom(msg.sender, address(this), _bidAmount);
        highestBidder = msg.sender;
        highestBid = _bidAmount;
        ended = true;
        emit BidPlaced(msg.sender, _bidAmount);
        finalizeAuction();
    }

    function endAuction() external override nonReentrant {
        require(block.timestamp >= endTime || msg.sender == seller, "Auction not yet ended");
        require(!ended, "Auction already ended");
        ended = true;
        finalizeAuction();
    }

    function getAuctionDetails() external view override returns (
        address, address, uint256, uint256, bool, address, uint256, uint256, address
    ) {
        return (
            seller, highestBidder, highestBid, endTime, ended,
            assetAddress, assetId, amount, paymentToken
        );
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function transferAssetToContract(
        address _from,
        address _assetAddress,
        AuctionFactory.AssetType _assetType,
        uint256 _assetId,
        uint256 _amount
    ) internal {
        if (_assetType == AuctionFactory.AssetType.ERC721) {
            require(IERC721(_assetAddress).getApproved(_assetId) == address(this), "Contract not approved for ERC721");
            IERC721(_assetAddress).transferFrom(_from, address(this), _assetId);
        } else if (_assetType == AuctionFactory.AssetType.ERC20) {
            require(IERC20(_assetAddress).allowance(_from, address(this)) >= _amount, "Insufficient ERC20 allowance");
            IERC20(_assetAddress).transferFrom(_from, address(this), _amount);
        } else if (_assetType == AuctionFactory.AssetType.ERC1155) {
            require(IERC1155(_assetAddress).isApprovedForAll(_from, address(this)), "Contract not approved for ERC1155");
            IERC1155(_assetAddress).safeTransferFrom(_from, address(this), _assetId, _amount, "");
        }
    }

    function finalizeAuction() internal {
        if (highestBidder != address(0)) {
            IERC20(paymentToken).transfer(seller, highestBid);
            if (assetType == AuctionFactory.AssetType.ERC721) {
                IERC721(assetAddress).transferFrom(address(this), highestBidder, assetId);
            } else if (assetType == AuctionFactory.AssetType.ERC20) {
                IERC20(assetAddress).transfer(highestBidder, amount);
            } else if (assetType == AuctionFactory.AssetType.ERC1155) {
                IERC1155(assetAddress).safeTransferFrom(address(this), highestBidder, assetId, amount, "");
            }
            emit AuctionEnded(highestBidder, highestBid);
        } else {
            if (assetType == AuctionFactory.AssetType.ERC721) {
                IERC721(assetAddress).transferFrom(address(this), seller, assetId);
            } else if (assetType == AuctionFactory.AssetType.ERC20) {
                IERC20(assetAddress).transfer(seller, amount);
            } else if (assetType == AuctionFactory.AssetType.ERC1155) {
                IERC1155(assetAddress).safeTransferFrom(address(this), seller, assetId, amount, "");
            }
            emit AuctionEnded(address(0), 0);
        }
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}