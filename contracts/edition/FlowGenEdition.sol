// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../common/ERC721A/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "../accesscontrol/interfaces/IFlowAccessControl.sol";
import "../common/ERC4907/IERC4907.sol";

contract FlowGenEdition is Context, ERC2981, ERC721A, ERC721ABurnable {
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    // IMMUTABLE VARIABLES
    uint256 public immutable preSalePrice;
    /// @dev The time until presalePrice will be valid
    uint256 public immutable countDownTime;

    uint256 public immutable maxSupply;

    // PUBLIC && PRIVATE VARIABLES
    string private baseURI;
    address public marketplace;
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
    IFlowAccessControl flowRoles;

    using Strings for uint256;

    modifier onlyAdmin() {
        require(
            flowRoles.isAdmin(_msgSender()),
            "MyriadFlowOfferStation: User is not authorized"
        );
        _;
    }

    event AssetCreated(
        uint256 currentIndex,
        uint256 quantity,
        address indexed creator
    );
    event AssetDestroyed(uint indexed tokenId, address ownerOrApproved);

    event RentalInfo(
        uint256 tokenId,
        bool isRentable,
        uint256 price,
        address indexed renter
    );
    event UpdateUser(
        uint256 indexed tokenId,
        address indexed user,
        uint64 expires
    );

    constructor(
        string memory name,
        string memory symbol,
        address marketplaceAddress,
        address accessControlAddress,
        uint256 _salePrice,
        uint256 _preSalePrice,
        uint256 _countDownTime, // unix time (secs)
        uint256 _maxSupply,
        uint256 _royaltyBPS
    ) ERC721A(name, symbol) {
        flowRoles = IFlowAccessControl(accessControlAddress);
        marketplace = marketplaceAddress;
        salePrice = _salePrice;
        preSalePrice = _preSalePrice;
        countDownTime = block.timestamp + _countDownTime;
        maxSupply = _maxSupply;

        // SET DEFAULT ROYALTY TO 5%
        _setDefaultRoyalty(_msgSender(), uint96(_royaltyBPS));
    }

    function mint(
        uint256 quantity
    ) external payable returns (uint256, uint256) {
        require(
            totalSupply() + quantity <= maxSupply,
            "FlowGenEdition: exceeding max token supply!"
        );
        if (countDownTime > block.timestamp) {
            require(
                msg.value >= quantity * preSalePrice,
                "FlowGenEdition: Not enough funds!"
            );
        } else {
            require(
                msg.value >= quantity * salePrice,
                "FlowGenEdition: Not enough funds!"
            );
        }
        _safeMint(_msgSender(), quantity);
        setApprovalForAll(marketplace, true);
        emit AssetCreated(totalSupply(), quantity, _msgSender());
        return (totalSupply(), quantity);
    }

    function burnNFT(uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        require(
            ownerOf(tokenId) == _msgSender() ||
                isApprovedForAll(owner, _msgSender()),
            "FlowGenEdition: Not Owner Or Approved"
        );
        _burn(tokenId, true);
        _resetTokenRoyalty(tokenId);
        emit AssetDestroyed(tokenId, _msgSender());
    }

    function withdraw() external onlyAdmin {
        // get the balance of the contract
        (bool callSuccess, ) = payable(_msgSender()).call{
            value: address(this).balance
        }("");
        require(callSuccess, "FlowGenEdition: Withdrawal failed");
    }

    /********************* ERC4907 *********************************/
    /// @dev Owner can set the rental status of the token
    function setRentInfo(uint256 tokenId, bool isRentable) external {
        address owner = ownerOf(tokenId);
        require(
            owner == _msgSender() || isApprovedForAll(owner, _msgSender()),
            "FlowGenEdition: Caller is not token owner "
        );
        rentables[tokenId].isRentable = isRentable;
        emit RentalInfo(
            tokenId,
            isRentable,
            rentables[tokenId].hourlyRate,
            _msgSender()
        );
    }

    ///@dev Owner can set the rental price of the token
    function setprice(uint256 tokenId, uint256 pricePerHour) external {
        address owner = ownerOf(tokenId);
        require(
            owner == _msgSender() || isApprovedForAll(owner, _msgSender()),
            "FlowGenEdition: Caller is not token owner "
        );
        rentables[tokenId].hourlyRate = pricePerHour;
        emit RentalInfo(
            tokenId,
            rentables[tokenId].isRentable,
            pricePerHour,
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
            "FlowGenEdition: Caller is not token owner "
        );
        require(
            userOf(tokenId) == address(0),
            "FlowGenEdition: Item is already subscribed"
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
        require(
            rentables[_tokenId].isRentable,
            "FlowGenEdition: Not available for rent"
        );
        require(
            userOf(_tokenId) == address(0),
            "FlowGenEdition: NFT Already Subscribed"
        );
        require(
            _timeInHours > 0,
            "FlowGenEdition: Time can't be less than 1 hour"
        );
        require(
            _timeInHours <= 4320,
            "FlowGenEdition: Time can't be more than 6 months"
        );

        uint256 amount = amountRequired(_tokenId, _timeInHours);

        require(msg.value >= amount, "FlowGenEdition: Insufficient Funds");

        RentableItems storage info = rentables[_tokenId];
        info.user = _msgSender();
        info.expires = uint64(block.timestamp + (_timeInHours * 3600));
        emit UpdateUser(_tokenId, _msgSender(), info.expires);
    }

    /// @dev IERC4907 implementation
    function userOf(uint256 tokenId) public view returns (address) {
        // console.log(
        //     "user1 is %s and tokenId is %s",
        //     rentables[tokenId].user,
        //     tokenId
        // );
        // console.log("time1 is %s", rentables[tokenId].expires);
        // console.log("blocktimestamp1 is %s", block.timestamp);
        if (rentables[tokenId].expires >= block.timestamp) {
            // console.log("user2 is %s", rentables[tokenId].user);
            // console.log("time2 is %s", rentables[tokenId].expires);
            // console.log("blocktimestamp2 is %s", block.timestamp);
            return rentables[tokenId].user;
        } else {
            // console.log("Hey");
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

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721A) {
        // console.log("HI");
        for (uint256 i = startTokenId; i <= quantity; i++) {
            require(
                userOf(i) == address(0),
                "FlowGenEdition : Item is already subscribed"
            );
            if (from != to && rentables[i].user != address(0)) {
                delete rentables[startTokenId];
                emit UpdateUser(startTokenId, address(0), 0);
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC721A, ERC721A, ERC2981) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        if (interfaceId == type(IERC4907).interfaceId) return true;
        return super.supportsInterface(interfaceId);
    }
}
