// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract Marketplace is Context, AccessControlEnumerable, ReentrancyGuard, ERC2981 {

    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    bytes32 public constant MARKETPLACE_ADMIN_ROLE = keccak256("MARKETPLACE_ADMIN_ROLE");

    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address public marketplacePayoutAddress;
    uint96 public platformFeeBasisPoint;

    enum ItemStatus{ REMOVED, SALE, AUCTION, SOLD }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        ItemStatus status;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;

    event ItemForSale(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller,
        uint256 price
    );

    event ItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metadataURI,
        address seller,
        address buyer,
        uint256 price
    );

    event ItemRemoved(
        uint256 itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller
    );

    // Only item owner should be able to perform action
    modifier onlyItemOwner(address nftContract, uint256 tokenId) {
        require(
            IERC721(nftContract).ownerOf(tokenId) == _msgSender(),
            "Marketplace: Sender does not own the item"
        );
        _;
    }

    // Only when item exist
    modifier onlyWhenItemExists(uint256 itemId) {
        require(
            (idToMarketItem[itemId].nftContract != address(0)),
            "Marketplace: Market item doesn't exist"
        );
        _;
    }

    // Only when item is is for sale
    modifier onlyWhenItemIsForSale(uint256 itemId){
        require(
            idToMarketItem[itemId].status == ItemStatus.SALE,
            "Marketplace: Market item is not for sale"
        );
        _;
    }

    // Only when item is is for Auction
    modifier onlyWhenItemIsForAuction(uint256 itemId){
        require(
            idToMarketItem[itemId].status == ItemStatus.AUCTION,
            "Marketplace: Market item is not for sale"
        );
        _;
    }

    // Only seller should be able to perform action
    modifier onlySeller(uint256 itemId) {
        require(
            idToMarketItem[itemId].seller == _msgSender(),
            "Marketplace: Sender is not seller of this item"
        );
        _;
    }

    constructor(uint96 _platformFee) {
        _setupRole(MARKETPLACE_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(MARKETPLACE_ADMIN_ROLE, MARKETPLACE_ADMIN_ROLE);
        platformFeeBasisPoint = _platformFee;
        marketplacePayoutAddress = _msgSender();
    }

    /*  Places an item for sale on the marketplace
        Accepts price in native asset of the blockchain network
    */
    function listSaleItem(
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
            payable(_msgSender()),
            payable(address(0)),
            price,
            ItemStatus.SALE
        );
        IERC721(nftContract).transferFrom(_msgSender(), address(this), tokenId);

        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );
        emit ItemForSale(itemId, nftContract, tokenId, metadataURI, _msgSender(), price);
        return itemId;
    }

    /*  Removes the item from marketplace
        Transfers ownership of the item back to seller
    */
    function removeSaleItem(uint256 itemId) public onlySeller(itemId) {
        IERC721(idToMarketItem[itemId].nftContract).transferFrom(
            address(this),
            idToMarketItem[itemId].seller,
            idToMarketItem[itemId].tokenId
        );
        idToMarketItem[itemId].status = ItemStatus.REMOVED;

        string memory metadataURI = IERC721Metadata(idToMarketItem[itemId].nftContract).tokenURI(
            idToMarketItem[itemId].tokenId
        );

        emit ItemRemoved(itemId, idToMarketItem[itemId].nftContract, idToMarketItem[itemId].tokenId, metadataURI, _msgSender());
    }

    /*  Creates the sale of a marketplace item
        Transfers ownership of the item, as well as funds between parties
    */
    function buyItem(uint256 itemId)
        public
        payable
        nonReentrant
        onlyWhenItemExists(itemId)
        onlyWhenItemIsForSale(itemId)
    {
        MarketItem memory _item = idToMarketItem[itemId];

        string memory metadataURI = IERC721Metadata(_item.nftContract).tokenURI(_item.tokenId);
        require(msg.value == _item.price, "Marketplace: Pay Market Price to buy the NFT");

        idToMarketItem[itemId].owner = payable(_msgSender());
        idToMarketItem[itemId].status = ItemStatus.SOLD;

        IERC721(_item.nftContract).transferFrom(address(this), _msgSender(), _item.tokenId);

        // Calculate Payout for Platform
        uint256 amountReceived = msg.value;
        uint256 payoutForMarketplace = (amountReceived * platformFeeBasisPoint) / 1000;
        uint256 amountRemaining = msg.value - payoutForMarketplace;

        //Calculate Royalty Amount for Creator 
        (address creator, uint256 royaltyAmount) = IERC2981(_item.nftContract).royaltyInfo(_item.tokenId, amountRemaining);

        // Calculate Payout for Seller
        uint256 payoutForSeller = amountRemaining - royaltyAmount;

        //transfering amounts to marketplace, creator and seller
        payable(marketplacePayoutAddress).transfer(payoutForMarketplace);
        payable(creator).transfer(royaltyAmount);
        payable(_item.seller).transfer(payoutForSeller);

        _itemsSold.increment();
        emit ItemSold(itemId, _item.nftContract, _item.tokenId, metadataURI, _item.seller, _msgSender(), _item.price);
    }

    /*  Change the Platform fees along with the payout address
        Allows only Admins to perform this operation
    */
    function changeFeeAndPayoutAddress(
        uint96 newPlatformFee,
        address newPayoutAddress
    ) public onlyRole(MARKETPLACE_ADMIN_ROLE) {
        platformFeeBasisPoint = newPlatformFee;
        marketplacePayoutAddress = newPayoutAddress;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
