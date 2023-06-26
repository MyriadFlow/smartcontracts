# A GUIDE TO SMART CONTRACT

## **EternumPass**

_{ERC721} token, including:

 - ability for holders to burn (destroy) their tokens
 - token ID and URI autogeneration
 - ability for holders to give for rent
 - services can only be used after renewal of subscription

This contract uses {AccessControl} to lock permissioned functions using the
different roles - head to its documentation for details.

The account that deploys the contract will be granted the creator and pauser
roles, as well as the default admin role, which will let it grant both creator
and pauser roles to other accounts._

### MONTH

```solidity
uint256 MONTH
```

UNIX TIME FOR ONE MONTH(30 days)

### mintPaused

```solidity
bool mintPaused
```

### publicSalePrice

```solidity
uint256 publicSalePrice
```

### platFormFeeBasisPoint

```solidity
uint256 platFormFeeBasisPoint
```

### subscriptionPricePerMonth

```solidity
uint256 subscriptionPricePerMonth
```

### baseURI

```solidity
string baseURI
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
mapping(uint256 => struct EternumPass.RentableItems) rentables
```

storing the data of the user who are renting the NFT

### cancellationRequested

```solidity
mapping(uint256 => bool) cancellationRequested
```

To check if cancellation is intiated or not

### flowRoles

```solidity
contract IACCESSMASTER flowRoles
```

### whenNotpaused

```solidity
modifier whenNotpaused()
```

### onlyWhenTokenExist

```solidity
modifier onlyWhenTokenExist(uint256 tokenId)
```

### onlyOperator

```solidity
modifier onlyOperator()
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

### NFTMinted

```solidity
event NFTMinted(uint256 tokenId, address owner)
```

### NFTBurnt

```solidity
event NFTBurnt(uint256 tokenId, address ownerOrApproved)
```

### RentalInfo

```solidity
event RentalInfo(uint256 tokenId, bool isRentable, uint256 price, address renter)
```

### RequestedCancelSubscription

```solidity
event RequestedCancelSubscription(uint256 tokenId, uint256 Time)
```

### constructor

```solidity
constructor(string _name, string _symbol, string _initialURI, uint256 _publicSalePrice, uint256 _platFormFeeBasisPoint, uint256 _subscriptionPricePerMonth, uint96 royaltyBasisPoint, bool _isOperatorSubscription, address flowContract) public
```

### updateFee

```solidity
function updateFee(uint256 _platFormFeeBasisPoint) external
```

Function to update the plateformFeeBasisPoint

### setPrice

```solidity
function setPrice(uint256 _publicSalePrice) external
```

Admin Role can set the mint price

### pause

```solidity
function pause() public
```

pause or stop the contract from working by ADMIN

### unpause

```solidity
function unpause() public
```

Unpause the contract by ADMIN

### setSubscriptionCharges

```solidity
function setSubscriptionCharges(uint256 _subscriptionCharges) public
```

change the subscription amount only by Admin

### setFreeSubscriptionStatus

```solidity
function setFreeSubscriptionStatus(bool _isOperatorSubscription) external
```

change the free subscription status

### setBaseURI

```solidity
function setBaseURI(string _tokenBaseURI) external
```

only operator can set base token URI for the contract

### setTokenURI

```solidity
function setTokenURI(uint256 tokenId, string _tokenUri) external
```

to set token URI of a indivual token

### subscribe

```solidity
function subscribe() external payable returns (uint256)
```

Call to mint NFTs

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tokenId |

### delegateSubscribe

```solidity
function delegateSubscribe(address creator, bool freeSubscribe) public returns (uint256 tokenId)
```

### revokeSubscription

```solidity
function revokeSubscription(uint256 _tokenId) public
```

Burns `tokenId`. See {ERC721-_burn}.

_Requirements:

- The caller must own `tokenId` or be an approved operator._

### withdraw

```solidity
function withdraw() external
```

only Admin can withdraw the funds collected

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

### setRentInfo

```solidity
function setRentInfo(uint256 tokenId, bool isRentable, uint256 pricePerHour) public
```

Owner can set the NFT's rental price and status

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

### renewSubscription

```solidity
function renewSubscription(uint256 tokenId, uint64 duration) external payable
```

Renews the subscription to an NFT
Throws if `tokenId` is not a valid NFT
Renewal can be done even if existing subscription is not ended

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to renew the subscription for |
| duration | uint64 | The number of months to extend a subscription for
 cannot be more than 12 or less than 1 |

### cancelSubscription

```solidity
function cancelSubscription(uint256 tokenId) external payable
```

Cancels the subscription of an NFT

_Throws if `tokenId` is not a valid NFT
only deduct a week as a penalty when refunding the money._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to cancel the subscription for |

### expiresAt

```solidity
function expiresAt(uint256 tokenId) external view returns (uint64)
```

Gets the expiration date of a subscription

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to get the expiration date of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint64 | The expiration date of the subscription |

### isRenewable

```solidity
function isRenewable(uint256 tokenId) public view returns (bool)
```

Determines whether a subscription can be renewed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to get the expiration date of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The renewability of a the subscription |

### userOf

```solidity
function userOf(uint256 tokenId) public view virtual returns (address)
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
function userExpires(uint256 tokenId) public view virtual returns (uint256)
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

### amountRequired

```solidity
function amountRequired(uint256 tokenId, uint256 time) public view returns (uint256)
```

to calculate the amount of money required
to rent an item for a certain time

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view returns (string)
```

_Returns the Uniform Resource Identifier (URI) for `tokenId` token._

### _baseURI

```solidity
function _baseURI() internal view returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal virtual
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```