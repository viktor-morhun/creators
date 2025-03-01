import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract, BigNumber } from "ethers";

interface AuctionDetails {
  seller: string;
  highestBidder: string;
  highestBid: BigNumber;
  endTime: BigNumber;
  ended: boolean;
  assetAddress: string;
  assetId: BigNumber;
  amount: BigNumber;
  paymentToken: string;
}

describe("Auction Contracts", () => {
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let bidder1: SignerWithAddress;
  let bidder2: SignerWithAddress;
  let reputationManager: Contract;
  let auctionFactory: Contract;
  let mockERC20: Contract;
  let mockERC721: Contract;
  let mockERC1155: Contract;
  let englishAuction: Contract;
  let dutchAuction: Contract;
  let sealedBidAuction: Contract;
  let timeBasedAuction: Contract;

  const startingPrice: BigNumber = ethers.utils.parseEther("1");
  const reservePrice: BigNumber = ethers.utils.parseEther("0.5");
  const bidAmount1: BigNumber = ethers.utils.parseEther("0.6");
  const bidAmount2: BigNumber = ethers.utils.parseEther("0.8");
  const duration: number = 3600; // 1 час в секундах
  const amount: number = 100;

  beforeEach(async () => {
    // Получаем аккаунты
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Деплоим ReputationManager с initialOwner
    const ReputationManager = await ethers.getContractFactory("ReputationManager");
    reputationManager = await ReputationManager.deploy(owner.address);
    await reputationManager.deployed();

    // Деплоим мок-токены
    const ERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await ERC20.deploy("Mock Token", "MTK", ethers.utils.parseEther("1000"));
    await mockERC20.deployed();

    const ERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await ERC721.deploy("Mock NFT", "MNFT");
    await mockERC721.deployed();

    const ERC1155 = await ethers.getContractFactory("MockERC1155");
    mockERC1155 = await ERC1155.deploy();
    await mockERC1155.deployed();

    // Деплоим AuctionFactory с initialOwner
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    auctionFactory = await AuctionFactory.deploy(reputationManager.address, owner.address);
    await auctionFactory.deployed();

    // Подготавливаем токены для продавца и участников
    await mockERC20.transfer(seller.address, ethers.utils.parseEther("500"));
    await mockERC20.connect(seller).approve(auctionFactory.address, ethers.utils.parseEther("500"));
    await mockERC20.connect(bidder1).approve(auctionFactory.address, ethers.utils.parseEther("500"));
    await mockERC20.connect(bidder2).approve(auctionFactory.address, ethers.utils.parseEther("500"));

    await mockERC721.mint(seller.address, 1);
    await mockERC721.connect(seller).approve(auctionFactory.address, 1);

    await mockERC1155.mint(seller.address, 1, amount, "0x");
    await mockERC1155.connect(seller).setApprovalForAll(auctionFactory.address, true);
  });

  describe("AuctionFactory", () => {
    it("should create an English auction", async () => {
      const tx = await auctionFactory.connect(seller).createAuction(
        0, // English
        0, // ERC20
        mockERC20.address,
        0, // assetId не используется для ERC20
        amount,
        mockERC20.address,
        duration,
        startingPrice,
        reservePrice
      );
      const receipt = await tx.wait();
      const auctionAddress: string = receipt.events[0].args.auctionAddress;

      expect(await auctionFactory.auctions(1)).to.equal(auctionAddress);
      expect(await auctionFactory.auctionCount()).to.equal(1);
    });
  });

  describe("EnglishAuction", () => {
    beforeEach(async () => {
      const tx = await auctionFactory.connect(seller).createAuction(
        0, // English
        1, // ERC721
        mockERC721.address,
        1, // assetId
        1, // amount
        mockERC20.address,
        duration,
        startingPrice,
        reservePrice
      );
      const receipt = await tx.wait();
      englishAuction = await ethers.getContractAt("EnglishAuction", receipt.events[0].args.auctionAddress);
    });

    it("should transfer asset to auction contract on creation", async () => {
      expect(await mockERC721.ownerOf(1)).to.equal(englishAuction.address);
    });

    it("should allow placing bids and update highest bidder", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(englishAuction.address, bidAmount1);

      await englishAuction.connect(bidder1).placeBid(bidAmount1);
      const details: AuctionDetails = await englishAuction.getAuctionDetails();

      expect(details.highestBidder).to.equal(bidder1.address);
      expect(details.highestBid).to.equal(bidAmount1);
    });

    it("should end auction and transfer assets", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(englishAuction.address, bidAmount1);
      await englishAuction.connect(bidder1).placeBid(bidAmount1);

      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      await englishAuction.endAuction();

      expect(await mockERC721.ownerOf(1)).to.equal(bidder1.address);
      expect(await mockERC20.balanceOf(seller.address)).to.equal(
        ethers.utils.parseEther("500").add(bidAmount1)
      );
    });

    it("should support IERC1155Receiver interface", async () => {
      const IERC1155ReceiverInterfaceId = "0x4e2312e0";
      expect(await englishAuction.supportsInterface(IERC1155ReceiverInterfaceId)).to.be.true;
    });
  });

  describe("DutchAuction", () => {
    beforeEach(async () => {
      const tx = await auctionFactory.connect(seller).createAuction(
        1, // Dutch
        0, // ERC20
        mockERC20.address,
        0, // assetId
        amount,
        mockERC20.address,
        duration,
        startingPrice,
        reservePrice
      );
      const receipt = await tx.wait();
      dutchAuction = await ethers.getContractAt("DutchAuction", receipt.events[0].args.auctionAddress);
    });

    it("should decrease price over time", async () => {
      const initialPrice: BigNumber = await dutchAuction.getCurrentPrice();
      await ethers.provider.send("evm_increaseTime", [duration / 2]);
      await ethers.provider.send("evm_mine", []);
      const midPrice: BigNumber = await dutchAuction.getCurrentPrice();

      expect(initialPrice).to.equal(startingPrice);
      expect(midPrice).to.be.lt(startingPrice);
      expect(midPrice).to.be.gt(reservePrice);
    });

    it("should accept bid and end auction", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(dutchAuction.address, bidAmount1);

      await dutchAuction.connect(bidder1).placeBid(bidAmount1);
      const details: AuctionDetails = await dutchAuction.getAuctionDetails();

      expect(details.highestBidder).to.equal(bidder1.address);
      expect(details.ended).to.be.true;
      expect(await mockERC20.balanceOf(bidder1.address)).to.equal(amount);
    });

    it("should support IERC1155Receiver interface", async () => {
      const IERC1155ReceiverInterfaceId = "0x4e2312e0";
      expect(await dutchAuction.supportsInterface(IERC1155ReceiverInterfaceId)).to.be.true;
    });
  });

  describe("SealedBidAuction", () => {
    beforeEach(async () => {
      const tx = await auctionFactory.connect(seller).createAuction(
        2, // SealedBid
        2, // ERC1155
        mockERC1155.address,
        1, // assetId
        amount,
        mockERC20.address,
        duration,
        0, // startingPrice не используется
        reservePrice
      );
      const receipt = await tx.wait();
      sealedBidAuction = await ethers.getContractAt("SealedBidAuction", receipt.events[0].args.auctionAddress);
    });

    it("should allow sealed bidding and revealing", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(sealedBidAuction.address, bidAmount1);

      await sealedBidAuction.connect(bidder1).placeBid(bidAmount1);
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      await sealedBidAuction.connect(bidder1).revealBid(bidAmount1, 0); // nonce=0 для простоты
      const details: AuctionDetails = await sealedBidAuction.getAuctionDetails();

      expect(details.highestBidder).to.equal(bidder1.address);
      expect(details.highestBid).to.equal(bidAmount1);
    });

    it("should end auction and transfer assets", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(sealedBidAuction.address, bidAmount1);

      await sealedBidAuction.connect(bidder1).placeBid(bidAmount1);
      await ethers.provider.send("evm_increaseTime", [duration + 86400 + 1]); // +1 день
      await ethers.provider.send("evm_mine", []);

      await sealedBidAuction.connect(bidder1).revealBid(bidAmount1, 0);
      await sealedBidAuction.endAuction();

      expect(await mockERC1155.balanceOf(bidder1.address, 1)).to.equal(amount);
    });

    it("should support IERC1155Receiver interface", async () => {
      const IERC1155ReceiverInterfaceId = "0x4e2312e0";
      expect(await sealedBidAuction.supportsInterface(IERC1155ReceiverInterfaceId)).to.be.true;
    });
  });

  describe("TimeBasedAuction", () => {
    beforeEach(async () => {
      const tx = await auctionFactory.connect(seller).createAuction(
        3, // TimeBased
        1, // ERC721
        mockERC721.address,
        1, // assetId
        1, // amount
        mockERC20.address,
        duration,
        startingPrice,
        reservePrice
      );
      const receipt = await tx.wait();
      timeBasedAuction = await ethers.getContractAt("TimeBasedAuction", receipt.events[0].args.auctionAddress);
    });

    it("should extend time on late bid", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(timeBasedAuction.address, bidAmount1);

      await ethers.provider.send("evm_increaseTime", [duration - 300]); // 5 минут до конца
      await ethers.provider.send("evm_mine", []);

      const initialEndTime: BigNumber = await timeBasedAuction.endTime();
      await timeBasedAuction.connect(bidder1).placeBid(bidAmount1);
      const newEndTime: BigNumber = await timeBasedAuction.endTime();

      expect(newEndTime).to.equal(initialEndTime.add(300)); // +5 минут
    });

    it("should end auction and transfer assets", async () => {
      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(timeBasedAuction.address, bidAmount1);

      await timeBasedAuction.connect(bidder1).placeBid(bidAmount1);
      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);

      await timeBasedAuction.endAuction();

      expect(await mockERC721.ownerOf(1)).to.equal(bidder1.address);
    });

    it("should support IERC1155Receiver interface", async () => {
      const IERC1155ReceiverInterfaceId = "0x4e2312e0";
      expect(await timeBasedAuction.supportsInterface(IERC1155ReceiverInterfaceId)).to.be.true;
    });
  });

  describe("ReputationManager", () => {
    it("should update reputation for bidder and seller", async () => {
      const tx = await auctionFactory.connect(seller).createAuction(
        0, // English
        1, // ERC721
        mockERC721.address,
        1,
        1,
        mockERC20.address,
        duration,
        startingPrice,
        reservePrice
      );
      const receipt = await tx.wait();
      const auction = await ethers.getContractAt("EnglishAuction", receipt.events[0].args.auctionAddress);

      await mockERC20.transfer(bidder1.address, bidAmount1);
      await mockERC20.connect(bidder1).approve(auction.address, bidAmount1);
      await auction.connect(bidder1).placeBid(bidAmount1);

      await ethers.provider.send("evm_increaseTime", [duration + 1]);
      await ethers.provider.send("evm_mine", []);
      await auction.endAuction();

      expect(await reputationManager.getReputation(bidder1.address)).to.equal(1);
      expect(await reputationManager.getReputation(seller.address)).to.equal(2);
    });
  });
});