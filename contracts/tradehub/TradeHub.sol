// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "../accessmaster/interfaces/IAccessMaster.sol";

///@dev Define a custom error for when an item already exists
error ItemExist();

/**
 * @title TradeHub
 * @dev This contract implements a decentralized marketplace for buying and selling NFTs.
 */
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

    uint256 private Counter;

    address public accessMasterAddress;
    uint96 public platformFeeBasisPoint;

    uint8 public constant version = 1;

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
    /// @dev Mapping to track MarketItem by its ID
    mapping(uint256 => MarketItem) public idToMarketItem;
    /// @dev Mappings to track NFTs listed for sale and their owners
    mapping(address => mapping(uint256 => uint256)) public marketItemERC721;
    mapping(address => mapping(address => mapping(uint256 => uint256)))
        public marketItemERC1155;

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
        uint256 price,
        uint256 quantity
    );

    event ItemRemoved(
        uint256 itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        string metaDataURI,
        address seller
    );

    ///@notice Modifier to ensure that an item is currently for sale
    modifier onlyWhenItemIsForSale(uint256 itemId) {
        require(
            idToMarketItem[itemId].status == ItemStatus.SALE,
            "TradeHub: Market item is not for sale"
        );
        _;
    }
    ///@notice Modifier to ensure that an item is currently in an auction
    modifier onlyWhenItemIsForAuction(uint256 itemId) {
        require(
            idToMarketItem[itemId].status == ItemStatus.AUCTION,
            "TradeHub: The auction has not started yet"
        );
        _;
    }
    /// @notice Modifier to ensure that the sender is the seller of the item
    modifier onlySeller(uint256 itemId) {
        require(
            idToMarketItem[itemId].seller == _msgSender(),
            "TradeHub: Sender is not seller of this item"
        );
        _;
    }
    ///@notice  Modifier to ensure that there are no bidders on the item
    modifier onlyWhenNoBidder(uint256 itemId) {
        require(
            idToMarketItem[itemId].highestBidder == address(0),
            "TradeHub : Auction is still running"
        );
        _;
    }
    ///@notice Modifier to check if an NFT contract is eligible for listing only
    /// if it is an ERC721 and ERC1155
    modifier onlyWhenItemIsEligible(address nftContract) {
        require(
            checkERC1155(nftContract) || checkERC721(nftContract),
            "TradeHub: Contract is not eligible for listing"
        );
        _;
    }

    ///@notice Modifier to ensure that the sender is an operator
    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "EternumPass: Unauthorized!"
        );
        _;
    }

    /**
     * @dev Constructor for TradeHub
     * @param _platformFee The platform fee in basis points(10%)
     * @param _name The name of the marketplace
     * @param flowContract The address of the Access Master contract
     */
    constructor(
        uint96 _platformFee,
        string memory _name,
        address flowContract
    ) {
        flowRoles = IACCESSMASTER(flowContract);
        platformFeeBasisPoint = _platformFee;
        name = _name;
        accessMasterAddress = flowContract;
    }

    /**
     * @dev Change the platform fees along with the payout address
     * Allows only Admins to perform this operation
     * @param newPlatformFee The new platform fee in basis points
     */
    function changeFee(uint96 newPlatformFee) public onlyOperator {
        platformFeeBasisPoint = newPlatformFee;
    }

    /**
     * @dev Check if the item already exists in Sale or Auction.
     *  If it does, return the previous value ,if not generate new one
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT
     * @return itemId The unique item ID for the NFT
     */
    function _getItemId(
        address nftContract,
        uint256 tokenId
    ) private returns (uint256 itemId) {
        if (checkERC1155(nftContract)) {
            uint256 marketItemId = marketItemERC1155[_msgSender()][nftContract][
                tokenId
            ];
            if (marketItemId == 0) {
                Counter++;
                itemId = Counter;
                marketItemERC1155[_msgSender()][nftContract][tokenId] = itemId;
            } else if (
                marketItemId != 0 &&
                (idToMarketItem[marketItemId].status == ItemStatus.SOLD ||
                    idToMarketItem[marketItemId].status == ItemStatus.REMOVED)
            ) {
                itemId = marketItemId;
            } else {
                revert ItemExist();
            }
        } else {
            uint256 marketItemId = marketItemERC721[nftContract][tokenId];
            if (marketItemId == 0) {
                Counter++;
                itemId = Counter;
                marketItemERC721[nftContract][tokenId] = itemId;
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

    /**
     * @dev Get the metadata URI of an NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT
     * @return metadataURI The metadata URI for the NFT
     */
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

    /**
     * @dev Transfer an NFT from one address to another
     * @param nftContract The address of the NFT contract
     * @param from The address of the sender
     * @param to The address of the receiver
     * @param tokenId The ID of the NFT
     * @param quantity The quantity of NFTs to transfer (only relevant for ERC1155)
     */
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
     * @dev Split the payment for an NFT between the creator, marketplace, and NFT seller
     * Transfer the NFT to the buyer
     * @param itemId The ID of the item
     * @param value The total payment amount
     * @param recieverAddress The address of the NFT buyer
     * @param quantity The quantity of NFTs being sold
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
        address marketplacePayoutAddress = flowRoles.getPayoutAddress();

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
     * @notice List an NFT item for sale or auction
     * @dev It can only be called when the item is not currently up for auction or sale on the marketplace.
     * Or else Error will be thrown ItemExist()
     *
     * Emits a "SaleStarted" or "AuctionStarted" event, depending on the listing type.
     *
     * Requirements:
     * - The price must be greater than 0 wei.
     * - For auction listings, the auction duration must be at least 1 minute (60 seconds).
     *
     * @param nftContract The address of the NFT contract
     * @param tokenId The ID of the NFT
     * @param price The sale price per unit
     * @param quantity The quantity of NFTs to list (only relevant for ERC1155)
     * @param forAuction Whether the item is listed for auction
     * @param time The duration of the auction in seconds (only relevant for auctions)
     *
     * @return itemId The unique item ID for the NFT
     *
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
            require(time >= 60, "TradeHub: Time cannot be less than 1 min");
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
     * @notice Allows the owner of an item to remove it from the marketplace.
     * The ownership of the item is transferred back to the seller.
     * This function can only be called when there are no active bidders on the item.
     *
     * @param itemId The unique identifier of the item to be removed.
     *
     * Emits an "ItemRemoved" event upon successful removal.
     *
     * Requirements:
     * - The caller must be the seller of the item.
     * - The item must not have any active bidders.
     *
     * @param itemId The unique identifier of the item to be removed.
     */
    function removeItem(
        uint256 itemId
    ) external onlySeller(itemId) onlyWhenNoBidder(itemId) {
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
     * @notice Initiates the sale of an item automatically after an auction has ended.
     * This function is called internally and transitions the item's status from 'AUCTION' to 'SALE'.
     *
     * @param itemId The unique identifier of the item with the ended auction.
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
     * @notice Allows a user to purchase an item listed for sale.
     * The user must send the correct amount of Ether corresponding to the item's price.
     * The item can be an ERC721 or ERC1155 token.
     *
     * @param itemId The unique identifier of the item to be purchased.
     * @param quantity The quantity of items to purchase (used for ERC1155 tokens).
     *
     * Emits an "ItemSold" event upon a successful purchase.
     *
     * Requirements:
     * - The item must be listed for sale.
     * - The sent Ether must match the item's price.
     *
     * @param itemId The unique identifier of the item to be purchased.
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
            quantity = 1;
            _paymentSplit(itemId, msg.value, _msgSender(), 1);
        }

        emit ItemSold(
            itemId,
            _item.nftContract,
            _item.tokenId,
            metadataURI,
            _item.seller,
            _msgSender(),
            _item.price,
            quantity
        );
    }

    /**
     * @notice Starts an auction for an item, allowing users to place bids.
     * The duration of the auction is specified in seconds.
     *
     * @dev The default "Auction price" is automatically set to the current "Sale Price" of the item
     * in the time of conversion occurs.
     * In the case of ERC1155 tokens, the entire quantity of tokens for that specific tokenId is made available for auction
     * without requiring additional approval from the Seller
     *
     * @param itemId The unique identifier of the item to be auctioned.
     * @param time The duration of the auction in seconds.
     *
     * Emits an "AuctionStarted" event upon successful auction initiation.
     *
     * Requirements:
     * - The caller must be the seller of the item.
     * - The item must be in Sale already (either ERC721 or ERC1155).
     * - The auction duration must be at least 1 minute (60 seconds).
     * -
     *
     * @param itemId The unique identifier of the item to be auctioned.
     */
    function startAuction(
        uint256 itemId,
        uint256 time
    ) external onlySeller(itemId) onlyWhenItemIsForSale(itemId) {
        address nftContract = idToMarketItem[itemId].nftContract;
        require(time >= 60, "TradeHub: Timer cannot be less than One Minute");

        uint256 price = idToMarketItem[itemId].price *
            idToMarketItem[itemId].supply;

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

    /**
     * @notice Marks the end of the auction for a specific item.
     * If there are no active bidders, the item is automatically listed for sale.
     *
     * @param itemId The unique identifier of the item with the ended auction.
     */
    function _endAuction(uint256 itemId) private {
        if (idToMarketItem[itemId].highestBidder != address(0)) {
            address auctioneerAddress = idToMarketItem[itemId].seller;
            uint256 bidAmount = idToMarketItem[itemId].highestBid;
            address nftContract = idToMarketItem[itemId].nftContract;
            uint256 tokenId = idToMarketItem[itemId].tokenId;
            string memory metadataURI = _getMetaDataURI(nftContract, tokenId);

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
     * @notice Allows the seller to accept the current highest bid, concluding the auction.
     * If no bidder exists, the item is automatically listed for sale.
     * Requirements:
     * - The caller must be the seller of the item.
     * - The item must be in Auction State.
     *
     * @param itemId The unique identifier of the item with the ongoing auction.
     */
    function acceptBidAndEndAuction(
        uint256 itemId
    ) external onlyWhenItemIsForAuction(itemId) onlySeller(itemId) {
        _endAuction(itemId);
    }

    /**
     * @notice After the auction's time has run out, anybody can conclude the bidding by
     * confirming the highest bid and bidder, and therefore transferring the NFT.
     * If no bidder exists, the item is automatically listed for sale.
     *
     * @param itemId The unique identifier of the item with the ongoing auction.
     */
    function concludeAuction(
        uint256 itemId
    ) external onlyWhenItemIsForAuction(itemId) {
        require(
            idToMarketItem[itemId].auctioneEndTime <= block.timestamp,
            "TradeHub: Auction is still running"
        );
        _endAuction(itemId);
    }

    /**
     * @notice Updates the price of an item for sale by the auctioneer.
     * This function can only be called when there are no active bidders on the item.
     *
     * @param itemId The unique identifier of the item with the updated price.
     * @param pricePerUnit The new price per unit for the item.
     * @return The updated price per unit.
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

    /**
     * @notice Checks if a contract supports the ERC1155 interface.
     *
     * @param contractAddress The address of the contract to check.
     * @return True if the contract supports ERC1155, otherwise false.
     */
    function checkERC1155(address contractAddress) private view returns (bool) {
        return
            IERC1155(contractAddress).supportsInterface(_INTERFACE_ID_ERC1155);
    }

    /**
     * @notice Checks if a contract supports the ERC721 interface.
     *
     * @param contractAddress The address of the contract to check.
     * @return True if the contract supports ERC721, otherwise false.
     */
    function checkERC721(address contractAddress) private view returns (bool) {
        return IERC721(contractAddress).supportsInterface(_INTERFACE_ID_ERC721);
    }

    /**
     * @notice Overrides the supportsInterface function to include ERC2981 and ERC1155Receiver interfaces.
     *
     * @param interfaceId The interface ID to check.
     * @return True if the contract supports the interface, otherwise false.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC2981, ERC1155Holder) returns (bool) {
        if (interfaceId == _INTERFACE_ID_ERC2981) return true;
        return super.supportsInterface(interfaceId);
    }
}
