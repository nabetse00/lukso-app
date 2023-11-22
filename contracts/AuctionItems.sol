// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LSP8Burnable} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol";
// for docs ineherint
import {LSP8IdentifiableDigitalAssetCore} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetCore.sol";

import {LSP8Mintable} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol";
// import {LSP8CompatibleERC721Mintable} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8CompatibleERC721Mintable.sol";
import {_LSP8_TOKENID_TYPE_HASH, _LSP8_TOKEN_METADATA_BASE_URI, _LSP8_METADATA_TOKEN_URI_PREFIX} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";

import {ILSP8Mintable} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/ILSP8Mintable.sol";

abstract contract IAuctionItems is ILSP8Mintable {
    function safeMint(
        address to,
        bytes memory uri
    ) public virtual returns (bytes32);

    function safeTransferFrom(
        address from,
        address to,
        bytes32 tokenId
    ) public virtual;
}
// Custom Errors

/**
 * @dev Reverts trying to change `tokenId URI`.
 */
error LSP8_METADATA_TOKEN_URI_CANNOT_CHANGE(address caller);

/**
 * @dev Reverts trying to change `base tokenId URI`.
 */
error LSP8_METADATA_TOKEN_BASE_URI_CANNOT_CHANGE(address caller);

string constant NAME = "Lukso Auction Items";
string constant SYMBOL = "LKAI";
string constant PREFIX_ID_HASH = "auction";

enum TokenType {
    TOKEN,
    NFT,
    COLLECTION
}

// keccak256('LSP4Metadata')
bytes32 constant _LSP4_TOKEN_TYPE_DATA_KEY = 0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3;
//bytes4 constant BASE_URI_HASH = 0x00000000;
bytes4 constant BASE_URI_HASH = 0x6f357c6a;
bytes constant BASE_URI = "ipfs://";

/**
 * @title Lukso Auction LSP8 NFTs
 * @author nabetse
 */
