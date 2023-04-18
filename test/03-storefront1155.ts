import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { BytesLike } from "ethers"
import { ethers , network} from "hardhat"
import { FlowCollection, FlowMarketplace  , FlowAccessControl } from "../typechain-types"

describe("FlowCollection  && FlowMarketplace contract", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, creator, creator2, buyer , operator] = await ethers.getSigners()
        
    })
    let flowAccessControl : FlowAccessControl
    let flowCollection: FlowCollection  
    let marketplace: FlowMarketplace

    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        marketplaceAddress: ""
    }
    const salePrice = ethers.utils.parseUnits("100", "wei");

    before(async () => {
        const FlowAccessControlFactory = await ethers.getContractFactory("FlowAccessControl")
        flowAccessControl = await FlowAccessControlFactory.deploy()

        let marketplaceFactory = await ethers.getContractFactory("FlowMarketplace")
        marketplace = await marketplaceFactory.deploy(300,"MyMarketplace",flowAccessControl.address)

        let flowCollectionFactory = await ethers.getContractFactory("FlowCollection")
        flowCollection = await flowCollectionFactory.deploy("www.xyz.com",marketplace.address,flowAccessControl.address)
    })
    it("Should get the right owner", async () => {
        const STOREFRONT_ADMIN_ROLE = await flowAccessControl.FLOW_ADMIN_ROLE()
        expect(await flowAccessControl.getRoleMember(STOREFRONT_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })

    // TODO Marketplace don't have owner property or function

    it("Should grant role", async () => {
        const FLOW_OPERATOR_ROLE = await flowAccessControl.FLOW_OPERATOR_ROLE()
        expect(
            await flowAccessControl.grantRole(FLOW_OPERATOR_ROLE, operator.address)
        )
            .to.emit(flowAccessControl, "RoleGranted")
            .withArgs(FLOW_OPERATOR_ROLE, operator.address, owner.address)
        let hasRole = await flowAccessControl.hasRole(FLOW_OPERATOR_ROLE, operator.address)
        expect(hasRole).to.be.true

        const FLOW_CREATOR_ROLE = await flowAccessControl.FLOW_CREATOR_ROLE()

        expect(
            await flowAccessControl.connect(operator).grantRole(FLOW_CREATOR_ROLE, creator.address)
        )
            .to.emit(flowAccessControl, "RoleGranted")
            .withArgs(FLOW_CREATOR_ROLE, creator.address, operator.address)

        hasRole = await flowAccessControl.hasRole(FLOW_CREATOR_ROLE, creator.address)
        expect(hasRole).to.be.true

        expect(
            await flowAccessControl.connect(operator).grantRole(FLOW_CREATOR_ROLE, creator2.address)
        )
            .to.emit(flowAccessControl, "RoleGranted")
            .withArgs(FLOW_CREATOR_ROLE, creator2.address, operator.address)

        hasRole = await flowAccessControl.hasRole(FLOW_CREATOR_ROLE, creator2.address)
        expect(hasRole).to.be.true

    })
    const metaDataHash = "ipfs://QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF"

    it("Should delegate artifact creation", async () => {
        const data: BytesLike = "0x123456";

        expect(
            await flowCollection.connect(operator).delegateAssetCreation(creator.address,10,data,"Www.xyz.com")
        )
            .to.emit(flowCollection, "AssetCreated")
            .withArgs(1, creator.address, metaDataHash)
        
        expect(await flowCollection.connect(creator2).createAsset(10,data,"www.xyz.com")).to.emit(flowCollection, "AssetCreated")
            .withArgs(1, creator.address, metaDataHash)

        expect(await flowCollection.balanceOf(creator.address,1)).to.be.equal(10)
        expect(await flowCollection.balanceOf(creator2.address,2)).to.be.equal(10)

    })
     it("Should create marketitem", async () => {
        // change the system
        await flowCollection.connect(creator).setApprovalForAll(marketplace.address,true)
        expect(
            await marketplace.connect(creator).listItem(flowCollection.address, 1, salePrice,10,false,0)
        )
            .to.emit(marketplace, "SaleStarted")
            .withArgs(1, flowCollection.address, 1, metaDataHash, creator2.address,salePrice)
        
        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(1)
        expect(marketItem.seller).to.equal(creator.address)
        expect(marketItem.status).to.be.equal(1)
        expect(marketItem.supply).to.be.equal(10);
        expect(marketItem.nftContract).to.equal(flowCollection.address)

    })

    it("Should be able to create market sale", async () => {
        await marketplace.connect(buyer).buyItem(1,10,{
            value: (salePrice).mul(10)
        })
        const marketItem = await marketplace.idToMarketItem(1)
        expect(await flowCollection.balanceOf(buyer.address,1)).to.equal(10)
        expect(marketItem.status).to.equal(3)
    })

    it("Should be able to delete market item", async () => {
        // Create artifact
        const data: BytesLike = "0x123456";
        await flowCollection.connect(creator2).createAsset(10,data,"ipfs://QmTiQKxZoVMvDahqVUzvkJhAjF9C1MzytpDEocxUT3oBde")        
        // Create Market Item
        await marketplace.connect(creator2).listItem(flowCollection.address, 2, salePrice,1,false,0)
        // Remove that item market item and expect it to emit MarketItemRemoved and Transfer

        expect(await marketplace.connect(creator2).removeItem(2))
            .to.emit(marketplace, "ItemRemoved")
    
        
    })
    it("Auction: auction working or not,placebid,AcceptBidandEndAuction",async () => {
        let accounts = await ethers.getSigners() 
        const buyer1 = accounts[5]
        const buyer2 = accounts[6]
        const buyer3 = accounts[7]

        let val = ethers.utils.parseUnits("110","wei");
        let Time = 3600 
        //to check if the auction item  is created or not
        await flowCollection.connect(buyer).setApprovalForAll(marketplace.address,true)
        await marketplace.connect(buyer).listItem(flowCollection.address,1,salePrice,10,true,Time)
    
        //to check if bidding can be done or not
        //USER 1
        expect(await marketplace.connect(buyer1).placeBid(3,{value : val.mul(10)})).to.emit(marketplace ,"Bidplaced").withArgs(1,salePrice,buyer1.address)
        //USER2
        val = ethers.utils.parseUnits("120","wei")
        await marketplace.connect(buyer2).placeBid(3,{value : val.mul(10)})
        
        //to check user won't be bid less than the previous highest bid
       expect(marketplace.connect(buyer3).placeBid(3, {value : salePrice.mul(10) })).to.be.revertedWith("Marketplace: value less than the highest Bid")

        //moving the time forward
       await network.provider.send("hardhat_mine", ["0x1200"]);
       
        //to check if the user can't bid after end time  
        await expect(marketplace.connect(buyer3).placeBid(3, {value : val.mul(10) })).to.be.reverted;

        await  marketplace.connect(buyer).acceptBidAndEndAuction(3);
        expect(await flowCollection.balanceOf(buyer2.address,1)).to.be.equal(10);
        
    })
    it("concludeAuction , invokeStartAuction , _invokestartSale ",async () => {
        let accounts = await ethers.getSigners() 
        let buyer1 = accounts[5]
        const buyer2 = accounts[6]

        const data: BytesLike = "0x123456";
        await flowCollection.connect(buyer2).safeTransferFrom(buyer2.address,buyer1.address ,1 , 10 ,data)
       
        await flowCollection.connect(buyer1).setApprovalForAll(marketplace.address,true)

        await marketplace.connect(buyer1).listItem(flowCollection.address,1,salePrice,10,true,600)
        
        await marketplace.connect(buyer1).acceptBidAndEndAuction(4)

        const marketItem = await marketplace.idToMarketItem(4)

        expect(marketItem.status).to.be.equal(1)

        await marketplace.connect(buyer1).startAuction(4,600);
    
        let val = ethers.utils.parseEther("2")
        await marketplace.connect(operator).placeBid(4, {value : val});
        //user can't conclude before item End Time Ended
        expect(marketplace.connect(creator).concludeAuction(4)).to.be.reverted
        //moving the time forward
        await network.provider.send("hardhat_mine", ["0x260"]);

        expect( marketplace.concludeAuction(4)).to.emit(marketplace,"AuctionEnded").withArgs(4,buyer1.address,operator.address)

        expect(await flowCollection.balanceOf(operator.address,1)).to.be.equal(10);
    })
    it("should destroy Asset",async () => {
        expect(await flowCollection.connect(operator).destroyAsset(1,10)).to.emit(flowCollection,"AssetDestroyed");
        expect(await flowCollection.balanceOf(operator.address,2)).to.be.equal(0)
    })
})