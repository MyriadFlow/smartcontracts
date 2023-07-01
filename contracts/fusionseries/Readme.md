# A GUIDE TO CONTRACT

## **FusionSeries**

_{ERC1155} token, including:

 - ability for holders to burn (destroy) their tokens
 - a creator role that allows for token minting (creation)
 - token ID and URI autogeneration

This contract uses {AccessControl} to lock permissioned functions using the
different roles - head to its documentation for details.

The account that deploys the contract will be granted the creator and pauser
roles, as well as the default admin role, which will let it grant both creator
roles to other accounts._

### marketplace

```solidity
address marketplace
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

### AssetCreated

```solidity
event AssetCreated(uint256 tokenID, address creator, uint256 amount)
```

### AssetDestroyed

```solidity
event AssetDestroyed(uint256 tokenId, address ownerOrApproved)
```

### constructor

```solidity
constructor(string baseURI, address marketplaceAddress, address flowContract) public
```

_Grants `FLOW_ADMIN_ROLE`, `FLOW_CREATOR_ROLE` and `FLOW_OPERATOR_ROLE` to the
account that deploys the contract._

### createAsset

```solidity
function createAsset(uint256 amount, bytes data, string _uri) public returns (uint256)
```

_Creates a new token for `to`. Its token ID will be automatically
assigned (and available on the emitted {IERC1155-Transfer} event), and the token
URI autogenerated based on the base URI passed at construction.


Requirements:

- the caller must have the `FLOW_CREATOR_ROLE`._

### delegateAssetCreation

```solidity
function delegateAssetCreation(address creator, uint256 amount, bytes data, string _uri) public returns (uint256)
```

_Creates a new token for `to`. Its token ID will be automatically
assigned (and available on the emitted {IERC1155-Transfer} event), and the token
URI autogenerated based on the base URI passed at construction.

Requirements:

- the caller must have the `FLOW_CREATOR_ROLE`._

### destroyAsset

```solidity
function destroyAsset(uint256 tokenId, uint256 amount) public
```

Burns `tokenId`. See {ERC721-_burn}.

_Requirements:

- The caller must own `tokenId` or be an approved operator._

### setURI

```solidity
function setURI(string newuri) external
```

_ONLY Operator can set the Base URI_

### uri

```solidity
function uri(uint256 tokenId) public view virtual returns (string)
```

_Returns the Uniform Resource Identifier (URI) for `tokenId` token._

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address operator, address from, address to, uint256[] ids, uint256[] amounts, bytes data) internal virtual
```

_See {ERC1155-_beforeTokenTransfer}._

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._