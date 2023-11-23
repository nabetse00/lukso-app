// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import {LSP7CompatibleERC20Mintable} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7CompatibleERC20Mintable.sol";

contract CustomToken is LSP7CompatibleERC20Mintable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) LSP7CompatibleERC20Mintable(name, symbol, msg.sender) {
        mint(msg.sender, totalSupply, true, "0x");
    }
}
