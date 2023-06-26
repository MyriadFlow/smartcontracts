# A GUIDE TO CONTRACT

## **MyriadFlowOfferStation**
_Anyone may enter into a contract for any NFT anywhere in the globe at the price they like, and if the asset owner approves, they will accept the offer on this platform._

### paused

```solidity
bool paused
```

### version

```solidity
string version
```

### proposalCounter

```solidity
uint256 proposalCounter
```

### MyriadFlowOfferStationPayoutAddress

```solidity
address MyriadFlowOfferStationPayoutAddress
```

### platformFeeBasisPoint

```solidity
uint96 platformFeeBasisPoint
```

### ProposalStatus

```solidity
enum ProposalStatus {
  NONEXISTANT,
  ACTIVE,
  WITHDRAWN,
  SOLD
}
```

### ProposalId

```solidity
struct ProposalId {
  address nftContractAddress;
  uint256 tokenId;
  address buyer;
  uint256 proposedBid;
  enum MyriadFlowOfferStation.ProposalStatus status;
}
```

### idToproposal

```solidity
mapping(uint256 => struct MyriadFlowOfferStation.ProposalId) idToproposal
```

### flowRoles

```solidity
contract IACCESSMASTER flowRoles
```

### ProposalInitiated

```solidity
event ProposalInitiated(address nftContractAddress, uint256 tokenId, uint256 offerId, string metadataURI, address buyer, uint256 proposedAmmount)
```

### ProposalWithdrawn

```solidity
event ProposalWithdrawn(uint256 offerId)
```

### ProposalAccepted

```solidity
event ProposalAccepted(address contractAddress, uint256 tokenId, uint256 offerId, address seller, address buyer, uint256 finalAmount)
```

### ProposalUpdated

```solidity
event ProposalUpdated(uint256 offerId, uint256 previousAmount, uint256 updatedAmount)
```

### onlyWhenProposalActive

```solidity
modifier onlyWhenProposalActive(uint256 offerId)
```

### onlyIfOfferCreator

```solidity
modifier onlyIfOfferCreator(uint256 offerId)
```

### onlyWhenNotPaused

```solidity
modifier onlyWhenNotPaused()
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

### constructor

```solidity
constructor(uint96 _platformFee, string _version, bool _paused, address flowContract) public
```

### createOffer

```solidity
function createOffer(address _nftContractAddress, uint256 _tokenId) external payable returns (uint256)
```

create an Offer to any  nft contract in the blockchain

### withdrawOffer

```solidity
function withdrawOffer(uint256 offerId) external returns (uint256)
```

Withdraw the offer if the User does not intend anymore

### acceptOffer

```solidity
function acceptOffer(uint256 _offerId) external
```

Token Owner accepts the Offer and transfers the token to the buyer

### increaseOffer

```solidity
function increaseOffer(uint256 offerId) external payable
```

To increase the Offer Price of a Offer Id

### setPause

```solidity
function setPause() external
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_See {IERC165-supportsInterface}._

## ItemExist

```solidity
error ItemExist()
```