// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "../accessmaster/interfaces/IAccessMaster.sol";

error ItemExist();

// create a function
contract TradeHub is
    Context,
    ReentrancyGuard,
    ERC721Holder,
    ERC1155Holder,
    ERC2981
{
    // Set Constants for Interface ID and Roles
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;

    address public marketplacePayoutAddress;
    uint96 public platformFeeBasisPoint;
    uint8 public version = 1;

    string public name;

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
        uint256 supply;
        uint256 auctioneEndTime;
        uint256 highestBid;
        address highestBidder;
        ItemStatus status;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;

    mapping(address => mapping(uint256 => uint256)) private _marketItem;

    IACCESSMASTER flowRoles;

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
    modifier onlyWhenItemIsForSale(uint256 itemId) {
        require(
            idToMarketItem[itemId].status == ItemStatus.SALE,
            "TradeHub: Market item is not for sale"
        );
        _;
    }
    modifier onlyWhenItemIsForAuction(uint256 itemId) {
        require(
            idToMarketItem[itemId].status == ItemStatus.AUCTION,
            "TradeHub: The auction has not started yet"
        );
        _;
    }
    modifier onlySeller(uint256 itemId) {
        require(
            idToMarketItem[itemId].seller == _msgSender(),
            "TradeHub: Sender is not seller of this item"
        );
        _;
    }
    modifier onlyWhenNoBidder(uint256 itemId) {
        require(
            idToMarketItem[itemId].highestBidder == address(0),
            "TradeHub : Auction is still running"
        );
        _;
    }
    modifier onlyWhenItemIsEligible(address nftContract) {
        require(
            checkERC1155(nftContract) || checkERC721(nftContract),
            "TradeHub: Contract is not eligible for listing"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            flowRoles.isAdmin(_msgSender()),
            "TradeHub: User is not authorized"
        );
        _;
    }

    constructor(
        uint96 _platformFee,
        string memory _name,
        address flowContract
    ) {
        flowRoles = IACCESSMASTER(flowContract);
        platformFeeBasisPoint = _platformFee;
        marketplacePayoutAddress = _msgSender();
        name = _name;
    }

    /** @dev Change the Platform fees along with the payout address
     *   Allows only Admins to perform this operation
     */
    function changeFeeAndPayoutAddress(
        uint96 newPlatformFee,
        address newPayoutAddress
    ) public onlyAdmin {
        platformFeeBasisPoint = newPlatformFee;
        marketplacePayoutAddress = newPayoutAddress;
    }

    /** @dev check if the item already existed , if it
     * does then return the previous value
     */

    function _getItemId(
        address nftContract,
        uint256 tokenId
    ) private returns (uint256 itemId) {
        uint256 marketItemId = _marketItem[nftContract][tokenId];
        if (checkERC1155(nftContract)) {
            _itemIds.increment();
            itemId = _itemIds.current();
        } else {
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
                revert ItemExist();
            }
        }
    }

    function _getMetaDataURI(
        address nftContract,
        uint256 tokenId
    ) private view returns (string memory metadataURI) {
        if (checkERC1155(nftContract)) {
            metadataURI = IERC1155MetadataURI(nftContract).uri(tokenId);
        } else {
            metadataURI = IERC721Metadata(nftContract).tokenURI(tokenId);
        }
    }

    function _transferItem(
        address nftContract,
        address from,
        address to,
        uint256 tokenId,
        uint256 quantity
    ) private {
        if (checkERC1155(nftContract)) {
            IERC1155(nftContract).safeTransferFrom(
                from,
                to,
                tokenId,
                quantity,
                ""
            );
        } else {
            IERC721(nftContract).transferFrom(from, to, tokenId);
        }
    }

    /**
     * @dev function to split the payment between creator , marketplace & nft Seller
     *  also tranfer it to the nft buyer who paid for it
     */
    function _paymentSplit(
        uint256 itemId,
        uint256 value,
        address recieverAddress,
        uint256 quantity
    ) private nonReentrant {
        MarketItem memory _item = idToMarketItem[itemId];
        _transferItem(
            _item.nftContract,
            address(this),
            recieverAddress,
            _item.tokenId,
            quantity
        );

        uint256 payoutForMarketplace;
        uint256 amountRemaining;

        if (checkERC1155(_item.nftContract)) {
            // Calculate Payout for Platform
            payoutForMarketplace = (value * platformFeeBasisPoint) / 1000;
            //Calculate Payout for Seller
            amountRemaining = value - payoutForMarketplace;
            //transfering amounts to marketplace, creator and seller
            payable(marketplacePayoutAddress).transfer(payoutForMarketplace);
            //item Seller
            payable(_item.seller).transfer(amountRemaining);
        } else {
            // Calculate Payout for Platform
            payoutForMarketplace = (value * platformFeeBasisPoint) / 1000;
            amountRemaining = value - payoutForMarketplace;

            //Calculate Royalty Amount for Creator
            (address creator, uint256 royaltyAmount) = IERC2981(
                _item.nftContract
            ).royaltyInfo(_item.tokenId, amountRemaining);

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
    }

    /**
     * @dev only {ERC721} or {ERC1155} token owner can use this function for listing
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 quantity,
        bool forAuction,
        uint256 time
    ) external onlyWhenItemIsEligible(nftContract) returns (uint256 itemId) {
        require(price > 0, "TradeHub: Price must be at least 1 wei");

        if (checkERC721(nftContract)) {
            quantity = 1;
        }

        if (forAuction == true) {
            require(
                time >= 60,
                "TradeHub: Time cannot be less than 1 min"
            );
        }
        itemId = _getItemId(nftContract, tokenId);

        string memory metadataURI = _getMetaDataURI(nftContract, tokenId);

        if (checkERC1155(nftContract)) {
            // {ERC1155} token listing
            require(
                IERC1155(nftContract).balanceOf(_msgSender(), tokenId) >=
                    quantity,
                "TradeHub: Insufficient qunatity for listing!"
            );
            _transferItem(
                nftContract,
                _msgSender(),
                address(this),
                tokenId,
                quantity
            );
        } else {
            // {ERC721} token listing
            require(
                IERC721(nftContract).ownerOf(tokenId) == _msgSender(),
                "TradeHub: Sender does not own the item"
            );
            _transferItem(nftContract, _msgSender(), address(this), tokenId, 1);
        }

        if (forAuction != true) {
            idToMarketItem[itemId] = MarketItem(
                itemId,
                nftContract,
                tokenId,
                payable(_msgSender()),
                price,
                quantity,
                0,
                0,
                address(0),
                ItemStatus.SALE
            );

            // quantity should be added
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
            uint256 startingBid = price * quantity;

            idToMarketItem[itemId] = MarketItem(
                itemId,
                nftContract,
                tokenId,
                _msgSender(),
                price,
                quantity,
                endAt,
                startingBid,
                address(0),
                ItemStatus.AUCTION
            );
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
    }

    /**
     * @dev Removes/Deletes  the item from marketplace
     * Transfers ownership of the item back to seller
     * check if the auction is already ended or not
     *
     */
    function removeItem(
        uint256 itemId
    ) public onlySeller(itemId) onlyWhenNoBidder(itemId) {
        address nftContract = idToMarketItem[itemId].nftContract;
        address seller = idToMarketItem[itemId].seller;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        uint256 quantity = idToMarketItem[itemId].supply;

        _transferItem(nftContract, address(this), seller, tokenId, quantity);

        idToMarketItem[itemId].status = ItemStatus.REMOVED;

        string memory metadataURI = _getMetaDataURI(nftContract, tokenId);
        emit ItemRemoved(
            itemId,
            idToMarketItem[itemId].nftContract,
            idToMarketItem[itemId].tokenId,
            metadataURI,
            _msgSender()
        );
    }

    /**
     * @dev it starts sale automatically after the Auction is ended
     */
    function _invokeStartSale(uint itemId) private {
        idToMarketItem[itemId].auctioneEndTime = 0;
        idToMarketItem[itemId].status = ItemStatus.SALE;

        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        uint256 price = idToMarketItem[itemId].price;
        string memory metadataURI = _getMetaDataURI(nftContract, tokenId);
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
        uint256 itemId,
        uint256 quantity
    ) public payable onlyWhenItemIsForSale(itemId) {
        MarketItem memory _item = idToMarketItem[itemId];
        require(
            quantity <= _item.supply,
            "TradeHub: greater quantity than available"
        );
        require(
            msg.value == _item.price * quantity,
            "TradeHub: Pay Market Price to buy the NFT"
        );
        string memory metadataURI = _getMetaDataURI(
            _item.nftContract,
            _item.tokenId
        );
        //ERC1155
        if (checkERC1155(_item.nftContract)) {
            _paymentSplit(itemId, msg.value, _msgSender(), quantity);

            _item.supply = _item.supply - quantity;

            if (_item.supply == 0) {
                idToMarketItem[itemId].status = ItemStatus.SOLD;
            }
        } else {
            _paymentSplit(itemId, msg.value, _msgSender(), 1);
        }

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

    /**
     * @dev start auction for an item
     */
    function startAuction(
        uint256 itemId,
        uint256 time
    ) external onlySeller(itemId) onlyWhenItemIsForSale(itemId) {
        address nftContract = idToMarketItem[itemId].nftContract;
        require(
            time >= 60,
            "TradeHub: Timer cannot be less than One Minute"
        );

        uint256 price = idToMarketItem[itemId].highestBid;

        uint256 endTime = block.timestamp + time;

        idToMarketItem[itemId].auctioneEndTime = endTime;
        idToMarketItem[itemId].status = ItemStatus.AUCTION;

        uint256 tokenId = idToMarketItem[itemId].tokenId;

        string memory metadataURI = _getMetaDataURI(nftContract, tokenId);

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
            "TradeHub: Time limit has been reached"
        );
        require(
            msg.value > idToMarketItem[itemId].highestBid,
            "TradeHub: value less than the highest Bid"
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

    /// @dev end auction and split payment or start sale
    function _endAuction(uint256 itemId) private {
        address auctioneerAddress = idToMarketItem[itemId].seller;
        uint256 bidAmount = idToMarketItem[itemId].highestBid;
        address nftContract = idToMarketItem[itemId].nftContract;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        string memory metadataURI = _getMetaDataURI(nftContract, tokenId);
        if (idToMarketItem[itemId].highestBidder != address(0)) {
            if (checkERC1155(nftContract)) {
                uint256 quantity = idToMarketItem[itemId].supply;
                _paymentSplit(
                    itemId,
                    bidAmount,
                    idToMarketItem[itemId].highestBidder,
                    quantity
                );
            } else {
                _paymentSplit(
                    itemId,
                    bidAmount,
                    idToMarketItem[itemId].highestBidder,
                    1
                );
            }
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
     * @dev only Seller can accept the current highest Bid and transfer the NFT concluding the auction,
     * if no bidder then start sale
     */
    function acceptBidAndEndAuction(
        uint256 itemId
    ) public onlyWhenItemIsForAuction(itemId) onlySeller(itemId) {
        _endAuction(itemId);
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
            "TradeHub: Auction is still running"
        );
        _endAuction(itemId);
    }

    /**
     * @dev function to update the price of the auction
     * by the auctioneer ,if there is no bids available
     */
    function updatePrice(
        uint256 itemId,
        uint256 pricePerUnit
    ) external onlySeller(itemId) onlyWhenNoBidder(itemId) returns (uint256) {
        idToMarketItem[itemId].price = pricePerUnit;
        emit PriceUpdated(itemId, pricePerUnit);
        return pricePerUnit;
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

    function checkERC1155(address contractAddress) private view returns (bool) {
        return
            IERC1155(contractAddress).supportsInterface(_INTERFACE_ID_ERC1155);
    }

    function checkERC721(address contractAddress) private view returns (bool) {
        return
            IERC1155(contractAddress).supportsInterface(_INTERFACE_ID_ERC721);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC2981, ERC1155Receiver) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
