import { useEffect, useState } from "react";
import { AuctionData } from "../types/models";
import { getJsonData, ipfsUrl } from "../utils/IpfsHelpers";
import CountDown from "./CountDown";
import { ethers } from "ethers";
import { getAuctionData, placeBid, withdrawAll } from "../utils/Auction";
import { useConnectWallet } from "@web3-onboard/react";
import { getBlances } from "../utils/MockToken";
import { updateAccount } from "@web3-onboard/core/dist/store/actions";

interface Props {
    auctionInit: AuctionData
    update: (addr: string) => Promise<void>
}

function gatewayIpfsUrl(cidUrl: string) {
    const cid = cidUrl.replace("ipfs://", "")
    return ipfsUrl(cid)
}

export default function AuctionComponent({ auctionInit, update }: Props) {
    const [ended, setEnded] = useState(false)
    const [bid, setBid] = useState('')
    const [bal, setBal] = useState('')
    const [{ wallet }] = useConnectWallet()
    const [auction, setAuction] = useState(auctionInit)


    function format_price(value: string) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return formatter.format(Number(value))

    }

    function format_address(value: string) {
        const length = 4
        return `${value.slice(0, length + 2)}...${value.slice(value.length - length, value.length)}`

    }

    useEffect(
        () => {
            let delta = new Date(auction.data.product_end_date).valueOf() - Date.now().valueOf();
            if (delta > 0) {
                setEnded(false)
            } else {
                setEnded(true)
            }

            if (Number(auction.status) == 2) {
                setEnded(true)
            }


            if (bid.length == 0) {
                const initial = ethers.parseEther(auction.min_imcrement) + ethers.parseEther(auction.bid)
                setBid(ethers.formatEther(initial))
            }
        }
    )


    async function updateAuctionData() {
        const [uri, bid, bidder, seller, tokenAddr, increment, bider_bid, status, highestBider] = await getAuctionData(wallet!, auction.addr)
        const json = await getJsonData(uri)
        const _auction: AuctionData =
        {
            addr: auction.addr,
            uri: uri,
            data: json,
            bid: bid,
            bidder: bidder,
            seller: seller,
            bidderBid: bider_bid,
            min_imcrement: increment,
            token: tokenAddr,
            status: status,
            highestBider: highestBider
        }
        setAuction(_auction)
        if(Number(bider_bid)> Number(bid)){
            const val = Number(bider_bid) + Number(increment)
            setBid(val.toString())
        }else{
            const val = Number(bid) + Number(increment)
            setBid(val.toString())
        }
    }

    useEffect(
        () => {

            getBlances(wallet!, auction.token).then(
                b => setBal(ethers.formatEther(b))
            )
            updateAuctionData()
        },
        [wallet?.provider]
    )

    async function handlePlaceBid() {
        const txn = await placeBid(wallet!, auction.addr, auction.token, bid, auction.bidderBid)
        await update(auction.addr)
        console.log(txn)
        await txn.wait()
        await updateAuctionData()
    }

    async function handleBuyItNow() {
        const txn = await placeBid(wallet!, auction.addr, auction.token, auction.data.product_buy_it_price, auction.bidderBid)
        await update(auction.addr)
        console.log(txn)
        await txn.wait()
        await updateAuctionData()
    }

    async function handleWithdraw() {
        const txn = await withdrawAll(wallet!, auction.addr)
        await update(auction.addr)
        console.log(txn)
        await txn.wait()
        await updateAuctionData()
    }

    return (
        <div className="card  max-w-2xl md:card-side  bg-neutral shadow-xl border-2  border-solid border-neutral-800">
            <figure className="md:max-h-fit max-h-48 p-2"><img className="object-cover" src={`${gatewayIpfsUrl(auction.data.product_picture)}`} alt={`${auction.data.product_name} image`} /></figure>
            <div className="card-body">
                <h2 className="card-title">
                    <div className="flex flex-col">
                        {auction.data.product_name}
                        <div className="flex">
                            <div className="badge badge-secondary">Seller: {format_address(auction.seller)}</div>
                            <div className="badge badge-primary">Winner: {format_address(auction.highestBider)}</div>
                        </div>
                    </div>
                </h2>
                <p>{auction.data.product_description}</p>
                <p>{format_price(auction.data.product_buy_it_price)}</p>
                <div className="stats bg-neutral-900">
                    <div className="stat">
                        <div className="stat-title">Current bid</div>
                        <div className="stat-value">{format_price(auction.bid)}</div>
                        <div className="stat-desc">Starting at {format_price(auction.data.product_start_price)}</div>
                    </div>
                    <CountDown endDate={auction.data.product_end_date} isEnded={ended} />
                </div>


                <div className="card-actions justify-end">
                    {
                        wallet?.accounts[0].address != auction.seller ?
                            <>
                                <span> Your current bid is: {auction.bidderBid}</span>
                                <span className="">Max {bal} tokens</span>
                                <input type="number"
                                    step="0.01"
                                    min={Number(auction.bid) + Number(auction.min_imcrement)}
                                    max={bal+Number(auction.bidderBid)}
                                    className="input input-bordered input-primary"
                                    value={bid}
                                    onChange={(e) => { setBid(e.target.value) }} />

                                <button disabled={ended || (Number(bid) > (Number(bal)+ Number(auction.bidderBid)))} onClick={() => handlePlaceBid()} className="btn btn-primary btn-outline" >Place a Bid</button>
                                {Number(auction.data.product_buy_it_price) > 0 &&
                                    <button onClick={() => handleBuyItNow()} className="btn btn-primary btn-outline" disabled={ended || (Number(auction.data.product_buy_it_price) > Number(bal))}  >Buy Now for {format_price(auction.data.product_buy_it_price)}</button>
                                }
                                <button onClick={() => handleWithdraw()} className="btn btn-primary btn-outline" disabled={!ended}>Withdraw</button>
                            </>
                            :
                            <p>You are the auction seller</p>
                    }
                </div>
            </div>
        </div>


    )
}