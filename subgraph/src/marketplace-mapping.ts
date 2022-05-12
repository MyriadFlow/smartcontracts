import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketItemCreated,
  MarketItemSold,
  MarketItemRemoved,
} from "../generated/MarketPlace/MarketPlace"
import { MarketItem, Token } from "../generated/schema"

export function handleMarketItemCreated(event: MarketItemCreated): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (!marketItem) {
    marketItem = new MarketItem(event.params.itemId.toString());
    marketItem.createdAtTimestamp = event.block.timestamp
  }

  let token = Token.load(event.params.tokenId.toString())
  if (token) {
    marketItem.itemId = event.params.itemId
    marketItem.nftContract = event.params.nftContract
    marketItem.owner = event.params.owner
    marketItem.seller = event.params.seller
    marketItem.token = event.params.tokenId.toString()
    marketItem.forSale = event.params.forSale
    marketItem.price = event.params.price
    marketItem.metaDataUri = event.params.metaDataURI
    marketItem.deleted = false
    marketItem.save()
  }

}

export function handleMarketItemSold(event: MarketItemSold): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (!marketItem) {
    marketItem = new MarketItem(event.params.itemId.toString());
  }
  marketItem.owner = event.params.buyer;
  marketItem.sold = true;
  marketItem.save()
}

export function handleMarketItemRemoved(event: MarketItemRemoved): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (marketItem) {
    marketItem.deleted = true
    marketItem.owner = marketItem.seller;
    marketItem.save()
  }
}


