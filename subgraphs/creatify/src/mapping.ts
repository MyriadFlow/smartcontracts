import {
  Transfer,
} from "../generated/Creatify/Creatify"

import {
  Token,
  User,
} from "../generated/schema"
export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString())
    token.creator = event.params.to.toHexString()
    token.tokenID = event.params.tokenId
    token.createdAtTimestamp = event.block.timestamp
  }
  token.owner = event.params.to.toHexString();
  token.save();

  let user = User.load(event.params.to.toHexString());
  if (!user) {
    user = new User(event.params.to.toHexString());
    user.save();
  }
}
