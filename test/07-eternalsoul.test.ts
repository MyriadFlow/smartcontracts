import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { EternalSoul , AccessMaster} from "../typechain-types"

describe("Eternal Soul Contract", () => {                       
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {   
    [owner, creator, creator2, buyer , operator] = await ethers.getSigners()  
    })
    let accessmaster : AccessMaster
    let eternalsoul: EternalSoul

    const metadata = {
        name: "Eternal Soul",
        symbol: "ES",
        baseTokenURI: "",
        tradehubAddress: "0x07464F440AfcD4ce72Eb9DBF716AA30aBb518870"
    }
    
    before(async () => {
        const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
        accessmaster = await AccessMasterFactory.deploy()

        const EternalSoulFactory = await ethers.getContractFactory("EternalSoul")
        eternalsoul = await EternalSoulFactory.deploy(metadata.name, metadata.symbol,"www.xyz.com" ,accessmaster.address)   

        const creatorRole = await accessmaster.FLOW_CREATOR_ROLE()
        await accessmaster.grantRole(creatorRole,creator.address)

    })
    it("Should return the right name and symbol of the token once eternalsoul is deployed", async () => {
        expect(await eternalsoul.name()).to.equal(metadata.name)
        expect(await eternalsoul.symbol()).to.equal(metadata.symbol)
    })
    it("Should issue only by creator and delegateIssue only by Operator",async() =>{
        expect(await eternalsoul.delegateIssue(creator2.address,"www.Robolox.com")).to.emit(eternalsoul,"AssetIssued")

        expect(await eternalsoul.ownerOf(1)).to.be.equal(creator2.address)

        expect(await eternalsoul.connect(creator).issue("www.Robolox.com")).to.emit(eternalsoul,"AssetIssued")

        expect(await eternalsoul.ownerOf(2)).to.be.equal(creator.address)
        ///Revert 
        expect(eternalsoul.connect(buyer).issue("www.abc.com")).to.be.reverted
    })
    it("Should not able to transfer",async() =>{
        ///Revert 
        expect(eternalsoul.connect(creator).issue("www.abc.com")).to.be.reverted
    })
    it("only Owner should burn",async() =>{
        expect(await eternalsoul.connect(creator2).destroyAsset(1)).to.emit(eternalsoul,"AssetDestroyed")

        expect(eternalsoul.ownerOf(1)).to.be.reverted
    })




})