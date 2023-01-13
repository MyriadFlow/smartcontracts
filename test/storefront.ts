import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { StoreFront, Marketplace } from "../typechain-types"

describe("storefront contract", () => {

    let [owner, creator, creator2, buyer, operator]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
    })
    let storefront: StoreFront
    let marketplace: Marketplace
    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        marketplaceAddress: ""
    }
    before(async () => {
        let marketplaceFactory = await ethers.getContractFactory("Marketplace")
        marketplace = await marketplaceFactory.deploy(300)

        let storefrontFactory = await ethers.getContractFactory("StoreFront")
        storefront = await storefrontFactory.deploy(metadata.name, metadata.symbol, marketplace.address)
    })
    it("Should return the right name and symbol of the token once StoreFront is deployed", async () => {
        expect(await storefront.name()).to.equal(metadata.name)
        expect(await storefront.symbol()).to.equal(metadata.symbol)
    })

    it("Should get the right owner", async () => {
        const STOREFRONT_ADMIN_ROLE = await storefront.STOREFRONT_ADMIN_ROLE()
        expect(await storefront.getRoleMember(STOREFRONT_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })

    // TODO Marketplace don't have owner property or function


    it("Should grant role", async () => {
        const STOREFRONT_OPERATOR_ROLE = await storefront.STOREFRONT_OPERATOR_ROLE()
        expect(
            await storefront.grantRole(STOREFRONT_OPERATOR_ROLE, operator.address)
        )
            .to.emit(storefront, "RoleGranted")
            .withArgs(STOREFRONT_OPERATOR_ROLE, operator.address, owner.address)
        let hasRole = await storefront.hasRole(STOREFRONT_OPERATOR_ROLE, operator.address)
        expect(hasRole).to.be.true

        const STOREFRONT_CREATOR_ROLE = await storefront.STOREFRONT_CREATOR_ROLE()

        expect(
            await storefront.connect(operator).grantRole(STOREFRONT_CREATOR_ROLE, creator.address)
        )
            .to.emit(storefront, "RoleGranted")
            .withArgs(STOREFRONT_CREATOR_ROLE, creator.address, operator.address)

        hasRole = await storefront.hasRole(STOREFRONT_CREATOR_ROLE, creator.address)
        expect(hasRole).to.be.true

    })
    const metaDataHash = "ipfs://QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF"

    it("Should delegate artifact creation", async () => {
        expect(
            await storefront.connect(operator).delegateAssetCreation(creator2.address, metaDataHash)
        )
            .to.emit(storefront, "AssetCreated")
            .withArgs(1, creator2.address, metaDataHash)

        const tokenURI = await storefront.tokenURI(1)
        expect(tokenURI).to.equal(metaDataHash)
    })

    const salePrice = ethers.utils.parseUnits("1", "ether");

    it("Should create marketitem", async () => {
        expect(
            await storefront.connect(creator2).approve(marketplace.address, 1)
        )
            .to.emit(storefront, "Approval")
            .withArgs(creator2.address, marketplace.address, 1)

        expect(
            await marketplace.connect(creator2).createMarketItem(storefront.address, 1, salePrice)
        )
            .to.emit(marketplace, "MarketItemCreated")
            .withArgs(1, storefront.address, 1, metaDataHash, creator2.address, "0x0000000000000000000000000000000000000000", salePrice, true)

        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(1)
        expect(marketItem.owner).to.not.equal(creator2.address)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.forSale).to.true
        expect(marketItem.deleted).to.false
        expect(marketItem.nftContract).to.equal(storefront.address)
    })

    it("Should be able to create market sale", async () => {
        await marketplace.connect(buyer).createMarketSale(1, {
            value: salePrice
        })

        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.owner).to.equal(buyer.address)
        expect(marketItem.forSale).to.equal(false)
    })

    it("Should be able to delete market item", async () => {
        // Create artifact
        await storefront.connect(creator).createAsset("ipfs://QmTiQKxZoVMvDahqVUzvkJhAjF9C1MzytpDEocxUT3oBde")
        marketplace = marketplace.connect(creator)

        // Create Market Item
        await marketplace.createMarketItem(storefront.address.toString(), 2, 1)

        // Remove that item market item and expect it to emit MarketItemRemoved and Transfer
        expect(await marketplace.removeFromSale(2))
            .to.emit(marketplace, "MarketItemRemoved").withArgs(2)
            .and
            .to.emit(storefront, "Transfer").withArgs(marketplace.address, creator.address, 2)

        // Get that market item and expect it to be soft deleted
        const res = await marketplace.idToMarketItem(2)
        expect(res.deleted).to.true
    })

    it("Should not be able to create market sale if item is not for sale", async () => {
        const marketplaceBuyer = await marketplace.connect(buyer)
        await expect(marketplaceBuyer.createMarketSale(1, {
            value: salePrice
        })).to.be.revertedWith("Marketplace: Market item is not for sale")
    })
})