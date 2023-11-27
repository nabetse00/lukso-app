import { ethers } from "ethers";
import { MockToken__factory } from '../../../typechain-types';

import { WalletState } from "@web3-onboard/core";


export async function dispenseToken(wallet: WalletState, mockAddr: string): Promise<ethers.ContractTransactionResponse>{
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const token = MockToken__factory.connect(mockAddr, signer)
    const txn = await token.dispense(signer.address)
    console.log(txn)
    return txn
}

export async function getBlances(wallet: WalletState, mockAddr: string){
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const token = MockToken__factory.connect(mockAddr, signer)
    const bal = await token.balanceOf(signer.address)
    return bal
}