// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./Bytecode.sol";
import "./interface/IERC6551Account.sol";

contract CyberMaven is
    IERC165,
    IERC1271,
    IERC6551Account,
    Context,
    ERC721Holder,
    ERC1155Holder
{
    string public name = "CyberMaven Wallet";
    string public symbol = "CMW";
    uint8 public version = 1;
    uint256 private _nounce;

    event ECR6551ERC20Transfer(
        address indexed contractAddress,
        address indexed to,
        uint256 indexed amount
    );
    event ERC6551ERC20Approve(
        address indexed contractAddress,
        address indexed spender,
        uint256 indexed amount
    );

    event ECR6551ERC721SafeTransferFrom(
        address indexed contractAddress,
        address indexed to,
        uint256 indexed tokenId
    );
    event ECR6551ERC721Transfer(
        address indexed contractAddress,
        address indexed to,
        uint256 indexed tokenId
    );
    event ERC6551ERC721Approve(
        address indexed contractAddress,
        address indexed to,
        uint256 indexed tokenId
    );
    event ERC6551ERC721SetApprovalForAll(
        address indexed contractAddress,
        address indexed to,
        bool indexed check
    );

    event ECR6551ERC1155Transfer(
        address contractAddress,
        address indexed to,
        uint256 indexed id,
        uint256 indexed amount
    );
    event ERC6551ERC1155SetApprovalForAll(
        address indexed contractAddress,
        address indexed operator,
        bool indexed approved
    );

    modifier onlyOwner() {
        require(msg.sender == owner(), "CyberMaven: Not token owner");
        _;
    }

    receive() external payable {}

    function setWalletName(string memory _name) external onlyOwner {
        name = _name;
    }

    function setWalletSymbol(string memory _symbol) external onlyOwner {
        symbol = _symbol;
    }

    function token()
        external
        view
        returns (uint256 chainId, address tokenContract, uint256 tokenId)
    {
        uint256 length = address(this).code.length;
        return
            abi.decode(
                Bytecode.codeAt(address(this), length - 0x60, length),
                (uint256, address, uint256)
            );
    }

    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this
            .token();
        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    /************************ Utility Functions **********************************/

    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable onlyOwner returns (bytes memory result) {
        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
        _nounce++;
    }
    // Put Getter

    function getValueFromMyContract(
        address contractAddr,
        bytes calldata data
    ) external view returns (bytes memory) {
        // Call the getter function on the contract.
        (bool success, bytes memory output) = contractAddr.staticcall(data);
        require(success, "CyberMaven : Contract call failed");

        return output;
    }

    function callSetter(
        address contractAddress,
        bytes calldata payload
    ) external payable onlyOwner returns (bytes memory) {
        (bool success, bytes memory _data) = contractAddress.call{
            value: msg.value
        }(payload);
        require(success, "CyberMaven : Contract call failed");
        return _data;
    }

    /**************************  ERC20 ***********************************/

    function erc20Transfer(
        address contractAddr,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(contractAddr).transfer(to, amount);
        emit ECR6551ERC20Transfer(contractAddr, to, amount);
    }

    function erc20Approve(
        address contractAddr,
        address spender,
        uint256 amount
    ) external onlyOwner {
        IERC20(contractAddr).approve(spender, amount);
        emit ERC6551ERC20Approve(contractAddr, spender, amount);
    }

    /**************************  ERC721 ***********************************/

    function erc721SafeTransferFrom(
        address contractAddr,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        IERC721(contractAddr).safeTransferFrom(address(this), to, tokenId);
        emit ECR6551ERC721SafeTransferFrom(contractAddr, to, tokenId);
    }

    function erc721Transfer(
        address contractAddr,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        IERC721(contractAddr).transferFrom(address(this), to, tokenId);
        emit ECR6551ERC721Transfer(contractAddr, to, tokenId);
    }

    function erc721Approve(
        address contractAddr,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        IERC721(contractAddr).approve(to, tokenId);
        emit ERC6551ERC721Approve(contractAddr, to, tokenId);
    }

    function erc721setApprovalForAll(
        address contractAddr,
        address to,
        bool approved
    ) external onlyOwner {
        IERC721(contractAddr).setApprovalForAll(to, approved);
        emit ERC6551ERC721SetApprovalForAll(contractAddr, to, approved);
    }

    /**************************  ERC1155 ***********************************/
    function erc1155SafeTransferFrom(
        address contractAddr,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external onlyOwner {
        IERC1155(contractAddr).safeTransferFrom(
            address(this),
            to,
            id,
            amount,
            data
        );
        emit ECR6551ERC1155Transfer(contractAddr, to, id, amount);
    }

    function erc1155setApprovalForAll(
        address contractAddr,
        address operator,
        bool approved
    ) external onlyOwner {
        IERC1155(contractAddr).setApprovalForAll(operator, approved);
        emit ERC6551ERC1155SetApprovalForAll(contractAddr, operator, approved);
    }

    /************************* PURE/VIEW Functions **********************************************/
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4 magicValue) {
        bool isValid = SignatureChecker.isValidSignatureNow(
            owner(),
            hash,
            signature
        );

        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }

        return "";
    }

    function nonce() external view returns (uint256) {
        return _nounce;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC1155Receiver) returns (bool) {
        if (
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC6551Account).interfaceId
        ) return true;
        return super.supportsInterface(interfaceId);
    }
}
