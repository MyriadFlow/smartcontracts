import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Creatify, Marketplace } from "../typechain-types"

describe("creatify contract", () => {

    let [owner, creator, creator2, buyer, operator]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
    })
    let creatify: Creatify
    let marketplace: Marketplace
    const metadata = {
        name: "Creatify",
        symbol: "CRFTY",
        baseTokenURI: "",
        marketplaceAddress: ""
    }
    before(async () => {
        let marketplaceFactory = await ethers.getContractFactory("Marketplace")
        marketplace = await marketplaceFactory.deploy(300)

        let creatifyFactory = await ethers.getContractFactory("Creatify")
        creatify = await creatifyFactory.deploy(metadata.name, metadata.symbol, metadata.baseTokenURI, marketplace.address)
    })
    it("Should return the right name and symbol of the token once Creatify is deployed", async () => {
        expect(await creatify.name()).to.equal(metadata.name)
        expect(await creatify.symbol()).to.equal(metadata.symbol)
    })

    it("Should get the right owner", async () => {
        const CREATIFY_ADMIN_ROLE = await creatify.CREATIFY_ADMIN_ROLE()
        expect(await creatify.getRoleMember(CREATIFY_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })

    // TODO Marketplace don't have owner property or function


    it("Should grant role", async () => {


        const CREATIFY_OPERATOR_ROLE = await creatify.CREATIFY_OPERATOR_ROLE()
        expect(
            await creatify.grantRole(CREATIFY_OPERATOR_ROLE, operator.address)
        )
            .to.emit(creatify, "RoleGranted")
            .withArgs(CREATIFY_OPERATOR_ROLE, operator.address, owner.address)
        let hasRole = await creatify.hasRole(CREATIFY_OPERATOR_ROLE, operator.address)
        expect(hasRole).to.be.true

        const CREATIFY_CREATOR_ROLE = await creatify.CREATIFY_CREATOR_ROLE()

        expect(
            await creatify.connect(operator).grantRole(CREATIFY_CREATOR_ROLE, creator.address)
        )
            .to.emit(creatify, "RoleGranted")
            .withArgs(CREATIFY_CREATOR_ROLE, creator.address, operator.address)

        hasRole = await creatify.hasRole(CREATIFY_CREATOR_ROLE, creator.address)
        expect(hasRole).to.be.true

    })
    const metaDataHash = "ipfs://QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF"

    it("Should delegate artifact creation", async () => {
        expect(
            await creatify.connect(operator).delegateArtifactCreation(creator2.address, metaDataHash)
        )
            .to.emit(creatify, "ArtifactCreated")
            .withArgs(1, creator2.address, metaDataHash)

        const tokenURI = await creatify.tokenURI(1)
        expect(tokenURI).to.equal(metaDataHash)
    })

    const salePrice = ethers.utils.parseUnits("1", "ether");

    it("Should create marketitem", async () => {
        expect(
            await creatify.connect(creator2).approve(marketplace.address, 1)
        )
            .to.emit(creatify, "Approval")
            .withArgs(creator2.address, marketplace.address, 1)

        expect(
            await marketplace.connect(creator2).createMarketItem(creatify.address, 1, salePrice)
        )
            .to.emit(marketplace, "MarketItemCreated")
            .withArgs(1, creatify.address, 1, metaDataHash, creator2.address, "0x0000000000000000000000000000000000000000", salePrice, true)

        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(1)
        expect(marketItem.owner).to.not.equal(creator2.address)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.forSale).to.true
        expect(marketItem.deleted).to.false
        expect(marketItem.nftContract).to.equal(creatify.address)
    })

    it("Should be able to create market sale", async () => {
        await marketplace.connect(buyer).createMarketSale(creatify.address, 1, {
            value: salePrice
        })

        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.owner).to.equal(buyer.address)
        expect(marketItem.forSale).to.equal(false)
    })

    it("Should not be able to create market sale if item is not for sale", async () => {
        const marketplaceBuyer = await marketplace.connect(buyer)
        await expect(marketplaceBuyer.createMarketSale(creatify.address, 91, {
            value: salePrice
        })).to.be.revertedWith("Marketplace: Market item is not for sale")
    })
})