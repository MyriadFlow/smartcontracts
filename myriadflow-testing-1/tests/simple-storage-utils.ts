import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { DataChanged } from "../generated/SimpleStorage/SimpleStorage"

export function createDataChangedEvent(
  time: BigInt,
  data: BigInt
): DataChanged {
  let dataChangedEvent = changetype<DataChanged>(newMockEvent())

  dataChangedEvent.parameters = new Array()

  dataChangedEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )
  dataChangedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromUnsignedBigInt(data))
  )

  return dataChangedEvent
}
