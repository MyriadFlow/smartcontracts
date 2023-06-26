# A GUIDE TO CONTRACT

## IACCESSMASTER



_External interface of AccessMaster declared to support ERC165 detection._

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

## AccessMaster

_This Contract Module helps to deploy the
base Roles for the other flow contracts .
Every other Flow contract will retrieve the roles of the
ADMIN, OPERATOR, CREATOR, etc. from this._

### FLOW_ADMIN_ROLE

```solidity
bytes32 FLOW_ADMIN_ROLE
```

### FLOW_OPERATOR_ROLE

```solidity
bytes32 FLOW_OPERATOR_ROLE
```

### FLOW_CREATOR_ROLE

```solidity
bytes32 FLOW_CREATOR_ROLE
```

### constructor

```solidity
constructor() public
```
_to check if the address {User} is the ADMIN_
### isAdmin

```solidity
function isAdmin(address user) external view returns (bool)
```

_to check if the address {User} is the OPERATOR_

### isOperator

```solidity
function isOperator(address user) external view returns (bool)
```

_to check if the address {User} is the CREATOR_

### isCreator

```solidity
function isCreator(address user) external view returns (bool)
```