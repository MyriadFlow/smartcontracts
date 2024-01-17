import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect,assert} from "chai"
import { ethers,network } from "hardhat"
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
        accessmaster = await AccessMasterFactory.deploy(owner.address)

        const EternalSoulFactory = await ethers.getContractFactory("EternalSoul")
        eternalsoul = await EternalSoulFactory.deploy(metadata.name, metadata.symbol,"www.xyz.com","Voucher-Domain","1","1000000000000000000",accessmaster.address)   

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

        expect(await eternalsoul.connect(creator).issue(creator.address,"www.Robolox.com")).to.emit(eternalsoul,"AssetIssued")

        expect(await eternalsoul.ownerOf(2)).to.be.equal(creator.address)
        ///Revert 
        expect(eternalsoul.connect(buyer).issue(buyer.address,"www.abc.com")).to.be.reverted
    })
    it("Should not able to transfer",async() =>{
        ///Revert 
        expect(eternalsoul.connect(creator).issue("www.abc.com",buyer.address)).to.be.reverted
    })
    it("only Owner should burn",async() =>{
        expect(await eternalsoul.connect(creator2).destroyAsset(1)).to.emit(eternalsoul,"AssetDestroyed")

        expect(eternalsoul.ownerOf(1)).to.be.reverted
    })
    it("check Lazy Minting",async () => {
        const price = ethers.utils.parseEther("1.0")
        const uri = "www.abc.com"
        const SIGNING_DOMAIN_NAME = "Voucher-Domain"
        const SIGNING_DOMAIN_VERSION = "1"
        const chainId =  network.config.chainId
        const contractAddress = eternalsoul.address 
        const signer = owner

        const domain = {
            name: SIGNING_DOMAIN_NAME,
            version: SIGNING_DOMAIN_VERSION,
            verifyingContract: contractAddress,
            chainId
        } 
        const voucher = {
            price,
            uri
        }
        const types = {
                LazyNFTVoucher: [
                    { name: "price", type: "uint256"},
                    { name: "uri", type: "string"}
                ]
        }
        const signature = await signer._signTypedData(domain, types, voucher)
        const voucher1 = {...voucher,signature}
        // console.log(`The signer is ${await eternalsoul.recover(voucher1)}`)  
        // to check if the correct signer is returning or not 
        expect(await eternalsoul.recover(voucher1)).to.be.equal(owner.address)
         /// Calculating the transfer of Eth is happening after lazy mitning
            // Assert
        const startingOwnerBalance = await eternalsoul.provider.getBalance(
            owner.address
        )
        const startingBuyerBalance = await eternalsoul.provider.getBalance(
            buyer.address
        )
        ///ACT
        const transactionResponse = await eternalsoul.connect(buyer).lazyIssue(voucher1 ,{ value : price})
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await eternalsoul.provider.getBalance(
                owner.address
        )
        const endingBuyerBalance = await eternalsoul.provider.getBalance(
                buyer.address
        )
        
        assert.equal(
                endingOwnerBalance.sub(startingOwnerBalance).toString(),
                startingBuyerBalance.sub(endingBuyerBalance).sub(gasCost).toString()
        )

    })



})