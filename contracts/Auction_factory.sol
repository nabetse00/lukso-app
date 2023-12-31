// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Auction, IAuction} from "./Auction.sol";
import {AuctionItems} from "./AuctionItems.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Auction Factory
 * @author Nabetse
 * @notice On createAuction Adds new Auctions
 * @notice A flat fee is applied when creating an Auction.
 * @notice So `FLAT_FEE` tokens are transfered to the contract on auction creation
 * @notice Transfers items as LSP8 nfts to auction contract
 * @notice Allowed tokens are USDC and DAI
 */
contract AuctionFactory is IAuction, Ownable {
    address public immutable USDC_ADDR;
    address public immutable DAI_ADDR;
    address payable public immutable AUCTION_ITEMS_ADDR;
    uint256 public constant FLAT_FEE = 0.5 ether;

    Auction[] public auctions;

    event AuctionCreated(
        Auction auctionContract,
        address owner,
        uint numAuctions
    );

    /**
     * Create Auction Factory
     * @param _usdToken USDC token address
     * @param _daiToken DAI token adress
     * @param factoryOwner factory owner
     */
    constructor(address _usdToken, address _daiToken, address factoryOwner) {
        USDC_ADDR = _usdToken;
        DAI_ADDR = _daiToken;
        AUCTION_ITEMS_ADDR = payable(address(new AuctionItems(address(this))));
        _transferOwnership(factoryOwner);
    }

    /**
     * creates an Auction Contract
     * @dev _bidToken is treated as ERC20 token in order to reduce
     * auction factory contract size. Nevertheless it's a LSP7 token
     * @param _bidToken token allowed [USDC or DAI]
     * @param _itemOwner item owner
     * @param itemUri uri
     * @param _startingPrice start price for auction in tokens
     * @param _buyItNowPrice buy it now price in tokens
     * @param _duration [1 hour to 7 days] auction duration
     */
    function createAuction(
        address _bidToken,
        address _itemOwner,
        bytes memory itemUri,
        uint256 _startingPrice,
        uint256 _buyItNowPrice,
        uint256 _duration
    ) public {
        require(
            _bidToken == USDC_ADDR || _bidToken == DAI_ADDR,
            "[Auction Factory] Token for auction must be USDC or DAI"
        );

        // tranfer flat fee
        IERC20(_bidToken).transferFrom(
            msg.sender,
            address(this),
            _valueToTokens(_bidToken, FLAT_FEE)
        );

        // mint a token
        bytes32 _itemTokenId = AuctionItems(AUCTION_ITEMS_ADDR).safeMint(
            address(this),
            itemUri
        );

        AuctionConfig memory _config = AuctionConfig(
            _itemOwner,
            0,
            0,
            _startingPrice,
            _buyItNowPrice,
            _itemTokenId
        );

        Auction newAuction = new Auction(
            _bidToken,
            AUCTION_ITEMS_ADDR,
            _duration,
            _config
        );

        // transfer item
        AuctionItems(AUCTION_ITEMS_ADDR).safeTransferFrom(
            address(this),
            address(newAuction),
            _config.itemTokenId
        );

        auctions.push(newAuction);

        emit AuctionCreated(newAuction, msg.sender, auctions.length);
    }

    /**
     * gets this factory Auctions
     */
    function getAuctions() public view returns (Auction[] memory) {
        return auctions;
    }

    /**
     * Factory owner can withdraw token fees
     * in USDC and DAI tokens
     * @param receiver address to receive tokens
     */
    function withdrawFees(address payable receiver) public onlyOwner {
        require(receiver != address(0));
        uint256 bal = IERC20Metadata(USDC_ADDR).balanceOf(address(this));
        if (bal > 0) {
            bool success = IERC20Metadata(USDC_ADDR).transfer(receiver, bal);
            require(
                success,
                "[Auction Factory] Withdraw Fees Failed to send DAI"
            );
        }
        bal = IERC20Metadata(DAI_ADDR).balanceOf(address(this));
        if (bal > 0) {
            bool success = IERC20Metadata(DAI_ADDR).transfer(receiver, bal);
            require(
                success,
                "[Auction Factory] Withdraw Fees Failed to send DAI"
            );
        }
        bal = address(this).balance;
        if (bal > 0) {
            (bool sent, ) = receiver.call{value: bal}("");
            require(sent, "[Auction] Rescue Failed to send Ether");
        }
    }

    /**
     * This function converts all tokens values in 18 decimals
     * to value in token decimals
     * @notice LSP7 is 18 decimal but this can be
     * changed to mimic, for example, USDC [ethereum network] 6 decimals
     * @param bidToken token address
     * @param valueInEth value in ethers ie 18 decimals
     * @return value in tokens decimals
     */
    function _valueToTokens(
        address bidToken,
        uint256 valueInEth
    ) internal view returns (uint256) {
        return
            (valueInEth * 10 ** (IERC20Metadata(bidToken).decimals())) /
            1 ether;
    }
}
