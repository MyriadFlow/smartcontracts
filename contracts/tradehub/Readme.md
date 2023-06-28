# A GUIDE TO CONTRACT

## TradeHub

_A marketplace contract where anyone can list there assets and give it for direct sale or auction_


### marketplacePayoutAddress

```solidity
address marketplacePayoutAddress
```

### platformFeeBasisPoint

```solidity
uint96 platformFeeBasisPoint
```

### name

```solidity
string name
```

### ItemStatus

```solidity
enum ItemStatus {
  NONEXISTANT,
  SALE,
  AUCTION,
  SOLD,
  REMOVED
}
```

### MarketItem

```solidity
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
  enum TradeHub.ItemStatus status;
}
```

### idToMarketItem

```solidity
mapping(uint256 => struct TradeHub.MarketItem) idToMarketItem
```

### flowRoles

```solidity
contract IACCESSMASTER flowRoles
```

### SaleStarted

```solidity
event SaleStarted(uint256 itemId, address nftContract, uint256 tokenId, string metaDataURI, address seller, uint256 price)
```

### AuctionStarted

```solidity
event AuctionStarted(uint256 itemId, address nftContract, uint256 tokenId, string metaDataURI, address auctioneer, uint256 basePrice, uint256 endTime)
```

### BidPlaced

```solidity
event BidPlaced(uint256 itemId, uint256 amount, address bidder)
```

### AuctionEnded

```solidity
event AuctionEnded(uint256 auctionId, address nftContract, uint256 tokenId, string metadataURI, address auctioneer, address highestBidder, uint256 bid)
```

### PriceUpdated

```solidity
event PriceUpdated(uint256 itemId, uint256 updatedPrice)
```

### TimeUpdated

```solidity
event TimeUpdated(uint256 itemId, uint256 updatedTime)
```

### ItemSold

```solidity
event ItemSold(uint256 itemId, address nftContract, uint256 tokenId, string metadataURI, address seller, address buyer, uint256 price)
```

### ItemRemoved

```solidity
event ItemRemoved(uint256 itemId, address nftContract, uint256 tokenId, string metaDataURI, address seller)
```

### onlyWhenItemIsForSale

```solidity
modifier onlyWhenItemIsForSale(uint256 itemId)
```

### onlyWhenItemIsForAuction

```solidity
modifier onlyWhenItemIsForAuction(uint256 itemId)
```

### onlySeller

```solidity
modifier onlySeller(uint256 itemId)
```

### onlyWhenNoBidder

```solidity
modifier onlyWhenNoBidder(uint256 itemId)
```

### onlyWhenItemIsEligible

```solidity
modifier onlyWhenItemIsEligible(address nftContract)
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

### constructor

```solidity
constructor(uint96 _platformFee, string _name, address flowContract) public
```

### changeFeeAndPayoutAddress

```solidity
function changeFeeAndPayoutAddress(uint96 newPlatformFee, address newPayoutAddress) public
```

_Change the Platform fees along with the payout address
  Allows only Admins to perform this operation_

### listItem

```solidity
function listItem(address nftContract, uint256 tokenId, uint256 price, uint256 quantity, bool forAuction, uint256 time) external returns (uint256 itemId)
```

_only {ERC721} or {ERC1155} token owner can use this function for listing_

### removeItem

```solidity
function removeItem(uint256 itemId) public
```

_Removes/Deletes  the item from marketplace
Transfers ownership of the item back to seller
check if the auction is already ended or not_

### buyItem

```solidity
function buyItem(uint256 itemId, uint256 quantity) public payable
```

@dev buy nft from a seller , transfer it &&
 check if it's not in auction already

### startAuction

```solidity
function startAuction(uint256 itemId, uint256 time) external
```

_start auction for an item_

### placeBid

```solidity
function placeBid(uint256 itemId) external payable
```

_Users can place a bid on a specific item &&
to check if the item auction time is still there or not_

### acceptBidAndEndAuction

```solidity
function acceptBidAndEndAuction(uint256 itemId) public
```

_only Seller can accept the current highest Bid and transfer the NFT concluding the auction,
if no bidder then start sale_

### concludeAuction

```solidity
function concludeAuction(uint256 itemId) public
```

@dev After the auction's time has run out, anybody can conclude the
bidding by confirming the highest bid and bidder, and
therefore transferring the NFT; otherwise launching Sale automatically

### updatePrice

```solidity
function updatePrice(uint256 itemId, uint256 pricePerUnit) external returns (uint256)
```

_function to update the price of the auction
by the auctioneer ,if there is no bids available_

### updateAuctionTime

```solidity
function updateAuctionTime(uint256 itemId, uint256 time) public returns (uint256)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```