import { expect } from "chai";
import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { network, ethers } from "hardhat";
import { createUP, executeAsUp, executeBatchAsUp, keccak256 } from "./helper";

enum AuctionStatus {
    INIT,
    ON_GOING,
    ENDED,
    CANCELED,
    DELETABLE,
    UNEXPECTED
}

const FLAT_FEE_USDC = ethers.parseUnits("0.5", 18);
const FLAT_FEE_DAI = ethers.parseUnits("0.5", 18);

describe("Auction Contract Tests", function () {

    async function deployWithFixture() {
        await network.provider.send("evm_setIntervalMining", [[3000, 5000]]);
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        // 2 universal Profiles
        const UP1 = await createUP("test UP 1", "", [], [])
        const UP2 = await createUP("test UP 2", "", [], [])

        // const auctionItemFactory = await ethers.getContractFactory("AuctionItems");
        // const auctionItems = await auctionItemFactory.deploy(owner.address);
        // await auctionItems.waitForDeployment()

        const CustomTokenFactory = await ethers.getContractFactory("CustomToken");
        const initialSupply = ethers.parseEther("2000000")
        const usdc = await CustomTokenFactory.deploy("Mock USDC Token", "USDC", initialSupply);
        const usdcAddr = await usdc.getAddress()
        const dai = await CustomTokenFactory.deploy("Mock DAI Token", "DAI", initialSupply);
        const daiAddr = await dai.getAddress()


        // Auction factory contract
        const auctionFactory_Factory = await ethers.getContractFactory("AuctionFactory")
        const auctionFactory = await auctionFactory_Factory.deploy(usdcAddr, daiAddr, owner.address);
        await auctionFactory.waitForDeployment()

        // send some tokens to other account
        const amount = ethers.parseEther("1000")
        let tokTxn = await usdc["transfer(address,uint256)"](otherAccount.address, amount)
        await tokTxn.wait()


        // send some tokens to UPs
        tokTxn = await usdc.transferBatch([owner.address, owner.address], [UP1.address, UP2.address], [amount, amount], [false, false], ["0x", "0x"])
        await tokTxn.wait()
        tokTxn = await dai.transferBatch([owner.address, owner.address], [UP1.address, UP2.address], [amount, amount], [false, false], ["0x", "0x"])
        await tokTxn.wait()

        return { auctionFactory, owner, otherAccount, usdc, dai, UP1, UP2 };
    }

    it("Create an auction with EOA", async function () {
        const { auctionFactory, owner, otherAccount, UP1, UP2, usdc } = await loadFixture(deployWithFixture);
        // approve factory to get fee
        const auctionFactoryAddr = await auctionFactory.getAddress()
        const apprTxnawait = await usdc.approve(auctionFactoryAddr, FLAT_FEE_USDC)
        await apprTxnawait.wait()

        const tokenUri = "itemUri"

        let creacteTxn = await auctionFactory.createAuction(
            await usdc.getAddress(),
            otherAccount.address,
            ethers.toUtf8Bytes(tokenUri),
            ethers.parseEther("1"),
            ethers.parseEther("10"),
            36000 * 2 // 2 hours
        )
        await creacteTxn.wait()

        const auctionAddrs = await auctionFactory.getAuctions()
        // console.log(auctionAddrs)
        expect(auctionAddrs.length).to.be.equal(1)

        // check auction contract

        const auction = await ethers.getContractAt("Auction", auctionAddrs[0])

        const auctionItemAddr = await auction.auctionItems()

        expect(auctionItemAddr).to.not.be.equal("")

        const auctionItem = await ethers.getContractAt("AuctionItems", auctionItemAddr)

        // check item
        const itemIds = await auctionItem.getAllTokenIds()
        //console.log(itemIds)
        const itemId = itemIds[0]

        expect(itemIds.length).to.be.equal(1)
        expect(await auctionItem.tokenOwnerOf(itemId)).to.be.equal(auctionAddrs[0])

        // get a nft base uri
        const LSP8TokenMetadataBaseURI = keccak256("LSP8TokenMetadataBaseURI")
        const hash = keccak256('keccak256(utf8)').slice(0, 2 + 4 * 2)
        const baseUri = 'ipfs://'
        const metaUriHexStr = await auctionItem.getData(LSP8TokenMetadataBaseURI)
        const metaUriStr = ethers.toUtf8String(metaUriHexStr)
        const hashStr = ethers.toUtf8String(hash)
        expect(metaUriStr).to.be.equal(hashStr + baseUri)
        // get complete uri
        const tokenUriFromAuction = await auctionItem.getTokenUri(itemId)
        expect(tokenUriFromAuction).to.be.equal(hashStr + tokenUri)

    });

    it("Create an auction with Universal Profile", async function () {
        const { auctionFactory, owner, otherAccount, UP1, UP2, usdc } = await loadFixture(deployWithFixture);
        const auctionFactoryAddr = await auctionFactory.getAddress()
        const tokenUri = "itemUri"
        const usdcAddr = await usdc.getAddress()


        // approve factory to get fee
        // and create auction as UP
        const creacteTxn = await executeBatchAsUp(UP1,
            ["CustomToken", "AuctionFactory",],
            [usdcAddr, auctionFactoryAddr],
            ["approve", "createAuction"],
            [[auctionFactoryAddr, FLAT_FEE_USDC],
            [usdcAddr,
                otherAccount.address,
                ethers.toUtf8Bytes(tokenUri),
                ethers.parseEther("1"),
                ethers.parseEther("10"),
                36000 * 2],]
        )


        await creacteTxn.wait()

        const auctionAddrs = await auctionFactory.getAuctions()
        // console.log(auctionAddrs)
        expect(auctionAddrs.length).to.be.equal(1)

        // check auction contract

        const auction = await ethers.getContractAt("Auction", auctionAddrs[0])

        const auctionItemAddr = await auction.auctionItems()

        expect(auctionItemAddr).to.not.be.equal("")

        const auctionItem = await ethers.getContractAt("AuctionItems", auctionItemAddr)

        // check item
        const itemIds = await auctionItem.getAllTokenIds()
        //console.log(itemIds)
        const itemId = itemIds[0]

        expect(itemIds.length).to.be.equal(1)
        expect(await auctionItem.tokenOwnerOf(itemId)).to.be.equal(auctionAddrs[0])

        // get a nft base uri
        const LSP8TokenMetadataBaseURI = keccak256("LSP8TokenMetadataBaseURI")
        const hash = keccak256('keccak256(utf8)').slice(0, 2 + 4 * 2)
        const baseUri = 'ipfs://'
        const metaUriHexStr = await auctionItem.getData(LSP8TokenMetadataBaseURI)
        const metaUriStr = ethers.toUtf8String(metaUriHexStr)
        const hashStr = ethers.toUtf8String(hash)
        expect(metaUriStr).to.be.equal(hashStr + baseUri)
        // get complete uri
        const tokenUriFromAuction = await auctionItem.getTokenUri(itemId)
        expect(tokenUriFromAuction).to.be.equal(hashStr + tokenUri)

    });

    it("Place bid tests as EOA and UP", async function () {
        const { auctionFactory, owner, otherAccount, UP1, UP2, usdc } = await loadFixture(deployWithFixture);
        const auctionFactoryAddr = await auctionFactory.getAddress()
        const tokenUri = "itemUri"
        const usdcAddr = await usdc.getAddress()

        const startPrice = ethers.parseEther("1")
        const buyItNow = ethers.parseEther("10")
        const duration = 36000 * 2


        // approve factory to get fee
        // and create auction as UP
        const creacteTxn = await executeBatchAsUp(UP1,
            ["CustomToken", "AuctionFactory",],
            [usdcAddr, auctionFactoryAddr],
            ["approve", "createAuction"],
            [[auctionFactoryAddr, FLAT_FEE_USDC],
            [usdcAddr,
                UP1.address,
                ethers.toUtf8Bytes(tokenUri),
                startPrice,
                buyItNow,
                duration
            ],]
        )


        await creacteTxn.wait()

        const auctionAddrs = await auctionFactory.getAuctions()
        // console.log(auctionAddrs)
        expect(auctionAddrs.length).to.be.equal(1)
        const auctionAddr = auctionAddrs[0]

        // check auction contract
        const auction = await ethers.getContractAt("Auction", auctionAddr)

        const auctionItemAddr = await auction.auctionItems()

        expect(auctionItemAddr).to.not.be.equal("")

        const auctionItem = await ethers.getContractAt("AuctionItems", auctionItemAddr)

        // check item
        const itemIds = await auctionItem.getAllTokenIds()
        //console.log(itemIds)
        const itemId = itemIds[0]

        expect(itemIds.length).to.be.equal(1)
        expect(await auctionItem.tokenOwnerOf(itemId)).to.be.equal(auctionAddrs[0])

        // get a nft base uri
        const LSP8TokenMetadataBaseURI = keccak256("LSP8TokenMetadataBaseURI")
        const hash = keccak256('keccak256(utf8)').slice(0, 2 + 4 * 2)
        const baseUri = 'ipfs://'
        const metaUriHexStr = await auctionItem.getData(LSP8TokenMetadataBaseURI)
        const metaUriStr = ethers.toUtf8String(metaUriHexStr)
        const hashStr = ethers.toUtf8String(hash)
        expect(metaUriStr).to.be.equal(hashStr + baseUri)
        // get complete uri
        const tokenUriFromAuction = await auctionItem.getTokenUri(itemId)
        expect(tokenUriFromAuction).to.be.equal(hashStr + tokenUri)

        // Place bid as EAO
        let balEOA = await usdc.balanceOf(otherAccount.address)

        // revert bid bellow startprice
        let bid = startPrice / 10n
        await usdc.connect(otherAccount).approve(auctionAddr, bid)
        let bidTxn = auction.connect(otherAccount).placeBid(otherAccount.address, bid)
        await expect(bidTxn).to.be.reverted

        bid = startPrice
        await usdc.connect(otherAccount).approve(auctionAddr, bid)
        bidTxn = auction.connect(otherAccount).placeBid(otherAccount.address, bid)
        await expect(bidTxn).to.be.not.reverted
        await (await bidTxn).wait()

        // check 
        let hbidder = await auction.highestBidder()
        expect(hbidder).to.be.equal(otherAccount.address)
        let hbid = await auction.getHighestBid()
        expect(hbid).to.be.equal(startPrice)

        bid = startPrice * 2n
        await usdc.connect(otherAccount).approve(auctionAddr, bid)
        bidTxn = auction.connect(otherAccount).placeBid(otherAccount.address, bid)
        await expect(bidTxn).to.be.not.reverted
        await (await bidTxn).wait()

        // check 
        hbidder = await auction.highestBidder()
        expect(hbidder).to.be.equal(otherAccount.address)
        hbid = await auction.getHighestBid()
        expect(hbid).to.be.equal(bid + startPrice)
        expect(await auction.highestBindingBid()).to.be.equal(startPrice)

        // up bid too low
        let balUp2 = await usdc.balanceOf(UP2.address)
        bid = startPrice*2n
        let bidUpTxn = executeBatchAsUp(UP2,
            ["CustomToken", "Auction",],
            [usdcAddr, auctionAddr],
            ["approve", "placeBid"],
            [[auctionAddr, bid], [UP2.address, bid],]
        )
        await (await bidUpTxn).wait()
        const increment = ethers.parseEther("0.25")
        hbidder = await auction.highestBidder()
        expect(hbidder).to.be.equal(otherAccount.address)
        hbid = await auction.getHighestBid()
        expect(hbid).to.be.equal(startPrice *3n)
        expect(await auction.highestBindingBid()).to.be.equal(startPrice*2n + increment )
        // check up2 bal
        balUp2 -= (await usdc.balanceOf(UP2.address))
        expect(balUp2).to.be.equal(bid)

        // test buy it now price

        let tokensIds = await auctionItem.tokenIdsOf(UP2.address)
        expect(tokensIds.length).to.be.equal(0)

        bid = buyItNow
        bidUpTxn = executeBatchAsUp(UP2,
            ["CustomToken", "Auction",],
            [usdcAddr, auctionAddr],
            ["approve", "placeBid"],
            [[auctionAddr, bid], [UP2.address, bid],]
        )
        await expect(bidUpTxn).to.emit(auction, "BuytItNowEvent").withArgs(UP2.address)
        const UP2Contract = await ethers.getContractAt("UniversalProfile", UP2.address)


        await expect(bidUpTxn).to.emit(UP2Contract, "UniversalReceiver")
        await (await bidUpTxn).wait()


        // check refounds
        balEOA -= (await usdc.balanceOf(otherAccount.address))
        expect(balEOA).to.be.equal(0)

        // check nft transfet
        tokensIds = await auctionItem.tokenIdsOf(UP2.address)
        expect(tokensIds.length).to.be.equal(1)

        // can t bid on this auction
        bid = startPrice * 4n
        bidUpTxn = executeBatchAsUp(UP2,
            ["CustomToken", "Auction",],
            [usdcAddr, auctionAddr],
            ["approve", "placeBid"],
            [[auctionAddr, bid], [UP2.address, bid],]
        )

        await expect(bidUpTxn).to.be.reverted









    });

    it("place a bid for auction in usdc via paymaster", async function () {
        //await executePlaceBidTransaction(my_auctions[0], otherUserWallet, richTokenWallet, usdc, usdcUsd);
    });


});