import dotenv from 'dotenv';
import { ethers } from "hardhat"
import { Wallet } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { appendFileSync} from 'fs';

// load env vars
if (process.env.mode != "prod"){
    console.log("loading dev envs")
    dotenv.config({path:"./.env.dev"});
}else{
    console.log("production")
}

async function main(){
    let EOA_PRIVATE_KEY = ""
    let signer: Wallet | HardhatEthersSigner
    if(process.env.mode != "prod"){
        EOA_PRIVATE_KEY = process.env.LOCALNET_EOA_PRIVATE_KEY as string
        // console.log(process.env.LOCALNET_RPC_URL)
        const provider = new ethers.JsonRpcProvider(
            process.env.LOCALNET_RPC_URL,
        );

        [ signer ] =  await ethers.getSigners()

    }else{
        EOA_PRIVATE_KEY =  process.env.TESTNET_EOA_PRIVATE_KEY as string
        const provider = new ethers.JsonRpcProvider(
            process.env.TESTNET_RPC_URL,
        );
        signer = new ethers.Wallet(EOA_PRIVATE_KEY, provider);
    }
    console.log('🔑 EOA: ', EOA_PRIVATE_KEY);
    // signer = new ethers.Wallet(EOA_PRIVATE_KEY, provider);
    const customTokenFactory = await ethers.getContractFactory("CustomToken")
    const initialSupply = ethers.parseEther("100000000")
    // two example tokens 
    const usdcFake = await customTokenFactory.connect(signer).deploy("Fake USDC Token", "fUSDC", initialSupply)
    await usdcFake.waitForDeployment()
    const daiFake = await customTokenFactory.connect(signer).deploy("Fake DAI Token", "fDAI", initialSupply)
    await daiFake.waitForDeployment()

    console.log(`🆙 fake usdc token deployed at: ${await usdcFake.getAddress()}`);
    console.log(`🆙 fake dai token deployed at: ${await daiFake.getAddress()}`);
    
    const filePath = './contracts.txt'
    appendFileSync(filePath, `FAKE_USDC_ADDR="${await usdcFake.getAddress()}"\n`, );
    appendFileSync(filePath, `FAKE_DAI_ADDR="${await daiFake.getAddress()}"\n`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });