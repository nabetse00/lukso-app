import { useConnectWallet } from "@web3-onboard/react";
import RequireProfile from "../components/RequireUniversalProfile";
import { useEffect, useState } from "react";
import { TokenList, getProfileData } from "../utils/ProfileData";

export function Component() {
    const [{ wallet }] = useConnectWallet()
    const [nfts, setNfts] = useState<TokenList[]>()

    useEffect(
        () => {
            if(wallet?.provider){

                getProfileData(wallet!).then(
                    (l) => {
                        console.log("done metadata")
                        setNfts(l)
                    }
                    )
                }
        },
        [wallet?.provider]
    )


    function formatList(list: string[], key:string, prefix: string) {
        return (
        <ul className="list-decimal" key={key}>
            {list.map(
                (l, i) => {
                    return <li key={l}>{prefix}[{i}] {l}</li>
                })
            }</ul>)
    }

    return (
        <RequireProfile>
            <div className="flex flex-col my-6 justify-center">
                <div>You own: </div>
                {nfts &&
                    <ul className="menu bg-base-200 w-56 rounded-box">
                        {
                            nfts.map(
                                (nft, i) => {
                                    return <li key={i}>
                                        on {nft.addr}:
                                        {formatList(nft.list, `${nft}${i}`,"nft id:")}

                                    </li>
                                }
                            )
                        }
                    </ul>
                }
            </div>
        </RequireProfile>
    )
}

Component.displayName = "NftPageRoute";

