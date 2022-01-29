// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Marketplace is Context, AccessControlEnumerable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address public payoutAddress;
    uint96 public platformFeeBasisPoint;

    bytes32 public constant MARKETPLACE_ADMIN_ROLE =
        keccak256("MARKETPLACE_ADMIN_ROLE");

    constructor(uint96 _platformFee) {
        _setupRole(MARKETPLACE_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(MARKETPLACE_ADMIN_ROLE, MARKETPLACE_ADMIN_ROLE);
        platformFeeBasisPoint = _platformFee;
        payoutAddress = _msgSender();
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

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller,
        address owner,
        uint256 price,
        bool forSale
    );
    event MarketItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address buyer,
        uint256 price
    );

    event MarketItemRemoved(uint256 itemId);

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

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            true,
            true
        );
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            metadataURI,
            msg.sender,
            address(0),
            price,
            true
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

        emit MarketItemRemoved(itemId);
    }

    /*  Creates the sale of a marketplace item
        Transfers ownership of the item, as well as funds between parties
    */
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
        onlyWhenItemExist(itemId)
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Marketplace: Pay Market Price to buy the NFT"
        );

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Calculate Payouts between seller and platform
        uint256 amountReceived = msg.value;
        uint256 amountToMarketplace = (amountReceived * platformFeeBasisPoint) /
            1000;
        uint256 amountToSeller = amountReceived - amountToMarketplace;

        idToMarketItem[itemId].seller.transfer(amountToSeller);
        payable(address(payoutAddress)).transfer(amountToMarketplace);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].forSale = false;
        _itemsSold.increment();
        emit MarketItemSold(itemId, nftContract, tokenId, msg.sender, price);
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
}
