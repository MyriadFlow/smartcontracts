import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketItemCreated,
  MarketItemSold,
  MarketItemRemoved,
} from "../generated/MarketPlace/MarketPlace"
import { MarketItem } from "../generated/schema"

export function handleMarketItemCreated(event: MarketItemCreated): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (!marketItem) {
    marketItem = new MarketItem(event.params.itemId.toString());
    marketItem.createdAtTimestamp = event.block.timestamp
  }
  marketItem.itemId = event.params.itemId
  marketItem.nftContract = event.params.nftContract
  marketItem.owner = event.params.owner
  marketItem.seller = event.params.seller
  marketItem.tokenId = event.params.tokenId
  marketItem.forSale = event.params.forSale
  marketItem.price = event.params.price
  marketItem.metaDataUri = event.params.metaDataURI
  marketItem.deleted = false
  marketItem.save()
}

export function handleMarketItemSold(event: MarketItemSold): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (!marketItem) {
    marketItem = new MarketItem(event.params.itemId.toString());
  }
  marketItem.sold = true;
  marketItem.save()
}

export function handleMarketItemRemoved(event: MarketItemRemoved): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (marketItem) {
    marketItem.deleted = true
  }
}


