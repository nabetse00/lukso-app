import { useLoaderData, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"


export function Component() {
    const navigate = useNavigate();
    return (

        <div>

            <div className="hero my-6 py-6  bg-neutral rounded-box">
                <div className="hero-content flex-col lg:flex-row text-center">
                    <img src={logo} className="w-48" />
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold test-center">
                            Welcome to Lukso Auctions
                        </h1>
                        <p className="py-6">
                            Where Your Bidding Adventure Begins!
                        </p>

                    </div>
                </div>
            </div>

            <div className="flex flex-wrap my-6 justify-center">
                <div className="m-6 card w-96 bg-neutral text-neutral-content">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">Dispenser</h2>
                        <p>Use this dispenser to get some mUSDC or mDAI tokens</p>
                        <div className="card-actions justify-end">
                            <button onClick={() => navigate('/dispenser')} className="btn btn-primary">Get mUsdc</button>
                            <button onClick={() => navigate('/dispenser')} className="btn btn-secondary">Get mDai</button>
                        </div>
                    </div>
                </div>

                <div className="m-6 card w-96 bg-neutral text-neutral-content">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">Buyer ?</h2>
                        <p>Check our Auctions.</p>
                        <div className="card-actions justify-end">
                            <button onClick={() => navigate('/auctions')} className="btn btn-primary">Go to Auction</button>
                        </div>
                    </div>
                </div>

                <div className="m-6 card w-96 bg-neutral text-neutral-content">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title">Seller ?</h2>
                        <p>Create a new Auction</p>
                        <div className="card-actions justify-end">
                            <button onClick={() => navigate('/auctions')} className="btn btn-primary">Create a new Auction</button>
                        </div>
                    </div>
                </div>


            </div>
            <div className="bg-neutral py-6 rounded-box">
                <div className="chat chat-start">
                    <div className="chat-bubble">🙋 Why Lukso Auctions?</div>
                </div>
                <div className="chat chat-end">
                    <div className="chat-bubble">
                        🚀 Simple: It's Easy for You:
                        <br />
                        At Lukso Auctions, we're committed to providing you with an interface that's not only clean and intuitive but also tailored to make your bidding experience as easy as possible. Navigating our site is a breeze, allowing you to focus on the joy of bidding.

                    </div>
                </div>
                <div className="chat chat-start">
                    <div className="chat-bubble">💡 What can i find here?</div>
                </div>
                <div className="chat chat-end">
                    <div className="chat-bubble">
                        A wide range of auctions featuring one-of-a-kind items, from rare collectibles to everyday treasures. Lukso Auctions brings you a curated selection of high-quality products that resonate with your personal taste, enhancing your bidding adventure.
                    </div>
                </div>
                <div className="chat chat-start">
                    <div className="chat-bubble">🔒 What about Security?</div>
                </div>
                <div className="chat chat-end">
                    <div className="chat-bubble">
                        Rest easy knowing that your crypto assets are in good hands at Lukso Auctions. Our platform employs cutting-edge blockchain technology and cryptographic protocols to ensure the utmost security for your cryptocurrency transactions, providing you with peace of mind as you bid on your favorite items.
                    </div>
                </div>
                <div className="chat chat-start">
                    <div className="chat-bubble">🎉 How can I Join?</div>
                </div>
                <div className="chat chat-end">
                    <div className="chat-bubble">
                        Ready to embark on a personalized journey of excitement and discovery? Sign up for Lukso Auctions today and experience the joy of bidding, the ease of transactions, and the thrill of winning! Your next prized possession is just a bid away. Happy Bidding!
                    </div>
                </div>
            </div>
        </div>
    )
}

Component.displayName = "MainPageRoute";
