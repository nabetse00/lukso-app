import { TransactionRequest, ethers } from "ethers";
import { MockToken__factory } from '../../../typechain-types';
import { AuctionFactory__factory } from '../../../typechain-types';
import { Auction__factory } from '../../../typechain-types';
import { AuctionItems__factory } from '../../../typechain-types';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';

import AuctionFactoryContractABI from '../../../artifacts/contracts/Auction_factory.sol/AuctionFactory.json';
import CustomTokenContractABI from '../../../artifacts/contracts/CustomToken.sol/CustomToken.json';
import AuctionContractABI from '../../../artifacts/contracts/Auction.sol/Auction.json';
import bs58 from 'bs58'

import { WalletState } from "@web3-onboard/core";
import { FLAT_FEE_DAI, FLAT_FEE_USDC } from "../types/contracts";

import { Buffer } from 'buffer/';

export async function createAuction(wallet: WalletState,
    bidTokenAddr: string, itemUri: string, startingPrice: number, buyItNow: number, duration: number
): Promise<ethers.ContractTransactionResponse> {
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const auctionFactory = AuctionFactory__factory.connect(import.meta.env.VITE_TESTNET_AF_ADDR, signer)
    // const token = MockToken__factory.connect(bidTokenAddr, signer)

    // await token.approve(import.meta.env.VITE_TESTNET_AF_ADDR, FLAT_FEE_USDC)
    const startingPriceBN = ethers.parseEther(startingPrice.toString())
    const buyItNowBN = ethers.parseEther((buyItNow ? buyItNow : 0).toString())
    const tokenUri = ethers.toUtf8Bytes(itemUri)


    let txn = await auctionFactory.createAuction(
        bidTokenAddr, signer.address, getBytes32FromIpfsHash(itemUri), startingPriceBN, buyItNowBN, duration * 3600
    )
    console.log(txn)
    return txn
}

export async function createAuctionBatch(wallet: WalletState,
    bidTokenAddr: string, itemUri: string, startingPrice: number, buyItNow: number, duration: number
) {
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const itemOwnerAddr = await signer.getAddress()
    const startingPriceBN = ethers.parseEther(startingPrice.toString())
    const buyItNowBN = ethers.parseEther((buyItNow ? buyItNow : 0).toString())
    // const tokenUri = ethers.encodeBytes32String(itemUri)


    const universalProfileAddress = signer.address;
    const universalProfile = new ethers.Contract(
        universalProfileAddress,
        UniversalProfile.abi,
        provider,
    );

    const auctionFactoryAddress = import.meta.env.VITE_TESTNET_AF_ADDR;
    const tokenContract = new ethers.Contract(
        bidTokenAddr,
        CustomTokenContractABI.abi,
        signer,
    );
    const auctionContract = new ethers.Contract(
        auctionFactoryAddress,
        AuctionFactoryContractABI.abi,
        signer,
    );

    const MockTokenAbi = new ethers.Interface(CustomTokenContractABI.abi)
    const AuctionFactoryAbi = new ethers.Interface(AuctionFactoryContractABI.abi)
    const callData = MockTokenAbi.encodeFunctionData("approve", [auctionFactoryAddress, FLAT_FEE_USDC],)
    
    // console.log("cide is " + itemUri)
    const uri32Bytes = getBytes32FromIpfsHash(itemUri)
    const uri32str = "0x" + Buffer.from(uri32Bytes.buffer).toString("hex")
    // console.log("Send sent 32 bytes: " + uri32str)

    const callData2 = AuctionFactoryAbi.encodeFunctionData("createAuction",
        [bidTokenAddr, signer.address, uri32str, startingPriceBN, buyItNowBN, duration * 3600],)

    const unsignedTrx = await universalProfile.executeBatch.populateTransaction(
        [0, 0], [bidTokenAddr, auctionFactoryAddress], [0, 0], [callData, callData2]
    )

    console.log("sending")
    const txn = await signer.sendTransaction(unsignedTrx);

    return txn
}



