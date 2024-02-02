import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect, assert } from "chai"
import { ethers, network } from "hardhat"
import { Phygital, TradeHub, AccessMaster } from "../typechain-types"
import exp from "constants"
import { stat } from "fs"
import { log } from "console"

describe("Phygital Contract", () => {
    let [owner, creator, creator2, buyer, operator]: SignerWithAddress[] =
        new Array(5)
    before(async () => {
        ;[owner, operator, creator, creator2, buyer] = await ethers.getSigners()
    })

    let accessmaster: AccessMaster
    let phygital: Phygital
    let tradehub: TradeHub

    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        tradehubAddress: "",
    }

    before(async () => {
        const AccessMasterFactory = await ethers.getContractFactory(
            "AccessMaster"
        )
        accessmaster = await AccessMasterFactory.deploy(owner.address)

        let TradeHubFactory = await ethers.getContractFactory("TradeHub")
        tradehub = await TradeHubFactory.deploy(
            300,
            "MyMarketplace",
            accessmaster.address
        )

        const PhygitalFactory = await ethers.getContractFactory("Phygital")

        phygital = await PhygitalFactory.deploy(
            metadata.name,
            metadata.symbol,
            tradehub.address,
            accessmaster.address
        )
    })
    it("Should return the right name and symbol of the token once Phygital is deployed", async () => {
        expect(await phygital.name()).to.equal(metadata.name)
        expect(await phygital.symbol()).to.equal(metadata.symbol)
    })

    it("Should get the right owner", async () => {
        const FLOW_ADMIN_ROLE = await accessmaster.FLOW_ADMIN_ROLE()
        expect(
            await accessmaster.getRoleMember(FLOW_ADMIN_ROLE, 0)
        ).to.be.equal(owner.address)
    })

    // TODO TradeHub don't have owner property or function

    it("Should grant role", async () => {
        const FLOW_OPERATOR_ROLE = await accessmaster.FLOW_OPERATOR_ROLE()
        expect(
            await accessmaster.grantRole(FLOW_OPERATOR_ROLE, operator.address)
        )
            .to.emit(accessmaster, "RoleGranted")
            .withArgs(FLOW_OPERATOR_ROLE, operator.address, owner.address)

        let hasRole = await accessmaster.hasRole(
            FLOW_OPERATOR_ROLE,
            operator.address
        )
        expect(hasRole).to.be.true

        const FLOW_CREATOR_ROLE = await accessmaster.FLOW_CREATOR_ROLE()

        expect(
            await accessmaster
                .connect(operator)
                .grantRole(FLOW_CREATOR_ROLE, creator.address)
        )
            .to.emit(accessmaster, "RoleGranted")
            .withArgs(FLOW_CREATOR_ROLE, creator.address, operator.address)

        hasRole = await accessmaster.hasRole(FLOW_CREATOR_ROLE, creator.address)
        expect(hasRole).to.be.true
    })
    const metaDataHash = "ipfs://QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF"

    it("Should delegate artifact creation", async () => {
        expect(
            await phygital.connect(operator).delegateAssetCreation(
                creator2.address,
                metaDataHash,
                500,
                "0x04547032214B80"
                // "0xd3b9733f92d113a903d0580c4e9d5de39a4e73a6e058a9c2d8396c4aecec4c34"
            )
        )
            .to.emit(phygital, "AssetCreated")
            .withArgs(1, creator2.address, metaDataHash)

        /// to check the item status should be original (4)
        let status = await phygital.phygitalAssets(1)
        expect(status.status).to.be.equal(5)

        const tokenURI = await phygital.tokenURI(1)
        expect(tokenURI).to.equal(metaDataHash)
    })

    it("Should Mint artifact ", async () => {
        /// To check if the same Id cannot be entered twice
        expect(phygital.createAsset(metaDataHash, 500, "0x0454703221B80")).to.be
            .reverted

        await phygital.createAsset(metaDataHash, 300, "0x0454703221b804")

        /// to check the item status should be original (4)
        let status = await phygital.phygitalAssets(2)
        expect(status.status).to.be.equal(5)

        expect(await phygital.ownerOf(2)).to.be.equal(owner.address)
        expect(await phygital.Counter()).to.be.equal(2)
    })

    // const salePrice = ethers.utils.parseUnits("1", "ether")
    it("should set item status", async () => {
        await phygital
            .connect(creator)
            .createAsset("www.xyz.com", 300, "0x045A7032219B80")

        expect(await phygital.connect(creator).setItemStatus(3, 1)).to.emit(
            phygital,
            "UpdateAssetStatus"
        )
        let status = await phygital.phygitalAssets(3)
        expect(status.status).to.be.equal(1)
    })

    it("should destroy Asset", async () => {
        // To check if the asset cannot be burned other than owner or operator
        expect(phygital.connect(buyer).destroyAsset(3)).to.be.reverted
        // Cannot burn until status is burned
        expect(phygital.connect(creator).destroyAsset(3)).to.be.reverted

        await phygital.setItemStatus(3, 0)
        expect(phygital.connect(creator).destroyAsset(3)).to.emit(
            phygital,
            "AssetDestroyed"
        )
        expect(phygital.ownerOf(3)).to.be.reverted

        await phygital
            .connect(creator)
            .createAsset("www.xyz.com", 300, "0x045A5F")
        await phygital.setItemStatus(4, 0)
        // To check asset can be burned by operator too
        await phygital.destroyAsset(4)
        expect(phygital.ownerOf(4)).to.be.reverted
    })
    it("To check ERC4907 for Phygital", async () => {
        await phygital.createAsset("www.abcd.con", 300, "0x045A7032214B80")
        let val = ethers.utils.parseUnits("100", "wei")
        let currentTokenID = await phygital.Counter()
        await phygital.setRentInfo(currentTokenID, true, val)
        //// RENT USER FUNCTION
        expect(
            await phygital
                .connect(creator)
                .rent(currentTokenID, 1, { value: val })
        ).to.emit(phygital, "UpdateUser")
        expect(await phygital.userOf(currentTokenID)).to.be.equal(
            creator.address
        )
        //// SET USER FUNCTION
        await phygital.createAsset("www.abcde.con", 400, "0xF123")
        currentTokenID = await phygital.Counter()
        expect(
            await phygital.setUser(currentTokenID, buyer.address, 3000)
        ).to.emit(phygital, "UpdateUser")
        /// SET RENT INFO
        currentTokenID = await phygital.Counter()
        expect(
            phygital.connect(creator).rent(currentTokenID, 1, { value: val })
        ).to.be.revertedWith("Phygital: Not available for rent")
    })
    it("To check rental for more failing test cases and transfer funds feature", async () => {
        const rentPrice = ethers.utils.parseEther("1.0")
        /// Creting a new asset
        await phygital
            .connect(creator)
            .createAsset("www.abc.com", 300, "0x0F5A45")
        let currentTokenID = await phygital.Counter()
        /// Checking if rental status false item cannot be rented
        expect(phygital.rent(currentTokenID, 1)).to.be.revertedWith(
            "Phygital: Not available for rent"
        )
        /// Rental Status True and setting the Price
        await phygital
            .connect(creator)
            .setRentInfo(currentTokenID, true, rentPrice)
        /// Invalide tokenId
        currentTokenID = await phygital.Counter()
        expect(phygital.rent(currentTokenID, 0)).to.be.revertedWith(
            "Phygital: Invalide Token I"
        )
        /// checking if the rental status can be taken for 0 hours or 4320
        expect(phygital.rent(currentTokenID, 0)).to.be.revertedWith(
            "Phygital: Time can't be less than 1 hour"
        )

        expect(phygital.rent(currentTokenID, 4321)).to.be.revertedWith(
            "Phygital: Time can't be more than 6 months"
        )
        /// Calculate if transfer of Eth is happening after rental
        // Assert
        const startingOwnerBalance = await phygital.provider.getBalance(
            creator.address
        )
        const startingRentorBalance = await phygital.provider.getBalance(
            owner.address
        )
        ///ACT
        const transactionResponse = await phygital.rent(currentTokenID, 1, {
            value: rentPrice,
        })
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await phygital.provider.getBalance(
            creator.address
        )
        const endingRentorBalance = await phygital.provider.getBalance(
            owner.address
        )

        assert.equal(
            endingOwnerBalance.sub(startingOwnerBalance).toString(),
            startingRentorBalance
                .sub(endingRentorBalance)
                .sub(gasCost)
                .toString()
        )
        /// TO check the Rented User
        expect(await phygital.userOf(currentTokenID)).to.be.equal(owner.address)
        //// checking if user already exists it would throw error
        expect(
            phygital
                .connect(operator)
                .rent(currentTokenID, 1, { value: rentPrice })
        ).to.be.reverted
    })
})
