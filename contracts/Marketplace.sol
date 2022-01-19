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

    constructor(uint96 _platformFee) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(DEFAULT_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
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
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, address owner, uint256 price, bool forSale);
    event MarketItemSold(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address buyer, uint256 price);

    /*  Places an item for sale on the marketplace
        Accepts price in native asset of the blockchain network
    */
    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) public returns(uint256) {
        require(price > 0, "Marketplace: Price must be at least 1 wei");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, true);

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, true);
        return itemId;
    }

    /*  Creates the sale of a marketplace item
        Transfers ownership of the item, as well as funds between parties
    */
    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Marketplace: Pay Market Price to buy the NFT");

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        // Calculate Payouts between seller and platform
        uint256 amountReceived = msg.value;
        uint256 amountToMarketplace = (amountReceived * platformFeeBasisPoint) / 1000;
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
    function changeFeeAndPayoutAddress(uint96 newPlatformFee, address newPayoutAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        platformFeeBasisPoint = newPlatformFee;
        payoutAddress = newPayoutAddress;
    }
}
