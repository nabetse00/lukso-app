import { useEffect, useState } from "react";
// import { useLoaderData } from "react-router-dom";
import RequireProfile from "../components/RequireUniversalProfile";
import { getAuctionData, getAuctions } from "../utils/Auction";
import { useConnectWallet } from "@web3-onboard/react";
import { AuctionData } from "../types/models";
import { getJsonData } from "../utils/IpfsHelpers";
import AuctionComponent from "../components/AuctionComponent";



export function Component() {
    // const data = useLoaderData();
    const [auctions, setAuctions] = useState<AuctionData[]>([])
    const [loading, setLoading] = useState(true)
    const [{ wallet }] = useConnectWallet()

    async function getAuctionsData() {
        const auctions = await getAuctions(wallet!)
        const auctionsData: AuctionData[] = []
        for (let index = 0; index < auctions.length; index++) {
            const addr = auctions[index];
            const [uri, bid, bidder, seller, tokenAddr, increment, bider_bid] = await getAuctionData(wallet!, addr)
            const json = await getJsonData(uri)
            auctionsData.push(
                {
                    addr: addr,
                    uri: uri,
                    data: json,
                    bid: bid,
                    bidder: bidder,
                    seller: seller,
                    bidderBid: bider_bid,
                    min_imcrement: increment,
                    token: tokenAddr
                })
        }
        setAuctions(auctionsData)
        setLoading(false)
    }

    async function updateAuction(addr: string) {

        const [uri, bid, bidder, seller, tokenAddr, increment, bider_bid] = await getAuctionData(wallet!, addr)

        const new_auctions = [...auctions]

        new_auctions.map(
            el => {
                if (el.addr != addr) {
                    return el
                }
                el = {
                    addr: addr,
                    uri: uri,
                    data: el.data,
                    bid: bid,
                    bidder: bidder,
                    seller: seller,
                    bidderBid: bider_bid,
                    min_imcrement: increment,
                    token: tokenAddr
                }
            }
        )

        setAuctions(new_auctions)
    }

    useEffect(
        () => {

            if (auctions.length == 0) {
                getAuctionsData().then(
                    () => console.log("Auctions loaded")
                )
            }
        },
        [wallet?.provider]
    )
    return (
        <RequireProfile>
            <div className="flex flex-wrap  gap-6 justify-center my-4">
            {loading && <span className="loading loading-dots loading-lg"></span>}
                {
                    auctions.map(
                        v => <AuctionComponent key={v.addr} auction={v} update={updateAuction} />
                    )
                }
            </div>
        </RequireProfile>
    )
}

Component.displayName = "MainPageRoute";