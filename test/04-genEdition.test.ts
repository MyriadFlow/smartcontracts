import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { FlowGenEdition, FlowAccessControl , FlowMarketplace} from "../typechain-types"
import { BigNumber } from "ethers"

describe("FlowGenEdition", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner,creator, creator2, buyer,operator] = await ethers.getSigners()
        
    })

    let flowAccessControl : FlowAccessControl
    let flowGenEdition: FlowGenEdition
    let marketplace : FlowMarketplace
    let preSalePrice: BigNumber;
    let Saleprice: BigNumber;
    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "www.xyz.com",
        marketplaceAddress: ""
    }
    before(async () => {
        preSalePrice = ethers.utils.parseEther("0.005")
        Saleprice = ethers.utils.parseEther("0.01")

        const FlowAccessControlFactory = await ethers.getContractFactory("FlowAccessControl")
        flowAccessControl = await FlowAccessControlFactory.deploy()


        let marketplaceFactory = await ethers.getContractFactory("FlowMarketplace")
        marketplace = await marketplaceFactory.deploy(300,"MyMarketplace",flowAccessControl.address)

        const flowGenEditionFactory = await ethers.getContractFactory("FlowGenEdition")

        flowGenEdition = await flowGenEditionFactory.deploy(metadata.name, metadata.symbol, marketplace.address , flowAccessControl.address,Saleprice,preSalePrice,120,200,300);
        
        await flowGenEdition.deployed()
    })
    it("Should return the right name and symbol of the token, and other constructor parameters once FlowGenEdution is deployed", async () => {
        expect(await flowGenEdition.name()).to.equal(metadata.name)
        expect(await flowGenEdition.symbol()).to.equal(metadata.symbol)
        expect(await flowGenEdition.salePrice()).to.equal(Saleprice)
        expect(await flowGenEdition.preSalePrice()).to.equal(preSalePrice)
        expect(await flowGenEdition.maxSupply()).to.equal(200)
    })

    it("Should get the right owner", async () => {
        const FLOW_ADMIN_ROLE = await flowAccessControl.FLOW_ADMIN_ROLE()
        expect(await flowAccessControl.getRoleMember(FLOW_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })
    it("to check single minting and batch minting ",async () => {

        /// MINTING
        await flowGenEdition.connect(creator).mint(1 ,{value : preSalePrice})
        expect(await flowGenEdition.ownerOf(1)).to.be.equal(creator.address)
        expect(await flowGenEdition.balanceOf(creator.address)).to.be.equal(1)
        await flowGenEdition.connect(creator2).mint(5 , {
            value : Saleprice.mul(5)
        })
        for (let i = 2; i <= 6; i++) {
            expect(await flowGenEdition.ownerOf(i)).to.be.equal(creator2.address)
        }
        expect(await flowGenEdition.balanceOf(creator2.address)).to.be.equal(5)
        //moving the time forward
       await network.provider.send("hardhat_mine", ["0x100"]);    
        await flowGenEdition.connect(creator).mint(1 ,{value : 
        Saleprice})
        expect(await flowGenEdition.ownerOf(7)).to.be.equal(creator.address)
        expect(await flowGenEdition.balanceOf(creator.address)).to.be.equal(2)
    })
    it("to check burn ",async () => {
        //no one can other owner or approved
        expect(flowGenEdition.burnNFT(2)).to.be.reverted
        expect(await flowGenEdition.connect(creator2).burnNFT(2)).to.emit(flowGenEdition,"AssetDestroyed");
        expect(flowGenEdition.ownerOf(2)).to.be.reverted   
    })
    it("check ERC4907",async () => {
        let val = ethers.utils.parseUnits("100","wei");
        await flowGenEdition.connect(creator).setRentInfo(1,true)
        await flowGenEdition.connect(creator).setprice(1,val)

        expect(await flowGenEdition.rent(1,1,{value : val})).to.emit(flowGenEdition,"UpdateUser");

        expect(await flowGenEdition.userOf(1)).to.be.equal(owner.address)  
        //// SET USER FUNCTION
        expect(await flowGenEdition.connect(creator2).setUser(3,buyer.address,3000)).to.emit(flowGenEdition,"UpdateUser")
        expect(await flowGenEdition.userOf(3)).to.be.equal(buyer.address)
        
    })
    it("create a marketitem and buy",async () => {
        expect(await marketplace.connect(creator2).listItem(flowGenEdition.address,4,Saleprice,1,false,0)).to.emit(marketplace, "SaleStarted")
        
        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(4)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.status).to.be.equal(1)
        expect(marketItem.nftContract).to.equal(flowGenEdition.address)
        
        expect(await marketplace.buyItem(1,1,{value : Saleprice})).to.emit(marketplace,"ItemSold")

    })



})