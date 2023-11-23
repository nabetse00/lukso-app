// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import {LSP7CompatibleERC20Mintable} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7CompatibleERC20Mintable.sol";

/**
 * @title mock tokens
 * @author 
 * @notice Adds a dispenser function for demo and tests
 */
contract MockToken is LSP7CompatibleERC20Mintable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) LSP7CompatibleERC20Mintable(name, symbol, msg.sender) {
        _mint(msg.sender, totalSupply, true, "0x");
    }

    function dispense(address to) public {
        _mint(to, 10 ether, true, "0x");
    }
}
