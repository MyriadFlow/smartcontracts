import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { MyriadFlowOfferStation , SignatureSeries  ,AccessMaster} from "../typechain-types"
import exp from "constants"
import { off } from "process"
import { equal } from "assert"

describe("FlowOfferStation  contract", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
        
    })
    let accessMaster : AccessMaster
    let signatureSeries: SignatureSeries
    let offerstation: MyriadFlowOfferStation
    
    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        marketplaceAddress: ""
    }
    before(async () => {
        let AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
        accessMaster = await AccessMasterFactory.deploy(owner.address);

        let offerStationFactory = await ethers.getContractFactory("MyriadFlowOfferStation")
        offerstation = await offerStationFactory.deploy(300 , false , accessMaster.address)

        let SignatureSeriesFactory = await ethers.getContractFactory("SignatureSeries")
        signatureSeries = await SignatureSeriesFactory.deploy(metadata.name, metadata.symbol,"Voucher-Domain","1","1000000000000000000",offerstation.address ,accessMaster.address)

        const STOREFRONT_OPERATOR_ROLE = await accessMaster.FLOW_OPERATOR_ROLE()

         await accessMaster.grantRole(STOREFRONT_OPERATOR_ROLE, operator.address)
        
        
         const STOREFRONT_CREATOR_ROLE = await accessMaster.FLOW_CREATOR_ROLE()

         await accessMaster.connect(operator).grantRole(STOREFRONT_CREATOR_ROLE, creator.address)

    })
     it("User can offer to any NFT owner in the blockchain,withdraw and Update",async () => {
        await signatureSeries.connect(creator).createAsset("www.xyz.com",300);
        const contractAddress = signatureSeries.address

        expect(await offerstation.connect(buyer).createOffer(contractAddress,1 , {value : ethers.utils.parseEther("1.0")})).to.emit(offerstation,"ProposalIntiated")

        let proposalId = await offerstation.idToproposal(1)
        expect(proposalId.nftContractAddress).to.be.equal(signatureSeries.address)
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
      const contractAddress = signatureSeries.address
         //Accept Offer
        let val2 = ethers.utils.parseEther("1.0")
        await offerstation.createOffer(contractAddress,1 , {value : val2})

        expect(offerstation.acceptOffer(1)).to.be.revertedWith("offerstation: Proposal is already Closed")

        expect(await signatureSeries.ownerOf(1)).to.be.equal(creator.address)

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

        expect(await signatureSeries.ownerOf(1)).to.be.equal(owner.address)
       
        let amount = (val2.mul(70)).div(100) 
        
        let totalValue = (endingCreatorBalance.sub(startingCreatorBalance)).add(gasCost)

         assert.equal(
                totalValue.toString(),
                amount.toString()
            )

    })
    it("When Paused no offer ",async () => {
        const contractAddress = signatureSeries.address
        let Pause = await offerstation.paused()
        expect(Pause).to.be.false;
        await offerstation.setPause();
        Pause = await offerstation.paused();
        expect(Pause).to.be.true;
        let val2 = ethers.utils.parseEther("1.0")
        expect( offerstation.createOffer(contractAddress,1 , {value : val2})).to.be.revertedWith("MyriadOfferStation: You cannot offer , it is paused for sometime!")
        // only Admin can call
        expect(offerstation.connect(creator2).setPause()).to.be.revertedWith("MyriadFlowOfferStation: User is not authorized");
    })
    it("To check updatePlatformFee",async()=>{
        await offerstation.updatePlatformFee(30)
        expect(await offerstation.platformFeeBasisPoint()).to.be.equal(30)       
    })
})