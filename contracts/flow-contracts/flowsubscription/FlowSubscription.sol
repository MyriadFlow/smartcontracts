// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "../../common/interface/IERC5643.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../../accessmaster/interfaces/IAccessMaster.sol";

/// @title Users can only utilise token services after renewing their subscriptions and renting them to others.
/**
 * @dev {ERC721} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - token ID and URI autogeneration
 *  - ability for holders to give for rent
 *  - services can only be used after renewal of subscription
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the Operator and pauser
 * roles, as well as the default admin role, which will let it grant both creator
 * and pauser roles to other accounts.
 */
contract FlowSubscription is Context, IERC5643, ERC2981, ERC721Enumerable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    /// @notice UNIX TIME FOR ONE MONTH(30 days)
    uint256 public constant MONTH = 2592000;

    using Strings for uint256;

    bool public mintPaused = false;
    uint8 public version = 1;
    uint256 public publicSalePrice;
    uint256 public subscriptionPricePerMonth;
    uint256 private _tokenIdCounter;
    string public baseURI;
    address private owner;

    /// @notice To store subscription info
    mapping(uint256 => uint64) private _expirations; // subscription
    /// @notice To check if cancellation is intiated or not
    mapping(uint256 => bool) public cancellationRequested;
    /// @notice storing token URI's
    mapping(uint256 => string) private _tokenURI;

    IACCESSMASTER flowRoles;

    modifier whenNotpaused() {
        require(mintPaused == false, "FlowSubscription: NFT Minting Paused");
        _;
    }
    modifier onlyWhenTokenExist(uint256 tokenId) {
        require(_exists(tokenId), "FlowSubscription: Not a valid tokenId");
        _;
    }

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "EternalSoul: User is not authorized "
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            flowRoles.isAdmin(_msgSender()),
            "InstaGen: User is not authorized"
        );
        _;
    }
    event SubscriptionIssued(uint256 tokenId, address indexed owner);

    event SubscriptionRevoked(uint256 tokenId, address indexed ownerOrApproved);

    event SubscriptionCancelRequested(
        uint256 indexed tokenId,
        uint256 indexed Time
    );

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initialURI,
        uint256 _publicSalePrice,
        uint256 _subscriptionPricePerMonth,
        uint96 royaltyBasisPoint,
        address flowContract
    ) ERC721(_name, _symbol) {
        baseURI = _initialURI;
        publicSalePrice = _publicSalePrice;
        subscriptionPricePerMonth = _subscriptionPricePerMonth;
        // Setting default royalty
        _setDefaultRoyalty(_msgSender(), royaltyBasisPoint);

        flowRoles = IACCESSMASTER(flowContract);
    }

    /// @notice Admin Role can set the mint price
    function setPrice(uint256 _publicSalePrice) external onlyOperator {
        publicSalePrice = _publicSalePrice;
    }

    /// @notice pause or stop the contract from working by ADMIN
    function pause() external onlyOperator {
        mintPaused = true;
    }

    /// @notice Unpause the contract by ADMIN
    function unpause() public onlyOperator {
        mintPaused = false;
    }

    /// @notice only operator can set base token URI for the contract
    function setBaseURI(string memory _tokenBaseURI) external onlyOperator {
        baseURI = _tokenBaseURI;
    }

    /// @notice to set token URI of a indivual token
    function setTokenURI(uint tokenId, string memory _tokenUri) external {
        require(
            ownerOf(tokenId) == _msgSender() ||
               flowRoles.isOperator(_msgSender())
        );
        _tokenURI[tokenId] = _tokenUri;
    }

    /// @notice Call to mint NFTs
    /// @return tokenId
    function subscribe() external payable whenNotpaused returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        require(
            publicSalePrice >= msg.value,
            "FlowSubscription: Insuffiecient amount!"
        );
        _safeMint(_msgSender(), tokenId);
        emit SubscriptionIssued(tokenId, _msgSender());
        return tokenId;
    }

    //// @notice to mint NFT's By Operator
    function delegateSubscribe(
        address creator
    ) public onlyOperator returns (uint256 tokenId) {
        _tokenIdCounter++;
        tokenId = _tokenIdCounter;
        _safeMint(creator, tokenId);
        emit SubscriptionIssued(tokenId, _msgSender());
    }

    /**
     * @notice Burns `tokenId`. See {ERC721-_burn}.
     *
     * @dev Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function revokeSubscription(
        uint256 _tokenId
    ) public onlyWhenTokenExist(_tokenId) {
        require(
            _isApprovedOrOwner(_msgSender(), _tokenId),
            "FlowSubscription: Not Owner Or Approved"
        );
        _burn(_tokenId);
        emit SubscriptionRevoked(_tokenId, _msgSender());
        _resetTokenRoyalty(_tokenId);
    }

    /// @notice only Admin can withdraw the funds collected
    function withdraw() external onlyAdmin {
        // get the balance of the contract
        (bool callSuccess, ) = payable(_msgSender()).call{
            value: address(this).balance
        }("");
        require(callSuccess, "FlowSubscription: Withdrawal failed");
    }

    /** SUBSCRIPTION  **/

    /// @notice Renews the subscription to an NFT
    /// Throws if `tokenId` is not a valid NFT
    /// Renewal can be done even if existing subscription is not ended
    /// @param tokenId The NFT to renew the subscription for
    /// @param duration The number of months to extend a subscription for
    /// cannot be more than 12 or less than 1
    function renewSubscription(
        uint256 tokenId,
        uint64 duration
    ) external payable onlyWhenTokenExist(tokenId) {
        bool isOperator = flowRoles.isOperator(_msgSender());
        require(
            _isApprovedOrOwner(_msgSender(), tokenId) || isOperator,
            "FlowSubscription: Caller is not owner nor approved nor the Operator"
        );
        require(
            cancellationRequested[tokenId] == false,
            "FlowSubscription: Renewal cannot be proceeded, token  is in cancellation process!"
        );
        require(
            duration > 0 && duration <= 12,
            "FlowSubscription: Duration must be between 1 to 12 months!"
        );
        uint256 _duration = (duration * MONTH);
        if (!isOperator) {
            require(
                msg.value >= duration * subscriptionPricePerMonth,
                "FlowSubscription: Insufficient Payment"
            );
        }
        uint64 newExpiration;

        if (isRenewable(tokenId)) {
            newExpiration = uint64(block.timestamp + _duration);
            _expirations[tokenId] = newExpiration;
        } else {
            newExpiration = uint64(_expirations[tokenId] + _duration);
            _expirations[tokenId] = newExpiration;
        }
        emit SubscriptionUpdate(tokenId, newExpiration);
    }

    /// @notice Cancels the subscription of an NFT
    /// @dev Throws if `tokenId` is not a valid NFT
    /// only deduct a week as a penalty when refunding the money.
    /// @param tokenId The NFT to cancel the subscription for
    function cancelSubscription(
        uint256 tokenId
    ) external payable onlyWhenTokenExist(tokenId) {
        bool isOperator = flowRoles.isOperator(_msgSender());
        require(
            isRenewable(tokenId) == false,
            "FlowSubscription: Cancellation cannot be proceeded!"
        );
        if (!isOperator) {
            require(
                cancellationRequested[tokenId] == false,
                "FlowSubscription: Cancellation cannot be proceeded!"
            );
            require(
                _isApprovedOrOwner(_msgSender(), tokenId),
                "FlowSubscription: Caller is not owner nor approved"
            );
            cancellationRequested[tokenId] = true;
            _expirations[tokenId] = uint64(block.timestamp);
            emit SubscriptionCancelRequested(tokenId, block.timestamp);
        } else {
            payable(ownerOf(tokenId)).transfer(msg.value);
            cancellationRequested[tokenId] = false;
        }
    }

    /** Getter Functions **/

    ////// SUBSCRIPTION ///////////////

    /// @notice Gets the expiration date of a subscription
    /// @param tokenId The NFT to get the expiration date of
    /// @return The expiration date of the subscription
    function expiresAt(uint256 tokenId) external view returns (uint64) {
        return _expirations[tokenId];
    }

    /// @notice Determines whether a subscription can be renewed
    /// @param tokenId The NFT to get the expiration date of
    /// @return The renewability of a the subscription
    function isRenewable(uint256 tokenId) public view returns (bool) {
        if (_expirations[tokenId] <= block.timestamp) {
            return true;
        } else {
            return false;
        }
    }

    //////////////////////////////////

    ///@dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721) returns (string memory) {
        if (bytes(_tokenURI[tokenId]).length == 0) {
            string memory _tokenUri = _baseURI(); //ERC721
            return string(abi.encodePacked(_tokenUri, "/", tokenId.toString()));
        } else {
            return _tokenURI[tokenId];
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        if (interfaceId == type(IERC5643).interfaceId) return true;
        return super.supportsInterface(interfaceId);
    }
}
