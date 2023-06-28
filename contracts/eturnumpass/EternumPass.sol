// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../common/interface/IERC4907.sol";
import "../common/interface/IERC5643.sol";
import "../accessmaster/interfaces/IAccessMaster.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

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
 * The account that deploys the contract will be granted the creator and pauser
 * roles, as well as the default admin role, which will let it grant both creator
 * and pauser roles to other accounts.
 */
contract EternumPass is Context, IERC4907, IERC5643, ERC2981, ERC721Enumerable {
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    /// @notice UNIX TIME FOR ONE MONTH(30 days)
    uint256 public constant MONTH = 2592000;

    using Strings for uint256;

    bool public mintPaused = true;
    ///@notice for giving users free subscriptions or not
    bool private isOperatorSubscription;
    uint256 public publicSalePrice;
    uint256 public platFormFeeBasisPoint;
    uint256 public subscriptionPricePerMonth;
    uint256 private _tokenIdCounter;
    string public baseURI;
    address tradeHubAddress;

    struct RentableItems {
        bool isRentable; //to check is renting is available
        address user; // address of user role
        uint64 expires; // unix timestamp, user expires
        uint256 hourlyRate; // amountPerHour
    }

    /// @notice storing the data of the user who are renting the NFT
    mapping(uint256 => RentableItems) internal rentables;
    /// @notice To store subscription info
    mapping(uint256 => uint64) private _expirations; // subscription
    /// @notice To check if cancellation is intiated or not
    mapping(uint256 => bool) public cancellationRequested;
    /// @notice storing token URI's
    mapping(uint256 => string) private _tokenURI;

    // INTERFACES
    IACCESSMASTER flowRoles;

    modifier whenNotpaused() {
        require(mintPaused == false, "EternumPass: NFT Minting Paused");
        _;
    }

    modifier onlyWhenTokenExist(uint256 tokenId) {
        require(_exists(tokenId), "EternumPass: Not a valid tokenId");
        _;
    }

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "EternumPass: Unauthorized!"
        );
        _;
    }
    modifier onlyAdmin() {
        require(
            flowRoles.isAdmin(_msgSender()),
            "EternumPass: User is not authorized"
        );
        _;
    }
    event NFTMinted(uint256 tokenId, address indexed owner);
    event NFTBurnt(uint256 tokenId, address indexed ownerOrApproved);

    event RentalInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 price,
        address indexed renter
    );
    event RequestedCancelSubscription(
        uint256 indexed tokenId,
        uint256 indexed Time
    );

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initialURI,
        uint256 _publicSalePrice,
        uint256 _platFormFeeBasisPoint,
        uint256 _subscriptionPricePerMonth,
        uint96 royaltyBasisPoint,
        bool _isOperatorSubscription,
        address flowContract,
        address _tradeHubAddrr
    ) ERC721(_name, _symbol) {
        flowRoles = IACCESSMASTER(flowContract);
        baseURI = _initialURI;
        publicSalePrice = _publicSalePrice;
        platFormFeeBasisPoint = _platFormFeeBasisPoint;
        subscriptionPricePerMonth = _subscriptionPricePerMonth;
        // Setting default royalty
        _setDefaultRoyalty(_msgSender(), royaltyBasisPoint);
        isOperatorSubscription = _isOperatorSubscription;
        tradeHubAddress = _tradeHubAddrr;
    }

    ///@notice Function to update the plateformFeeBasisPoint
    function updateFee(uint256 _platFormFeeBasisPoint) external onlyOperator {
        platFormFeeBasisPoint = _platFormFeeBasisPoint;
    }

    /// @notice Admin Role can set the mint price
    function setPrice(uint256 _publicSalePrice) external onlyAdmin {
        publicSalePrice = _publicSalePrice;
    }

    /// @notice pause or stop the contract from working by ADMIN
    function pause() public onlyAdmin {
        mintPaused = true;
    }

    /// @notice Unpause the contract by ADMIN
    function unpause() public onlyAdmin {
        mintPaused = false;
    }

    /// @notice change the subscription amount only by Admin
    function setSubscriptionCharges(
        uint256 _subscriptionCharges
    ) public onlyOperator {
        subscriptionPricePerMonth = _subscriptionCharges;
    }

    ///@notice change the free subscription status
    function setFreeSubscriptionStatus(bool _isOperatorSubscription) external {
        isOperatorSubscription = _isOperatorSubscription;
    }

    /// @notice only operator can set base token URI for the contract
    function setBaseURI(string memory _tokenBaseURI) external onlyOperator {
        baseURI = _tokenBaseURI;
    }

    /// @notice to set token URI of a indivual token
    function setTokenURI(
        uint tokenId,
        string memory _tokenUri
    ) external onlyOperator {
        _tokenURI[tokenId] = _tokenUri;
    }

    /// @notice for addition of subscription period to an token
    function _addSubScription(uint currentTokenId) private {
        _expirations[currentTokenId] = uint64(block.timestamp + MONTH);
    }

    /// @notice Call to mint NFTs
    /// @return tokenId
    function subscribe() external payable whenNotpaused returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        require(
            publicSalePrice >= msg.value,
            "EternumPass: Insuffiecient amount!"
        );
        _safeMint(_msgSender(), tokenId);
        if (isOperatorSubscription) {
            _addSubScription(tokenId);
        }
        // Approve marketplace to transfer NFTs
        setApprovalForAll(tradeHubAddress, true);

        emit NFTMinted(tokenId, _msgSender());

        return tokenId;
    }

    //// @notice
    function delegateSubscribe(
        address creator,
        bool freeSubscribe
    ) public onlyOperator returns (uint256 tokenId) {
        _tokenIdCounter++;
        tokenId = _tokenIdCounter;
        _safeMint(creator, tokenId);
        if (freeSubscribe) {
            _addSubScription(tokenId);
        }
        emit NFTMinted(tokenId, _msgSender());
    }

    /**
     * @notice Burns `tokenId`. See {ERC721-_burn}.
     *
     * @dev Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function revokeSubscription(uint256 _tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), _tokenId),
            "EternumPass: Not Owner Or Approved"
        );
        _burn(_tokenId);
        emit NFTBurnt(_tokenId, _msgSender());
        _resetTokenRoyalty(_tokenId);
    }

    /// @notice only Admin can withdraw the funds collected
    function withdraw() external onlyAdmin {
        // get the balance of the contract
        (bool callSuccess, ) = payable(_msgSender()).call{
            value: address(this).balance
        }("");
        require(callSuccess, "EternumPass: Withdrawal failed");
    }

    /** ERC4907 **/

    /// @notice set the user and expires of an NFT
    /// @dev This function is used to gift a person by the owner,
    /// The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires

    function setUser(
        uint256 tokenId,
        address user,
        uint64 expires
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "EternumPass: Not token owner Or approved"
        );
        require(
            userOf(tokenId) == address(0),
            "EternumPass: Item is already subscribed"
        );
        RentableItems storage info = rentables[tokenId];
        info.user = user;
        info.expires = expires + uint64(block.timestamp);
        emit UpdateUser(tokenId, user, expires);
    }

    /// @notice Owner can set the NFT's rental price and status
    function setRentInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 pricePerHour
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "EternumPass: Caller is not token owner or approved"
        );
        rentables[tokenId].isRentable = isRentable;
        rentables[tokenId].hourlyRate = pricePerHour;

        emit RentalInfo(tokenId, isRentable, pricePerHour, _msgSender());
    }

    /// @notice to use for renting an item
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT,
    /// time cannot be less than 1 hour or more than 6 months
    /// @param _timeInHours  is in hours , Ex- 1,2,3

    function rent(uint256 _tokenId, uint256 _timeInHours) external payable {
        require(
            rentables[_tokenId].isRentable,
            "EternumPass: Not available for rent"
        );
        require(
            userOf(_tokenId) == address(0),
            "EternumPass: NFT Already Subscribed"
        );
        require(
            _timeInHours > 0,
            "EternumPass: Time can't be less than 1 hour"
        );
        require(
            _timeInHours <= 4320,
            "EternumPass: Time can't be more than 6 months"
        );

        uint256 amount = amountRequired(_tokenId, _timeInHours);

        require(msg.value >= amount, "EternumPass: Insufficient Funds");

        uint256 payoutForCreator = (msg.value * platFormFeeBasisPoint) / 1000;
        payable(ownerOf(_tokenId)).transfer(payoutForCreator);

        RentableItems storage info = rentables[_tokenId];
        info.user = _msgSender();
        info.expires = uint64(block.timestamp + (_timeInHours * 3600));
        emit UpdateUser(_tokenId, _msgSender(), info.expires);
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
            "EternumPass: Caller is owner nor approved or the Operator"
        );
        require(
            cancellationRequested[tokenId] == false,
            "EternumPass: Renewal cannot be proceeded, token in cancellation process!"
        );
        require(
            duration > 0 && duration <= 12,
            "EternumPass: Duration must be between 1 to 12 months!"
        );
        uint256 _duration = (duration * MONTH);
        if (!isOperator) {
            require(
                msg.value >= duration * subscriptionPricePerMonth,
                "EternumPass: Insufficient Payment"
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
        require(
            isRenewable(tokenId) == false,
            "EternumPass: Cancellation cannot be proceeded!"
        );
        bool isOperator = flowRoles.isOperator(_msgSender());
        if (!isOperator) {
            require(
                cancellationRequested[tokenId] == false,
                "EternumPass: Cancellation cannot be proceeded!"
            );
            require(
                _isApprovedOrOwner(_msgSender(), tokenId),
                "EternumPass: Caller is owner nor approved"
            );
            cancellationRequested[tokenId] = true;
            _expirations[tokenId] = uint64(block.timestamp);
            emit RequestedCancelSubscription(tokenId, block.timestamp);
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

    /*******ERC4907*******/

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    function userOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if (uint256(rentables[tokenId].expires) >= block.timestamp) {
            return rentables[tokenId].user;
        } else {
            return address(0);
        }
    }

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(
        uint256 tokenId
    ) public view virtual override returns (uint256) {
        return rentables[tokenId].expires;
    }

    /// @notice to calculate the amount of money required
    /// to rent an item for a certain time
    function amountRequired(
        uint256 tokenId,
        uint256 time
    ) public view returns (uint256) {
        uint256 amount = rentables[tokenId].hourlyRate * time;
        return amount;
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

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        if (interfaceId == type(IERC4907).interfaceId) return true;
        if (interfaceId == type(IERC5643).interfaceId) return true;
        return super.supportsInterface(interfaceId);
    }
}
