import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketPlace,
  MarketItemCreated,
  MarketItemSold,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/MarketPlace/MarketPlace"
import { MarketItem } from "../generated/schema"

export function handleMarketItemCreated(event: MarketItemCreated): void {
  let marketItem = MarketItem.load(event.params.itemId.toString())
  if (!marketItem) {
    marketItem = new MarketItem(event.params.itemId.toString());
  }
  marketItem.itemId = event.params.itemId
  marketItem.nftContract = event.params.nftContract
  marketItem.owner = event.params.owner
  marketItem.seller = event.params.seller
  marketItem.tokenId = event.params.tokenId
  marketItem.forSale = event.params.forSale
  marketItem.price = event.params.price
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



