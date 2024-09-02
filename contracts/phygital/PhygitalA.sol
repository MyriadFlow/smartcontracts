// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "../accessmaster/interfaces/IAccessMaster.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../common/ERC721A/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @title PhygitalA: A Smart Contract for Managing Phygital Assets with ERC721 Tokens
/**
 * @dev This contract manages phygital (physical + digital) assets through NFTs. It supports minting, renting,
 * and tracking of physical items' digital representations. The contract integrates ERC721A for efficient
 * batch minting, ERC2981 for royalty management, and IERC4907 for rentable NFTs.
 * It allows for the immutable registration of NFC IDs to NFTs, ensuring a unique and verifiable link
 * between a physical item and its digital counterpart.
 */
contract PhygitalA is Context, ERC2981, ERC721A, ERC721ABurnable {
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    // IMMUTABLE & CONSTANTS VARIABLES
    uint256 public immutable maxSupply;
    uint8 public constant version = 1;

    // PUBLIC && PRIVATE VARIABLES
    string private baseURL;
    bool public isRevealed;
    uint256 public nftPrice;
    uint16 public maxMint; /// @notice how many can be minted by a wallet
    address public tradeHub;
    address public accessMasterAddress;

    enum ItemStatus {
        DESTROYED,
        DAMAGED,
        REPAIRED,
        RESALE,
        REGISTERED
    }

    struct PhygitalInfo {
        uint256 registerTime; ///< Timestamp of registration
        bytes phygitalId; ///< Unique NFC ID of the physical item
        ItemStatus status; ///< Current status of the item
    }

    struct RentableItems {
        bool isRentable; //to check is renting is available
        address user; // address of user role
        uint64 expires; // unix timestamp, user expires
        uint256 hourlyRate; // amountPerHour
    }

    ///@dev storing the data of the user who are renting the NFT
    mapping(uint256 => RentableItems) public rentables;

    mapping(uint256 => string) private _tokenURIs;

    ///< Mapping of tokenIds to their phygital information
    mapping(uint256 => PhygitalInfo) public phygitalAssets;

    /// @notice Ensures NFC IDs are unique
    mapping(bytes => bool) public phygitalIdCheck;

    mapping(address => uint) public userBalance;

    // INTERFACES
    IACCESSMASTER flowRoles;
    IERC20 token;

    modifier onlyAdnin() {
        require(
            flowRoles.isAdmin(_msgSender()),
            "PhygitalA: User is not authorized"
        );
        _;
    }

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "PhygitalA: User is not authorized"
        );
        _;
    }

    modifier onlyOwnerOrOperator(uint256 tokenId) {
        require(
            ownerOf(tokenId) == _msgSender() ||
                flowRoles.isOperator(_msgSender()),
            "PhygitalA:User is not owner or operator"
        );
        _;
    }

    event PhygitalAAssetCreated(
        uint256 currentIndex,
        uint256 quantity,
        address indexed creator
    );

    event PhygitalAAssetDestroyed(
        uint indexed tokenId,
        address ownerOrApproved
    );

    event FundTransferred(address sender, address reciepient, uint256 amount);

    event UpdateAssetStatus(
        address user,
        uint256 tokenId,
        ItemStatus assetStatus,
        uint256 time
    );

    event UpdateAssetPrice(address user, uint256 updatedPrice);

    event UpdateAssetMaxMint(address user, uint256 updatedMaxMint);

    event AssetRegistered(
        address user,
        uint256 tokenId,
        bytes uuid,
        uint256 time
    );

    /**
     * contract details :-
     * 1. NFT PRICE.
     * 2. maxsupply for the token.
     * 3.roytaltybps points.
     * 4. maxmint , is the number tokens can be minted
     * by any wallet address .
     *
     */
    constructor(
        string memory name,
        string memory symbol,
        address tradeHubAddress,
        address accessControlAddress,
        address _tokenAddr,
        uint256[] memory contractDetails,
        string memory _baseUri
    ) ERC721A(name, symbol) {
        flowRoles = IACCESSMASTER(accessControlAddress);
        tradeHub = tradeHubAddress;
        token = IERC20(_tokenAddr);
        require(contractDetails.length == 4, "Phygital: Invalid Input!");
        nftPrice = contractDetails[0];
        maxSupply = contractDetails[1];
        // SET DEFAULT ROYALTY
        _setDefaultRoyalty(_msgSender(), uint96(contractDetails[2]));
        maxMint = uint16(contractDetails[3]);
        baseURL = _baseUri;
        accessMasterAddress = accessControlAddress;
    }

    function setNFTPrice(uint256 amount) external onlyOperator {
        nftPrice = amount;
        emit UpdateAssetPrice(_msgSender(), amount);
    }

    function setMaxMint(uint16 amount) external onlyOperator {
        maxMint = amount;
        emit UpdateAssetMaxMint(_msgSender(), amount);
    }

    function setItemStatus(
        uint256 tokenId,
        ItemStatus _status
    ) external onlyOwnerOrOperator(tokenId) {
        phygitalAssets[tokenId].status = _status;
        emit UpdateAssetStatus(_msgSender(), tokenId, _status, block.timestamp);
    }

    /// @dev to transfer ERC20/Native token Funds from one address to another
    function _transferFunds(
        address from,
        address to,
        uint256 amount,
        bool isNative
    ) private {
        bool success;
        if (isNative) {
            (success, ) = payable(to).call{value: amount}("");
        } else {
            success = token.transferFrom(from, to, amount);
        }

        require(success, "PhygitalA: Transfer failed");

        emit FundTransferred(from, to, amount);
    }

    /**
     * @dev Mints `quantity` number of new NFTs to the caller's address, provided they meet the specified requirements.
     * The function checks if the caller has enough ERC20 tokens for the minting fee, adheres to the max mint limit per wallet,
     * and if the total minted NFTs would not exceed the contract's max supply. It transfers the minting fee from the caller
     * to the payout address and mints the NFTs. The function then sets the trade hub as an approved operator for these NFTs,
     * facilitating further trading operations. Emits a `PhygitalAAssetCreated` event upon successful minting.
     *
     * Requirements:
     * - The caller must have a sufficient balance of ERC20 tokens to cover the minting fee.
     * - The quantity to mint must not exceed the per-wallet `maxMint` limit unless `maxMint` is set to 0 (indicating no limit).
     * - The total supply of minted NFTs after the operation must not exceed the `maxSupply` of the contract.
     *
     * @param quantity The number of NFTs the caller wishes to mint.
     * @return prevQuantity The total number of NFTs minted in the contract before this minting operation.
     * @return newQuantity The number of NFTs successfully minted in this operation.
     */
    function mint(uint256 quantity) external returns (uint256, uint256) {
        uint prevQuantity = _totalMinted();
        uint256 afterMintReserves = userBalance[_msgSender()] + quantity;

        if (maxMint != 0) {
            require(
                afterMintReserves <= maxMint,
                "PhygitalA: Quantity should be less than max mint"
            );
        }
        require(
            _totalMinted() + quantity <= maxSupply,
            "PhygitalA: Exceeding max token supply!"
        );
        // require(
        //     token.balanceOf(_msgSender()) >= calculateRequiredPrice(quantity),
        //     "PhygitalA: Not enough funds!"
        // );
        address recipient = flowRoles.getPayoutAddress();

        _transferFunds(
            _msgSender(),
            recipient,
            calculateRequiredPrice(quantity),
            false
        );

        userBalance[_msgSender()] += quantity;

        _safeMint(_msgSender(), quantity);
        setApprovalForAll(tradeHub, true);

        emit PhygitalAAssetCreated(_totalMinted(), quantity, _msgSender());
        return (prevQuantity, quantity);
    }

    /// @dev Allows operators to mint tokens on behalf of other addresses.
    function delegateMint(
        address reciever,
        uint256 quantity
    ) external onlyOperator returns (uint256, uint256) {
        uint prevQuantity = _totalMinted();
        require(
            quantity <= maxMint || maxMint == 0,
            "Phygital: Quantity should be less than max mint"
        );
        require(
            _totalMinted() + quantity <= maxSupply,
            "PhygitalA: Exceeding max token supply!"
        );

        _safeMint(reciever, quantity);
        setApprovalForAll(tradeHub, true);

        emit PhygitalAAssetCreated(_totalMinted(), quantity, _msgSender());
        return (prevQuantity, quantity);
    }

    /// @dev Registers a phygital asset's NFC ID to a tokenId.
    function registerAssetId(
        uint256 tokenId,
        bytes memory _phygitalID
    ) external onlyOwnerOrOperator(tokenId) {
        require(_exists(tokenId), "PhygitalA: Token does not exists");
        require(
            !phygitalIdCheck[_phygitalID] &&
                phygitalAssets[tokenId].registerTime == 0,
            "PhygitalA: NFC Tag is already stored!"
        );

        phygitalAssets[tokenId] = PhygitalInfo(
            block.timestamp,
            _phygitalID,
            ItemStatus.REGISTERED
        );

        phygitalIdCheck[_phygitalID] = true;

        emit AssetRegistered(
            _msgSender(),
            tokenId,
            _phygitalID,
            block.timestamp
        );
    }

    function reveal(string memory uri) external onlyAdnin {
        require(isRevealed == false, "Collection is already revealed!");
        isRevealed = true;
        baseURL = uri;
    }

    /**
     * @notice Burns `tokenId`. See {ERC721-_burn}.
     *
     * @dev Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burnAsset(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == _msgSender(),
            "PhygitalA: User is not asset owner!"
        );
        require(
            phygitalAssets[tokenId].status == ItemStatus.DESTROYED,
            "PhygitalA: Asset cannot be destroyed!"
        );
        _burn(tokenId, true);
        _resetTokenRoyalty(tokenId);
        emit PhygitalAAssetDestroyed(tokenId, _msgSender());
    }

    /** Getter Functions **/

    /////////////////////////////////////////////////

    function calculateRequiredPrice(
        uint256 quantity
    ) public view returns (uint256 amount) {
        amount = quantity * nftPrice;
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(IERC721A, ERC721A) returns (string memory) {
        if (!_exists(tokenId)) _revert(URIQueryForNonexistentToken.selector);
        string memory baseURI = _baseURI();
        if (isRevealed) {
            return _baseURI();
        }
        return
            bytes(baseURI).length != 0
                ? string(abi.encodePacked(baseURI, _toString(tokenId)))
                : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURL;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC721A, ERC721A, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        return super.supportsInterface(interfaceId);
    }
}
