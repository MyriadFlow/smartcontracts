import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  AssetCreated,
  AssetDestroyed,
  Paused,
  StoreFrontRoleAdminChanged,
  StoreFrontRoleGranted,
  StoreFrontRoleRevoked,
  Transfer,
  Unpaused
} from "../generated/StoreFront/StoreFront"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createAssetCreatedEvent(
  tokenID: BigInt,
  creator: Address,
  metaDataURI: string
): AssetCreated {
  let assetCreatedEvent = changetype<AssetCreated>(newMockEvent())

  assetCreatedEvent.parameters = new Array()

  assetCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenID",
      ethereum.Value.fromUnsignedBigInt(tokenID)
    )
  )
  assetCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  assetCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "metaDataURI",
      ethereum.Value.fromString(metaDataURI)
    )
  )

  return assetCreatedEvent
}

export function createAssetDestroyedEvent(
  tokenId: BigInt,
  ownerOrApproved: Address
): AssetDestroyed {
  let assetDestroyedEvent = changetype<AssetDestroyed>(newMockEvent())

  assetDestroyedEvent.parameters = new Array()

  assetDestroyedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  assetDestroyedEvent.parameters.push(
    new ethereum.EventParam(
      "ownerOrApproved",
      ethereum.Value.fromAddress(ownerOrApproved)
    )
  )

  return assetDestroyedEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createStoreFrontRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): StoreFrontRoleAdminChanged {
  let storeFrontRoleAdminChangedEvent = changetype<StoreFrontRoleAdminChanged>(
    newMockEvent()
  )

  storeFrontRoleAdminChangedEvent.parameters = new Array()

  storeFrontRoleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  storeFrontRoleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  storeFrontRoleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return storeFrontRoleAdminChangedEvent
}

export function createStoreFrontRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): StoreFrontRoleGranted {
  let storeFrontRoleGrantedEvent = changetype<StoreFrontRoleGranted>(
    newMockEvent()
  )

  storeFrontRoleGrantedEvent.parameters = new Array()

  storeFrontRoleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  storeFrontRoleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  storeFrontRoleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return storeFrontRoleGrantedEvent
}

export function createStoreFrontRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): StoreFrontRoleRevoked {
  let storeFrontRoleRevokedEvent = changetype<StoreFrontRoleRevoked>(
    newMockEvent()
  )

  storeFrontRoleRevokedEvent.parameters = new Array()

  storeFrontRoleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  storeFrontRoleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  storeFrontRoleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return storeFrontRoleRevokedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
