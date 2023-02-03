import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  AssetCreated as AssetCreatedEvent,
  AssetDestroyed as AssetDestroyedEvent,
  Paused as PausedEvent,
  StoreFrontRoleAdminChanged as StoreFrontRoleAdminChangedEvent,
  StoreFrontRoleGranted as StoreFrontRoleGrantedEvent,
  StoreFrontRoleRevoked as StoreFrontRoleRevokedEvent,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent
} from "../generated/StoreFront/StoreFront"
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
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAssetCreated(event: AssetCreatedEvent): void {
  let entity = new AssetCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenID = event.params.tokenID
  entity.creator = event.params.creator
  entity.metaDataURI = event.params.metaDataURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAssetDestroyed(event: AssetDestroyedEvent): void {
  let entity = new AssetDestroyed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.ownerOrApproved = event.params.ownerOrApproved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStoreFrontRoleAdminChanged(
  event: StoreFrontRoleAdminChangedEvent
): void {
  let entity = new StoreFrontRoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStoreFrontRoleGranted(
  event: StoreFrontRoleGrantedEvent
): void {
  let entity = new StoreFrontRoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStoreFrontRoleRevoked(
  event: StoreFrontRoleRevokedEvent
): void {
  let entity = new StoreFrontRoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
