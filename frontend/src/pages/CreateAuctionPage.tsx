import { useForm } from "react-hook-form"
import ImageUpload from "../components/ImageInput"
import { AuctionJson, AuctionTokens, IAuctionInput } from "../types/models"
import { useRef, useState } from "react";
import ViewAuction from "../components/AuctionView";
import { uploadJson, uploadToIpfs } from "../utils/IpfsHelpers";
import RequireProfile from "../components/RequireUniversalProfile";
import { createAuctionBatch } from "../utils/Auction";
import { useConnectWallet } from "@web3-onboard/react";
import { WalletState } from "@web3-onboard/core";
import { TESTNET_MOCK_USDC_ADDR, TESTNET_MOCK_DAI_ADDR, FLAT_FEE_USDC } from "../types/contracts";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { getBlances } from "../utils/MockToken";



export function Component() {
    const [{ wallet }] = useConnectWallet()
    const { register, handleSubmit, reset, getValues, trigger, formState: { errors }, } = useForm<IAuctionInput>(
        {
            defaultValues: {
                itemName: "",
                itemDescription: "",
                auctionToken: AuctionTokens.USDC,
                startingPrice: 0.1,
                auctionImage: undefined,
                duration: 1
            },
            mode: "all"
        }

    )

    const modal = useRef()
    const [loading, setLoading] = useState(false)
    const [loadingMsg, setLoadingMsg] = useState("loading")
    const [balCheck, setBalCheck] = useState(false)
    const [isRejected, setIsRejected] = useState(false)

    async function uploadAuctionJson(data: IAuctionInput) {

        const currentTime = new Date().getTime();
        const end = new Date(currentTime + data.duration * 60 * 60 * 1000);
        console.log(`got ${data.auctionImage[0].name}`)
        const imgCID = await uploadToIpfs(data.auctionImage[0])
        const json: AuctionJson = {
            product_description: data.itemDescription,
            product_picture: `ipfs://${imgCID}`,
            product_name: data.itemName,
            product_start_price: data.startingPrice.toString(),
            product_auction_token: data.auctionToken == AuctionTokens.USDC ? "USDC" : "DAI",
            product_buy_it_price: data.buyItNowPrice.toString(),
            product_end_date: new Date(end)
        }
        console.log(JSON.stringify(json))
        const tokenURI = await uploadJson(json)
        //console.log(tokenURI)
        return tokenURI
    }

    async function createAuctionOnChain(wallet: WalletState, tokenUri: string, data: IAuctionInput) {
        const bidTokenAddr = (data.auctionToken == AuctionTokens.USDC) ? TESTNET_MOCK_USDC_ADDR : TESTNET_MOCK_DAI_ADDR
        data.itemUri = tokenUri
        const txn = await createAuctionBatch(wallet, bidTokenAddr, tokenUri, data.startingPrice, data.buyItNowPrice, data.duration)
        return txn
    }


    async function onSubmit(wallet: WalletState, data: IAuctionInput) {
        (modal.current as any).showModal()
        setIsRejected(false)
        setLoadingMsg("Checking Token Balance")
        try {
            const bidTokenAddr = (data.auctionToken == AuctionTokens.USDC) ? TESTNET_MOCK_USDC_ADDR : TESTNET_MOCK_DAI_ADDR
            const bal = await getBlances(wallet, bidTokenAddr)
            if (bal < FLAT_FEE_USDC) {
                setBalCheck(false)
                return
            } else {
                setBalCheck(true)
                setLoadingMsg("Checking Token Balance Ok!")
            }

            setLoading(true)
            setLoadingMsg("Uploading to ipfs")
            const tokenURI = await uploadAuctionJson(data)
            setLoadingMsg("Waiting for transaction validation")
            const txn = await createAuctionOnChain(wallet, tokenURI!, data)
            setLoadingMsg("Transaction validation OK")
            setLoading(false)
            setLoadingMsg("Loading")
            console.log(txn)
        } catch (e) {
            setIsRejected(true)
            setLoadingMsg("Loading")
        }
        return
    }

    return (
        <RequireProfile>


            <div className="card bg-neutral text-neutral-content">
                <div className="card-body items-center text-center">
                    <h1 className="card-title">Create a new auction</h1>

                    <form onSubmit={handleSubmit((data) => onSubmit(wallet!, data))} className="w-full">

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">What's the name of the item?</span>
                            </label>
                            <input type="text" placeholder="Item Name ..." className="input input-bordered bg-neutral w-full"
                                {...register("itemName", { required: true, maxLength: 40 },)}
                            />
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.itemName?.type == "required" && "Item name required"}
                                    {errors.itemName?.type == "maxLength" && "Item name too long"}
                                </span>
                            </label>
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Item Description</span>
                            </label>
                            <textarea className="textarea textarea-bordered h-24 bg-neutral" placeholder="Item Description..."
                                {...register("itemDescription", { required: true, maxLength: 200 },)}
                            ></textarea>
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.itemDescription?.type == "required" && "Item description required"}
                                    {errors.itemDescription?.type == "maxLength" && "Item description too long"}
                                </span>
                            </label>
                        </div>


                        <div className="flex flex-wrap gap-4">

                            <div className="form-control max-w-xs">
                                <label className="label">
                                    <span className="label-text">Auction Tokens</span>
                                </label>
                                <select
                                    className="select select-bordered bg-neutral"
                                    {...register("auctionToken", { required: true })} >
                                    <option value="usdc">USDC</option>
                                    <option value="dai">DAI</option>
                                </select>
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.auctionToken?.type == "required" && "Please choose a token"}
                                    </span>
                                </label>
                            </div>


                            <div className="form-control grow">
                                <label className="label">
                                    <span className="label-text">Starting price</span>
                                </label>
                                <input type="number" step="0.01" placeholder="Input value ie $18.78" className="input input-bordered bg-neutral w-full"
                                    {...register("startingPrice", { required: true, min: 0.1 },)}
                                />
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.startingPrice?.type == "required" && "Starting price required"}
                                        {errors.startingPrice?.type == "min" && "Starting price too low"}
                                    </span>
                                </label>
                            </div>

                            <div className="form-control grow">
                                <label className="label">
                                    <span className="label-text">Buy it now price</span>
                                </label>
                                <input type="number" step="0.01" placeholder="Input value ie $18.78" className="input input-bordered bg-neutral w-full"
                                    {...register("buyItNowPrice", {
                                        validate: {
                                            min: v => (v > getValues("startingPrice")) || (v == 0)
                                        },
                                    },)}
                                />
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.buyItNowPrice?.type == "min" && "Buy it now price must be > starting price"}
                                    </span>
                                </label>
                            </div>
                        </div>


                        <ImageUpload register={register} name="auctionImage" errors={errors} trigger={trigger} />


                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Auction duration in hours</span>
                            </label>
                            <input type="number" className="input input-bordered bg-neutral w-full"
                                {...register("duration", { required: true, min: 1 })}
                            />

                            <label className="label">
                                <span className="label-text-alt text-error">
                                    {errors.duration?.type == "required" && "duration required"}
                                    {errors.duration?.type == "min" && "duraction too low"}
                                </span>
                            </label>
                        </div>


                        <div className="card-actions justify-end mt-6">
                            <input type="submit" className="btn  btn-outline btn-primary" />
                            <button onClick={() => reset()} className="btn btn-outline btn-error">Reset</button>
                        </div>
                    </form>

                </div>

                <dialog ref={modal as any} id="info-modal" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        {!isRejected && !balCheck &&
                            <div role="alert" className="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <h3 className="font-bold">you don't have enought tokens to pay Auction Factory Fee.</h3>
                                    <div className="text-xs">You can get some from the dispenser</div>
                                </div>

                                <button className="btn"><Link to="/dispenser">Go to Dispenser</Link></button>

                            </div>
                        }
                        {!isRejected && balCheck &&
                            <div role="alert" className="alert mt-6 alert-info">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

                                <div>
                                    <h3 className="font-bold">
                                        You will pay {ethers.formatEther(FLAT_FEE_USDC)} fee to Auction Factory
                                        to create a new Auction.
                                    </h3>
                                    <div className="text-xs">Accept transaction in UP extention</div>
                                </div>
                            </div>
                        }
                        {!isRejected && loading &&

                            <div className="mt-6 card w-96 shadow-xl bg-neutral">
                                <div className="card-body">
                                    <h2 className="card-title">{loadingMsg} </h2>
                                    <span className="loading loading-dots loading-sm"></span>
                                    <dl>
                                        <dt>Item description:</dt>
                                        <dd className="skeleton bg-neutral h-4 w-full">
                                            <span className="loading loading-dots loading-sm"></span>

                                        </dd>

                                        <dt>Item URI:</dt>
                                        <dd className="skeleton bg-neutral h-4  w-full">
                                            <span className="loading loading-dots loading-sm"></span>
                                        </dd>

                                        <dt>Starting price:</dt>
                                        <dd className="skeleton bg-neutral h-4 w-full">
                                            <span className="loading loading-dots loading-sm"></span>

                                        </dd>

                                        <dt>Buy it now:</dt>
                                        <dd className="skeleton bg-neutral h-4 w-full">
                                            <span className="loading loading-dots loading-sm"></span>
                                        </dd>

                                        <dt>Duration:</dt>
                                        <dd className="skeleton bg-neutral h-4 w-full">
                                            <span className="loading loading-dots loading-sm"></span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>

                        }
                        {!isRejected && !loading && balCheck &&
                                <ViewAuction auction={getValues()} />

                        }

                        {isRejected &&
                            <div role="alert" className="alert alert-warning mt-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <h3 className="font-bold">
                                        You rejected the transaction
                                    </h3>
                                    <div className="text-xs">Please Accept transaction in UP extention</div>
                                </div>
                            </div>
                        }
                    </div>
                </dialog>

            </div>
        </RequireProfile>
    )
}

