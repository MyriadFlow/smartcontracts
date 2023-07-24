// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract SFT is ERC1155 {
    uint256 public counter = 0;

    constructor() ERC1155("www.xyz.com") {}

    function mintSFT(address to, uint256 amount) external {
        counter++;
        _mint(to, counter, amount, "");
    }
}
