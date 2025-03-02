const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnglishAuction", function () {
  let AuctionFactory, EnglishAuction, ERC20Token, ERC721Token;
  let auctionFactory, englishAuction, erc20Token, erc721Token;
  let owner, seller, bidder1, bidder2;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const STARTING_PRICE = ethers.parseEther("1"); // 1 единица валюты
  const DURATION = 3600; // 1 час в секундах
  const TOKEN_AMOUNT = ethers.parseEther("100"); // 100 токенов ERC20 для аукциона
  const INITIAL_BALANCE = ethers.parseEther("120"); // 120 токенов для продавца
  const NFT_ID = 1;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Деплоим ERC20Mock токен с увеличенным начальным балансом
    ERC20Token = await ethers.getContractFactory("ERC20Mock");
    erc20Token = await ERC20Token.deploy("Test Token", "TST", seller.address, INITIAL_BALANCE);
    await erc20Token.waitForDeployment();

    // Деплоим ERC721Mock токен
    ERC721Token = await ethers.getContractFactory("ERC721Mock");
    erc721Token = await ERC721Token.deploy("Test NFT", "NFT");
    await erc721Token.waitForDeployment();

    // Деплоим AuctionFactory
    AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    auctionFactory = await AuctionFactory.deploy(owner.address);
    await auctionFactory.waitForDeployment();

    // Минтим NFT для продавца
    await erc721Token.connect(seller).mint(seller.address, NFT_ID);
  });
describe("ERC20 as Asset and Payment", function () {
  beforeEach(async function () {
    await erc20Token.connect(seller).transfer(bidder1.address, ethers.parseEther("10"));
    await erc20Token.connect(seller).transfer(bidder2.address, ethers.parseEther("10"));

    await erc20Token.connect(seller).approve(auctionFactory.target, TOKEN_AMOUNT);

    const tx = await auctionFactory.connect(seller).createEnglishAuction(
      0, // ERC20
      erc20Token.target,
      0,
      TOKEN_AMOUNT,
      erc20Token.target,
      DURATION,
      STARTING_PRICE
    );
    const receipt = await tx.wait();
    const auctionAddress = receipt.logs[1].args.auctionAddress;
    EnglishAuction = await ethers.getContractFactory("EnglishAuction");
    englishAuction = EnglishAuction.attach(auctionAddress);
  });

  it("should allow bidding and finalize with ERC20", async function () {
    // Bidder1 делает ставку
    await erc20Token.connect(bidder1).approve(englishAuction.target, ethers.parseEther("1.5"));
    await expect(englishAuction.connect(bidder1).placeBid(ethers.parseEther("1.5")))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder1.address, ethers.parseEther("1.5"));

    // Bidder2 делает более высокую ставку
    await erc20Token.connect(bidder2).approve(englishAuction.target, ethers.parseEther("2"));
    await expect(englishAuction.connect(bidder2).placeBid(ethers.parseEther("2")))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder2.address, ethers.parseEther("2"));

    // Проверяем баланс bidder1 (возврат предыдущей ставки)
    expect(await erc20Token.balanceOf(bidder1.address)).to.equal(ethers.parseEther("10")); // Исправлено с 9.5 на 10

    // Увеличиваем время
    await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
    await ethers.provider.send("evm_mine", []);

    // Завершаем аукцион
    await englishAuction.connect(seller).endAuction();

    // Проверяем балансы
    expect(await erc20Token.balanceOf(seller.address)).to.equal(ethers.parseEther("2")); // 120 - 10 - 10 + 2
    expect(await erc20Token.balanceOf(bidder2.address)).to.equal(ethers.parseEther("108")); // 10 + 100 - 2
  });
});

describe("EnglishAuction Functionality", function () {
  beforeEach(async function () {
    await erc721Token.connect(seller).approve(auctionFactory.target, NFT_ID);

    const tx = await auctionFactory.connect(seller).createEnglishAuction(
      1, // ERC721
      erc721Token.target,
      NFT_ID,
      0,
      ZERO_ADDRESS,
      DURATION,
      STARTING_PRICE
    );
    const receipt = await tx.wait();
    const auctionAddress = receipt.logs[1].args.auctionAddress;
    EnglishAuction = await ethers.getContractFactory("EnglishAuction");
    englishAuction = EnglishAuction.attach(auctionAddress);
  });

  it("should allow placing bids and finalize English Auction", async function () {
    // Bidder1 делает ставку
    await expect(englishAuction.connect(bidder1).placeBid(ethers.parseEther("1.5"), { value: ethers.parseEther("1.5") }))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder1.address, ethers.parseEther("1.5"));

    // Bidder2 делает более высокую ставку
    await expect(englishAuction.connect(bidder2).placeBid(ethers.parseEther("2"), { value: ethers.parseEther("2") }))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder2.address, ethers.parseEther("2"));

    // Увеличиваем время
    await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
    await ethers.provider.send("evm_mine", []);

    // Завершаем аукцион
    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    await englishAuction.connect(seller).endAuction();

    // Проверяем балансы
    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerBalanceAfter).to.be.above(sellerBalanceBefore);
    expect(await erc721Token.ownerOf(NFT_ID)).to.equal(bidder2.address);
  });
});
  // Тест 2: ERC721 как актив и ETH как оплата
 // Тест 2: ERC721 как актив и ETH как оплата
