// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev This Contract Module helps to deploy brands and manage them.
 * Mints NFTs for each brand.
 * Updates metadata for each brand.
 * Adds admins, operators, and publishers to each brand.
 * Sets the payout address for each brand.
 * Deletes a brand.
 */

contract MyriadFlowBrands is Context, ERC721 {
    uint8 public constant version = 1;
    mapping(uint256 => Brand) public brands;

    uint256 public _tokenId = 0;

    struct Brand {
        string name;
        string metadata;
        mapping(address => bool) adminRole;
        mapping(address => bool) operatorRole;
        mapping(address => bool) publisherRole;
        address payoutAddress;
    }

    event BrandLaunched(uint256 tokenId, string name, string metadata);
    event BrandMetadataUpdated(uint256 tokenId, string metadata);
    event BrandAdminAdded(uint256 tokenId, address account);
    event BrandOperatorAdded(uint256 tokenId, address account);
    event BrandPublisherAdded(uint256 tokenId, address account);
    event BrandAdminRevoked(uint256 tokenId, address account);
    event BrandOperatorRevoked(uint256 tokenId, address account);
    event BrandPublisherRevoked(uint256 tokenId, address account);
    event PayoutAddressUpdated(uint256 tokenId, address payoutAddress);
    event BrandDeleted(uint256 tokenId);

    constructor() ERC721("MyriadFlow Brands", "MFB") {}

    function isBrandAdmin(
        uint256 tokenId,
        address account
    ) external view returns (bool) {
        return brands[tokenId].adminRole[account];
    }

    function isBrandOperator(
        uint256 tokenId,
        address account
    ) external view returns (bool) {
        return brands[tokenId].operatorRole[account];
    }

    function isBrandPublisher(
        uint256 tokenId,
        address account
    ) external view returns (bool) {
        return brands[tokenId].publisherRole[account];
    }

    function createBrand(string memory name, string memory uri) external {
        _tokenId++;
        uint256 nextTokenId = _tokenId;
        brands[nextTokenId].name = name;
        brands[nextTokenId].metadata = uri;
        brands[nextTokenId].adminRole[_msgSender()] = true;
        brands[nextTokenId].operatorRole[_msgSender()] = true;
        brands[nextTokenId].publisherRole[_msgSender()] = true;
        brands[nextTokenId].payoutAddress = _msgSender();
        _safeMint(_msgSender(), nextTokenId);

        emit BrandLaunched(nextTokenId, name, uri);
    }

    function setBrandMetadata(uint256 tokenId, string memory uri) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        brands[tokenId].metadata = uri;
        emit BrandMetadataUpdated(tokenId, uri);
    }

    function addAdmin(uint256 tokenId, address account) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        brands[tokenId].adminRole[account] = true;
        emit BrandAdminAdded(tokenId, account);
    }

    function addOperator(uint256 tokenId, address account) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        brands[tokenId].operatorRole[account] = true;
        emit BrandOperatorAdded(tokenId, account);
    }

    function addPublisher(uint256 tokenId, address account) external {
        require(
            brands[tokenId].operatorRole[_msgSender()],
            "You are not the brand operator"
        );
        brands[tokenId].publisherRole[account] = true;
        emit BrandPublisherAdded(tokenId, account);
    }

    function revokeAdmin(uint256 tokenId, address account) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        brands[tokenId].adminRole[account] = false;
        emit BrandAdminRevoked(tokenId, account);
    }

    function revokeOperator(uint256 tokenId, address account) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        brands[tokenId].operatorRole[account] = false;
        emit BrandOperatorRevoked(tokenId, account);
    }

    function revokePublisher(uint256 tokenId, address account) external {
        require(
            brands[tokenId].operatorRole[_msgSender()],
            "You are not the brand operator"
        );
        brands[tokenId].publisherRole[account] = false;
        emit BrandPublisherRevoked(tokenId, account);
    }

    function setTokenURI(uint256 tokenId, string memory uri) external {
        require(
            brands[tokenId].operatorRole[_msgSender()],
            "You are not the brand operator"
        );
        brands[tokenId].metadata = uri;
        emit BrandMetadataUpdated(tokenId, uri);
    }

    function deleteBrand(uint256 tokenId) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        _burn(tokenId);
        emit BrandDeleted(tokenId);
    }

    /// @dev Sets the payout address.
    /// @param _payoutAddress The new address to receive funds from multiple contracts.
    /// @notice Only the admin can set the payout address.
    function setPayoutAddress(
        uint256 tokenId,
        address _payoutAddress
    ) external {
        require(
            brands[tokenId].adminRole[_msgSender()],
            "You are not the brand admin"
        );
        brands[tokenId].payoutAddress = _payoutAddress;
        emit PayoutAddressUpdated(tokenId, _payoutAddress);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return brands[tokenId].metadata;
    }

    /**
     * @notice Retrieves the payout address defined by the admin.
     * @return The payout address for receiving funds.
     */

    function getPayoutAddress(uint256 tokenId) external view returns (address) {
        return brands[tokenId].payoutAddress;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            brands[tokenId].adminRole[to] = true;
            brands[tokenId].operatorRole[to] = true;
            brands[tokenId].publisherRole[to] = true;
            brands[tokenId].adminRole[from] = false;
        }
        return super._update(to, tokenId, auth);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
