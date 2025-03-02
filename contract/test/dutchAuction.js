const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DutchAuction", function () {
  let AuctionFactory, DutchAuction, ERC20Token, ERC721Token;
  let auctionFactory, dutchAuction, erc20Token, erc721Token;
  let owner, seller, bidder1, bidder2;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const STARTING_PRICE = ethers.parseEther("2"); // Начальная цена 2 единицы валюты
  const RESERVE_PRICE = ethers.parseEther("0.5"); // Резервная цена 0.5 единицы
  const DURATION = 3600; // 1 час в секундах
  const TOKEN_AMOUNT = ethers.parseEther("100"); // 100 токенов ERC20 для аукциона
  const INITIAL_BALANCE = ethers.parseEther("120"); // 120 токенов для продавца
  const NFT_ID = 1;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    ERC20Token = await ethers.getContractFactory("ERC20Mock");
    erc20Token = await ERC20Token.deploy("Test Token", "TST", seller.address, INITIAL_BALANCE);
    await erc20Token.waitForDeployment();

    ERC721Token = await ethers.getContractFactory("ERC721Mock");
    erc721Token = await ERC721Token.deploy("Test NFT", "NFT");
    await erc721Token.waitForDeployment();

    AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    auctionFactory = await AuctionFactory.deploy(owner.address);
    await auctionFactory.waitForDeployment();

    await erc721Token.connect(seller).mint(seller.address, NFT_ID);
  });

  describe("ERC721 as Asset and ETH as Payment", function () {
    beforeEach(async function () {
      await erc721Token.connect(seller).approve(auctionFactory.target, NFT_ID);

      const tx = await auctionFactory.connect(seller).createDutchAuction(
        1, // ERC721
        erc721Token.target,
        NFT_ID,
        0,
        ZERO_ADDRESS,
        DURATION,
        STARTING_PRICE,
        RESERVE_PRICE
      );
      const receipt = await tx.wait();
      const auctionAddress = receipt.logs[1].args.auctionAddress;
      DutchAuction = await ethers.getContractFactory("DutchAuction");
      dutchAuction = DutchAuction.attach(auctionAddress);
    });

    it("should allow bidding and finalize with ETH", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION / 2]);
      await ethers.provider.send("evm_mine", []);

      const currentPrice = await dutchAuction.getCurrentPrice();
      const bidAmount = ethers.parseEther("1.5");

      expect(currentPrice).to.be.lte(STARTING_PRICE);
      expect(bidAmount).to.be.gte(currentPrice);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(dutchAuction.connect(bidder1).placeBid(bidAmount, { value: bidAmount }))
        .to.emit(dutchAuction, "BidPlaced")
        .withArgs(bidder1.address, bidAmount)
        .to.emit(dutchAuction, "AuctionEnded")
        .withArgs(bidder1.address, bidAmount);

      expect(await dutchAuction.ended()).to.be.true;

      expect(await erc721Token.ownerOf(NFT_ID)).to.equal(bidder1.address);

      // Проверяем баланс продавца (учитываем газ)
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const balanceIncrease = sellerBalanceAfter - sellerBalanceBefore;
      expect(balanceIncrease).to.be.closeTo(bidAmount, ethers.parseEther("0.1")); // Допускаем погрешность на газ
    });
  });

  describe("ERC20 as Asset and Payment", function () {
    beforeEach(async function () {
      await erc20Token.connect(seller).transfer(bidder1.address, ethers.parseEther("10"));
      await erc20Token.connect(seller).transfer(bidder2.address, ethers.parseEther("10"));

      await erc20Token.connect(seller).approve(auctionFactory.target, TOKEN_AMOUNT);

      const tx = await auctionFactory.connect(seller).createDutchAuction(
        0, // ERC20
        erc20Token.target,
        0,
        TOKEN_AMOUNT,
        erc20Token.target,
        DURATION,
        STARTING_PRICE,
        RESERVE_PRICE
      );
      const receipt = await tx.wait();
      const auctionAddress = receipt.logs[1].args.auctionAddress;
      DutchAuction = await ethers.getContractFactory("DutchAuction");
      dutchAuction = DutchAuction.attach(auctionAddress);
    });

    it("should allow bidding and finalize with ERC20", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION / 2]);
      await ethers.provider.send("evm_mine", []);

      const currentPrice = await dutchAuction.getCurrentPrice();
      const bidAmount = ethers.parseEther("1.5");

      expect(currentPrice).to.be.lte(STARTING_PRICE);
      expect(bidAmount).to.be.gte(currentPrice);

      await erc20Token.connect(bidder1).approve(dutchAuction.target, bidAmount);
      await expect(dutchAuction.connect(bidder1).placeBid(bidAmount))
        .to.emit(dutchAuction, "BidPlaced")
        .withArgs(bidder1.address, bidAmount)
        .to.emit(dutchAuction, "AuctionEnded")
        .withArgs(bidder1.address, bidAmount);

      expect(await dutchAuction.ended()).to.be.true;

      expect(await erc20Token.balanceOf(seller.address)).to.equal(ethers.parseEther("1.5")); // 120 - 10 - 10 - 100 + 1.5
      expect(await erc20Token.balanceOf(bidder1.address)).to.equal(ethers.parseEther("108.5")); // 10 + 100 - 1.5
    });
  });
});