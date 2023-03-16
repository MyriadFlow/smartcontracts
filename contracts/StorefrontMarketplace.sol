// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

error ItemNotExist();
error StorefrontMarketplace_NotCreator();

contract StorefrontMarketplace is
    Context,
    AccessControlEnumerable,
    ReentrancyGuard,
    ERC2981
{
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    bytes32 public constant MARKETPLACE_ADMIN_ROLE =
        keccak256("MARKETPLACE_ADMIN_ROLE");

    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;

    address public marketplacePayoutAddress;
    uint96 public platformFeeBasisPoint;

    string public marketplaceName;

    enum ItemStatus {
        NONEXISTANT,
        SALE,
        AUCTION,
        SOLD,
        REMOVED
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 auctioneEndTime;
        uint256 highestBid;
        address highestBidder;
        ItemStatus status;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;

    mapping(address => mapping(uint256 => uint256)) private _marketItem;

    event SaleStarted(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller,
        uint256 price
    );

    event AuctionStarted(
        uint256 itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address indexed auctioneer,
        uint256 basePrice,
        uint256 endTime
    );

    event BidPlaced(uint256 itemId, uint256 amount, address indexed bidder);

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metadataURI,
        address auctioneer,
        address highestBidder,
        uint256 bid
    );

    event PriceUpdated(uint256 itemId, uint256 updatedPrice);

    event TimeUpdated(uint256 itemId, uint256 updatedTime);

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

    modifier onlyItemOwner(address nftContract, uint256 tokenId) {
        require(
            IERC721(nftContract).ownerOf(tokenId) == _msgSender(),
            "StorefrontMarketplace: Sender does not own the item"
        );
        _;
    }
    modifier onlyWhenItemIsForSale(uint256 itemId) {
        require(
            idToMarketItem[itemId].status == ItemStatus.SALE,
            "StorefrontMarketplace: Market item is not for sale"
        );
        _;
    }
    modifier onlyWhenItemIsForAuction(uint256 itemId) {
        require(
            idToMarketItem[itemId].status == ItemStatus.AUCTION,
            "StorefrontMarketplace: The auction has not started yet"
        );
        _;
    }
    modifier onlySeller(uint256 itemId) {
        require(
            idToMarketItem[itemId].seller == _msgSender(),
            "StorefrontMarketplace: Sender is not seller of this item"
        );
        _;
    }
    modifier onlyWhenNoBidder(uint256 itemId) {
        require(
            idToMarketItem[itemId].highestBidder == address(0),
            "StorefrontMarketplace : Auction is still running"
        );
        _;
    }

    constructor(uint96 _platformFee, string memory _marketplaceName) {
        _setupRole(MARKETPLACE_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(MARKETPLACE_ADMIN_ROLE, MARKETPLACE_ADMIN_ROLE);
        platformFeeBasisPoint = _platformFee;
        marketplacePayoutAddress = _msgSender();
        marketplaceName = _marketplaceName;
    }

    /**
     * @dev function to split the payment between creator , marketplace & nft Seller
     *  also tranfer it to the nft buyer who paid for it
     */
    function _paymentSplit(
        uint256 itemId,
        uint256 value,
        address recieverAddress
    ) private nonReentrant {
        MarketItem memory _item = idToMarketItem[itemId];

        IERC721(_item.nftContract).transferFrom(
            address(this),
            recieverAddress,
            _item.tokenId
        );
        // Calculate Payout for Platform
        uint256 amountReceived = value;
        uint256 payoutForMarketplace = (amountReceived *
            platformFeeBasisPoint) / 1000;
        uint256 amountRemaining = value - payoutForMarketplace;

        //Calculate Royalty Amount for Creator
        (address creator, uint256 royaltyAmount) = IERC2981(_item.nftContract)
            .royaltyInfo(_item.tokenId, amountRemaining);

        // Calculate Payout for Seller
        uint256 payoutForSeller = amountRemaining - royaltyAmount;
        //transfering amounts to marketplace, creator and seller
        payable(marketplacePayoutAddress).transfer(payoutForMarketplace);
        //creator
        payable(creator).transfer(royaltyAmount);
        //item Seller
        payable(_item.seller).transfer(payoutForSeller);

        idToMarketItem[itemId].seller = address(0);
        idToMarketItem[itemId].status = ItemStatus.SOLD;
    }

    /**
     * @dev token owner can use this function for listing
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool forAuction,
        uint256 time
    ) external onlyItemOwner(nftContract, tokenId) returns (uint256) {
        require(
            price > 0,
            "StorefrontMarketplace: Price must be at least 1 wei"
        );
        if (forAuction == true) {
            require(
                time >= 60,
                "StorefrontMarketplace: Time cannot be less than One hour"
            );
        }

        uint256 itemId;
        uint256 marketItemId = _marketItem[nftContract][tokenId];

        if (marketItemId == 0) {
            _itemIds.increment();
            itemId = _itemIds.current();
            _marketItem[nftContract][tokenId] = itemId;
        } else if (
            marketItemId != 0 &&
            (idToMarketItem[marketItemId].status == ItemStatus.SOLD ||
                idToMarketItem[marketItemId].status == ItemStatus.REMOVED)
        ) {
            itemId = marketItemId;
        } else {
            revert ItemNotExist();
        }

        IERC721(nftContract).transferFrom(_msgSender(), address(this), tokenId);
        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );

        if (forAuction != true) {
            idToMarketItem[itemId] = MarketItem(
                itemId,
                nftContract,
                tokenId,
                payable(_msgSender()),
                price,
                0,
                0,
                address(0),
                ItemStatus.SALE
            );

            emit SaleStarted(
                itemId,
                nftContract,
                tokenId,
                metadataURI,
                _msgSender(),
                price
            );
        } else {
            //time argument should be set in unix
            uint256 endAt = block.timestamp + time;
            idToMarketItem[itemId] = MarketItem(
                itemId,
                nftContract,
                tokenId,
                _msgSender(),
                price,
                endAt,
                price,
                address(0),
                ItemStatus.AUCTION
            );
            idToMarketItem[itemId].status = ItemStatus.AUCTION;
            emit AuctionStarted(
                itemId,
                nftContract,
                tokenId,
                metadataURI,
                _msgSender(),
                price,
                endAt
            );
        }
        return itemId;
    }

    /**
     * @dev Removes/Deletes  the item from marketplace
     *  Transfers ownership of the item back to seller
     * check if the auction is already ended or not
     *
     */
    function removeItem(
        uint256 itemId
    ) public onlySeller(itemId) onlyWhenNoBidder(itemId) {
        IERC721(idToMarketItem[itemId].nftContract).transferFrom(
            address(this),
            idToMarketItem[itemId].seller,
            idToMarketItem[itemId].tokenId
        );
        idToMarketItem[itemId].status = ItemStatus.REMOVED;

        string memory metadataURI = IERC721Metadata(
            idToMarketItem[itemId].nftContract
        ).tokenURI(idToMarketItem[itemId].tokenId);
        emit ItemRemoved(
            itemId,
            idToMarketItem[itemId].nftContract,
            idToMarketItem[itemId].tokenId,
            metadataURI,
            _msgSender()
        );
    }

    /***
     * @dev it starts sale automatically after the Auction is ended
     */
    function _invokeStartSale(uint itemId) private {
        idToMarketItem[itemId].auctioneEndTime = 0;
        idToMarketItem[itemId].status = ItemStatus.SALE;

        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        uint256 price = idToMarketItem[itemId].price;

        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );

        emit SaleStarted(
            itemId,
            nftContract,
            tokenId,
            metadataURI,
            _msgSender(),
            price
        );
    }

    /**
     *  @dev buy nft from a seller , transfer it &&
     *  check if it's not in auction already
     */
    function buyItem(
        uint256 itemId
    ) public payable onlyWhenItemIsForSale(itemId) {
        MarketItem memory _item = idToMarketItem[itemId];

        string memory metadataURI = IERC721Metadata(_item.nftContract).tokenURI(
            _item.tokenId
        );
        require(
            msg.value == _item.price,
            "StorefrontMarketplace: Pay Market Price to buy the NFT"
        );

        idToMarketItem[itemId].status = ItemStatus.SOLD;
        _paymentSplit(itemId, msg.value, _msgSender());
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

    /***
     * @dev start auction for an item
     */
    function startAuction(
        uint256 itemId,
        uint256 time
    ) external onlySeller(itemId) {
        require(
            time >= 60,
            "StorefrontMarketplace: Timer cannot be less than One Minute"
        );
        idToMarketItem[itemId].auctioneEndTime = 0;

        uint256 price = idToMarketItem[itemId].price;

        uint256 endTime = block.timestamp + time;

        idToMarketItem[itemId].auctioneEndTime = endTime;
        idToMarketItem[itemId].status = ItemStatus.AUCTION;

        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );

        emit AuctionStarted(
            itemId,
            nftContract,
            tokenId,
            metadataURI,
            _msgSender(),
            price,
            time
        );
    }

    /**
     * @dev Users can place a bid on a specific item &&
     * to check if the item auction time is still there or not
     */
    function placeBid(
        uint256 itemId
    ) external payable onlyWhenItemIsForAuction(itemId) {
        require(
            block.timestamp < idToMarketItem[itemId].auctioneEndTime,
            "StorefrontMarketplace: Time limit has been reached"
        );
        require(
            msg.value > idToMarketItem[itemId].highestBid,
            "StorefrontMarketplace: value less than the highest Bid"
        );

        address lastHighestBidder = idToMarketItem[itemId].highestBidder;

        uint256 lastHighestBid = idToMarketItem[itemId].highestBid;
        if (lastHighestBidder != address(0)) {
            payable(lastHighestBidder).transfer(lastHighestBid);
        }

        idToMarketItem[itemId].highestBidder = _msgSender();
        idToMarketItem[itemId].highestBid = msg.value;
        emit BidPlaced(itemId, msg.value, _msgSender());
    }

    /**
     * @dev Accept the current highest Bid and transfer the NFT concluding the auction  only by the item Seller
     */
    function acceptBidAndEndAuction(
        uint256 itemId
    ) public onlyWhenItemIsForAuction(itemId) {
        address auctioneerAddress = idToMarketItem[itemId].seller;
        uint256 bidAmount = idToMarketItem[itemId].highestBid;
        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );

        if (idToMarketItem[itemId].highestBidder != address(0)) {
            _paymentSplit(
                itemId,
                bidAmount,
                idToMarketItem[itemId].highestBidder
            );

            emit AuctionEnded(
                itemId,
                nftContract,
                tokenId,
                metadataURI,
                auctioneerAddress,
                idToMarketItem[itemId].highestBidder,
                bidAmount
            );
            idToMarketItem[itemId].highestBidder = address(0);
            idToMarketItem[itemId].highestBid = 0;
        } else {
            _invokeStartSale(itemId);
        }
    }

    /**
     *  @dev After the auction's time has run out, anybody can conclude the
     * bidding by confirming the highest bid and bidder, and
     * therefore transferring the NFT; otherwise launching Sale automatically
     */
    function concludeAuction(
        uint256 itemId
    ) public onlyWhenItemIsForAuction(itemId) {
        require(
            idToMarketItem[itemId].auctioneEndTime <= block.timestamp,
            "StorefrontMarketplace: Auction is still running"
        );

        address auctioneerAddress = idToMarketItem[itemId].seller;
        uint256 bidAmount = idToMarketItem[itemId].highestBid;
        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        string memory metadataURI = IERC721Metadata(nftContract).tokenURI(
            tokenId
        );

        if (idToMarketItem[itemId].highestBidder != address(0)) {
            _paymentSplit(
                itemId,
                bidAmount,
                idToMarketItem[itemId].highestBidder
            );
            emit AuctionEnded(
                itemId,
                nftContract,
                tokenId,
                metadataURI,
                auctioneerAddress,
                idToMarketItem[itemId].highestBidder,
                bidAmount
            );
            idToMarketItem[itemId].highestBidder = address(0);
            idToMarketItem[itemId].highestBid = 0;
        } else {
            _invokeStartSale(itemId);
        }
    }

    /**
     * @dev function to update the price of the auction
     * by the auctioneer ,if there is no bids available
     */
    function updatePrice(
        uint256 itemId,
        uint256 price
    ) external onlySeller(itemId) onlyWhenNoBidder(itemId) returns (uint256) {
        idToMarketItem[itemId].price = price;
        emit PriceUpdated(itemId, price);
        return price;
    }

    /***
     * @dev function to update the end time of the auction by the auctioneer ,
     * if there is no bids available
     *  @param the time must be in seconds
     */
    function updateAuctionTime(
        uint256 itemId,
        uint256 time
    )
        public
        onlySeller(itemId)
        onlyWhenItemIsForAuction(itemId)
        onlyWhenNoBidder(itemId)
        returns (uint256)
    {
        idToMarketItem[itemId].auctioneEndTime = block.timestamp + time;
        emit TimeUpdated(itemId, idToMarketItem[itemId].auctioneEndTime);
        return idToMarketItem[itemId].auctioneEndTime;
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
