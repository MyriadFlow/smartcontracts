## EternalSoul

This token is a soul bound token

_{ERC721} token, including:

 - ability for holders to burn (destroy) their tokens
 - a creator role that allows for token minting (creation)
 - token ID and URI autogeneration

This contract uses {AccessControl} to lock permissioned   functions using the
different roles - head to its documentation for details.

Tokens cannot be transferred_

### baseURI

```solidity
string baseURI
```

### flowRoles

```solidity
contract IACCESSMASTER flowRoles
```

### onlyOperator

```solidity
modifier onlyOperator()
```

### onlyCreator

```solidity
modifier onlyCreator()
```

### AssetIssued

```solidity
event AssetIssued(uint256 tokenID, address creator, string metaDataURI)
```

### AssetDestroyed

```solidity
event AssetDestroyed(uint256 tokenId, address ownerOrApproved)
```

### constructor

```solidity
constructor(string name, string symbol, string _intialURI, address flowContract) public
```

### setBaseURI

```solidity
function setBaseURI(string uri) external
```

_update BaseURI of the metadata_

### issue

```solidity
function issue(string metadataURI) public returns (uint256)
```

_only the creator role can issue the token_

### delegateIssue

```solidity
function delegateIssue(address creator, string metadataURI) public returns (uint256)
```

_only operator can assign issue for an user_

### destroyAsset

```solidity
function destroyAsset(uint256 tokenId) public
```

Burns `tokenId`. See {ERC721-_burn}.

_Requirements:

- The caller must own `tokenId` or be an approved operator._

### _setTokenURI

```solidity
function _setTokenURI(uint256 tokenId, string _tokenURI) internal virtual
```

_Sets `_tokenURI` as the tokenURI of `tokenId`.

Requirements:

- `tokenId` must exist._

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view virtual returns (string)
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

_only minting and burning can happen 
token transfer are restricted_

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```