describe("ERC721 as Asset and ETH as Payment", function () {
  beforeEach(async function () {
    await erc721Token.connect(seller).approve(auctionFactory.target, NFT_ID);

    const tx = await auctionFactory.connect(seller).createEnglishAuction(
      1, // ERC721
      erc721Token.target,
      NFT_ID,
      0,
      ZERO_ADDRESS,
      DURATION,
      STARTING_PRICE
    );
    const receipt = await tx.wait();
    const auctionAddress = receipt.logs[1].args.auctionAddress;
    EnglishAuction = await ethers.getContractFactory("EnglishAuction");
    englishAuction = EnglishAuction.attach(auctionAddress);
  });

  it("should allow bidding and finalize with ETH", async function () {
    // Bidder1 делает ставку
    await expect(englishAuction.connect(bidder1).placeBid(ethers.parseEther("1.5"), { value: ethers.parseEther("1.5") }))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder1.address, ethers.parseEther("1.5"));

    // Bidder2 делает более высокую ставку
    await expect(englishAuction.connect(bidder2).placeBid(ethers.parseEther("2"), { value: ethers.parseEther("2") }))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder2.address, ethers.parseEther("2"));

    // Увеличиваем время
    await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
    await ethers.provider.send("evm_mine", []);

    // Завершаем аукцион
    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    await englishAuction.connect(seller).endAuction();

    // Проверяем балансы
    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerBalanceAfter).to.be.above(sellerBalanceBefore);
    expect(await erc721Token.ownerOf(NFT_ID)).to.equal(bidder2.address);
  });
});
// Тест 3: ERC20 как актив и ETH как оплата
describe("ERC20 as Asset and Payment", function () {
  beforeEach(async function () {
    await erc20Token.connect(seller).transfer(bidder1.address, ethers.parseEther("10"));
    await erc20Token.connect(seller).transfer(bidder2.address, ethers.parseEther("10"));

    await erc20Token.connect(seller).approve(auctionFactory.target, TOKEN_AMOUNT);

    const tx = await auctionFactory.connect(seller).createEnglishAuction(
      0,
      erc20Token.target,
      0,
      TOKEN_AMOUNT,
      erc20Token.target,
      DURATION,
      STARTING_PRICE
    );
    const receipt = await tx.wait();
    const auctionAddress = receipt.logs[1].args.auctionAddress;
    EnglishAuction = await ethers.getContractFactory("EnglishAuction");
    englishAuction = EnglishAuction.attach(auctionAddress);
  });

  it("should allow bidding and finalize with ERC20", async function () {
    // Bidder1 делает ставку
    await erc20Token.connect(bidder1).approve(englishAuction.target, ethers.parseEther("1.5"));
    await expect(englishAuction.connect(bidder1).placeBid(ethers.parseEther("1.5")))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder1.address, ethers.parseEther("1.5"));

    // Bidder2 делает более высокую ставку
    await erc20Token.connect(bidder2).approve(englishAuction.target, ethers.parseEther("2"));
    await expect(englishAuction.connect(bidder2).placeBid(ethers.parseEther("2")))
      .to.emit(englishAuction, "BidPlaced")
      .withArgs(bidder2.address, ethers.parseEther("2"));

    // Проверяем баланс bidder1 (возврат предыдущей ставки)
    expect(await erc20Token.balanceOf(bidder1.address)).to.equal(ethers.parseEther("10")); // Исправлено с 9.5 на 10

    // Увеличиваем время
    await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
    await ethers.provider.send("evm_mine", []);

    // Завершаем аукцион
    await englishAuction.connect(seller).endAuction();

    // Проверяем балансы
    expect(await erc20Token.balanceOf(seller.address)).to.equal(ethers.parseEther("2")); // 120 - 10 - 10 + 2
    expect(await erc20Token.balanceOf(bidder2.address)).to.equal(ethers.parseEther("108")); // 10 + 100 - 2
  });
});
});