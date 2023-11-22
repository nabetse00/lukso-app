import * as dotenv from 'dotenv';
import hre from 'hardhat';
import { ethers } from "hardhat"
import schema from "./LSP4DigitalAsset.json"
// load env vars
dotenv.config();

const { UP_ADDR, ADDRESS, PRIVATE_KEY, CUSTOM_TOKEN_ADDR } = process.env;


async function main() {

    console.log('🔑 EOA: ', PRIVATE_KEY);
    console.log('🆙 Universal Profile: ', UP_ADDR);
    console.log('🆙 token: ', CUSTOM_TOKEN_ADDR);

    const amount = ethers.parseEther("19")
    // setup provider
    const provider = new ethers.JsonRpcProvider(
        'https://rpc.testnet.lukso.network',
    );
    // setup signer (the browser extension controller)
    const signer = new ethers.Wallet(PRIVATE_KEY as string, provider);
    // load the associated UP
    const UP = await ethers.getContractAt('UniversalProfile', UP_ADDR as string);
    const CustomTokenAbi =
        hre.artifacts.readArtifactSync('CustomToken').abi;
    const abiInterface = new ethers.Interface(CustomTokenAbi)
    const callData = abiInterface.encodeFunctionData("mint", [
        UP_ADDR!, 2900, false, "0x"])

    const myToken = await ethers.getContractAt('CustomToken', CUSTOM_TOKEN_ADDR!)
    const symbolEnc = await myToken.getData("0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756")
    const padded = ethers.zeroPadBytes(symbolEnc, 32)
    const symbol = ethers.decodeBytes32String(padded)

    // deploy CustomLSP7 as the UP (signed by the browser extension controller)
    const tx1 = await UP.connect(signer).execute(
        0,
        CUSTOM_TOKEN_ADDR!,
        0,
        callData,
    );

    let resp = await tx1.wait();
    console.log(
        '✅ Mint done, minted: ',
        ethers.formatEther(amount),
        symbol
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });