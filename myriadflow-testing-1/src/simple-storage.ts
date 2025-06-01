import { DataChanged as DataChangedEvent } from "../generated/SimpleStorage/SimpleStorage"
import { DataChanged } from "../generated/schema"

export function handleDataChanged(event: DataChangedEvent): void {
  let entity = new DataChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.time = event.params.time
  entity.data = event.params.data

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
