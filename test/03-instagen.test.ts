import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { InstaGen, AccessMaster , TradeHub} from "../typechain-types"
import { BigNumber } from "ethers"

describe("TradeHub and InstaGen contracts", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner,creator, creator2, buyer,operator] = await ethers.getSigners()
        
    })

    let accessmaster : AccessMaster
    let instagen: InstaGen
    let tradehub : TradeHub
    let preSalePrice: BigNumber;
    let Saleprice: BigNumber;
    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "www.xyz.com",
        marketplaceAddress: ""
    }
     preSalePrice = ethers.utils.parseEther("0.005")
    Saleprice = ethers.utils.parseEther("0.01")
    before(async () => {
    
        const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
       accessmaster = await AccessMasterFactory.deploy(owner.address)


        let TradeHubFactory = await ethers.getContractFactory("TradeHub")
        tradehub = await TradeHubFactory.deploy(300,"MyMarketplace",accessmaster.address)

        const InstaGenFactory = await ethers.getContractFactory("InstaGen")

        instagen = await InstaGenFactory.deploy(metadata.name, metadata.symbol, tradehub.address ,accessmaster.address,Saleprice,preSalePrice,300,10,10,"www.abc.com");
        
        await instagen.deployed()
    })
    it("Should return the right name and symbol of the token, and other constructor parameters once Instagen is deployed", async () => {
        expect(await instagen.name()).to.equal(metadata.name)
        expect(await instagen.symbol()).to.equal(metadata.symbol)
        expect(await instagen.salePrice()).to.equal(Saleprice)
        expect(await instagen.preSalePrice()).to.equal(preSalePrice)
        expect(await instagen.maxSupply()).to.equal(10)
    })

    it("Should get the right owner", async () => {
        const FLOW_ADMIN_ROLE = await accessmaster.FLOW_ADMIN_ROLE()
        expect(await accessmaster.getRoleMember(FLOW_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })
    it("to check single minting and transferring funds",async () => {
        // MINTING 
        // Calculate if transfer of Eth is happening after  single minting
        //  Assert
        const startingOwnerBalance = await instagen.provider.getBalance(
            owner.address
        )
        const startingBuyerBalance = await instagen.provider.getBalance(
            creator.address
        )
        const transactionResponse = await instagen.connect(creator).mint(1 ,{
            value : preSalePrice
        })

        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await instagen.provider.getBalance(
                owner.address
        )
        const endingBuyerBalance = await instagen.provider.getBalance(
                creator.address
        )
        
        assert.equal(
                endingOwnerBalance.sub(startingOwnerBalance).toString(),
                startingBuyerBalance.sub(endingBuyerBalance).sub(gasCost).toString()
        )

        // TO check the ownerOF and BalanceOf for single minting
        expect(await instagen.ownerOf(1)).to.be.equal(creator.address)
        expect(await instagen.balanceOf(creator.address)).to.be.equal(1)
        
    })
    it("batch minting",async () => {
        // Calculate if transfer of Eth is happening after  single minting
        //  Assert
        const startingOwnerBalance = await instagen.provider.getBalance(
            owner.address
        )
        const startingBuyerBalance = await instagen.provider.getBalance(
            creator2.address
        )
         const transactionResponse =  await instagen.connect(creator2).mint(5 ,{
            value : Saleprice.mul(5)
        })

        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await instagen.provider.getBalance(
                owner.address
        )
        const endingBuyerBalance = await instagen.provider.getBalance(
                creator2.address
        )
        assert.equal(
            endingOwnerBalance.sub(startingOwnerBalance).toString(),
            startingBuyerBalance.sub(endingBuyerBalance).sub(gasCost).toString()
        )

        /// TO check if the owner of Token ID 2 to 6 is Creator Address or not
        for (let i = 2; i <= 6; i++) {
            expect(await instagen.ownerOf(i)).to.be.equal(creator2.address)
        }
        expect(await instagen.balanceOf(creator2.address)).to.be.equal(5)
        //moving the time forward
        await network.provider.send("hardhat_mine", ["0x100"]);    
        await instagen.connect(creator).mint(1 ,{value : 
        Saleprice})
        expect(await instagen.ownerOf(7)).to.be.equal(creator.address)
        expect(await instagen.balanceOf(creator.address)).to.be.equal(2)
    })
    it("to check burn ",async () => {
        //no one can other owner or approved
        expect(instagen.burnNFT(2)).to.be.reverted
        expect(await instagen.connect(creator2).burnNFT(2)).to.emit(instagen,"AssetDestroyed");
        expect(instagen.ownerOf(2)).to.be.reverted   
    })
    it("check ERC4907",async () => {
        let val = ethers.utils.parseUnits("100","wei");
        await instagen.connect(creator).setRentInfo(1,true,val)
        expect(await instagen.rent(1,1,{value : val})).to.emit(instagen,"UpdateUser");
        expect(await instagen.userOf(1)).to.be.equal(owner.address)  
        //// SET USER FUNCTION
        expect(await instagen.connect(creator2).setUser(3,buyer.address,3000)).to.emit(instagen,"UpdateUser")
        expect(await instagen.userOf(3)).to.be.equal(buyer.address)
        
        expect(instagen.connect(creator).setUser(1,buyer.address,3000)).to.be.revertedWith("InstaGen: Item is already subscribed")

        expect(instagen.rent(5,1,{value : val})).to.be.revertedWith("InstaGen: Not available for rent")
    })
     it("To check rental for more failing test cases and transfer funds feature",async () => {
        const rentPrice = ethers.utils.parseEther("1.0")
        /// Creting a new asset 
        await instagen.connect(creator).mint(1,{value : Saleprice})
        /// Checking if rental status false item cannot be rented
        expect(instagen.rent(8,1)).to.be.reverted
        /// Rental Status True and setting the Price
        await instagen.connect(creator).setRentInfo(8,true,rentPrice)
        /// Invalide tokenId 
        expect(instagen.rent(8,0)).to.be.reverted 
        /// checking if the rental status can be taken for 0 hours or 4320
        expect(instagen.rent(8,0)).to.be.revertedWith("Instagen: Time can't be less than 1 hour")
        expect(instagen.rent(8,4321)).to.be.revertedWith("Instagen: Time can't be more than 6 months")
        /// Calculate if transfer of Eth is happening after rental
        // Assert
        const startingOwnerBalance = await instagen.provider.getBalance(
            creator.address
        )
        const startingRentorBalance = await instagen.provider.getBalance(
            owner.address
        )
        ///ACT
        const transactionResponse = await instagen.rent(8,1,{value : rentPrice})
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await instagen.provider.getBalance(
                creator.address
        )
        const endingRentorBalance = await instagen.provider.getBalance(
                owner.address
        )
        assert.equal(
                endingOwnerBalance.sub(startingOwnerBalance).toString(),
                startingRentorBalance.sub(endingRentorBalance).sub(gasCost).toString()
        )
        /// TO check the Rented User
        expect(await instagen.userOf(8)).to.be.equal(owner.address)
        //// checking if user already exists it would throw error
        expect(instagen.connect(operator).rent(8,1,{value : rentPrice})).to.be.reverted
    })
    it("To check an Edge Case",async () => {
        let accounts = await ethers.getSigners()
        let amount1 = Saleprice.mul(3)
        let amount2 = Saleprice.mul(2)
        expect(instagen.connect(accounts[6]).mint(3,{value : amount1})).to.be.revertedWith("InstaGen: Exceeding max token supply!")

        await instagen.connect(accounts[6]).mint(2,{value : amount2})

        expect(await instagen.balanceOf(accounts[6].address)).to.be.equal(2)

    })
    it("create a marketitem and buy",async () => {
        expect(await tradehub.connect(creator2).listItem(instagen.address,3,Saleprice,1,false,0)).to.emit(tradehub, "SaleStarted")        
        const marketItem = await tradehub.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(3)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.status).to.be.equal(1)
        expect(marketItem.nftContract).to.equal(instagen.address)
    })
   
})