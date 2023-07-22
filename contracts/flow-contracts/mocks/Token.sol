// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("MY TOKEN", "MTK") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    function mintToken(address to, uint256 amount) external {
        _mint(to, amount * 10 ** decimals());
    }
}
