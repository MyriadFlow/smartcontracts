// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class MarketItemCreated extends ethereum.Event {
  get params(): MarketItemCreated__Params {
    return new MarketItemCreated__Params(this);
  }
}

export class MarketItemCreated__Params {
  _event: MarketItemCreated;

  constructor(event: MarketItemCreated) {
    this._event = event;
  }

  get itemId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get nftContract(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get seller(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get owner(): Address {
    return this._event.parameters[4].value.toAddress();
  }

  get price(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get forSale(): boolean {
    return this._event.parameters[6].value.toBoolean();
  }
}

export class MarketItemSold extends ethereum.Event {
  get params(): MarketItemSold__Params {
    return new MarketItemSold__Params(this);
  }
}

export class MarketItemSold__Params {
  _event: MarketItemSold;

  constructor(event: MarketItemSold) {
    this._event = event;
  }

  get itemId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get nftContract(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get buyer(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get price(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class RoleAdminChanged extends ethereum.Event {
  get params(): RoleAdminChanged__Params {
    return new RoleAdminChanged__Params(this);
  }
}

export class RoleAdminChanged__Params {
  _event: RoleAdminChanged;

  constructor(event: RoleAdminChanged) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get previousAdminRole(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get newAdminRole(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }
}

export class RoleGranted extends ethereum.Event {
  get params(): RoleGranted__Params {
    return new RoleGranted__Params(this);
  }
}

export class RoleGranted__Params {
  _event: RoleGranted;

  constructor(event: RoleGranted) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get account(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class RoleRevoked extends ethereum.Event {
  get params(): RoleRevoked__Params {
    return new RoleRevoked__Params(this);
  }
}

export class RoleRevoked__Params {
  _event: RoleRevoked;

  constructor(event: RoleRevoked) {
    this._event = event;
  }

  get role(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get account(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get sender(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class MarketPlace extends ethereum.SmartContract {
  static bind(address: Address): MarketPlace {
    return new MarketPlace("MarketPlace", address);
  }

  DEFAULT_ADMIN_ROLE(): Bytes {
    let result = super.call(
      "DEFAULT_ADMIN_ROLE",
      "DEFAULT_ADMIN_ROLE():(bytes32)",
      []
    );

    return result[0].toBytes();
  }

  try_DEFAULT_ADMIN_ROLE(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "DEFAULT_ADMIN_ROLE",
      "DEFAULT_ADMIN_ROLE():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  createMarketItem(
    nftContract: Address,
    tokenId: BigInt,
    price: BigInt
  ): BigInt {
    let result = super.call(
      "createMarketItem",
      "createMarketItem(address,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(nftContract),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromUnsignedBigInt(price)
      ]
    );

    return result[0].toBigInt();
  }

  try_createMarketItem(
    nftContract: Address,
    tokenId: BigInt,
    price: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "createMarketItem",
      "createMarketItem(address,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(nftContract),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromUnsignedBigInt(price)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getRoleAdmin(role: Bytes): Bytes {
    let result = super.call("getRoleAdmin", "getRoleAdmin(bytes32):(bytes32)", [
      ethereum.Value.fromFixedBytes(role)
    ]);

    return result[0].toBytes();
  }

  try_getRoleAdmin(role: Bytes): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "getRoleAdmin",
      "getRoleAdmin(bytes32):(bytes32)",
      [ethereum.Value.fromFixedBytes(role)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  getRoleMember(role: Bytes, index: BigInt): Address {
    let result = super.call(
      "getRoleMember",
      "getRoleMember(bytes32,uint256):(address)",
      [
        ethereum.Value.fromFixedBytes(role),
        ethereum.Value.fromUnsignedBigInt(index)
      ]
    );

    return result[0].toAddress();
  }

  try_getRoleMember(role: Bytes, index: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getRoleMember",
      "getRoleMember(bytes32,uint256):(address)",
      [
        ethereum.Value.fromFixedBytes(role),
        ethereum.Value.fromUnsignedBigInt(index)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getRoleMemberCount(role: Bytes): BigInt {
    let result = super.call(
      "getRoleMemberCount",
      "getRoleMemberCount(bytes32):(uint256)",
      [ethereum.Value.fromFixedBytes(role)]
    );

    return result[0].toBigInt();
  }

  try_getRoleMemberCount(role: Bytes): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getRoleMemberCount",
      "getRoleMemberCount(bytes32):(uint256)",
      [ethereum.Value.fromFixedBytes(role)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  hasRole(role: Bytes, account: Address): boolean {
    let result = super.call("hasRole", "hasRole(bytes32,address):(bool)", [
      ethereum.Value.fromFixedBytes(role),
      ethereum.Value.fromAddress(account)
    ]);

    return result[0].toBoolean();
  }

  try_hasRole(role: Bytes, account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("hasRole", "hasRole(bytes32,address):(bool)", [
      ethereum.Value.fromFixedBytes(role),
      ethereum.Value.fromAddress(account)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  payoutAddress(): Address {
    let result = super.call("payoutAddress", "payoutAddress():(address)", []);

    return result[0].toAddress();
  }

  try_payoutAddress(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "payoutAddress",
      "payoutAddress():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  platformFeeBasisPoint(): BigInt {
    let result = super.call(
      "platformFeeBasisPoint",
      "platformFeeBasisPoint():(uint96)",
      []
    );

    return result[0].toBigInt();
  }

  try_platformFeeBasisPoint(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "platformFeeBasisPoint",
      "platformFeeBasisPoint():(uint96)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _platformFee(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ChangeFeeAndPayoutAddressCall extends ethereum.Call {
  get inputs(): ChangeFeeAndPayoutAddressCall__Inputs {
    return new ChangeFeeAndPayoutAddressCall__Inputs(this);
  }

  get outputs(): ChangeFeeAndPayoutAddressCall__Outputs {
    return new ChangeFeeAndPayoutAddressCall__Outputs(this);
  }
}

export class ChangeFeeAndPayoutAddressCall__Inputs {
  _call: ChangeFeeAndPayoutAddressCall;

  constructor(call: ChangeFeeAndPayoutAddressCall) {
    this._call = call;
  }

  get newPlatformFee(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get newPayoutAddress(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ChangeFeeAndPayoutAddressCall__Outputs {
  _call: ChangeFeeAndPayoutAddressCall;

  constructor(call: ChangeFeeAndPayoutAddressCall) {
    this._call = call;
  }
}

export class CreateMarketItemCall extends ethereum.Call {
  get inputs(): CreateMarketItemCall__Inputs {
    return new CreateMarketItemCall__Inputs(this);
  }

  get outputs(): CreateMarketItemCall__Outputs {
    return new CreateMarketItemCall__Outputs(this);
  }
}

export class CreateMarketItemCall__Inputs {
  _call: CreateMarketItemCall;

  constructor(call: CreateMarketItemCall) {
    this._call = call;
  }

  get nftContract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get price(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class CreateMarketItemCall__Outputs {
  _call: CreateMarketItemCall;

  constructor(call: CreateMarketItemCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class CreateMarketSaleCall extends ethereum.Call {
  get inputs(): CreateMarketSaleCall__Inputs {
    return new CreateMarketSaleCall__Inputs(this);
  }

  get outputs(): CreateMarketSaleCall__Outputs {
    return new CreateMarketSaleCall__Outputs(this);
  }
}

export class CreateMarketSaleCall__Inputs {
  _call: CreateMarketSaleCall;

  constructor(call: CreateMarketSaleCall) {
    this._call = call;
  }

  get nftContract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get itemId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class CreateMarketSaleCall__Outputs {
  _call: CreateMarketSaleCall;

  constructor(call: CreateMarketSaleCall) {
    this._call = call;
  }
}

export class GrantRoleCall extends ethereum.Call {
  get inputs(): GrantRoleCall__Inputs {
    return new GrantRoleCall__Inputs(this);
  }

  get outputs(): GrantRoleCall__Outputs {
    return new GrantRoleCall__Outputs(this);
  }
}

export class GrantRoleCall__Inputs {
  _call: GrantRoleCall;

  constructor(call: GrantRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class GrantRoleCall__Outputs {
  _call: GrantRoleCall;

  constructor(call: GrantRoleCall) {
    this._call = call;
  }
}

export class RenounceRoleCall extends ethereum.Call {
  get inputs(): RenounceRoleCall__Inputs {
    return new RenounceRoleCall__Inputs(this);
  }

  get outputs(): RenounceRoleCall__Outputs {
    return new RenounceRoleCall__Outputs(this);
  }
}

export class RenounceRoleCall__Inputs {
  _call: RenounceRoleCall;

  constructor(call: RenounceRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RenounceRoleCall__Outputs {
  _call: RenounceRoleCall;

  constructor(call: RenounceRoleCall) {
    this._call = call;
  }
}

export class RevokeRoleCall extends ethereum.Call {
  get inputs(): RevokeRoleCall__Inputs {
    return new RevokeRoleCall__Inputs(this);
  }

  get outputs(): RevokeRoleCall__Outputs {
    return new RevokeRoleCall__Outputs(this);
  }
}

export class RevokeRoleCall__Inputs {
  _call: RevokeRoleCall;

  constructor(call: RevokeRoleCall) {
    this._call = call;
  }

  get role(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class RevokeRoleCall__Outputs {
  _call: RevokeRoleCall;

  constructor(call: RevokeRoleCall) {
    this._call = call;
  }
}
