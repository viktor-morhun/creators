const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnglishAuction Functionality", function () {
  let AuctionFactory, auctionFactory;
  let EnglishAuction, englishAuction;
  let TestERC20, erc20Token;
  let MyNFT, erc721Token;
  let owner, seller, bidder1, bidder2;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Деплой тестового ERC20 токена
    TestERC20 = await ethers.getContractFactory("TestERC20");
    erc20Token = await TestERC20.deploy("TestERC20", "TST", 1000000, owner.address);
    await erc20Token.waitForDeployment();

    // Деплой тестового ERC721 токена (MyNFT)
    MyNFT = await ethers.getContractFactory("MyNFT");
    erc721Token = await MyNFT.deploy(owner.address);
    await erc721Token.waitForDeployment();

    // Деплой AuctionFactory
    AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    auctionFactory = await AuctionFactory.deploy(owner.address);
    await auctionFactory.waitForDeployment();

    // Mint и апрув для тестов
    await erc20Token.transfer(seller.address, 10000);
    await erc20Token.connect(seller).approve(await auctionFactory.getAddress(), 10000);
    await erc721Token.connect(owner).mintNFT(seller.address, "https://test.uri/");
    await erc721Token.connect(seller).approve(await auctionFactory.getAddress(), 1);

    // Создание English Auction
    const tx = await auctionFactory.connect(seller).createEnglishAuction(
      1, // AssetType.ERC721
      await erc721Token.getAddress(),
      1, // tokenId
      1, // amount
      ethers.ZeroAddress, // ETH как paymentToken
      3600, // длительность 1 час
      ethers.parseEther("1") // начальная цена 1 ETH
    );
    await tx.wait();
    const auctionAddress = await auctionFactory.auctions(1);
    EnglishAuction = await ethers.getContractFactory("EnglishAuction");
    englishAuction = EnglishAuction.attach(auctionAddress);
  });

  it("should allow placing bids and finalize English Auction", async function () {
    // Bidder1 делает ставку 2 ETH
    await englishAuction.connect(bidder1).placeBid({ value: ethers.parseEther("2") });
    let details = await englishAuction.getAuctionDetails();
    expect(details[1]).to.equal(bidder1.address); // highestBidder
    expect(details[2]).to.equal(ethers.parseEther("2")); // highestBid

    // Bidder2 делает ставку 3 ETH, Bidder1 получает возврат
    const bidder1BalanceBefore = await ethers.provider.getBalance(bidder1.address);
    await englishAuction.connect(bidder2).placeBid({ value: ethers.parseEther("3") });
    details = await englishAuction.getAuctionDetails();
    expect(details[1]).to.equal(bidder2.address); // highestBidder
    expect(details[2]).to.equal(ethers.parseEther("3")); // highestBid
    const bidder1BalanceAfter = await ethers.provider.getBalance(bidder1.address);
    expect(bidder1BalanceAfter).to.be.above(bidder1BalanceBefore); // Проверка возврата ETH

    // Завершаем аукцион после истечения времени
    await ethers.provider.send("evm_increaseTime", [3601]); // Пропускаем время
    await ethers.provider.send("evm_mine", []); // Майним блок
    await englishAuction.connect(seller).endAuction();

    // Проверяем финализацию
    details = await englishAuction.getAuctionDetails();
    expect(details[4]).to.be.true; // ended
    expect(await erc721Token.ownerOf(1)).to.equal(bidder2.address); // NFT передан победителю
    const sellerBalance = await ethers.provider.getBalance(seller.address);
    expect(sellerBalance).to.be.above(ethers.parseEther("3")); // Продавец получил ETH
  });
});