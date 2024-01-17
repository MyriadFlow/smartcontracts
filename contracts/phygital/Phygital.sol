// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "../common/interface/IERC4907.sol";
import "../accessmaster/interfaces/IAccessMaster.sol";

/**
 * @dev {ERC721} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a creator role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *  - token ID and URI autogeneration
 *  - ability for holders to give for rent (4907)
 *  - royalty is present (2981)
 *  - Lazy Minting is present
 *
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the creator and pauser
 * roles, as well as the default admin role, which will let it grant both creator
 * and pauser roles to other accounts.
 */
contract Phygital is Context, ERC721Enumerable, ERC2981, IERC4907 {
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    using Strings for uint256;

    address public tradeHub;
    address public accessMasterAddress;

    uint8 public version = 1;

    uint256 public nftPrice;
    uint256 public Counter;

    struct LazyNFTVoucher {
        uint256 price;
        string uri;
        bytes signature;
    }

    struct RentableItems {
        bool isRentable; //to check is renting is available
        address user; // address of user role
        uint64 expires; // unix timestamp, user expires
        uint256 hourlyRate; // amountPerHour
    }

    ///@dev storing the data of the user who are renting the NFT
    mapping(uint256 => RentableItems) public rentables;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    mapping(uint256 => bytes5) public nfcId;

    mapping(bytes5 => bool) public nfcCheck;

    IACCESSMASTER flowRoles;

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "Phygital: User is not authorized "
        );
        _;
    }

    modifier onlyCreator() {
        require(
            flowRoles.isCreator(_msgSender()),
            "Phygital: User is not authorized"
        );
        _;
    }

    event PhygitalAssetCreated(
        uint256 tokenID,
        address indexed creator,
        string metaDataURI
    );
    event PhygitalAssetDestroyed(uint indexed tokenId, address ownerOrApproved);
    event RentalInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 price,
        address indexed renter
    );

    event FundTransferred(
        address sender,
        address reciepient,
        uint256 tokenId,
        uint256 amount
    );

    /**
     * @dev Grants `FLOW_ADMIN_ROLE`, `FLOW_CREATOR_ROLE` and `FLOW_OPERATOR_ROLE` to the
     * account that deploys the contract.
     *
     * Token URIs will be autogenerated based on `baseURI` and their token IDs.
     * See {ERC721-tokenURI}.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 _nftPrice,
        address tradeHubAddress,
        address flowContract
    ) ERC721(name, symbol) {
        flowRoles = IACCESSMASTER(flowContract);
        tradeHub = tradeHubAddress;
        accessMasterAddress = flowContract;
        nftPrice = _nftPrice;
    }

    /// @notice transferring funds
    function _transferFunds(
        address sender,
        address recipient,
        uint256 tokenId,
        uint256 amount
    ) private {
        // get the balance of the contract
        (bool callSuccess, ) = payable(recipient).call{value: amount}("");
        require(callSuccess, "Phygital: Transfer failed");
        emit FundTransferred(sender, recipient, tokenId, amount);
    }

    function setNftPrice(uint256 _nftPrice) external onlyOperator {
        nftPrice = _nftPrice;
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_safeMint}.
     *
     * Requirements:
     *
     * - the caller must have the `FLOW_CREATOR_ROLE`.
     */
    function createAsset(
        string memory metadataURI,
        uint96 royaltyPercentBasisPoint,
        bytes5 _nfcId
    ) public returns (uint256) {
        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        require(!nfcCheck[_nfcId], "Phygital: NFC Tag is already stored!");
        Counter++;
        uint256 currentTokenID = Counter;

        nfcId[currentTokenID] = _nfcId;
        nfcCheck[_nfcId] = true;

        _safeMint(_msgSender(), currentTokenID);
        _setTokenURI(currentTokenID, metadataURI);
        // Set royalty Info
        require(
            royaltyPercentBasisPoint <= 1000,
            "Phygital: Royalty can't be more than 10%"
        );
        _setTokenRoyalty(
            currentTokenID,
            _msgSender(),
            royaltyPercentBasisPoint
        );
        // Approve tradeHub to transfer NFTs
        setApprovalForAll(tradeHub, true);

        emit PhygitalAssetCreated(currentTokenID, _msgSender(), metadataURI);
        return currentTokenID;
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_safeMint}.
     *
     * Requirements:
     *
     * - the caller must have the `FLOW_CREATOR_ROLE`.
     */
    function delegateAssetCreation(
        address creator,
        string memory metadataURI,
        uint96 royaltyPercentBasisPoint,
        bytes5 _nfcId
    ) public onlyOperator returns (uint256) {
        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        require(!nfcCheck[_nfcId], "Phygital: NFC Tag is already stored!");
        Counter++;
        uint256 currentTokenID = Counter;

        nfcId[currentTokenID] = _nfcId;
        nfcCheck[_nfcId] = true;

        _safeMint(creator, currentTokenID);
        _setTokenURI(currentTokenID, metadataURI);

        // Set royalty Info
        require(
            royaltyPercentBasisPoint <= 1000,
            "Phygital: Royalty can't be more than 10%"
        );
        _setTokenRoyalty(currentTokenID, creator, royaltyPercentBasisPoint);

        // Approve tradeHub to transfer NFTs
        setApprovalForAll(tradeHub, true);

        emit PhygitalAssetCreated(currentTokenID, creator, metadataURI);
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
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Phygital: Caller is not token owner or approved"
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
        require(_exists(tokenId), "Phygital: Non-Existent Asset");
        _tokenURIs[tokenId] = _tokenURI;
    }

    /********************* Rental(ERC4907) *********************************/
    /// @notice Owner can set the NFT's rental price and status
    function setRentInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 pricePerHour
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Phygital: Caller is not token owner or approved"
        );
        rentables[tokenId].isRentable = isRentable;
        rentables[tokenId].hourlyRate = pricePerHour;
        emit RentalInfo(tokenId, isRentable, pricePerHour, _msgSender());
    }

    /// @notice set the user and expires of an NFT
    /// @dev This function is used to gift a person by the owner,
    /// The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires

    function setUser(uint256 tokenId, address user, uint64 expires) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Phygital: Not token owner Or approved"
        );
        require(
            userOf(tokenId) == address(0),
            "Phygital: item is already subscribed"
        );
        RentableItems storage info = rentables[tokenId];
        info.user = user;
        info.expires = expires + uint64(block.timestamp);
        emit UpdateUser(tokenId, user, info.expires);
    }

    /**
     * @notice to use for renting an item
     * We are calculating 1 month equal to 30 days
     * @dev The zero address indicates there is no user renting the item currently
     * Throws if `tokenId` is not valid NFT,
     * time cannot be less than 1 hour or more than 6 months
     * @param _timeInHours  is in hours , Ex- 1,2,3
     */

    function rent(uint256 _tokenId, uint256 _timeInHours) external payable {
        require(_exists(_tokenId), "Phygital: Invalide Token Id");
        require(
            rentables[_tokenId].isRentable,
            "Phygital: Not available for rent"
        );
        require(
            userOf(_tokenId) == address(0),
            "Phygital: NFT Already Subscribed"
        );
        require(_timeInHours > 0, "Phygital: Time can't be less than 1 hour");
        require(
            _timeInHours <= 4320,
            "Phygital: Time can't be more than 6 months"
        );

        uint256 amount = amountRequired(_tokenId, _timeInHours);

        require(msg.value >= amount, "Phygital: Insufficient Funds");
        payable(ownerOf(_tokenId)).transfer(msg.value);

        RentableItems storage info = rentables[_tokenId];
        info.user = _msgSender();
        info.expires = uint64(block.timestamp + (_timeInHours * 3600));
        emit UpdateUser(_tokenId, _msgSender(), info.expires);
    }

    /** Getter Functions **/

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Phygital: Non-Existent Asset");
        string memory _tokenURI = _tokenURIs[tokenId];

        return _tokenURI;
    }

    /************* Rental(ERC4907) ***************** */
    /// @dev IERC4907 implementation
    function userOf(uint256 tokenId) public view returns (address) {
        if (userExpires(tokenId) >= block.timestamp) {
            return rentables[tokenId].user;
        } else {
            return address(0);
        }
    }

    /// @dev IERC4907 implementation
    function userExpires(uint256 tokenId) public view returns (uint256) {
        return rentables[tokenId].expires;
    }

    /// @notice to calculate the amount of money required
    /// to rent an item for a certain time
    function amountRequired(
        uint256 tokenId,
        uint256 time
    ) public view returns (uint256 amount) {
        amount = rentables[tokenId].hourlyRate * time;
    }

    /////////////////////////////////////////////////

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        if (from != to && rentables[tokenId].user != address(0)) {
            delete rentables[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        if (interfaceId == type(IERC4907).interfaceId) return true;
        return super.supportsInterface(interfaceId);
    }
}