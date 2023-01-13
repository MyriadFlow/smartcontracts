import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { MarketplaceItem } from "../generated/schema"
import { MarketplaceItem as MarketplaceItemEvent } from "../generated/Marketplace/Marketplace"
import { handleMarketplaceItem } from "../src/marketplace"
import { createMarketplaceItemEvent } from "./marketplace-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let itemId = BigInt.fromI32(234)
    let nftContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let tokenId = BigInt.fromI32(234)
    let metaDataURI = "Example string value"
    let seller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let owner = Address.fromString("0x0000000000000000000000000000000000000001")
    let price = BigInt.fromI32(234)
    let forSale = "boolean Not implemented"
    let activity = "Example string value"
    let newMarketplaceItemEvent = createMarketplaceItemEvent(
      itemId,
      nftContract,
      tokenId,
      metaDataURI,
      seller,
      owner,
      price,
      forSale,
      activity
    )
    handleMarketplaceItem(newMarketplaceItemEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MarketplaceItem created and stored", () => {
    assert.entityCount("MarketplaceItem", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "itemId",
      "234"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nftContract",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenId",
      "234"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "metaDataURI",
      "Example string value"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "forSale",
      "boolean Not implemented"
    )
    assert.fieldEquals(
      "MarketplaceItem",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "activity",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
