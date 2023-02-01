// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "hardhat/console.sol";

contract Marketplace is
    Context,
    AccessControlEnumerable,
    ReentrancyGuard,
    ERC2981
{
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address public payoutAddress;
    uint96 public platformFeeBasisPoint;

    bytes32 public constant MARKETPLACE_ADMIN_ROLE =
        keccak256("MARKETPLACE_ADMIN_ROLE");

    event NFTBurnt(uint tokenId, address indexed owner);

    constructor(uint96 _platformFee) {
        _setupRole(MARKETPLACE_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(MARKETPLACE_ADMIN_ROLE, MARKETPLACE_ADMIN_ROLE);
        platformFeeBasisPoint = _platformFee;
        payoutAddress = _msgSender();
        // Setting default royalty to 5%
        _setDefaultRoyalty(_msgSender(), 500);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool forSale;
        bool deleted;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(address => mapping(uint => address)) public creator;

    event MarketplaceItem(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller,
        address owner,
        uint256 price,
        bool forSale,
        string activity
    );

    // Only item owner should be able to perform action
    modifier onlyItemOwner(address nftContract, uint256 tokenId) {
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Marketplace: Sender does not own the item"
        );
        _;
    }

    // Only when item exist
    modifier onlyWhenItemExist(uint256 itemId) {
        require(
            idToMarketItem[itemId].deleted == false,
            "Marketplace: Market item doesn't exist"
        );
        _;
    }

    // Only when item is is for sale
    modifier onlyWhenItemIsForSale(uint256 itemId) {
        require(
            idToMarketItem[itemId].forSale == true,
            "Marketplace: Market item is not for sale"
        );
        _;
    }

    // Only seller should be able to perform action
    modifier onlySeller(uint256 itemId) {
        require(
            idToMarketItem[itemId].seller == msg.sender,
            "Marketplace: Sender is not seller of this item"
        );
        _;
    }

    /*  Places an item for sale on the marketplace
        Accepts price in native asset of the blockchain network
    */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public onlyItemOwner(nftContract, tokenId) returns (uint256) {
        require(price > 0, "Marketplace: Price must be at least 1 wei");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        if (creator[nftContract][tokenId] == address(0)) {
            creator[nftContract][tokenId] = _msgSender();
        }

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            true,
            false
        );
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );
        emit MarketplaceItem(
            itemId,
            nftContract,
            tokenId,
            metadataURI,
            msg.sender,
            address(0),
            price,
            true,
            "itemListed"
        );
        return itemId;
    }

    /*  Removes the item from marketplace
        Transfers ownership of the item back to seller
    */
    function removeFromSale(uint256 itemId) public onlySeller(itemId) {
        IERC721(idToMarketItem[itemId].nftContract).transferFrom(
            address(this),
            idToMarketItem[itemId].seller,
            idToMarketItem[itemId].tokenId
        );
        idToMarketItem[itemId].deleted = true;

        string memory metadataURI = IERC721Metadata(
            idToMarketItem[itemId].nftContract
        ).tokenURI(idToMarketItem[itemId].tokenId);

        emit MarketplaceItem(
            itemId,
            idToMarketItem[itemId].nftContract,
            idToMarketItem[itemId].tokenId,
            metadataURI,
            msg.sender,
            msg.sender,
            0,
            false,
            "itemRemoved"
        );
    }

    /*  Creates the sale of a marketplace item
        Transfers ownership of the item, as well as funds between parties
    */
    //TO check the function for royalty
    function createMarketSale(
        uint256 itemId
    )
        public
        payable
        nonReentrant
        onlyWhenItemExist(itemId)
        onlyWhenItemIsForSale(itemId)
    {
        // uint256 price = idToMarketItem[itemId].price;
        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        string memory metadataURI = IERC721Metadata(
            idToMarketItem[itemId].nftContract
        ).tokenURI(idToMarketItem[itemId].tokenId);
        address seller = idToMarketItem[itemId].seller;
        require(
            msg.value == idToMarketItem[itemId].price,
            "Marketplace: Pay Market Price to buy the NFT"
        );

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].forSale = false;

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        address nft_creator = creator[nftContract][tokenId];

        //Calculating royalty info
        (, uint _royaltyAmount) = royaltyInfo(itemId, msg.value);
        uint amountAvailable = msg.value - _royaltyAmount;

        // Calculate Payouts between seller and platform
        uint256 amountToMarketplace = (amountAvailable *
            platformFeeBasisPoint) / 1000;
        uint256 amountToSeller = amountAvailable - amountToMarketplace;

        //transfering royalty
        payable(nft_creator).transfer(_royaltyAmount);
        idToMarketItem[itemId].seller.transfer(amountToSeller);
        payable(address(payoutAddress)).transfer(amountToMarketplace);

        _itemsSold.increment();
        emit MarketplaceItem(
            itemId,
            nftContract,
            tokenId,
            metadataURI,
            seller,
            msg.sender,
            msg.value,
            false,
            "itemSale"
        );
    }

    /*  Change the Platform fees along with the payout address
        Allows only Admins to perform this operation
    */
    function changeFeeAndPayoutAddress(
        uint96 newPlatformFee,
        address newPayoutAddress
    ) public onlyRole(MARKETPLACE_ADMIN_ROLE) {
        platformFeeBasisPoint = newPlatformFee;
        payoutAddress = newPayoutAddress;
    }

    // function burnNFT(uint256 tokenId) public {
    //     require(
    //         _isApprovedOrOwner(_msgSender(), tokenId),
    //         "Erebrus: caller is not token owner or approved"
    //     );
    //     _burn(tokenId);
    //     _resetTokenRoyalty(tokenId);
    //     emit NFTBurnt(tokenId, _msgSender());
    //     _resetTokenRoyalty(tokenId);
    // }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlEnumerable, ERC2981)
        returns (bool)
    {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        return super.supportsInterface(interfaceId);
    }
}
