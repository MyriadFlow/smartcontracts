## FlowSubscription

_{ERC721} token, including:

 - ability for holders to burn (destroy) their tokens
 - token ID and URI autogeneration
 - ability for holders to give for rent
 - services can only be used after renewal of subscription

This contract uses {AccessControl} to lock permissioned functions using the
different roles - head to its documentation for details.

The account that deploys the contract will be granted the Operator and pauser
roles, as well as the default admin role, which will let it grant both creator
and pauser roles to other accounts._

### ADMIN_ROLE

```solidity
bytes32 ADMIN_ROLE
```

### OPERATOR_ROLE

```solidity
bytes32 OPERATOR_ROLE
```

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

### subscriptionPricePerMonth

```solidity
uint256 subscriptionPricePerMonth
```

### baseURI

```solidity
string baseURI
```

### cancellationRequested

```solidity
mapping(uint256 => bool) cancellationRequested
```

To check if cancellation is intiated or not

### whenNotpaused

```solidity
modifier whenNotpaused()
```

### onlyWhenTokenExist

```solidity
modifier onlyWhenTokenExist(uint256 tokenId)
```

### SubscriptionIssued

```solidity
event SubscriptionIssued(uint256 tokenId, address owner)
```

### SubscriptionRevoked

```solidity
event SubscriptionRevoked(uint256 tokenId, address ownerOrApproved)
```

### SubscriptionCancelRequested

```solidity
event SubscriptionCancelRequested(uint256 tokenId, uint256 Time)
```

### constructor

```solidity
constructor(string _name, string _symbol, string _initialURI, uint256 _publicSalePrice, uint256 _subscriptionPricePerMonth, uint96 royaltyBasisPoint) public
```

### setPrice

```solidity
function setPrice(uint256 _publicSalePrice) external
```

Admin Role can set the mint price

### pause

```solidity
function pause() external
```

pause or stop the contract from working by ADMIN

### unpause

```solidity
function unpause() public
```

Unpause the contract by ADMIN

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
function delegateSubscribe(address creator) public returns (uint256 tokenId)
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

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

## IERC5643

### SubscriptionUpdate

```solidity
event SubscriptionUpdate(uint256 tokenId, uint64 expiration)
```

Emitted when a subscription expiration changes

_When a subscription is canceled, the expiration value should also be 0._

### renewSubscription

```solidity
function renewSubscription(uint256 tokenId, uint64 duration) external payable
```

Renews the subscription to an NFT
Throws if `tokenId` is not a valid NFT

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to renew the subscription for |
| duration | uint64 | The number of seconds to extend a subscription for |

### cancelSubscription

```solidity
function cancelSubscription(uint256 tokenId) external payable
```

Cancels the subscription of an NFT

_Throws if `tokenId` is not a valid NFT_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to cancel the subscription for |

### expiresAt

```solidity
function expiresAt(uint256 tokenId) external view returns (uint64)
```

Gets the expiration date of a subscription

_Throws if `tokenId` is not a valid NFT_

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
function isRenewable(uint256 tokenId) external view returns (bool)
```

Determines whether a subscription can be renewed

_Throws if `tokenId` is not a valid NFT_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The NFT to get the expiration date of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The renewability of a the subscription |
