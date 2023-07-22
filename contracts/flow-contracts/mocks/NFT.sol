// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFT is ERC721Enumerable {
    uint256 public counter = 0;

    constructor() ERC721("MY TOKEN", "MTK") {}

    function mintNFT(address to) external returns (uint256) {
        counter++;
        _safeMint(to, counter);
        return counter;
    }

    function transferAsset(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId);
    }
}
