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
    before(async () => {
        preSalePrice = ethers.utils.parseEther("0.005")
        Saleprice = ethers.utils.parseEther("0.01")

        const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
       accessmaster = await AccessMasterFactory.deploy()


        let TradeHubFactory = await ethers.getContractFactory("TradeHub")
        tradehub = await TradeHubFactory.deploy(300,"MyMarketplace",accessmaster.address)

        const InstaGenFactory = await ethers.getContractFactory("InstaGen")

        instagen = await InstaGenFactory.deploy(metadata.name, metadata.symbol, tradehub.address ,accessmaster.address,Saleprice,preSalePrice,120,200,300,"www.abc.com");
        
        await instagen.deployed()
    })
    it("Should return the right name and symbol of the token, and other constructor parameters once FlowGenEdution is deployed", async () => {
        expect(await instagen.name()).to.equal(metadata.name)
        expect(await instagen.symbol()).to.equal(metadata.symbol)
        expect(await instagen.salePrice()).to.equal(Saleprice)
        expect(await instagen.preSalePrice()).to.equal(preSalePrice)
        expect(await instagen.maxSupply()).to.equal(200)
    })

    it("Should get the right owner", async () => {
        const FLOW_ADMIN_ROLE = await accessmaster.FLOW_ADMIN_ROLE()
        expect(await accessmaster.getRoleMember(FLOW_ADMIN_ROLE, 0)).to.be.equal(owner.address)
    })
    it("to check single minting and batch minting ",async () => {

        /// MINTING
        await instagen.connect(creator).mint(1 ,{value : preSalePrice})
        expect(await instagen.ownerOf(1)).to.be.equal(creator.address)
        expect(await instagen.balanceOf(creator.address)).to.be.equal(1)
        await instagen.connect(creator2).mint(5 , {
            value : Saleprice.mul(5)
        })
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
    it("create a marketitem and buy",async () => {
        expect(await tradehub.connect(creator2).listItem(instagen.address,3,Saleprice,1,false,0)).to.emit(tradehub, "SaleStarted")        
        const marketItem = await tradehub.idToMarketItem(1)
        expect(marketItem.itemId).to.equal(1)
        expect(marketItem.tokenId).to.equal(3)
        expect(marketItem.seller).to.equal(creator2.address)
        expect(marketItem.status).to.be.equal(1)
        expect(marketItem.nftContract).to.equal(instagen.address)
    })
      it("withdraws ETH from the contract", async () => {
            // Assert
            const startingNftBalance = await instagen.provider.getBalance(
                instagen.address
            )
            const startingDeployerBalance = await instagen.provider.getBalance(
                owner.address
            )
            // Act
            const transactionResponse = await instagen.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingNftBalance = await instagen.provider.getBalance(
                instagen.address
            )
            const endingDeployerBalance = await instagen.provider.getBalance(
                owner.address
            )
            expect(endingNftBalance).to.be.equal(0)
            assert.equal(
                startingNftBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
})