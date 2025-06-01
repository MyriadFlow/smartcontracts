import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { DataChanged } from "../generated/schema"
import { DataChanged as DataChangedEvent } from "../generated/SimpleStorage/SimpleStorage"
import { handleDataChanged } from "../src/simple-storage"
import { createDataChangedEvent } from "./simple-storage-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let time = BigInt.fromI32(234)
    let data = BigInt.fromI32(234)
    let newDataChangedEvent = createDataChangedEvent(time, data)
    handleDataChanged(newDataChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DataChanged created and stored", () => {
    assert.entityCount("DataChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DataChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "time",
      "234"
    )
    assert.fieldEquals(
      "DataChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "data",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
