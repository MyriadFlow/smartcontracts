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

## IFlowAccessControl

_External interface of FlowAccessControl declared to support ERC165 detection._

### isAdmin

```solidity
function isAdmin(address user) external view returns (bool)
```

_checks if the address {User} is Admin or not._

### isOperator

```solidity
function isOperator(address user) external view returns (bool)
```

_checks if the address {User} is Operator or not._

### isCreator

```solidity
function isCreator(address user) external view returns (bool)
```

_checks if the address {User} is creator or not._

## IERC4907

### UpdateUser

```solidity
event UpdateUser(uint256 tokenId, address user, uint64 expires)
```

Emitted when the `user` of an NFT or the `expires` of the `user` is changed
The zero address for user indicates that there is no user address

### setUser

```solidity
function setUser(uint256 tokenId, address user, uint64 expires) external
```

set the user and expires of an NFT

_The zero address indicates there is no user
Throws if `tokenId` is not valid NFT_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 |  |
| user | address | The new user of the NFT |
| expires | uint64 | UNIX timestamp, The new user could use the NFT before expires |

### userOf

```solidity
function userOf(uint256 tokenId) external view returns (address)
```

Get the user address of an NFT

_The zero address indicates that there is no user or the user is expired_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to get the user address for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The user address for this NFT |

### userExpires

```solidity
function userExpires(uint256 tokenId) external view returns (uint256)
```

Get the user expires of an NFT

_The zero value indicates that there is no user_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to get the user expires for |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The user expires for this NFT |

## FlowGenEdition

### preSalePrice

```solidity
uint256 preSalePrice
```

### countDownTime

```solidity
uint256 countDownTime
```

_The time until presalePrice will be valid_

### maxSupply

```solidity
uint256 maxSupply
```

### marketplace

```solidity
address marketplace
```

### salePrice

```solidity
uint256 salePrice
```

### RentableItems

```solidity
struct RentableItems {
  bool isRentable;
  address user;
  uint64 expires;
  uint256 hourlyRate;
}
```

### rentables

```solidity
mapping(uint256 => struct FlowGenEdition.RentableItems) rentables
```

_storing the data of the user who are renting the NFT_

### flowRoles

```solidity
contract IFlowAccessControl flowRoles
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

### AssetCreated

```solidity
event AssetCreated(uint256 currentIndex, uint256 quantity, address creator)
```

### AssetDestroyed

```solidity
event AssetDestroyed(uint256 tokenId, address ownerOrApproved)
```

### RentalInfo

```solidity
event RentalInfo(uint256 tokenId, bool isRentable, uint256 price, address renter)
```

### UpdateUser

```solidity
event UpdateUser(uint256 tokenId, address user, uint64 expires)
```

### constructor

```solidity
constructor(string name, string symbol, address marketplaceAddress, address accessControlAddress, uint256 _salePrice, uint256 _preSalePrice, uint256 _countDownTime, uint256 _maxSupply, uint256 _royaltyBPS) public
```

### mint

```solidity
function mint(uint256 quantity) external payable returns (uint256, uint256)
```

### burnNFT

```solidity
function burnNFT(uint256 tokenId) external
```

### withdraw

```solidity
function withdraw() external
```

### setRentInfo

```solidity
function setRentInfo(uint256 tokenId, bool isRentable) external
```

_Owner can set the rental status of the token_

### setprice

```solidity
function setprice(uint256 tokenId, uint256 pricePerHour) external
```

_Owner can set the rental price of the token_

### setUser

```solidity
function setUser(uint256 tokenId, address user, uint64 expires) public
```

set the user and expires of an NFT

_This function is used to gift a person by the owner,
The zero address indicates there is no user
Throws if `tokenId` is not valid NFT_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 |  |
| user | address | The new user of the NFT |
| expires | uint64 | UNIX timestamp, The new user could use the NFT before expires |

### rent

```solidity
function rent(uint256 _tokenId, uint256 _timeInHours) external payable
```

to use for renting an item

_The zero address indicates there is no user
Throws if `tokenId` is not valid NFT,
time cannot be less than 1 hour or more than 6 months_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 |  |
| _timeInHours | uint256 | is in hours , Ex- 1,2,3 |

### userOf

```solidity
function userOf(uint256 tokenId) public view returns (address)
```

_IERC4907 implementation_

### userExpires

```solidity
function userExpires(uint256 tokenId) public view returns (uint256)
```

_IERC4907 implementation_

### amountRequired

```solidity
function amountRequired(uint256 tokenId, uint256 time) public view returns (uint256 amount)
```

to calculate the amount of money required
to rent an item for a certain time

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```