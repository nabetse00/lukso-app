// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {AuctionItems} from "./AuctionItems.sol";
import {LSP9Vault} from "@lukso/lsp-smart-contracts/contracts/LSP9Vault/LSP9Vault.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {_INTERFACEID_LSP0} from "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0Constants.sol";

/**
 * @title Auction Abstract contract
 */
abstract contract AuctionAbstract {
    function getHighestBid() public virtual view returns (uint256);

    function placeBid(
        address _bidder,
        uint256 _tokenAmount
    ) public payable virtual returns (bool success);

    function cancelAuction() public virtual  returns (bool success);

    function rescue(address payable receiver) public virtual;

    function withdrawAll() public virtual returns (bool success);

    function withdraw() public virtual returns (bool success);

    function getMinimalIncrementTokens() public virtual view returns (uint256);
    
}
