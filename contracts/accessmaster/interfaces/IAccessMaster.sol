// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @dev External interface of AccessMaster declared to support ERC165 detection.
 */
interface IACCESSMASTER {
    /// @dev checks if the address {User} is Admin or not.
    function isAdmin(address user) external view returns (bool);

    /// @dev checks if the address {User} is Operator or not.
    function isOperator(address user) external view returns (bool);

    /// @dev checks if the address {User} is creator or not.
    function isCreator(address user) external view returns (bool);

    /**
     * @notice Retrieves the payout address defined by the admin.
     * @return The payout address for receiving funds.
     */
    function getPayoutAddress() external view  returns (address);

}
