// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/utils/Context.sol";
import "../common/ERC721A/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "../common/interface/IERC4907.sol";
import "../accessmaster/interfaces/IAccessMaster.sol";

/**
 * @dev {ERC721A} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a creator role that allows for token minting (creation)
 *  - token ID and URI autogeneration
 *  - ability for holders to give for (4)
 *  - royalty is present for admin (2981)
 * 
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the creator and pauser
 * roles, as well as the default admin role, which will let it grant both creator
 * and pauser roles to other accounts.
 */
contract InstaGen is  Context,IERC4907,ERC2981, ERC721A, ERC721ABurnable {
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    // IMMUTABLE VARIABLES
    uint256 public immutable preSalePrice;
    /// @dev The time until presalePrice will be valid
    uint256 public immutable countDownTime;

    uint256 public immutable maxSupply;

    uint8 public version = 1;

    // PUBLIC && PRIVATE VARIABLES
    string private baseURI;
    address public tradeHub;
    address public accessMasterAddress;
    uint256 public salePrice;

    struct RentableItems {
        bool isRentable; //to check is renting is available
        address user; // address of user role
        uint64 expires; // unix timestamp, user expires
        uint256 hourlyRate; // amountPerHour
    }

    ///@dev storing the data of the user who are renting the NFT
    mapping(uint256 => RentableItems) public rentables;

    // INTERFACES
    IACCESSMASTER flowRoles;

     modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "EternumPass: Unauthorized!"
        );
        _;
    }

    event InstaGenAssetCreated(
        uint256 currentIndex,
        uint256 quantity,
        address indexed creator
    );
    
    event InstaGenAssetDestroyed(uint indexed tokenId, address ownerOrApproved);

    event FundTransferred(address sender,address reciepient , uint256 tokenId,uint256 amount);

    event RentalInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 price,
        address indexed renter
    );

    constructor(
        string memory name,
        string memory symbol,
        address tradeHubAddress,
        address accessControlAddress,
        uint256 _salePrice,
        uint256 _preSalePrice,
        uint256 _countDownTime, // unix time (secs)
        uint256 _maxSupply,
        uint256 _royaltyBPS,
        string memory _baseUri
    ) ERC721A(name, symbol) {
        flowRoles = IACCESSMASTER(accessControlAddress);
        tradeHub = tradeHubAddress;
        salePrice = _salePrice;
        preSalePrice = _preSalePrice;
        countDownTime = block.timestamp + _countDownTime;
        maxSupply = _maxSupply;
        baseURI = _baseUri;
        // SET DEFAULT ROYALTY
        _setDefaultRoyalty(_msgSender(), uint96(_royaltyBPS)); 

        accessMasterAddress = accessControlAddress;
    }

    /// @dev transferring funds 
    function _transferFunds(
        address sender,
        address recipient,
        uint256 tokenId,
        uint256 amount
    ) private {
        // get the balance of the contract
        (bool callSuccess, ) = payable(recipient).call{
            value: amount
        }("");
        require(callSuccess, "InstaGen: Transfer failed");
        emit FundTransferred(sender,recipient,tokenId,amount);
    }


    function setSalePrice(uint256 _salePrice) external onlyOperator {
        salePrice = _salePrice;
    }

    function mint(
        uint256 quantity
    ) external payable returns (uint256, uint256) {
        uint prevQuantity = _totalMinted();
        require(
            _totalMinted() + quantity <= maxSupply,
            "InstaGen: Exceeding max token supply!"
        );
        if (countDownTime > block.timestamp) {
            require(
                msg.value >= quantity * preSalePrice,
                "InstaGen: Not enough funds!"
            );
        } else {
            require(
                msg.value >= quantity * salePrice,
                "InstaGen: Not enough funds!"
            );
        }
        _safeMint(_msgSender(), quantity);
        setApprovalForAll(tradeHub, true);

        address recipient = flowRoles.getPayoutAddress();
        _transferFunds(_msgSender(),recipient,quantity,msg.value);

        emit InstaGenAssetCreated(_totalMinted(), quantity, _msgSender());
        return (prevQuantity, quantity);
    }

    /**
     * @notice Burns `tokenId`. See {ERC721-_burn}.
     *
     * @dev Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burnNFT(uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        require(
            ownerOf(tokenId) == _msgSender() ||
                isApprovedForAll(owner, _msgSender()),
            "InstaGen: Not Owner Or Approved"
        );
        _burn(tokenId, true);
        _resetTokenRoyalty(tokenId);
        emit InstaGenAssetDestroyed(tokenId, _msgSender());
    }

    /********************* ERC4907 *********************************/
    /// @dev Owner can set the rental status of the token
    function setRentInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 pricePerHour
    ) external {
        address owner = ownerOf(tokenId);
        require(
            owner == _msgSender() || isApprovedForAll(owner, _msgSender()),
            "InstaGen: Caller is not token owner "
        );
        rentables[tokenId].isRentable = isRentable;
        rentables[tokenId].hourlyRate = pricePerHour;
        emit RentalInfo(
            tokenId,
            isRentable,
            rentables[tokenId].hourlyRate,
            _msgSender()
        );
    }

    /// @notice set the user and expires of an NFT
    /// @dev This function is used to gift a person by the owner,
    /// The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires

    function setUser(uint256 tokenId, address user, uint64 expires) public {
        address owner = ownerOf(tokenId);
        require(
            owner == _msgSender() || isApprovedForAll(owner, _msgSender()),
            "InstaGen: Caller is not token owner "
        );
        require(
            userOf(tokenId) == address(0),
            "InstaGen: Item is already subscribed"
        );
        RentableItems storage info = rentables[tokenId];
        info.user = user;
        info.expires = uint64(block.timestamp + expires);
        emit UpdateUser(tokenId, user, expires);
    }

    /// @notice to use for renting an item
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT,
    /// time cannot be less than 1 hour or more than 6 months
    /// @param _timeInHours  is in hours , Ex- 1,2,3
    function rent(uint256 _tokenId, uint256 _timeInHours) external payable {
         require(_exists(_tokenId),
            "SignatureSeries: Invalide Token Id"
        );
        require(
            rentables[_tokenId].isRentable,
            "InstaGen: Not available for rent"
        );
        require(
            userOf(_tokenId) == address(0),
            "InstaGen: NFT Already Subscribed"
        );
        require(_timeInHours > 0, "InstaGen: Time can't be less than 1 hour");
        require(
            _timeInHours <= 4320,
            "InstaGen: Time can't be more than 6 months"
        );

        uint256 amount = amountRequired(_tokenId, _timeInHours);

        require(msg.value >= amount, "InstaGen: Insufficient Funds");
        _transferFunds(_msgSender(),ownerOf(_tokenId),_tokenId,msg.value);

        RentableItems storage info = rentables[_tokenId];
        info.user = _msgSender();
        info.expires = uint64(block.timestamp + (_timeInHours * 3600));
        emit UpdateUser(_tokenId, _msgSender(), info.expires);
    }

    /** Getter Functions **/

    /// @dev IERC4907 implementation
    function userOf(uint256 tokenId) public view returns (address) {
        if (rentables[tokenId].expires >= block.timestamp) {
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

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC721A, ERC721A, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        if (interfaceId == type(IERC4907).interfaceId) return true;
        return super.supportsInterface(interfaceId);
    }
}
