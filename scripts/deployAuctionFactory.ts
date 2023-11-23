import dotenv from 'dotenv';
import { ethers } from "hardhat"
import { Wallet } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { appendFileSync } from 'fs';
import { CustomToken, UniversalProfile } from '../typechain-types';
import { createUP } from '../test/helper';

// load env vars
if (process.env.mode != "prod") {
    console.log("loading localnet dev envs")
    dotenv.config({ path: "./.env.dev" });
} else {
    console.log("loading testnet envs")
    dotenv.config();
}

async function main() {
    let EOA_PRIVATE_KEY = ""
    let signer: Wallet | HardhatEthersSigner
    let usdcFake: CustomToken
    let daiFake: CustomToken
    let UP: UniversalProfile
    if (process.env.mode != "prod") {
        EOA_PRIVATE_KEY = process.env.LOCALNET_EOA_PRIVATE_KEY as string
        const customTokenFactory = await ethers.getContractFactory("CustomToken")
        const initialSupply = ethers.parseEther("100000000")
        // on localnet we have to redeploy ...
        usdcFake = await customTokenFactory.deploy("Fake USDC Token", "fUSDC", initialSupply)
        await usdcFake.waitForDeployment()
        daiFake = await customTokenFactory.deploy("Fake DAI Token", "fDAI", initialSupply)
        await daiFake.waitForDeployment()

        const UPData = await createUP("test UP 1", "", [], [])
        UP = await ethers.getContractAt("UniversalProfile", UPData.address)
    
        // console.log(process.env.LOCALNET_RPC_URL)
        const provider = new ethers.JsonRpcProvider(
            process.env.LOCALNET_RPC_URL,
        );

        [signer] = await ethers.getSigners()

    } else {
        EOA_PRIVATE_KEY = process.env.TESTNET_EOA_PRIVATE_KEY as string
        const USDC_ADDR = process.env.TESTNET_FAKE_USDC_ADDR as string
        const DAI_ADDR = process.env.TESTNET_FAKE_DAI_ADDR as string
        const UP_ADDR = process.env.TESTNET_UP_ADDR as string 
        usdcFake = await ethers.getContractAt("CustomToken", USDC_ADDR)
        daiFake = await ethers.getContractAt("CustomToken", DAI_ADDR)
        UP = await ethers.getContractAt("UniversalProfile", UP_ADDR)
        const provider = new ethers.JsonRpcProvider(
            process.env.TESTNET_RPC_URL,
        );
        signer = new ethers.Wallet(EOA_PRIVATE_KEY, provider);
    }
    console.log('🔑 EOA: ', signer.address);
    const usdcAddr = await usdcFake.getAddress()
    const daiAddr = await daiFake.getAddress()
    console.log(`🆙 fake usdc token deployed at: ${usdcAddr}`);
    console.log(`🆙 fake dai token deployed at: ${daiAddr}`);
    
    // Auction factory contract
    const auctionFactory_Factory = await ethers.getContractFactory("AuctionFactory")
    const UpAddr = await UP.getAddress()
    console.log(`🆙 Universal Profile: ${UpAddr}`);
    const auctionFactory = await auctionFactory_Factory.connect(signer).deploy(usdcAddr, daiAddr, UpAddr);
    await auctionFactory.waitForDeployment()
    const filePath = './contracts.txt'
    const prefix = process.env.mode != "prod"? "LOCALNET": "TESTNET"
    const auctionFactoryAddr = await auctionFactory.getAddress()
    console.log(`🆙${prefix}_AUCTION_FACTORY_ADDR="${auctionFactoryAddr}"`);
    appendFileSync(filePath, `${prefix}_AUCTION_FACTORY_ADDR="${auctionFactoryAddr}"\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })