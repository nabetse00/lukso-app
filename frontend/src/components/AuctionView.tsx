import { IAuctionInput } from "../types/models"
interface Props {
    auction: IAuctionInput
}
export default function ViewAuction({ auction }: Props) {

    function generateImg() {
        console.log(auction.auctionImage)
        if (auction.auctionImage && auction.auctionImage.length > 0)
            return URL.createObjectURL(auction.auctionImage[0])

        return ""
    }

    return (
        <>
            <div className="card w-96 bg-base-100 shadow-xl bg-neutral">
                <figure><img src={generateImg()} alt="Auction image" /></figure>
                <div className="card-body">
                    <h2 className="card-title">New Auction: {auction.itemName}</h2>
                    <dl>
                        <dt>Item description:</dt>
                        <dd>{auction.itemDescription}</dd>

                        <dt>Item URI:</dt>
                        <dd>{auction.itemUri}</dd>

                        <dt>Starting price:</dt>
                        <dd>{auction.startingPrice}</dd>

                        <dt>Buy it now:</dt>
                        <dd>{auction.buyItNowPrice}</dd>

                        <dt>Duration:</dt>
                        <dd>{auction.duration}</dd>
                    </dl>
                </div>
            </div>
        </>
    )




}