export async function getAuctions(wallet: WalletState): Promise<string[]> {
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const auctionFactoryAddress = import.meta.env.VITE_TESTNET_AF_ADDR;
    const af = AuctionFactory__factory.connect(auctionFactoryAddress, signer)
    return await af.getAuctions()
}

export async function getAuctionData(wallet: WalletState, auctionAddr: string): Promise<string[]> {
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const auction = Auction__factory.connect(auctionAddr, signer)
    const itemAddr = await auction.auctionItems()
    const AuctionItem = AuctionItems__factory.connect(itemAddr, signer)
    const config = await auction.config()
    const tokenUriData = await AuctionItem.getTokenUri(config.itemTokenId)
    const bid = ethers.formatEther(await auction.highestBindingBid())
    const bidder = await auction.highestBidder()
    const seller = (await auction.config()).owner
    const tokenAddr = await auction.bidToken()
    const increment = ethers.formatEther(await auction.getMinimalIncrementTokens())
    const bider_bid = ethers.formatEther(await auction.fundsByBidder(bidder))

    return [getCidFromDataUri(tokenUriData), bid, bidder, seller, tokenAddr, increment, bider_bid]
}

export async function placeBid(wallet: WalletState, auctionAddr: string, tokenAddr:string, bidAmount:string, biderBid:string){
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const amount = ethers.parseEther(bidAmount) - ethers.parseEther(biderBid)

    const universalProfileAddress = signer.address;
    const universalProfile = new ethers.Contract(
        universalProfileAddress,
        UniversalProfile.abi,
        provider,
    );


    console.log([auctionAddr, amount])
    const MockTokenAbi = new ethers.Interface(CustomTokenContractABI.abi)
    const callData = MockTokenAbi.encodeFunctionData("approve", [auctionAddr, amount],)

    console.log([signer.address, amount])
    const AuctionAbi = new ethers.Interface(AuctionContractABI.abi)
    const callData2 = AuctionAbi.encodeFunctionData("placeBid",
    [signer.address, amount])

    console.log([0, 0], [tokenAddr, auctionAddr], [0, 0], [callData, callData2])
    const unsignedTrx = await universalProfile.executeBatch.populateTransaction(
        [0, 0], [tokenAddr, auctionAddr], [0, 0], [callData, callData2]
    )
    
    //console.log("sending")
    const txn = await signer.sendTransaction(unsignedTrx);

    return txn
}

export async function withdraw(wallet: WalletState, addr: string){
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const auction = Auction__factory.connect(addr, signer)
    await auction.withdraw()
}

export async function withdrawAll(wallet: WalletState, addr: string){
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const auction = Auction__factory.connect(addr, signer)
    await auction.withdrawAll()
}



function getBytes32FromIpfsHash(ipfsListing: string) {
    return bs58.decode(ipfsListing).slice(2)
}


function getIpfsHashFromBytes32(bytes32Hex: string) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex');
    const hashStr = bs58.encode(hashBytes)
    return hashStr
}

function getCidFromDataUri(data: string){
    // remove "0x 6f 35 7c 6a" (0x) [2 chars] + (4 bytes) * [2 chars] 
    const offset = 2 +4*2 
    const removeHash  = "0x" + data.slice(offset)
    const cid = getIpfsHashFromBytes32(removeHash)
    // console.log(`cid is : ${cid}`)
    return cid
}



function LSP2MappingBytes32(nameKey: string, val: string): string {
    // see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping
    const hashKeyName = keccak256(nameKey).slice(0, 2 + 10 * 2) + "0000"
    const mapping = hashKeyName + val.slice(2, 20 * 2 + 2)
    return mapping
  }


  
function keccak256(val: string): string {
    const enc = new TextEncoder()
    return ethers.keccak256(enc.encode(val))
  }
