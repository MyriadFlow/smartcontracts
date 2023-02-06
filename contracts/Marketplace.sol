// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

error NotSeller();

contract Marketplace is
    Context,
    AccessControlEnumerable,
    ReentrancyGuard,
    ERC2981
{
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    bytes32 public constant MARKETPLACE_ADMIN_ROLE = keccak256("MARKETPLACE_ADMIN_ROLE");

    using Counters for Counters.Counter;

    Counters.Counter private _saleItemId;
    Counters.Counter private _auctionItemId;
    Counters.Counter private _itemsSold;

    address public marketplacePayoutAddress;
    uint96 public platformFeeBasisPoint;

    enum ItemStatus {
        REMOVED,
        AVAILABLE,
        SOLD
    }

    struct SaleItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        ItemStatus status;
    }

    struct AuctionItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address auctioneer;
        uint256 endTime;
        uint256 highestBid;
        bool started; // to check if auction started or not
        bool ended; // for emergency cancellation
    }

    // Sale
    mapping(uint256 => SaleItem) public idToSaleItem;

    // Auction
    mapping(uint256 => AuctionItem) public idToAuctionItem;
    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(uint256 => address) public highestBidder;

    //@notice to map ItemId to Auction Id
    mapping(uint256 => uint256) public ItemIdtoAuctionId;

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

    event SaleItemRemoved(
        uint256 itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller
    );

    event AuctionItemRemoved(
        uint256 itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller
    );

    event AuctionStarted(uint256 AuctionId, uint256 BasePrice, address indexed Auctioneer);
    event Bid(uint256 AuctionId, uint256 amount, address indexed Bidder);
    event AuctionEnded(uint256 AuctionId, address indexed Auctioneer,address indexed HighestBidder);

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
            (idToSaleItem[itemId].nftContract != address(0)),
            "Marketplace: Market item doesn't exist"
        );
        _;
    }

    // Only when item is is for sale
    modifier onlyWhenItemIsForSale(uint256 itemId) {
        require(
            idToSaleItem[itemId].status == ItemStatus.AVAILABLE,
            "Marketplace: Market item is not for sale"
        );
        _;
    }

    // Only seller should be able to perform action
    modifier onlySeller(uint256 itemId) {
        require(
            idToSaleItem[itemId].seller == _msgSender(),
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

        _saleItemId.increment();
        uint256 itemId = _saleItemId.current();

        idToSaleItem[itemId] = SaleItem(
            itemId,
            nftContract,
            tokenId,
            payable(_msgSender()),
            price,
            ItemStatus.AVAILABLE
        );
        IERC721(nftContract).transferFrom(_msgSender(), address(this), tokenId);

        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );
        emit ItemForSale(
            itemId,
            nftContract,
            tokenId,
            metadataURI,
            _msgSender(),
            price
        );
        return itemId;
    }

    /*  Removes the item from marketplace
        Transfers ownership of the item back to seller
    */
    function removeSaleItem(uint256 itemId) public onlySeller(itemId) {
        IERC721(idToSaleItem[itemId].nftContract).transferFrom(
            address(this),
            idToSaleItem[itemId].seller,
            idToSaleItem[itemId].tokenId
        );
        idToSaleItem[itemId].status = ItemStatus.REMOVED;

        string memory metadataURI = IERC721Metadata(
            idToSaleItem[itemId].nftContract
        ).tokenURI(idToSaleItem[itemId].tokenId);

        if (ItemIdtoAuctionId[itemId] != 0) {
            endAuction(ItemIdtoAuctionId[itemId]);
        }

        emit SaleItemRemoved(
            itemId,
            idToSaleItem[itemId].nftContract,
            idToSaleItem[itemId].tokenId,
            metadataURI,
            _msgSender()
        );
    }

    /*  Creates the sale of a marketplace item
        Transfers ownership of the item, as well as funds between parties
    */
    function buyItem(
        uint256 itemId
    )
        public
        payable
        nonReentrant
        onlyWhenItemExists(itemId)
        onlyWhenItemIsForSale(itemId)
    {
        require(
            ItemIdtoAuctionId[itemId] == 0,
            "Marketplace: Market item is  for Auction"
        );
        SaleItem memory _item = idToSaleItem[itemId];

        string memory metadataURI = IERC721Metadata(_item.nftContract).tokenURI(
            _item.tokenId
        );
        require(
            msg.value == _item.price,
            "Marketplace: Pay Market Price to buy the NFT"
        );

        idToSaleItem[itemId].status = ItemStatus.SOLD;

        IERC721(_item.nftContract).transferFrom(
            address(this),
            _msgSender(),
            _item.tokenId
        );

        // Calculate Payout for Platform
        uint256 amountReceived = msg.value;
        uint256 payoutForMarketplace = (amountReceived *
            platformFeeBasisPoint) / 1000;
        uint256 amountRemaining = msg.value - payoutForMarketplace;

        //Calculate Royalty Amount for Creator
        (address creator, uint256 royaltyAmount) = IERC2981(_item.nftContract)
            .royaltyInfo(_item.tokenId, amountRemaining);

        // Calculate Payout for Seller
        uint256 payoutForSeller = amountRemaining - royaltyAmount;

        //transfering amounts to marketplace, creator and seller
        payable(marketplacePayoutAddress).transfer(payoutForMarketplace);
        payable(creator).transfer(royaltyAmount);
        payable(_item.seller).transfer(payoutForSeller);

        _itemsSold.increment();
        emit ItemSold(
            itemId,
            _item.nftContract,
            _item.tokenId,
            metadataURI,
            _item.seller,
            _msgSender(),
            _item.price
        );
    }

    /*
     **  @dev creating an Auction Item for an existing seller
     * End Time value should be in minutes (60 for 1 hour)
     */
    function startAuction(
        uint256 _itemId,
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _endTime
    ) public onlyWhenItemIsForSale(_itemId) returns (uint256) {
        //If user doesn't want to set different Price than the previous listed price
        if (_price == 0) {
            _price = idToSaleItem[_itemId].price;
        }

        if (idToSaleItem[_itemId].seller != _msgSender()) revert NotSeller();

        require(_endTime > 0, "Time can't be less than one minute");

        _auctionItemId.increment();
        uint256 auctionId = _auctionItemId.current();

        //time argument should be set in minutes
        uint256 endAt = block.number + (5 * _endTime) + 1;
        idToAuctionItem[auctionId] = AuctionItem(
            _itemId,
            _nftContract,
            _tokenId,
            _msgSender(),
            endAt,
            _price,
            false,
            true
        );
        ItemIdtoAuctionId[_itemId] = auctionId;
        emit AuctionStarted(auctionId, _price, _msgSender());

        return auctionId;
    }

    /**
     * @dev to create a function for bidding in a specific auctionId
     */
    function bid(uint256 itemId) external payable {
        uint256 auctionId = ItemIdtoAuctionId[itemId];
        require(
            idToAuctionItem[auctionId].started == true,
            "The auction has not started yet"
        );
        require(!idToAuctionItem[auctionId].ended, "Ended!");
        require(
            block.number < idToAuctionItem[auctionId].endTime,
            "time limit has been reached"
        );
        require(
            msg.value > idToAuctionItem[auctionId].highestBid,
            "value less than the highest Bid"
        );
        highestBidder[auctionId] = _msgSender();
        bids[auctionId][_msgSender()] = msg.value;
        idToAuctionItem[auctionId].highestBid = msg.value;
        emit Bid(auctionId, msg.value, msg.sender);
    }

    /**
     * @dev TO Withdraw the money if the user isn't the highest bidder
     */
    function withdrawBid(uint256 auctionId) external {
        require(bids[auctionId][_msgSender()] > 0, "You cannot withdraw");
        require(
            highestBidder[auctionId] != _msgSender(),
            "User can't Withdraw , user is the highestBidder"
        );
        uint256 bal = bids[auctionId][_msgSender()];
        bids[auctionId][msg.sender] = 0;
        payable(msg.sender).transfer(bal);
    }

    function endAuction(uint256 itemId) public onlySeller(itemId) {
        uint256 auctionId = ItemIdtoAuctionId[itemId];
        require(idToAuctionItem[auctionId].started, "not started");
        require(!idToAuctionItem[auctionId].ended, "Ended");
        //require(block.number >= idToAuctionItem[auctionId].endTime, "Still time left");
        address auctioneerAddress = idToAuctionItem[auctionId].auctioneer;

        address nftContractAddress = idToAuctionItem[auctionId].nftContract;

        uint256 _tokenId = idToAuctionItem[auctionId].tokenId;

        idToAuctionItem[auctionId].ended = true;

        uint256 bidAmount = idToAuctionItem[auctionId].highestBid;

        if (highestBidder[auctionId] != address(0)) {
            IERC721(nftContractAddress).transferFrom(
                address(this),
                auctioneerAddress,
                _tokenId
            );

            // Calculate Payout for Platform
            uint256 amountReceived = bidAmount;
            uint256 payoutForMarketplace = (amountReceived *
                platformFeeBasisPoint) / 1000;
            uint256 amountRemaining = amountReceived - payoutForMarketplace;

            //Calculate Royalty Amount for Creator
            (address creator, uint256 royaltyAmount) = IERC2981(
                nftContractAddress
            ).royaltyInfo(_tokenId, amountRemaining);

            // Calculate Payout for Seller
            uint256 payoutForAuctioneer = amountRemaining - royaltyAmount;

            //transfering amounts to marketplace, creator and seller
            payable(marketplacePayoutAddress).transfer(payoutForMarketplace);
            //paying to the creator
            payable(creator).transfer(royaltyAmount);
            //paying to the auctioneer
            payable(auctioneerAddress).transfer(payoutForAuctioneer);
        } else {
            IERC721(nftContractAddress).transferFrom(
                address(this),
                auctioneerAddress,
                _tokenId
            );
        }

        emit AuctionEnded(
            auctionId,
            auctioneerAddress,
            highestBidder[auctionId]
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
        marketplacePayoutAddress = newPayoutAddress;
    }

    function Totalitem() public view returns (uint256) {
        return _saleItemId.current();
    }

    function TotalitemSold() public view returns (uint256) {
        return _itemsSold.current();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlEnumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
