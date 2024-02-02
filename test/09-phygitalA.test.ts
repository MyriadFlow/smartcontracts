import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect, assert } from "chai"
import { ethers, network } from "hardhat"
import { PhygitalA, AccessMaster, Token } from "../typechain-types"
import { BigNumber } from "ethers"
import exp from "constants"

describe("PhygitalA contract", () => {
    let [owner, creator, creator2, buyer, operator]: SignerWithAddress[] =
        new Array(5)
    before(async () => {
        ;[owner, creator, creator2, buyer, operator] = await ethers.getSigners()
    })

    let accessmaster: AccessMaster
    let phygital: PhygitalA
    let token: Token
    let saleprice: BigNumber

    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "www.xyz.com",
        marketplaceAddress: "",
    }

    saleprice = ethers.utils.parseEther("0.01")

    before(async () => {
        const AccessMasterFactory = await ethers.getContractFactory(
            "AccessMaster"
        )
        accessmaster = await AccessMasterFactory.deploy(owner.address)

        const TokenFactory = await ethers.getContractFactory("Token")
        token = await TokenFactory.deploy()

        const accounts = await ethers.getSigners()
        for (let i = 0; i < 5; i++) {
            await token.connect(accounts[i]).mintToken(accounts[i].address, 100)
        }

        const PhygitalAFactory = await ethers.getContractFactory("PhygitalA")
        phygital = await PhygitalAFactory.deploy(
            metadata.name,
            metadata.symbol,
            "0x419aa2E770A301cBdb81FEdB1f9B0C2D5F6E26bd",
            accessmaster.address,
            token.address,
            [saleprice, 20, 300, 6],
            "www.abc.com"
        )
        await phygital.deployed()
    })
    it("Should return the right name and symbol of the token, and other constructor parameters once Phygital is deployed", async () => {
        expect(await phygital.name()).to.equal(metadata.name)
        expect(await phygital.symbol()).to.equal(metadata.symbol)
        expect(await phygital.nftPrice()).to.equal(saleprice)
        expect(await phygital.maxSupply()).to.equal(20)
    })
    /* The code snippet is a test case that checks the functionality of single minting and transferring
   funds in the `PhygitalA` contract. */
    it("to check single minting and transferring funds", async () => {
        // MINTING
        // Calculate if transfer of ERC20 is happening after  single minting
        //  Assert
        let value = ethers.utils.parseEther("1")
        let prevBalance = await token.balanceOf(creator.address)

        await token.connect(creator).approve(phygital.address, value)
        expect(await phygital.connect(creator).mint(1)).to.emit(
            phygital,
            "PhygitalAAssetCreated"
        )
        let afterBalance = await token.balanceOf(creator.address)
        let diff = prevBalance.sub(afterBalance)
        expect(diff).to.be.equal(saleprice)

        // TO check the ownerOF and BalanceOf for single minting
        expect(await phygital.ownerOf(1)).to.be.equal(creator.address)
        expect(await phygital.balanceOf(creator.address)).to.be.equal(1)

        await phygital.connect(creator).mint(5)
        // should check if user cannot more than max mint
        expect(phygital.connect(creator).mint(1)).to.be.reverted
    })
    /* The code snippet is a test case that checks the functionality of the `setMaxMint` function in
    the `PhygitalA` contract. */
    it("if maxmint is zero ,if user doesn't have funds && setMaxMint function", async () => {
        // to check if the status of an item must be REGISTERED STATUS(4)
        let status = await phygital.phygitalAssets(1)
        expect(status.status).to.be.equal(0)
        expect(status.registerTime).to.be.equal(0)

        /// to check not other than operator can setMaxMint
        expect(phygital.connect(buyer).setMaxMint(0)).to.be.reverted

        let value = ethers.utils.parseEther("10")

        /// to check user can mint unlimited if max mint 0
        await phygital.setMaxMint(0)
        await token.connect(buyer).approve(phygital.address, value)
        await phygital.connect(buyer).mint(10)

        expect(await phygital.balanceOf(buyer.address)).to.be.equal(10) //check user token balance

        /// to check the max quantity cannot be exceeded
        expect(phygital.connect(buyer).mint(10)).to.be.reverted
    })
    it("to check set Price and what if user doesn't have enough funds to mint", async () => {
        let val = ethers.utils.parseEther("1")
        ////to check the Set NFT PRICE function is working or not
        expect(await phygital.setNFTPrice(val)).to.emit(
            phygital,
            "UpdateAssetPrice"
        )
        expect(await phygital.nftPrice()).to.be.equal(val)
        /// to check what if the balance of the user not enough
        let balance = await token.balanceOf(buyer.address)
        await token.connect(buyer).transfer(creator.address, balance)

        expect(phygital.connect(buyer).mint(2)).to.be.reverted
    })
    it("to check delegate Minting", async () => {
        await phygital.setMaxMint(2)
        /// to check the operator cannot mint more than Max Mint
        expect(phygital.delegateMint(creator.address, 3)).to.be.reverted

        expect(await phygital.delegateMint(creator.address, 1)).to.emit(
            phygital,
            "PhygitalAAssetCreated"
        )
        /// to check the operator cannot mint more than Max Supply
        await phygital.setMaxMint(0)
        expect(phygital.delegateMint(creator.address, 8)).to.be.reverted
        //// to check delegate mint batch minting
        let balance = await phygital.balanceOf(creator.address)
        await phygital.delegateMint(creator.address, 3)
        let balance2 = await phygital.balanceOf(creator.address)

        expect(balance2.sub(balance)).to.be.equal(3)
    })

    it("to check burn and set item status", async () => {
        /// to check if the token cannot be burned other than owner, not by operator itself
        expect(phygital.burnAsset(1)).to.be.reverted
        /// to check the set item cannot be called other than Operator itself
        expect(phygital.connect(buyer).setItemStatus(1, 0)).to.be.reverted
        expect(await phygital.connect(creator).setItemStatus(1, 1)).to.emit(
            phygital,
            "UpdateAssetStatus"
        )
        await phygital.setItemStatus(1, 0)
        expect(await phygital.connect(creator).burnAsset(1)).to.emit(
            phygital,
            "PhygitalAAssetDestroyed"
        )
        expect(phygital.ownerOf(1)).to.be.reverted
        /// token cannot be burn which doesn't exist
        expect(phygital.burnAsset(21)).to.be.reverted
    })
    it("Register Asset Id", async () => {
        /// to check the token must exists
        expect(phygital.registerAssetId(21, "0x04A5")).to.be.reverted
        /* The code snippet `expect(await phygital.registerAssetId(1, "0x0FA4")).to.emit(phygital,
        "AssetRegistered")` is an assertion that checks if calling the `registerAssetId` function on
        the `phygital` contract with the arguments `1` and `"0x0FA4"` emits an event of type
        `"AssetRegistered"`. */
        expect(await phygital.registerAssetId(3, "0x0FA4")).to.emit(
            phygital,
            "AssetRegistered"
        )
        let asset = await phygital.phygitalAssets(3)
        expect(asset.phygitalId).to.be.equal("0x0fa4")
        expect(asset.status).to.be.equal(4)
        ///to check Same tokenId cannot be re-registered
        expect(phygital.registerAssetId(1, "0x04A78")).to.be.reverted
        ///to check same UUID cannot be used again
        expect(phygital.registerAssetId(4, "0x0FA4")).to.be.reverted
    })
})
