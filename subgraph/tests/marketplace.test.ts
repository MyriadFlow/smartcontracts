import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { ItemForSale } from "../generated/schema"
import { ItemForSale as ItemForSaleEvent } from "../generated/Marketplace/Marketplace"
import { handleItemForSale } from "../src/marketplace"
import { createItemForSaleEvent } from "./marketplace-utils"

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
    let price = BigInt.fromI32(234)
    let newItemForSaleEvent = createItemForSaleEvent(
      itemId,
      nftContract,
      tokenId,
      metaDataURI,
      seller,
      price
    )
    handleItemForSale(newItemForSaleEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ItemForSale created and stored", () => {
    assert.entityCount("ItemForSale", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ItemForSale",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "itemId",
      "234"
    )
    assert.fieldEquals(
      "ItemForSale",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nftContract",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ItemForSale",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenId",
      "234"
    )
    assert.fieldEquals(
      "ItemForSale",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "metaDataURI",
      "Example string value"
    )
    assert.fieldEquals(
      "ItemForSale",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ItemForSale",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
