import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { StoreFront, Marketplace } from "../typechain-types"

describe("storefront contract", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
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
            await storefront.connect(operator).delegateAssetCreation(creator2.address, metaDataHash, 500)
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
            await marketplace.connect(creator2).listItem(storefront.address, 1, salePrice,false,0)
        )
            .to.emit(marketplace, "SaleStarted")
            .withArgs(1, storefront.address, 1, metaDataHash, creator2.address,salePrice)

        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(1)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.status).to.be.equal(1)
        expect(marketItem.nftContract).to.equal(storefront.address)
    })

    it("Should be able to create market sale", async () => {
        await marketplace.connect(buyer).buyItem(1, {
            value: salePrice
        })
        const marketItem = await marketplace.idToMarketItem(1)
        expect(await storefront.ownerOf(1)).to.equal(buyer.address)
        expect(marketItem.status).to.equal(3)//check
    })

    it("Should be able to delete market item", async () => {
        // Create artifact
        await storefront.connect(creator).createAsset("ipfs://QmTiQKxZoVMvDahqVUzvkJhAjF9C1MzytpDEocxUT3oBde", 500)
        marketplace = marketplace.connect(creator)

        // Create Market Item
        await marketplace.listItem(storefront.address.toString(), 2, salePrice,false,0)

        // Remove that item market item and expect it to emit MarketItemRemoved and Transfer
        expect(await marketplace.removeItem(2))
            .to.emit(marketplace, "ItemRemoved").withArgs(2)
            .and
            .to.emit(storefront, "Transfer").withArgs(marketplace.address, creator.address, 2)

        // Get that market item and expect it to be soft deleted
        const res = await marketplace.idToMarketItem(2)
        expect(res.status).to.be.equal(4)
    })

    it("Should not be able to create market sale if item is not for sale", async () => {
        const marketplaceBuyer = await marketplace.connect(buyer)
        await expect(marketplaceBuyer.buyItem(1, {
            value: salePrice
        })).to.be.revertedWith("Marketplace: Market item is not for sale")
    })
    it("To check the royalty is working or not",async () => {
        await storefront.connect(buyer).approve(marketplace.address, 1)
        const startingCreatorBalance =  await marketplace.provider.getBalance(
                creator2.address
            ) 
        let val = salePrice
        //account[1]
        await  marketplace.connect(buyer).listItem(storefront.address,1,val,false,0);

        await marketplace.connect(operator).buyItem(1 , {value : val})

        const endingCreatorBalance = await marketplace.provider.getBalance(
                creator2.address
            ) 
        let amount = (val.mul(70)).div(100)    
        
        //700000000000000000
        const royalty = await storefront.royaltyInfo(1,amount)
        assert.equal(
                endingCreatorBalance.sub(startingCreatorBalance).toString(),
                royalty[1].toString()
            )   
    })
   
    it("Auction: auction working or not,placebid,AcceptBidandEndAuction",async () => {
        let accounts = await ethers.getSigners() 
        let [buyer1,buyer2 ] = [accounts[5] , accounts[6]]
        await storefront.connect(operator).approve(marketplace.address, 1)
        let val = ethers.utils.parseEther("1.1");
        let Time = 3600 
        //to check if the auction item  is created or not
        await marketplace.connect(operator).listItem(storefront.address,1,salePrice,true,Time);
         //to check if bidding can be done or not
        expect(await marketplace.connect(buyer1).placeBid(1,{value : val})).to.emit(marketplace ,"Bidplaced").withArgs(1,salePrice,buyer1.address)

        //to check user won't be bid less than the previous highest bid
       expect(marketplace.connect(buyer2).placeBid(1, {value : val })).to.be.revertedWith("value less than the highest Bid")

        //moving the time forward
       await network.provider.send("hardhat_mine", ["0x1200"]);
       
        //to check if the user can't bid after end time  
        val = ethers.utils.parseEther("2.1");
        const Bidder2 = marketplace.connect(buyer2)
        await expect(Bidder2.placeBid(1, {value : val })).to.be.reverted;
        
        await  marketplace.connect(operator).acceptBidAndEndAuction(1);
        
        expect(await storefront.ownerOf(1)).to.be.equal(buyer1.address);
        
    })
    it("concludeAuction , invokeStartAuction , _invokestartSale ",async () => {
        let accounts = await ethers.getSigners() 
        let [buyer1] = [accounts[5]]
        
        await storefront.connect(buyer1).approve(marketplace.address,1)
        
        await marketplace.connect(buyer1).listItem(storefront.address,1,salePrice,true,600)

        expect(await marketplace.connect(buyer1).acceptBidAndEndAuction(1)).to.emit(marketplace,"SaleStarted");

        const marketItem = await marketplace.idToMarketItem(1)
        expect(marketItem.status).to.be.equal(1)

         await marketplace.connect(buyer1).invokeStartAuction(1,600);

        let val = ethers.utils.parseEther("2")
        await marketplace.connect(operator).placeBid(1, {value : val});

        //user can't conclude before item End Time Ended
        expect(marketplace.connect(creator).concludeAuction(1)).to.be.reverted
        //moving the time forward
        await network.provider.send("hardhat_mine", ["0x260"]);

        expect( marketplace.concludeAuction(1)).to.emit(marketplace,"AuctionEnded").withArgs(1,buyer1.address,operator.address)

        expect(await storefront.ownerOf(1)).to.be.equal(operator.address);
    })
     it("UpdatePrice and UpdateTime ",async () => {

        await storefront.connect(operator).approve(marketplace.address,1)

        await marketplace.connect(operator).listItem(storefront.address,1,salePrice,true,300);

         const marketItem = await marketplace.idToMarketItem(1)
         
         const IntialTime = marketItem.auctioneEndTime;

         const IntialPrice = marketItem.price;

        let val = ethers.utils.parseEther("2");
        
        await marketplace.connect(operator).updatePrice(1,val)
        await marketplace.connect(operator).updateAuctionTime(1,600)

         const marketItem1 = await marketplace.idToMarketItem(1)
         
         const ATime = marketItem1.auctioneEndTime;

         const APrice = marketItem1.price;

         expect(IntialTime).to.not.equal(ATime)
         expect(IntialPrice).to.not.equal(APrice)

        val = ethers.utils.parseEther("2.1");
        await marketplace.connect(buyer).placeBid(1, {value : val })

        //no one can change time or price  when bid is there
        expect(marketplace.connect(operator).updatePrice(1,val)).to.be.reverted
        expect(marketplace.connect(operator).updateAuctionTime(1,1000)).to.be.reverted
    
    })

})

