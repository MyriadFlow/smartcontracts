// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

///Storefront -> ADMIN,CREATOR AND OPERATOR

/**
 * @dev This Contract Module helps to deploy the
 * base Roles for the other flow contracts .
 * Every other Flow contract will retrieve the roles of the
 * ADMIN, OPERATOR, CREATOR, etc. from this.
 */
contract FlowAccessControl is AccessControlEnumerable {
    bytes32 public constant FLOW_ADMIN_ROLE = keccak256("FLOW_ADMIN_ROLE");
    bytes32 public constant FLOW_OPERATOR_ROLE =
        keccak256("FLOW_OPERATOR_ROLE");
    bytes32 public constant FLOW_CREATOR_ROLE = keccak256("FLOW_CREATOR_ROLE");

    constructor() {
        _setupRole(FLOW_ADMIN_ROLE, _msgSender());

        _setRoleAdmin(FLOW_ADMIN_ROLE, FLOW_ADMIN_ROLE);
        _setRoleAdmin(FLOW_OPERATOR_ROLE, FLOW_ADMIN_ROLE);
        _setRoleAdmin(FLOW_CREATOR_ROLE, FLOW_OPERATOR_ROLE);

        // add Admin to operator and Creator
        grantRole(FLOW_OPERATOR_ROLE, _msgSender());
        grantRole(FLOW_CREATOR_ROLE, _msgSender());
    }

    /// @dev to check if the address {User} is the ADMIN
    function isAdmin(address user) external view returns (bool) {
        return hasRole(FLOW_ADMIN_ROLE, user);
    }

    /// @dev to check if the address {User} is the OPERATOR
    function isOperator(address user) external view returns (bool) {
        return hasRole(FLOW_OPERATOR_ROLE, user);
    }

    /// @dev to check if the address {User} is the OPERATOR
    function isCreator(address user) external view returns (bool) {
        return hasRole(FLOW_CREATOR_ROLE, user);
    }
}
