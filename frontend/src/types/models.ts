export interface MenuLinks {
  path: string;
  description: string;
}

export type Menu = MenuLinks[]


export enum AuctionTokens {
  USDC = "usdc",
  DAI = "dai"
}

export interface IAuctionInput {
  itemName: string
  itemDescription: string
  auctionToken: AuctionTokens
  startingPrice: number
  auctionImage: FileList
  duration: number
  buyItNowPrice: number
  itemUri: string
}

export type AuctionData = {
  addr: string
  uri: string
  data: AuctionJson
  bid: string,
  bidder: string,
  seller: string,
  bidderBid: string;
  min_imcrement: string;
  token: string;
  status:string;
}

export interface AuctionJson {
  product_description: string;
  product_picture: string;
  product_name: string;
  product_start_price: string
  product_auction_token: "USDC" | "DAI";
  product_buy_it_price: string;
  product_end_date: Date;
}
