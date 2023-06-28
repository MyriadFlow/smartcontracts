# A GUIDE TO CONTRACT

## **InstaGen**

_{ERC721A} token, including:

 - ability for holders to burn (destroy) their tokens
 - a creator role that allows for token minting (creation)
 - token ID and URI autogeneration
 - ability for holders to give for rent

This contract uses {AccessControl} to lock permissioned functions using the
different roles - head to its documentation for details.

The account that deploys the contract will be granted the creator and pauser
roles, as well as the default admin role, which will let it grant both creator
and pauser roles to other accounts._

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
mapping(uint256 => struct InstaGen.RentableItems) rentables
```

_storing the data of the user who are renting the NFT_

### flowRoles

```solidity
contract IACCESSMASTER flowRoles
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

### constructor

```solidity
constructor(string name, string symbol, address marketplaceAddress, address accessControlAddress, uint256 _salePrice, uint256 _preSalePrice, uint256 _countDownTime, uint256 _maxSupply, uint256 _royaltyBPS, string _baseUri) public
```

### mint

```solidity
function mint(uint256 quantity) external payable returns (uint256, uint256)
```

### burnNFT

```solidity
function burnNFT(uint256 tokenId) external
```

Burns `tokenId`. See {ERC721-_burn}.

_Requirements:

- The caller must own `tokenId` or be an approved operator._

### withdraw

```solidity
function withdraw() external
```

### setRentInfo

```solidity
function setRentInfo(uint256 tokenId, bool isRentable, uint256 pricePerHour) external
```

_Owner can set the rental status of the token_

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

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, it can be overridden in child contracts._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```