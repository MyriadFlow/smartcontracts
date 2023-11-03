import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { SignatureSeries , TradeHub  , AccessMaster} from "../typechain-types"
import exp from "constants"

describe("TradeHub && SignatureSeries Contract", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
        
    })

    let accessmaster : AccessMaster
    let signatureseries: SignatureSeries
    let tradehub: TradeHub

    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        tradehubAddress: ""
    }
    
    before(async () => {
        const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
        accessmaster = await AccessMasterFactory.deploy(owner.address)


        let  TradeHubFactory = await ethers.getContractFactory("TradeHub")
        tradehub = await TradeHubFactory.deploy(300,"MyMarketplace",accessmaster.address)

        const SignatureSeriesFactory = await ethers.getContractFactory("SignatureSeries")
        signatureseries = await SignatureSeriesFactory.deploy(metadata.name,metadata.symbol,"Voucher-Domain","1","1000000000000000000",tradehub.address , accessmaster.address)
    })
    it("Should return the right name and symbol of the token once SignatureSeries is deployed", async () => {
        expect(await signatureseries.name()).to.equal(metadata.name)
        expect(await signatureseries.symbol()).to.equal(metadata.symbol)
    })

    it("Should get the right owner", async () => {
        const FLOW_ADMIN_ROLE = await accessmaster.FLOW_ADMIN_ROLE()
        expect(await accessmaster.getRoleMember(FLOW_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })

    // TODO TradeHub don't have owner property or function

    it("Should grant role", async () => {
        const FLOW_OPERATOR_ROLE = await accessmaster.FLOW_OPERATOR_ROLE()
        expect(
            await accessmaster.grantRole(FLOW_OPERATOR_ROLE, operator.address)
        )
            .to.emit(accessmaster, "RoleGranted")
            .withArgs(FLOW_OPERATOR_ROLE, operator.address, owner.address)

        let hasRole = await accessmaster.hasRole(FLOW_OPERATOR_ROLE, operator.address)
        expect(hasRole).to.be.true

        const FLOW_CREATOR_ROLE = await accessmaster.FLOW_CREATOR_ROLE()

        expect(
            await accessmaster.connect(operator).grantRole(FLOW_CREATOR_ROLE, creator.address)
        )
            .to.emit(accessmaster, "RoleGranted")
            .withArgs(FLOW_CREATOR_ROLE, creator.address, operator.address)

        hasRole = await accessmaster.hasRole(FLOW_CREATOR_ROLE, creator.address)
        expect(hasRole).to.be.true

    })
    const metaDataHash = "ipfs://QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF"

    it("Should delegate artifact creation", async () => {
        expect(
            await signatureseries.connect(operator).delegateAssetCreation(creator2.address, metaDataHash, 500)
        )
            .to.emit(signatureseries, "AssetCreated")
            .withArgs(1, creator2.address, metaDataHash)

        const tokenURI = await signatureseries.tokenURI(1)
        expect(tokenURI).to.equal(metaDataHash)
        
    })
    
    const salePrice = ethers.utils.parseUnits("1", "ether");

    it("Should create marketitem", async () => {
        expect(
            await signatureseries.connect(creator2).approve(tradehub.address, 1)
        )
            .to.emit(signatureseries, "Approval")
            .withArgs(creator2.address, tradehub.address, 1)

        expect(
            await tradehub.connect(creator2).listItem(signatureseries.address, 1, salePrice,1,false,0)
        )
            .to.emit(tradehub, "SaleStarted")
            .withArgs(1, signatureseries.address, 1, metaDataHash, creator2.address,salePrice)

        const marketItem = await tradehub.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(1)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.status).to.be.equal(1)
        expect(marketItem.nftContract).to.equal(signatureseries.address)

    })

    it("Should be able to create market sale", async () => {
        await tradehub.connect(buyer).buyItem(1,1,{
            value: salePrice
        })
        const marketItem = await tradehub.idToMarketItem(1)
        expect(await signatureseries.ownerOf(1)).to.equal(buyer.address)
        expect(marketItem.status).to.equal(3)//check
    })

    it("Should be able to delete market item", async () => {
        // Create artifact
        await signatureseries.connect(creator).createAsset("ipfs://QmTiQKxZoVMvDahqVUzvkJhAjF9C1MzytpDEocxUT3oBde", 500)
        tradehub = tradehub.connect(creator)

        // Create Market Item
        await tradehub.listItem(signatureseries.address, 2, salePrice,1,false,0)

        // Remove that item market item and expect it to emit MarketItemRemoved and Transfer
        expect(await tradehub.removeItem(2))
            .to.emit(tradehub, "ItemRemoved").withArgs(2)
            .and
            .to.emit(tradehub, "Transfer").withArgs(tradehub.address, creator.address, 2)

        // Get that market item and expect it to be soft deleted
        const res = await tradehub.idToMarketItem(2)
        expect(res.status).to.be.equal(4)
    })

    it("Should not be able to create market sale if item is not for sale", async () => {
        const tradehubBuyer = tradehub.connect(buyer)
        await expect(tradehubBuyer.buyItem(1,1, {
            value: salePrice
        })).to.be.revertedWith("TradeHub: Market item is not for sale")
    })
    it("To check the royalty is working or not",async () => {
        await signatureseries.connect(buyer).approve(tradehub.address, 1)
        const startingCreatorBalance =  await tradehub.provider.getBalance(
                creator2.address
            ) 
        let val = salePrice
        //account[1]
        await  tradehub.connect(buyer).listItem(signatureseries.address,1,val,1,false,0);

        await tradehub.connect(operator).buyItem(1 ,1, {value : val})

        const endingCreatorBalance = await tradehub.provider.getBalance(
                creator2.address
            ) 
        let amount = (val.mul(70)).div(100)    
        
        //700000000000000000
        const royalty = await signatureseries.royaltyInfo(1,amount)
        assert.equal(
                endingCreatorBalance.sub(startingCreatorBalance).toString(),
                royalty[1].toString()
            )   
    })
   
    it("Auction: auction working or not,placebid,AcceptBidandEndAuction",async () => {
        let accounts = await ethers.getSigners() 

        const buyer1 = accounts[5]
        const buyer2 = accounts[6]
        const buyer3 = accounts[7]


        await signatureseries.connect(operator).approve(tradehub.address, 1)
        let val = ethers.utils.parseEther("1.1");

        let Time = 3600 

        //to check if the auction item  is created or not
        await tradehub.connect(operator).listItem(signatureseries.address,1,salePrice,1,true,Time);
         //to check if bidding can be done or not
        expect(await tradehub.connect(buyer1).placeBid(1,{value : val})).to.emit(tradehub ,"Bidplaced").withArgs(1,salePrice,buyer1.address)

        let val2 = ethers.utils.parseEther("1.2")
        expect(await tradehub.connect(buyer3).placeBid(1,{value : val2})).to.emit(tradehub ,"Bidplaced")

        //to check user won't be bid less than the previous highest bid
       expect(tradehub.connect(buyer2).placeBid(1, {value : val })).to.be.revertedWith("TradeHub: value less than the highest Bid")/// TO check

        //moving the time forward
       await network.provider.send("hardhat_mine", ["0x1200"]);
       
        //to check if the user can't bid after end time  
        val = ethers.utils.parseEther("2.1");
        const Bidder2 = tradehub.connect(buyer2)
        await expect(Bidder2.placeBid(1, {value : val })).to.be.reverted;
        
        await  tradehub.connect(operator).acceptBidAndEndAuction(1);
        
        expect(await signatureseries.ownerOf(1)).to.be.equal(buyer3.address);
        
    })
    it("concludeAuction , invokeStartAuction , _invokestartSale ",async () => {
        let accounts = await ethers.getSigners() 
        let [buyer1] = [accounts[5]]
        let buyer = accounts[7]

        await signatureseries.connect(buyer).transferFrom(buyer.address,buyer1.address ,1 )

        await signatureseries.connect(buyer1).approve(tradehub.address,1)
        
        await tradehub.connect(buyer1).listItem(signatureseries.address,1,salePrice,1,true,600)

        expect(await tradehub.connect(buyer1).acceptBidAndEndAuction(1)).to.emit(tradehub,"SaleStarted");

        const marketItem = await tradehub.idToMarketItem(1)
        expect(marketItem.status).to.be.equal(1)

         await tradehub.connect(buyer1).startAuction(1,600);

        let val = ethers.utils.parseEther("2")
        await tradehub.connect(operator).placeBid(1, {value : val});

        //user can't conclude before item End Time Ended
        expect(tradehub.connect(creator).concludeAuction(1)).to.be.reverted
        //moving the time forward
        await network.provider.send("hardhat_mine", ["0x260"]);

        expect( tradehub.concludeAuction(1)).to.emit(tradehub,"AuctionEnded").withArgs(1,buyer1.address,operator.address)

        expect(await signatureseries.ownerOf(1)).to.be.equal(operator.address);
    })
     it("UpdatePrice and UpdateTime ",async () => {
        await signatureseries.connect(operator).approve(tradehub.address,1)

        await tradehub.connect(operator).listItem(signatureseries.address,1,salePrice,1,true,300);

         const marketItem = await tradehub.idToMarketItem(1)
         
         const IntialTime = marketItem.auctioneEndTime;

         const IntialPrice = marketItem.price;

        let val = ethers.utils.parseEther("2");
        
        await tradehub.connect(operator).updatePrice(1,val)
        await tradehub.connect(operator).updateAuctionTime(1,600)

         const marketItem1 = await tradehub.idToMarketItem(1)
         
         const ATime = marketItem1.auctioneEndTime;

         const APrice = marketItem1.price;

         expect(IntialTime).to.not.equal(ATime)
         expect(IntialPrice).to.not.equal(APrice)

        val = ethers.utils.parseEther("2.1");
        await tradehub.connect(buyer).placeBid(1, {value : val })

        //no one can change time or price  when bid is there
        expect(tradehub.connect(operator).updatePrice(1,val)).to.be.reverted
        expect(tradehub.connect(operator).updateAuctionTime(1,1000)).to.be.reverted
    
    })
    it("should destroy Asset",async () => {
        await signatureseries.connect(creator).createAsset("www.xyz.com",300);
        expect(await signatureseries.connect(creator).destroyAsset(3)).to.emit(signatureseries,"AssetDestroyed");
        expect(signatureseries.ownerOf(3)).to.reverted;
    })
    it("To check ERC4907 for SignatureSeries",async () => {
        await signatureseries.createAsset("www.abcd.con",300);
        let val = ethers.utils.parseUnits("100","wei");
        await signatureseries.setRentInfo(4,true,val)
        //// RENT USER FUNCTION
        expect(await signatureseries.connect(creator).rent(4,1,{value : val})).to.emit(signatureseries,"UpdateUser");
        expect(await signatureseries.userOf(4)).to.be.equal(creator.address)
        //// SET USER FUNCTION
        await signatureseries.createAsset("www.abcde.con",400);
        expect(await signatureseries.setUser(5,buyer.address,3000)).to.emit(signatureseries,"UpdateUser")
        /// SET RENT INFO
        expect(signatureseries.connect(creator).rent(5,1,{value : val})).to.be.revertedWith("SignatureSeries: Not available for rent")
    })
    it("To check rental for more failing test cases and transfer funds feature",async () => {
        const rentPrice = ethers.utils.parseEther("1.0")
        /// Creting a new asset 
        await signatureseries.connect(creator).createAsset("www.abc.com",300)
        /// Checking if rental status false item cannot be rented
        expect(signatureseries.rent(6,1)).to.be.revertedWith("SignatureSeries: Not available for rent")
        /// Rental Status True and setting the Price
        await signatureseries.connect(creator).setRentInfo(6,true,rentPrice)
        /// Invalide tokenId 
        expect(signatureseries.rent(7,0)).to.be.revertedWith("SignatureSeries: Invalide Token I")
        /// checking if the rental status can be taken for 0 hours or 4320
        expect(signatureseries.rent(6,0)).to.be.revertedWith("SignatureSeries: Time can't be less than 1 hour")
        expect(signatureseries.rent(6,4321)).to.be.revertedWith("SignatureSeries: Time can't be more than 6 months")

        /// Calculate if transfer of Eth is happening after rental
        // Assert
        const startingOwnerBalance = await signatureseries.provider.getBalance(
            creator.address
        )
        const startingRentorBalance = await signatureseries.provider.getBalance(
            owner.address
        )
        ///ACT
        const transactionResponse = await signatureseries.rent(6,1,{value : rentPrice})
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await signatureseries.provider.getBalance(
                creator.address
        )
        const endingRentorBalance = await signatureseries.provider.getBalance(
                owner.address
        )
        
        assert.equal(
                endingOwnerBalance.sub(startingOwnerBalance).toString(),
                startingRentorBalance.sub(endingRentorBalance).sub(gasCost).toString()
        )
        /// TO check the Rented User
        expect(await signatureseries.userOf(6)).to.be.equal(owner.address)
        //// checking if user already exists it would throw error
        expect(signatureseries.connect(operator).rent(6,1,{value : rentPrice})).to.be.reverted
    })  
    it("check Lazy Minting",async () => {
        const price = ethers.utils.parseEther("1.0")

        // const price1 = ethers.BigNumber.from(50)
        //BigNumber { value: "50" }
        const uri = "www.abc.com"
        const SIGNING_DOMAIN_NAME = "Voucher-Domain"
        const SIGNING_DOMAIN_VERSION = "1"
        const chainId =  network.config.chainId
        const contractAddress = signatureseries.address 
        const signer = owner

        const domain = {
            name: SIGNING_DOMAIN_NAME,
            version: SIGNING_DOMAIN_VERSION,
            verifyingContract: contractAddress,
            chainId
        } 
        /// object content the name inside types
        // const voucher = {
        //     price : price2,
        //     uri
        // }

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
        // console.log(`The signer is ${await signatureseries.recover(voucher1)}`)  
        // to check if the correct signer is returning or not 
        expect(await signatureseries.recover(voucher1)).to.be.equal(owner.address)
         /// Calculating the transfer of Eth is happening after lazy mitning
            // Assert
        const startingOwnerBalance = await signatureseries.provider.getBalance(
            owner.address
        )
        const startingBuyerBalance = await signatureseries.provider.getBalance(
            buyer.address
        )
        ///ACT
        const transactionResponse = await signatureseries.connect(buyer).lazyAssetCreation(voucher1 , 300,{ value : price})
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await signatureseries.provider.getBalance(
                owner.address
        )
        const endingBuyerBalance = await signatureseries.provider.getBalance(
                buyer.address
        )
        
        assert.equal(
                endingOwnerBalance.sub(startingOwnerBalance).toString(),
                startingBuyerBalance.sub(endingBuyerBalance).sub(gasCost).toString()
        )

    })

})