contract AuctionItems is LSP8Mintable, LSP8Burnable {
    // Mapping from token index to token id
    mapping(uint256 => bytes32) private _indexToken;

    // Mapping from token id to index
    mapping(bytes32 => uint256) private _tokenIndex;

    //
    uint256 public auctionItemCreatedCount = 0;

    constructor(
        address owner
    ) LSP8Mintable(NAME, SYMBOL, owner, _LSP8_TOKENID_TYPE_HASH) {
        _setData(_LSP4_TOKEN_TYPE_DATA_KEY, abi.encode(TokenType.COLLECTION));
        _setData(
            _LSP8_TOKEN_METADATA_BASE_URI,
            abi.encodePacked(BASE_URI_HASH, BASE_URI)
        );
    }

    /**
     * @notice Retrieving the `tokenId` for `msg.sender` located in its list at index number `index`.
     *
     * @dev Returns a token id at index. See {totalSupply} to get total number of minted tokens.
     * @param index The index to search to search in the enumerable mapping.
     * @return TokenId or `bytes32(0)` if no tokenId exist at `index`.
     */
    function tokenAt(uint256 index) public view returns (bytes32) {
        return _indexToken[index];
    }

    /**
     * @notice Retrieving all `tokenId`
     *
     * @dev Returns an array of token ids. See {totalSupply} to get total number of minted tokens.
     * @return TokenIds array of bytes32 or `bytes32(0)` if no tokenIds exist.
     */
    function getAllTokenIds() public view returns (bytes32[] memory) {
        bytes32[] memory ids = new bytes32[](totalSupply());
        for (uint i = 0; i < ids.length; i++) {
            ids[i] = _indexToken[i];
        }
        return ids;
    }

    /**
     * @notice Creates a new auction item
     * @param nftOwner owner of the created nft
     * @param data The data sent alongside the the token transfer.
     *
     * @dev Returns tokenID = keccak256(abi.encodePacked( [PREFIX_ID_HASH], [count of created nfts], [data]))
     * @return tokenId Tokenid of the created nft
     */
    function createAuctionItem(
        address nftOwner,
        bytes memory data
    ) public onlyOwner returns (bytes32) {
        bytes32 tokenId = keccak256(
            abi.encodePacked(PREFIX_ID_HASH, auctionItemCreatedCount, data)
        );
        _mint({to: nftOwner, tokenId: tokenId, force: true, data: data});
        return tokenId;
    }

    function safeMint(
        address to,
        bytes memory uri
    ) public onlyOwner returns (bytes32) {
        bytes32 tokenId = createAuctionItem(to, "");
        bytes32 key = bytes32(bytes20(tokenId));
        key = key >> 96; // 12 bytes prefix * 8 = 96 
        key = bytes32(_LSP8_METADATA_TOKEN_URI_PREFIX) | key;
        _setData(key, abi.encodePacked(BASE_URI_HASH, uri));
        return tokenId;
    }

    function safeTransferFrom(
        address from,
        address to,
        bytes32 tokenId
    ) public {
        _transfer(from, to, tokenId, true, "");
    }

    function getTokenUri(bytes32 tokenId) public view returns (string memory) {
        bytes32 key = bytes32(bytes20(tokenId));
        key = key >> 96; // 12 bytes prefix * 8 = 96
        key = bytes32(_LSP8_METADATA_TOKEN_URI_PREFIX) | key;
        bytes memory data = _getData(key);
        // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36
        //uint256 offset = 36;

        return string(data);
    }

    // internals

    // overrides

    /**
     * @inheritdoc LSP8IdentifiableDigitalAssetCore
     *
     * @param from The address sending the `tokenId` (`address(0)` when `tokenId` is being minted).
     * @param to The address receiving the `tokenId` (`address(0)` when `tokenId` is being burnt).
     * @param tokenId The bytes32 identifier of the token being transferred.
     * @param data The data sent alongside the the token transfer.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) internal virtual override(LSP8IdentifiableDigitalAssetCore) {
        // `tokenId` being minted
        if (from == address(0)) {
            auctionItemCreatedCount++;
            uint256 index = totalSupply();
            _indexToken[index] = tokenId;
            _tokenIndex[tokenId] = index;
        }

        // `tokenId` being burnt
        if (to == address(0)) {
            uint256 lastIndex = totalSupply() - 1;
            uint256 index = _tokenIndex[tokenId];
            if (index < lastIndex) {
                bytes32 lastTokenId = _indexToken[lastIndex];
                _indexToken[index] = lastTokenId;
                _tokenIndex[lastTokenId] = index;
            }
            delete _indexToken[lastIndex];
            delete _tokenIndex[tokenId];
        }

        super._beforeTokenTransfer(from, to, tokenId, data);
    }

    /**
     * @inheritdoc ERC725YCore
     * @dev LSP8_TOKEN_METADATA_BASE_URI and _LSP8_METADATA_TOKEN_URI_PREFIX
     * can only be set once.
     *
     * @param dataKey A bytes32 data key to write the associated `bytes` value to the store.
     * @param dataValue The `bytes` value to associate with the given `dataKey` in the ERC725Y storage.
     *
     * @custom:events {DataChanged} event emitted after a successful `setData` call.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        // check data if data key is set
        if (dataKey == _LSP8_TOKEN_METADATA_BASE_URI) {
            bytes memory res = super._getData(dataKey);
            if (res.length != 0) {
                revert LSP8_METADATA_TOKEN_BASE_URI_CANNOT_CHANGE(msg.sender);
            }
            super._setData(dataKey, dataValue);
            return;
        }
        if (bytes12(dataKey) == _LSP8_METADATA_TOKEN_URI_PREFIX) {
            bytes memory res = super._getData(dataKey);
            if (res.length != 0) {
                revert LSP8_METADATA_TOKEN_URI_CANNOT_CHANGE(msg.sender);
            }
            super._setData(dataKey, dataValue);
            return;
        }
        super._setData(dataKey, dataValue);
    }
}
