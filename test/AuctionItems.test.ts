import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { LSP2MappingBytes32, createUP, executeAsUp, keccak256 } from "./helper";

const auctionItemContractName = "AuctionItems"
const customUrdContractName = "CustomUniversalReceiverDelegate"


describe("Auction items setup", function () {

    async function deployWithFixture() {
        await network.provider.send("evm_setIntervalMining", [[3000, 5000]]);
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        // 2 universal Profiles
        const UP1 = await createUP("test UP 1", "", [], [])
        const UP2 = await createUP("test UP 2", "", [], [])

        const auctionItemFactory = await ethers.getContractFactory(auctionItemContractName);
        const auctionItem = await auctionItemFactory.deploy(owner.address);
        await auctionItem.waitForDeployment()
        return { auctionItem, owner, otherAccount, UP1, UP2 };
    }

    describe("Should deploy correctly", function () {
        it("Correct constructor value", async function () {
            const { auctionItem, owner, otherAccount, UP1, UP2 } = await loadFixture(deployWithFixture);
            const UP1Contract = await ethers.getContractAt("UniversalProfile", UP1.address)
            const UP2Contract = await ethers.getContractAt("UniversalProfile", UP2.address)
            
            // check UPs
            expect(await UP1Contract.getAddress()).to.be.equal(UP1.address)
            expect(await UP2Contract.getAddress()).to.be.equal(UP2.address)
            // symbol
            let dataKey = keccak256("LSP4TokenName")
            const name = await auctionItem.getData(dataKey)
            const expectName = "Lukso Auction Items";
            expect(ethers.toUtf8String(name)).to.be.equal(expectName)

            dataKey = keccak256("LSP4TokenSymbol")
            const  symbol = await auctionItem.getData(dataKey)
            const expectSymbol = "LKAI";
            expect(ethers.toUtf8String(symbol)).to.be.equal(expectSymbol)

            dataKey = keccak256("LSP4Metadata")
            const meta = await auctionItem.getData(dataKey)
            const expectMeta = "";
            expect(ethers.toUtf8String(meta)).to.be.equal(expectMeta)
        });
        
    });

    describe("Auction items test functions", function () {
        it("Should be able to use mint function", async function () {
            const { auctionItem, owner, otherAccount, UP1, UP2 } = await loadFixture(deployWithFixture);


            const UP1Contract = await ethers.getContractAt("UniversalProfile", UP1.address)
            const UP2Contract = await ethers.getContractAt("UniversalProfile", UP2.address)

            // check UPs
            expect(await UP1Contract.getAddress()).to.be.equal(UP1.address)
            expect(await UP2Contract.getAddress()).to.be.equal(UP2.address)

            // mint an nft for UP1
            const tokenIdStr1 = "1"
            const tokenId1 = ethers.encodeBytes32String(tokenIdStr1)
            let mintTxn = auctionItem.mint(UP1.address, tokenId1, false, "0x")
            await expect(mintTxn).to.be.not.reverted
            await expect(mintTxn).to.emit(UP1Contract, "UniversalReceiver")
            await (await mintTxn).wait()

            // same tokenId should revert
            mintTxn = auctionItem.mint(UP2.address, tokenId1, false, "0x")
            await expect(mintTxn).to.be.revertedWithCustomError(auctionItem, "LSP8TokenIdAlreadyMinted").withArgs(tokenId1)

            // mint an nft for UP2
            const tokenIdStr2 = "2"
            const tokenId2 = ethers.encodeBytes32String(tokenIdStr2)
            mintTxn = auctionItem.mint(UP2.address, tokenId2, false, "0x")
            await expect(mintTxn).to.be.not.reverted
            await expect(mintTxn).to.emit(UP2Contract, "UniversalReceiver")
            await (await mintTxn).wait()


            // check tokens
            const total = await auctionItem.totalSupply()
            expect(total).to.be.equal(2n)

            // check minted nft
            const nfts = await auctionItem.tokenIdsOf(UP1.address)
            const decodedId = ethers.decodeBytes32String(nfts[0])
            expect(nfts.length).to.be.equal(1)
            expect(nfts[0]).to.be.equal(tokenId1)
            expect(decodedId).to.equal(tokenIdStr1)

            // check all token ids
            const allTokids = await auctionItem.getAllTokenIds()
            expect(allTokids.length).to.be.equal(2)
            expect(allTokids).to.be.deep.equal([tokenId1, tokenId2])
        });

        it("Should be able to use create auction function", async function () {
            const { auctionItem, owner, otherAccount, UP1, UP2 } = await loadFixture(deployWithFixture);
            const UP1Contract = await ethers.getContractAt("UniversalProfile", UP1.address)
            const UP2Contract = await ethers.getContractAt("UniversalProfile", UP2.address)

            // check UPs
            expect(await UP1Contract.getAddress()).to.be.equal(UP1.address)
            expect(await UP2Contract.getAddress()).to.be.equal(UP2.address)

            let createTxn = auctionItem.createAuctionItem(UP1.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP1Contract, "UniversalReceiver")
            await (await createTxn).wait()

            createTxn = auctionItem.createAuctionItem(UP2.address, "0x1234")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP2Contract, "UniversalReceiver")
            await (await createTxn).wait()

            // check all token ids
            const allTokids = await auctionItem.getAllTokenIds()

            const expectedTokenId1 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 0, "0x"])
            const expectedTokenId2 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 1, "0x1234"])
            expect(allTokids.length).to.be.equal(2)
            expect(allTokids).to.be.deep.equal([expectedTokenId1, expectedTokenId2])

        });

        it("Should be able to use burn function", async function () {
            const { auctionItem, owner, otherAccount, UP1, UP2 } = await loadFixture(deployWithFixture);
            const UP1Contract = await ethers.getContractAt("UniversalProfile", UP1.address)
            const UP2Contract = await ethers.getContractAt("UniversalProfile", UP2.address)
            const auctionContracAddr = await auctionItem.getAddress()

            // check UPs
            expect(await UP1Contract.getAddress()).to.be.equal(UP1.address)
            expect(await UP2Contract.getAddress()).to.be.equal(UP2.address)

            const expectedTokenId1 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 0, "0x"])
            const expectedTokenId2 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 1, "0x"])
            const expectedTokenId3 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 2, "0x"])

            let createTxn = auctionItem.createAuctionItem(UP1.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP1Contract, "UniversalReceiver")
            await (await createTxn).wait()

            createTxn = auctionItem.createAuctionItem(UP2.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP2Contract, "UniversalReceiver")
            await (await createTxn).wait()

            // burn a token
            let burnTxn = auctionItem.burn(expectedTokenId2, "0x")
            await expect(burnTxn).to.be.revertedWithCustomError(auctionItem, "LSP8NotTokenOperator")
            // await (await burnTxn).wait()

            burnTxn = executeAsUp(UP2, "AuctionItems", auctionContracAddr, "burn", [expectedTokenId2, "0x"])
            await expect(burnTxn).to.be.not.reverted
            await (await burnTxn).wait()

            createTxn = auctionItem.createAuctionItem(UP2.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP2Contract, "UniversalReceiver")
            await (await createTxn).wait()

            // check all token ids
            const createdItems = await auctionItem.auctionItemCreatedCount()
            expect(createdItems).to.be.equal(3)
            const allTokids = await auctionItem.getAllTokenIds()
            expect(allTokids.length).to.be.equal(2)
            expect(allTokids).to.be.deep.equal([expectedTokenId1, expectedTokenId3])

        });

        it("Should be able to use URI", async function () {
            const { auctionItem, owner, otherAccount, UP1, UP2 } = await loadFixture(deployWithFixture);
            const UP1Contract = await ethers.getContractAt("UniversalProfile", UP1.address)
            const UP2Contract = await ethers.getContractAt("UniversalProfile", UP2.address)
            const auctionContracAddr = await auctionItem.getAddress()

            // add token meta data base uri
            const baseUri = "ipfs://"

            const LSP8TokenMetadataBaseURI = keccak256("LSP8TokenMetadataBaseURI")
            // const hash = "0x6f357c6a"
            const hash = keccak256('keccak256(utf8)').slice(0, 2 + 4 * 2) // 0x(2 char) + 4 bytes (2 chars per byte)
            // or const hash = "0x00000000"
            // const baseUri = 'ipfs://your-base-uri-on-ipf-goes-here/'
            // const baseUriBytes = ethers.toUtf8Bytes(baseUri)
            // await auctionItem.setData(
            //     LSP8TokenMetadataBaseURI,
            //     ethers.concat(
            //         // `0x6f357c6a` represents the hash function identifier,
            //         // the first 4 bytes of keccak256('keccak256(utf8)')
            //         // to be used to ensure that the metadata of the NFT is set in stone and cannot be changed 
            //         // (for verifiability purpose)
            //         [hash, baseUriBytes]
            //     ))

            // check UPs
            expect(await UP1Contract.getAddress()).to.be.equal(UP1.address)
            expect(await UP2Contract.getAddress()).to.be.equal(UP2.address)

            const expectedTokenId1 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 0, "0x"])
            const expectedTokenId2 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 1, "0x"])
            const expectedTokenId3 = ethers.solidityPackedKeccak256(["string", "uint", "bytes"], ["auction", 2, "0x"])

            let createTxn = auctionItem.createAuctionItem(UP1.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP1Contract, "UniversalReceiver")
            await (await createTxn).wait()

            createTxn = auctionItem.createAuctionItem(UP2.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP2Contract, "UniversalReceiver")
            await (await createTxn).wait()

            createTxn = auctionItem.createAuctionItem(UP2.address, "0x")
            await expect(createTxn).to.be.not.reverted
            await expect(createTxn).to.emit(UP2Contract, "UniversalReceiver")
            await (await createTxn).wait()

            // check all token ids
            const createdItems = await auctionItem.auctionItemCreatedCount()
            expect(createdItems).to.be.equal(3)
            const allTokids = await auctionItem.getAllTokenIds()
            expect(allTokids.length).to.be.equal(3)
            expect(allTokids).to.be.deep.equal([expectedTokenId1, expectedTokenId2, expectedTokenId3])

            // get a nft uri
            const metaUriHexStr = await auctionItem.getData(LSP8TokenMetadataBaseURI)
            const metaUriStr = ethers.toUtf8String(metaUriHexStr)
            const hashStr = ethers.toUtf8String(hash)
            expect(metaUriStr).to.be.equal(hashStr + baseUri)

            // base uri can't change:

            const baseUri2 = 'ipfs://new-your-base-uri-on-ipf-goes-here/'
            const baseUriBytes2 = ethers.toUtf8Bytes(baseUri2)

            const changeTxn = auctionItem.setData(
                LSP8TokenMetadataBaseURI,
                ethers.concat([hash, baseUriBytes2]))
            // await (await changeTxn).wait()
            await expect(changeTxn).to.be.revertedWithCustomError(auctionItem, 'LSP8_METADATA_TOKEN_BASE_URI_CANNOT_CHANGE')

            const metaUriHexStr2 = await auctionItem.getData(LSP8TokenMetadataBaseURI)
            const metaUriStr2 = ethers.toUtf8String(metaUriHexStr2)
            expect(metaUriStr2).to.be.equal(hashStr + baseUri)

            const mapping = LSP2MappingBytes32("LSP8MetadataTokenURI", expectedTokenId1)
            const tokenURI = "<token hash uri>"
            await auctionItem.setData(mapping, ethers.toUtf8Bytes(tokenURI))

            const metaUriToken1 = await auctionItem.getData(mapping)
            const metaUriToken1Str = ethers.toUtf8String(metaUriToken1)

            expect(metaUriToken1Str).to.be.equal(tokenURI)

            // token uri can't change:
            const invalidTxn = auctionItem.setData(mapping, ethers.toUtf8Bytes(tokenURI))
            expect(invalidTxn).to.be.revertedWithCustomError(auctionItem, 'LSP8_METADATA_TOKEN_URI_CANNOT_CHANGE')

            // test getTokenUri
            const uri = await auctionItem.getTokenUri(expectedTokenId1)
            const uriStr = ethers.toUtf8String(uri)
            expect(uriStr).to.be.equal(tokenURI)
        });


    });
});