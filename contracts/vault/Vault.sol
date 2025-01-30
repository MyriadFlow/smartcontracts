// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./accessmaster/interfaces/IAccessMaster.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract Vault is Context {
    IACCESSMASTER public accessMaster;
    mapping(address => uint256) public feePercentage;

    modifier onlyAuthorizedUser() {
        require(accessMaster.isOperator(_msgSender()), "Unauthorized User");
        _;
    }

    constructor(address _accessMaster) {
        accessMaster = IACCESSMASTER(_accessMaster);
    }

    function withdraw(uint256 amount) external {
        require(
            accessMaster.getPayoutAddress() == _msgSender(),
            "Unauthorized User"
        );
        payable(_msgSender()).transfer(amount);
    }

    function setFeePercentage(address _user, uint256 _percentage) public {
        feePercentage[_user] = _percentage;
    }

    function getFeePercentage(address _user) public view returns (uint256) {
        return feePercentage[_user];
    }
}
