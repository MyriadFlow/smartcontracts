import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  AuctionEnded,
  AuctionStarted,
  BidPlaced,
  ItemRemoved,
  ItemSold,
  PriceUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SaleStarted,
  TimeUpdated
} from "../generated/Marketplace/Marketplace"

export function createAuctionEndedEvent(
  auctionId: BigInt,
  auctioneer: Address,
  highestBidder: Address
): AuctionEnded {
  let auctionEndedEvent = changetype<AuctionEnded>(newMockEvent())

  auctionEndedEvent.parameters = new Array()

  auctionEndedEvent.parameters.push(
    new ethereum.EventParam(
      "auctionId",
      ethereum.Value.fromUnsignedBigInt(auctionId)
    )
  )
  auctionEndedEvent.parameters.push(
    new ethereum.EventParam(
      "auctioneer",
      ethereum.Value.fromAddress(auctioneer)
    )
  )
  auctionEndedEvent.parameters.push(
    new ethereum.EventParam(
      "highestBidder",
      ethereum.Value.fromAddress(highestBidder)
    )
  )

  return auctionEndedEvent
}

export function createAuctionStartedEvent(
  itemId: BigInt,
  nftContract: Address,
  tokenId: BigInt,
  metaDataURI: string,
  auctioneer: Address,
  basePrice: BigInt,
  endTime: BigInt
): AuctionStarted {
  let auctionStartedEvent = changetype<AuctionStarted>(newMockEvent())

  auctionStartedEvent.parameters = new Array()

  auctionStartedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  auctionStartedEvent.parameters.push(
    new ethereum.EventParam(
      "nftContract",
      ethereum.Value.fromAddress(nftContract)
    )
  )
  auctionStartedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  auctionStartedEvent.parameters.push(
    new ethereum.EventParam(
      "metaDataURI",
      ethereum.Value.fromString(metaDataURI)
    )
  )
  auctionStartedEvent.parameters.push(
    new ethereum.EventParam(
      "auctioneer",
      ethereum.Value.fromAddress(auctioneer)
    )
  )
  auctionStartedEvent.parameters.push(
    new ethereum.EventParam(
      "basePrice",
      ethereum.Value.fromUnsignedBigInt(basePrice)
    )
  )
  auctionStartedEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )

  return auctionStartedEvent
}

export function createBidPlacedEvent(
  itemId: BigInt,
  amount: BigInt,
  bidder: Address
): BidPlaced {
  let bidPlacedEvent = changetype<BidPlaced>(newMockEvent())

  bidPlacedEvent.parameters = new Array()

  bidPlacedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  bidPlacedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  bidPlacedEvent.parameters.push(
    new ethereum.EventParam("bidder", ethereum.Value.fromAddress(bidder))
  )

  return bidPlacedEvent
}

export function createItemRemovedEvent(
  itemId: BigInt,
  nftContract: Address,
  tokenId: BigInt,
  metaDataURI: string,
  seller: Address
): ItemRemoved {
  let itemRemovedEvent = changetype<ItemRemoved>(newMockEvent())

  itemRemovedEvent.parameters = new Array()

  itemRemovedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  itemRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "nftContract",
      ethereum.Value.fromAddress(nftContract)
    )
  )
  itemRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "metaDataURI",
      ethereum.Value.fromString(metaDataURI)
    )
  )
  itemRemovedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )

  return itemRemovedEvent
}

export function createItemSoldEvent(
  itemId: BigInt,
  nftContract: Address,
  tokenId: BigInt,
  metadataURI: string,
  seller: Address,
  buyer: Address,
  price: BigInt
): ItemSold {
  let itemSoldEvent = changetype<ItemSold>(newMockEvent())

  itemSoldEvent.parameters = new Array()

  itemSoldEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  itemSoldEvent.parameters.push(
    new ethereum.EventParam(
      "nftContract",
      ethereum.Value.fromAddress(nftContract)
    )
  )
  itemSoldEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  itemSoldEvent.parameters.push(
    new ethereum.EventParam(
      "metadataURI",
      ethereum.Value.fromString(metadataURI)
    )
  )
  itemSoldEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  itemSoldEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  itemSoldEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return itemSoldEvent
}

export function createPriceUpdatedEvent(
  itemId: BigInt,
  updatedPrice: BigInt
): PriceUpdated {
  let priceUpdatedEvent = changetype<PriceUpdated>(newMockEvent())

  priceUpdatedEvent.parameters = new Array()

  priceUpdatedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  priceUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "updatedPrice",
      ethereum.Value.fromUnsignedBigInt(updatedPrice)
    )
  )

  return priceUpdatedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createSaleStartedEvent(
  itemId: BigInt,
  nftContract: Address,
  tokenId: BigInt,
  metaDataURI: string,
  seller: Address,
  price: BigInt
): SaleStarted {
  let saleStartedEvent = changetype<SaleStarted>(newMockEvent())

  saleStartedEvent.parameters = new Array()

  saleStartedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  saleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "nftContract",
      ethereum.Value.fromAddress(nftContract)
    )
  )
  saleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  saleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "metaDataURI",
      ethereum.Value.fromString(metaDataURI)
    )
  )
  saleStartedEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  saleStartedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )

  return saleStartedEvent
}

export function createTimeUpdatedEvent(
  itemId: BigInt,
  updatedTime: BigInt
): TimeUpdated {
  let timeUpdatedEvent = changetype<TimeUpdated>(newMockEvent())

  timeUpdatedEvent.parameters = new Array()

  timeUpdatedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  timeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "updatedTime",
      ethereum.Value.fromUnsignedBigInt(updatedTime)
    )
  )

  return timeUpdatedEvent
}
