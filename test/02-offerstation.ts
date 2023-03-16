import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { OfferStation , StorefrontCollection } from "../typechain-types"

describe("OfferStation contract", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
        
    })
    let offerstation: OfferStation
    let storefront: StorefrontCollection
    
   
    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        marketplaceAddress: ""
    }
    before(async () => {
        let offerStationFactory = await ethers.getContractFactory("OfferStation")
        offerstation = await offerStationFactory.deploy(300 ,"1" , false )

        let storefrontFactory = await ethers.getContractFactory("StorefrontCollection")
        storefront = await storefrontFactory.deploy(metadata.name, metadata.symbol, offerstation.address)

        const STOREFRONT_OPERATOR_ROLE = await storefront.STOREFRONT_OPERATOR_ROLE()

         await storefront.grantRole(STOREFRONT_OPERATOR_ROLE, operator.address)
        
        
         const STOREFRONT_CREATOR_ROLE = await storefront.STOREFRONT_CREATOR_ROLE()

         await storefront.connect(operator).grantRole(STOREFRONT_CREATOR_ROLE, creator.address)

    })
     it("User can offer to any NFT owner in the blockchain,withdraw and Update",async () => {
        await storefront.connect(creator).createAsset("www.xyz.com",300);
        const contractAddress = storefront.address

        expect(await offerstation.connect(buyer).createOffer(contractAddress,1 , {value : ethers.utils.parseEther("1.0")})).to.emit(offerstation,"ProposalIntiated")

        let proposalId = await offerstation.idToproposal(1)
        expect(proposalId.nftContractAddress).to.be.equal(storefront.address)
        expect(proposalId.tokenId).to.be.equal(1)
        expect(proposalId.status).to.be.equal(1)
        
        //increase the Offer Price
        let val = ethers.utils.parseEther("0.5");

        await offerstation.connect(buyer).increaseOffer(1,{value : val })

        proposalId = await offerstation.idToproposal(1)

        val = ethers.utils.parseEther("1.5");
        
        expect(proposalId.proposedBid).to.be.equal(val)

        //Withdraw the offer
        expect(await offerstation.connect(buyer).withdrawOffer(1)).to.emit(offerstation,"ProposalWithdrawn") 

        proposalId = await offerstation.idToproposal(1)

        expect(proposalId.status).to.be.equal(2)

    })
    it("Accept Offer by Owner",async()=>{

        const contractAddress = storefront.address
         //Accept Offer
        let val2 = ethers.utils.parseEther("1.0")
        await offerstation.createOffer(contractAddress,1 , {value : val2})

        expect(offerstation.acceptOffer(1)).to.be.revertedWith("offerstation: Proposal is already Closed")

        expect(await storefront.ownerOf(1)).to.be.equal(creator.address)

        const startingCreatorBalance =  await offerstation.provider.getBalance(
                creator.address
            )

        const transactionResponse = await offerstation.connect(creator).acceptOffer(2)
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)        

        const endingCreatorBalance = await offerstation.provider.getBalance(
                creator.address
            ) 

        expect(await storefront.ownerOf(1)).to.be.equal(owner.address)
       
        let amount = (val2.mul(70)).div(100) 
        
        let totalValue = (endingCreatorBalance.sub(startingCreatorBalance)).add(gasCost)

         assert.equal(
                totalValue.toString(),
                amount.toString()
            )

    })
    it("When Paused no offer ",async () => {

        const contractAddress = storefront.address
        let Pause = await offerstation.paused()
        expect(Pause).to.be.false;
        await offerstation.setPause();
        Pause = await offerstation.paused();
        expect(Pause).to.be.true;
        let val2 = ethers.utils.parseEther("1.0")
        expect( offerstation.createOffer(contractAddress,1 , {value : val2})).to.be.revertedWith("OfferStation: You cannot offer , it is paused for sometime!")
        
    })
})