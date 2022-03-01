import { expect } from "chai"
import { ethers } from "hardhat"
import { ArtifactCreatedEvent } from "../typechain-types/Creatify"

describe("MarketPlace", function () {
    it("should be able to remove market item", async () => {
        const [_, operator, creator] = await ethers.getSigners()

        const marketPlaceFac = await ethers.getContractFactory("Marketplace")
        let MarketPlace = await marketPlaceFac.deploy(10)
        const creatifyFac = await ethers.getContractFactory("Creatify")
        let Creatify = await creatifyFac.deploy("Creatify", "creatify", "test", MarketPlace.address)
        await Creatify.grantRole(await Creatify.CREATIFY_OPERATOR_ROLE(), operator.address)
        Creatify = Creatify.connect(operator)

        await Creatify.grantRole(await Creatify.CREATIFY_CREATOR_ROLE(), creator.address)
        Creatify = Creatify.connect(creator)

        await Creatify.createArtifact("testmetadatahashabc")
        MarketPlace = MarketPlace.connect(creator)

        await MarketPlace.createMarketItem(Creatify.address.toString(), 1, 1)
        expect(await MarketPlace.removeFromSale(1))
            .to.emit(MarketPlace, "MarketItemRemoved").withArgs(1)
            .and
            .to.emit(Creatify, "Transfer").withArgs(MarketPlace.address, creator.address, 1)
        const res = await MarketPlace.idToMarketItem(1)
        expect(res.deleted).to.true
        //TODO : check if deleted is set to true
    })
})