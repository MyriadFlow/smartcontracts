// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./interface/IERC6551Registry.sol";

/// @title Users can create there own smart contract Wallet or Token Bound Account
/**
 * @dev {ERC1167} token, including:
 *
 *  - ability for holders to create a token bound account  for a specific tokenId in NFT contract
 *  - ability for holders to compute Address
 *
 */

/// CYBERMAVEN REGISTRY

error InitializationFailed();

contract CyberMavenRegistry is IERC6551Registry, Context {
    string public name = "CyberMavenRegistry";
    uint256 public counter = 0;
    address private implementationContract;
    address private owner;
    uint8 public version = 1;

    struct AccountInfo {
        address tokenAddress;
        uint256 tokenId;
        address walletAccount;
    }

    ///@dev for users to fetch there wallet details
    mapping(address => mapping(uint256 => AccountInfo)) public userAccount;
    ///@dev number of wallets created by an user
    mapping(address => uint256) public userBalance;
    /// @dev data of the every wallet created
    mapping(uint256 => AccountInfo) public accounts;

    constructor(address contractAddr) {
        implementationContract = contractAddr;
        owner = _msgSender();
    }

    /// @notice to change the implementation contract only by owner
    /// @param contractAddr is address
    function setImplementation(address contractAddr) external {
        require(owner == _msgSender(), "AccountRegistry : Not owner!");
        implementationContract = contractAddr;
    }

    ///@notice create a token bound account
    function intiateWallet(
        address tokenContract,
        uint256 tokenId,
        bytes calldata init
    ) external {
        bytes memory encodedTokenData = abi.encode(
            block.chainid,
            tokenContract,
            tokenId
        );
        bytes32 salt = keccak256(encodedTokenData);
        createAccount(
            implementationContract,
            block.chainid,
            tokenContract,
            tokenId,
            uint256(salt),
            init
        );
    }

    /**
     *
     * @param implementation is the address of the contract which would be replicated
     * @param chainId  is the chainId of the current network
     * @param tokenContract is the nft contract Address
     * @param tokenId  is the tokenId which will be made to an token bound account
     * @param salt is any random number
     * @param initData is the bytes for the constructor of an contract
     */
    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes memory initData
    ) public returns (address) {
        bytes memory code = _creationCode(
            implementation,
            chainId,
            tokenContract,
            tokenId,
            salt
        );
        address _account = Create2.computeAddress(
            bytes32(salt),
            keccak256(code)
        );
        _account = Create2.deploy(0, bytes32(salt), code);
        if (initData.length != 0) {
            (bool success, ) = _account.call(initData);
            if (!success) revert InitializationFailed();
        }
        counter++;
        userAccount[_msgSender()][counter] = AccountInfo(
            tokenContract,
            tokenId,
            _account
        );
        userBalance[_msgSender()] = counter;
        accounts[counter] = AccountInfo(tokenContract, tokenId, _account);

        emit AccountCreated(
            _account,
            implementation,
            chainId,
            tokenContract,
            tokenId,
            salt
        );
        return _account;
    }

    function account(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view returns (address) {
        bytes32 bytecodeHash = keccak256(
            _creationCode(implementation, chainId, tokenContract, tokenId, salt)
        );

        return Create2.computeAddress(bytes32(salt), bytecodeHash);
    }

    function _creationCode(
        address implementation_,
        uint256 chainId_,
        address tokenContract_,
        uint256 tokenId_,
        uint256 salt_
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                hex"3d60ad80600a3d3981f3363d3d373d3d3d363d73",
                implementation_,
                hex"5af43d82803e903d91602b57fd5bf3",
                abi.encode(salt_, chainId_, tokenContract_, tokenId_)
            );
    }
}
