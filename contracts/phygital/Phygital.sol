// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../accessmaster/interfaces/IAccessMaster.sol";

/// @title Phygital: A Smart Contract for Managing Phygital Assets with ERC721 Tokens
/**
 * @dev This contract manages phygital (physical + digital) assets through NFTs. It supports minting, renting,
 * and tracking of physical items' digital representations. The contract integrates ERC721 for efficient
 * ERC2981 for royalty management.
 * It allows for the immutable registration of NFC IDs to NFTs, ensuring a unique and verifiable link
 * between a physical item and its digital counterpart.
 */
interface IVault {
    function getFeePercentage(address _user) external view returns (uint256);
}

contract Phygital is Context, ERC721, ERC2981, ReentrancyGuard {
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
    address public immutable vaultAddress;

    uint256 public immutable MAX_SUPPLY;

    using Strings for uint256;

    uint8 public constant version = 2;

    uint256 public nftPrice;
    uint256 public Counter;
    uint256 public publicPrice;
    uint256 public launchTime;
    bool public isCancelled;
    WhitelistInfo public whitelistInfo;

    /// modified this
    enum ItemStatus {
        DESTROYED,
        DAMAGED,
        REPAIRED,
        OWNED,
        MANUFACTURED,
        LOST
    }

    struct PhygitalInfo {
        uint256 registerTime;
        bytes phygitalId;
        ItemStatus status;
    }
    struct WhitelistInfo {
        // If whitelist is not started , public sale wont happen
        uint256 startTime;
        // Unless the Whitelist end , public sale wont happen
        uint256 endTime;
        // whitelist price
        uint256 whitelistPrice;
        // total allocation for whitelist in MAX SUPPLY
        uint256 allocation;
        // Total Whitelist Sales
        uint256 totalWhitelistSales;
        // mapping of whitelisted addresses
        mapping(address => bool) whitelist;
    }

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Mapping from token ID to its phygital asset information
    /// @dev Stores the registration time, NFC ID and current status for each token
    mapping(uint256 => PhygitalInfo) public phygitalAssets;

    /// @notice Mapping to track used phygital IDs
    /// @dev Used to ensure each physical item's NFC ID is only registered once
    /// @return bool True if the phygital ID has already been registered
    mapping(bytes => bool) public phygitalIdCheck;

    IACCESSMASTER flowRoles;
    IVault vault;

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "Phygital: User is not authorized "
        );
        _;
    }

    modifier onlyWhitelisted() {
        require(
            whitelistInfo.whitelist[_msgSender()],
            "Phygital: Address not whitelisted"
        );
        require(
            block.timestamp >= whitelistInfo.startTime &&
                block.timestamp <= whitelistInfo.endTime,
            "Phygital: Minting not active"
        );
        require(
            whitelistInfo.allocation > 0,
            "Phygital: No allocation remaining"
        );
        _;
    }

    event PhygitalAssetCreated(
        uint256 tokenID,
        address indexed creator,
        string metaDataURI
    );

    event PhygitalAssetDestroyed(uint indexed tokenId, address ownerOrApproved);

    event FundTransferred(
        address sender,
        address reciepient,
        uint256 tokenId,
        uint256 amount
    );

    event UpdateAssetStatus(address user, ItemStatus assetStatus, uint256 time);

    event WhitelistUpdated(address indexed user, bool isWhitelisted);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256[] memory whitelistValues,
        uint256 _publicPrice,
        uint256 _launchTime,
        address accessControlAddress,
        address _vaultAddress
    ) ERC721(name, symbol) {
        MAX_SUPPLY = _maxSupply;
        require(
            whitelistValues.length == 4,
            "Phygital: Invalid whitelist values"
        );
        whitelistInfo.startTime = whitelistValues[0];
        whitelistInfo.endTime = whitelistValues[1];
        whitelistInfo.whitelistPrice = whitelistValues[2];
        require(
            whitelistValues[3] <= 100,
            "Phygital: Allocation cannot exceed 100%"
        );
        whitelistInfo.allocation = whitelistValues[3];
        publicPrice = _publicPrice;
        flowRoles = IACCESSMASTER(accessControlAddress);
        launchTime = _launchTime;
        vaultAddress = _vaultAddress;
        vault = IVault(_vaultAddress);
    }

    ///  We should take fee from the vault address,
    function _transferFunds(uint256 value) private nonReentrant {
        uint256 fee = (value * vault.getFeePercentage(address(this))) / 100;
        uint256 creatorAmount = value - fee;
        // Transfer payment to MyriadFlow
        (bool success, ) = vaultAddress.call{value: fee}("");
        require(success, "Payment transfer failed");

        address creator = flowRoles.getPayoutAddress();
        (bool success2, ) = creator.call{value: creatorAmount}("");
        require(success2, "Payment transfer failed");
    }

    function setWhitelist(address user) external onlyOperator {
        whitelistInfo.whitelist[user] = true;
        emit WhitelistUpdated(user, true);
    }

    function cancelSale() external onlyOperator {
        isCancelled = true;
    }

    function updateWhitelistInfo(
        uint8 option,
        uint256 startTime,
        uint256 endTime,
        uint256 allocation,
        address user
    ) external onlyOperator {
        if (option == 1) {
            require(
                whitelistInfo.startTime < block.timestamp,
                "Whitelist minting already starterd!"
            );
            whitelistInfo.startTime = startTime;
        }
        if (option == 2) {
            require(
                whitelistInfo.endTime < block.timestamp,
                "Whitelist minting already over!"
            );
            whitelistInfo.endTime = endTime;
        }
        if (option == 3) {
            whitelistInfo.allocation = allocation;
        }
        if (option == 4) {
            whitelistInfo.whitelist[user] = false;
        }
    }

    function setItemStatus(uint256 tokenId, ItemStatus _status) external {
        require(
            flowRoles.isOperator(_msgSender()) ||
                ownerOf(tokenId) == _msgSender(),
            "Phygital: User is not authorised!"
        );

        phygitalAssets[tokenId].status = _status;

        emit UpdateAssetStatus(_msgSender(), _status, block.timestamp);
    }

    /// ONLY CALLED BY WHITELIST ,
    function buyAssetWhitelist(
        string memory metadataURI,
        uint96 royaltyPercentBasisPoint,
        bytes memory _phygitalID
    ) public payable onlyWhitelisted returns (uint256) {
        /// PUT CANCEL Status here.
        require(!isCancelled, "Sale is cancelled");
        require(
            msg.value >= whitelistInfo.whitelistPrice,
            "Insufficient payment"
        );
        require(!phygitalIdCheck[_phygitalID], "Tag is already stored!");
        require(Counter <= MAX_SUPPLY, "Max supply reached");

        uint totalsale = whitelistInfo.totalWhitelistSales;
        uint allocationInNumber = (MAX_SUPPLY * whitelistInfo.allocation) / 100;
        require(totalsale <= allocationInNumber, "No allocation remaining");

        Counter++;
        uint256 currentTokenID = Counter;

        phygitalAssets[currentTokenID] = PhygitalInfo(
            block.timestamp,
            _phygitalID,
            ItemStatus.OWNED
        );

        _safeMint(_msgSender(), currentTokenID);
        _setTokenURI(currentTokenID, metadataURI);

        whitelistInfo.totalWhitelistSales++;
        phygitalIdCheck[_phygitalID] = true;

        require(
            royaltyPercentBasisPoint <= 1000,
            "Royalty can't be more than 10%"
        );
        _setTokenRoyalty(
            currentTokenID,
            _msgSender(),
            royaltyPercentBasisPoint
        );
        _transferFunds(msg.value);
        emit PhygitalAssetCreated(currentTokenID, _msgSender(), metadataURI);
        return currentTokenID;
    }

    function buyAsset(
        address buyer,
        string memory metadataURI,
        uint96 royaltyPercentBasisPoint,
        bytes memory _phygitalID
    ) public payable returns (uint256) {
        if (!flowRoles.isOperator(_msgSender())) {
            require(block.timestamp >= launchTime, "Minting not active");
            require(msg.value >= publicPrice, "Insufficient payment");
        }
        require(!isCancelled, "Sale is cancelled");
        require(!phygitalIdCheck[_phygitalID], "Tag is already stored!");
        require(Counter <= MAX_SUPPLY, "Max supply reached");
        Counter++;
        uint256 currentTokenID = Counter;
        phygitalAssets[currentTokenID] = PhygitalInfo(
            block.timestamp,
            _phygitalID,
            ItemStatus.OWNED
        );
        phygitalIdCheck[_phygitalID] = true;
        _safeMint(buyer, currentTokenID);
        _setTokenURI(currentTokenID, metadataURI);
        require(
            royaltyPercentBasisPoint <= 1000,
            "Phygital: Royalty can't be more than 10%"
        );
        _setTokenRoyalty(
            currentTokenID,
            _msgSender(),
            royaltyPercentBasisPoint
        );

        emit PhygitalAssetCreated(currentTokenID, _msgSender(), metadataURI);
        return currentTokenID;
    }

    /**
     * @notice Burns `tokenId`. See {ERC721-_burn}.
     *
     * @dev Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function destroyAsset(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == _msgSender() ||
                flowRoles.isOperator(_msgSender()),
            "Phygital: Caller is not token owner or approved"
        );
        require(
            phygitalAssets[tokenId].status == ItemStatus.DESTROYED,
            "Phygital: Cannot be burned"
        );
        _burn(tokenId);
        emit PhygitalAssetDestroyed(tokenId, _msgSender());
        _resetTokenRoyalty(tokenId);
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) internal virtual {
        require(
            _requireOwned(tokenId) == _msgSender(),
            "Phygital: Non-Existent Asset"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _requireOwned(tokenId) == _msgSender(),
            "SignatureSeries: Non-Existent Asset"
        );
        string memory _tokenURI = _tokenURIs[tokenId];

        return _tokenURI;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        return super.supportsInterface(interfaceId);
    }
}
