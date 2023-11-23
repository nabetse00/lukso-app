import dotenv from 'dotenv';
import { ethers } from "hardhat"
import { Wallet } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { appendFileSync} from 'fs';

// load env vars
if (process.env.mode != "testnet") {
    console.log("loading localnet dev envs")
    dotenv.config({ path: "./.env.dev" });
} else {
    console.log("loading testnet envs")
    dotenv.config();
}

async function main(){
    let EOA_PRIVATE_KEY = ""
    let signer: Wallet | HardhatEthersSigner
    if(process.env.mode != "testnet"){
        EOA_PRIVATE_KEY = process.env.LOCALNET_EOA_PRIVATE_KEY as string
        [ signer ] =  await ethers.getSigners()

    }else{
        EOA_PRIVATE_KEY =  process.env.TESTNET_EOA_PRIVATE_KEY as string
        const provider = new ethers.JsonRpcProvider(
            process.env.TESTNET_RPC_URL,
        );
        signer = new ethers.Wallet(EOA_PRIVATE_KEY, provider);
    }
    console.log('🔑 EOA: ', EOA_PRIVATE_KEY);
    const MockTokenFactory = await ethers.getContractFactory("MockToken")
    const initialSupply = ethers.parseEther("100000000")
    // two mock tokens [with dispenser function] 
    const usdcFake = await MockTokenFactory.connect(signer).deploy("Mock USDC Token", "mUSDC", initialSupply)
    await usdcFake.waitForDeployment()
    const daiFake = await MockTokenFactory.connect(signer).deploy("Mock DAI Token", "mDAI", initialSupply)
    await daiFake.waitForDeployment()

    console.log(`🆙 mock usdc token deployed at: ${await usdcFake.getAddress()}`);
    console.log(`🆙 mock dai token deployed at: ${await daiFake.getAddress()}`);
    
    const filePath = './contracts.txt'
    appendFileSync(filePath, `MOCK_USDC_ADDR="${await usdcFake.getAddress()}"\n`, );
    appendFileSync(filePath, `MOCK_DAI_ADDR="${await daiFake.getAddress()}"\n`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });