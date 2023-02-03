import {
  ItemForSale as ItemForSaleEvent,
  ItemRemoved as ItemRemovedEvent,
  ItemSold as ItemSoldEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../generated/Marketplace/Marketplace"
import {
  ItemForSale,
  ItemRemoved,
  ItemSold,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/schema"

export function handleItemForSale(event: ItemForSaleEvent): void {
  let entity = new ItemForSale(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.itemId = event.params.itemId
  entity.nftContract = event.params.nftContract
  entity.tokenId = event.params.tokenId
  entity.metaDataURI = event.params.metaDataURI
  entity.seller = event.params.seller
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleItemRemoved(event: ItemRemovedEvent): void {
  let entity = new ItemRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.itemId = event.params.itemId
  entity.nftContract = event.params.nftContract
  entity.tokenId = event.params.tokenId
  entity.metaDataURI = event.params.metaDataURI
  entity.seller = event.params.seller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleItemSold(event: ItemSoldEvent): void {
  let entity = new ItemSold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.itemId = event.params.itemId
  entity.nftContract = event.params.nftContract
  entity.tokenId = event.params.tokenId
  entity.metadataURI = event.params.metadataURI
  entity.seller = event.params.seller
  entity.buyer = event.params.buyer
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
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

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
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

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
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
