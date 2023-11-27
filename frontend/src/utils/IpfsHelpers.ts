import axios from "axios"
import { AuctionJson } from "../types/models";
const JWT = `Bearer ${import.meta.env.VITE_PINATA_JWT}`



export async function axiosToIpfs(selectedFile: File) {
    const formData = new FormData();

    formData.append('file', selectedFile);

    const metadata = JSON.stringify({
        name: selectedFile.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            // maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`, 
                Authorization: JWT
            }
        });
        console.log(res.data);
        return(res.data as PinataResponse)
    } catch (error) {
        console.log(error);
    }
}
    

export async function uploadToIpfs(file: File): Promise<string> {
    const results = await axiosToIpfs(file)
    return results!.IpfsHash
}

type PinataResponse = {
    IpfsHash: string
    PinSize: number
    Timestamp: Date
}

export async function uploadJson(obj: Object): Promise<string | undefined> {
    let rootCid = ""
    try {
        //const obj = { hello: 'world' }
        const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
        // console.log(`${import.meta.env.VITE_WEB3_API}`)
        const upFile = new File([blob], 'item.json')
        const info = await axiosToIpfs(upFile)
        rootCid = info!.IpfsHash
        console.log(`status info ${info}`)
    } catch (e: any) {
        console.error(e);
    }
    return rootCid
};


export async function getJsonData(cid: string){
    
    const resp = await axios.get(
        ipfsUrl(cid), {
            headers:{
                // 'Content-Type': 'application/json',
                'Accept': '*/*',
                // 'Access-Control-Allow-Origin': '*',
                //"user-agent": "watever/2023.4.0"
            }
        }
    )
    const json = resp.data as AuctionJson
    return json;
}

export function ipfsUrl(cid: string) {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`
    return url;
}