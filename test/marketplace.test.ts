import { expect } from "chai"
import { ethers } from "hardhat"
import { ArtifactCreatedEvent } from "../typechain-types/Creatify"

describe("MarketPlace", function () {
    it("should be able to remove market item", async () => {
        const [_, operator, creator] = await ethers.getSigners()

        /* Deploy Marketplace */
        const marketPlaceFac = await ethers.getContractFactory("Marketplace")
        let MarketPlace = await marketPlaceFac.deploy(10)

        // Deploy Creatify 
        const creatifyFac = await ethers.getContractFactory("Creatify")
        let Creatify = await creatifyFac.deploy("Creatify", "creatify", "test", MarketPlace.address)

        // Grant OPERATOR role 
        await Creatify.grantRole(await Creatify.CREATIFY_OPERATOR_ROLE(), operator.address)
        Creatify = Creatify.connect(operator)

        // Grant CREATOR role 
        await Creatify.grantRole(await Creatify.CREATIFY_CREATOR_ROLE(), creator.address)
        Creatify = Creatify.connect(creator)

        // Create artifact
        await Creatify.createArtifact("testmetadatahashabc")
        MarketPlace = MarketPlace.connect(creator)

        // Create Market Item
        await MarketPlace.createMarketItem(Creatify.address.toString(), 1, 1)

        // Remove that item market item and expect it to emit MarketItemRemoved and Transfer
        expect(await MarketPlace.removeFromSale(1))
            .to.emit(MarketPlace, "MarketItemRemoved").withArgs(1)
            .and
            .to.emit(Creatify, "Transfer").withArgs(MarketPlace.address, creator.address, 1)

        // Get that market item and expect it to be soft deleted
        const res = await MarketPlace.idToMarketItem(1)
        expect(res.deleted).to.true
    })
})