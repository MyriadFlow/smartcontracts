import { log } from '@graphprotocol/graph-ts'
import {
  ArtifactCreated,
  Transfer,
} from "../generated/Creatify/Creatify"

import {
  Token,
  User,
} from "../generated/schema"
export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.params.tokenId.toString());
  if (token) {
    token.creator = event.params.to.toHexString()
    token.createdAtTimestamp = event.block.timestamp
    token.owner = event.params.to.toHexString();
    token.save();

    let user = User.load(event.params.to.toHexString());
    token.save();
    if (!user) {
      user = new User(event.params.to.toHexString());
      user.save();
    }
  }
}

export function handleArtifactCreated(event: ArtifactCreated): void {
  let token = Token.load(event.params.tokenID.toString());
  if (!token) {
    token = new Token(event.params.tokenID.toString())
    token.creator = event.params.creator.toHexString()
    token.createdAtTimestamp = event.block.timestamp
    token.owner = event.params.creator.toHexString();
    token.metaDataUri = event.params.metaDataUri
    let user = User.load(event.params.creator.toHexString());
    token.save();
    if (!user) {
      user = new User(event.params.creator.toHexString());
      user.save();
    }
  }
}