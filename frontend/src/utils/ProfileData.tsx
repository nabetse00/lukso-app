// Import and network setup
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json'
import LSP8Schema from '@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json';
import { LSP8IdentifiableDigitalAsset__factory} from "../../../typechain-types"
import { WalletState } from '@web3-onboard/core';
import { ethers } from 'ethers';

// Static variables
const RPC_ENDPOINT = 'https://rpc.testnet.lukso.network';
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs';

export type TokenList ={
    addr:string,
    list: string[]
}

export async function getProfileData(wallet: WalletState){
    const provider = new ethers.BrowserProvider(wallet.provider, 'any')
    const signer = await provider.getSigner()
    const config = { ipfsGateway: IPFS_GATEWAY };
    const profile = new ERC725(
        lsp3ProfileSchema as ERC725JSONSchema[],
        signer.address,
        RPC_ENDPOINT,
        config,
      );
      const result = await profile.fetchData('LSP5ReceivedAssets[]');
      console.log(result)
      const ownedAssets  = result.value as string[]

      const  ownedAssetsMetadata = []
      let nfts: string[] = []
      for( const addr of ownedAssets){
        const digitalAsset = new ERC725(LSP8Schema as ERC725JSONSchema[], addr, RPC_ENDPOINT, config);
        const data = await digitalAsset.fetchData('LSP8TokenIdType');
        ownedAssetsMetadata.push(data)
        if(data.value != null){
            nfts.push(addr)
        }

      }
    console.log(ownedAssetsMetadata);
    console.log(nfts)
    let tokensList: TokenList[] = []
    for(const nftAddr of nfts){
        const lsp8 = LSP8IdentifiableDigitalAsset__factory.connect(nftAddr, signer)
        const tokens = await lsp8.tokenIdsOf(signer.address)
        tokensList.push({
            addr:nftAddr,
            list:tokens
        })
    }

    return tokensList


}
