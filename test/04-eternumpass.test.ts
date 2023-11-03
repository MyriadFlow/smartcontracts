import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { EternumPass , AccessMaster} from "../typechain-types"
import { it } from "mocha"
describe("Eternumpass Contract", () => {
                                    
    let [owner, operator , creator, creator2, buyer,  ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
        
    })
    let accessmaster: AccessMaster
    let eternumpass: EternumPass


    let baseURI = "www.xyz.com"
    let publicSalePrice = ethers.utils.parseEther("1")
    let subscriptionPerMonth = ethers.utils.parseEther("0.1")

    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        tradehubAddress: ""
    }
    
    before(async () => {
        const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
        accessmaster = await AccessMasterFactory.deploy(owner.address)
        const  EternumPassFactory = await ethers.getContractFactory("EternumPass")        
        eternumpass = await EternumPassFactory.deploy(metadata.name, metadata.symbol,baseURI,publicSalePrice,30,subscriptionPerMonth,500,accessmaster.address,"0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298");
    })
    it("Should return the right name and symbol of the token once EternumPass is deployed", async () => {
        expect(await eternumpass.name()).to.equal(metadata.name)
        expect(await eternumpass.symbol()).to.equal(metadata.symbol)
    })
    it("check subscribe",async()=>{
        expect(eternumpass.subscribe()).to.be.reverted
        await eternumpass.unpause()
        expect(await eternumpass.connect(creator).subscribe({value : publicSalePrice})).to.emit(eternumpass,"NFTMinted")
        expect(await eternumpass.ownerOf(1)).to.be.equal(creator.address)
    })
    const metaDataHash = "ipfs://QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF"
    it("Should delegate artifact creation and SetTokenUri", async () => {
        expect(
            await eternumpass.delegateSubscribe(creator2.address)
        )
            .to.emit(eternumpass, "NFTMinted")
            .withArgs(1, creator2.address)
        expect(await eternumpass.ownerOf(2)).to.equal(creator2.address)

        let tokenURI = await eternumpass.tokenURI(1)
        let  baseURI1 = baseURI + "/1"
        expect(tokenURI).to.equal(baseURI1)
        await eternumpass.setTokenURI(1,metaDataHash)
        tokenURI = await eternumpass.tokenURI(1)
        expect(tokenURI).to.be.equal(metaDataHash)
    })
    it("should destroy Asset",async () => {
        await eternumpass.connect(creator).subscribe({value : publicSalePrice});
        expect(await eternumpass.connect(creator).revokeSubscription(3)).to.emit(eternumpass,"NFTBurnt");
        expect(eternumpass.ownerOf(3)).to.reverted;
    })
    it("To check Rental for eternumpass",async () => {
        await eternumpass.connect(operator).subscribe({value : publicSalePrice})

        let rentFee = ethers.utils.parseUnits("1","ether");
        /// SET RENTAL INFO
        expect(await eternumpass.connect(creator).setRentInfo(1,true,rentFee)).to.emit(eternumpass,"RentalInfo")
        //// SET USER FUNCTION
        //## TEST CASE 1 - IF THE USER IS NOT THE OWNER ,IT FAILS
        expect(eternumpass.setUser(1,owner.address,216000)).to.be.reverted
        // ## TEST CASE 2 - NORMAL SCENARIO
        expect(await eternumpass.connect(creator).setUser(1,owner.address,3000)).to.emit(eternumpass,"UpdateUser")

        expect(await eternumpass.userOf(1)).to.be.equal(owner.address)
        //// RENT USER FUNCTION
        //## TEST CASE 1 - IF THE TOKEN IS ALREADY RENTED  ,IT FAILS
        expect(eternumpass.connect(buyer).rent(1,1,{value : rentFee})).to.be.reverted
        //## TEST CASE 2 - IF THE TOKEN IS NOT RENTABLE  ,IT FAILS
        expect(eternumpass.connect(buyer).rent(4,1,{value : rentFee})).to.be.reverted

        ///## TEST CASE 2 - NORMAL SCENARIO
        //// SET RENT INFO TEST CASE 1 - IF SOMEELSE TRIES TO SET USER OTHER THAN OWNER , IT FAILS
        expect(eternumpass.connect(creator).setRentInfo(2,true,rentFee)).to.be.reverted
        //// SET RENT INFO TEST CASE 2 - NORMAL SCENARIO
        expect(await eternumpass.connect(creator2).setRentInfo(2,true,rentFee)).to.emit(eternumpass,"RentalInfo")
         //## TEST CASE 3 - IF THE TIME IS LESS THAN ONE HOUR  ,IT FAILS
        expect(eternumpass.connect(buyer).rent(2,0)).to.be.reverted
        //## TEST CASE 3 - IF THE TIME IS MORE THAN SIX MONTHS  ,IT FAILS
        expect(eternumpass.connect(buyer).rent(2,4321,{value : rentFee.mul(4321)})).to.be.reverted
        
        /******* TO CHECK THE TRANSFER FUNDS WORKING OR NOT*********************/
        const tokenOwner = await eternumpass.ownerOf(2)
         // Assert
        const startingOwnerBalance = await eternumpass.provider.getBalance(
            tokenOwner
        )
        const startingRentorBalance = await eternumpass.provider.getBalance(
            buyer.address
        )
        const startingPlatformOwnerBalance = await eternumpass.provider.getBalance(
            owner.address
        )
        ///ACT
        const transactionResponse = await eternumpass.connect(buyer).rent(2,2,{value : rentFee.mul(2)})
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        const endingOwnerBalance = await eternumpass.provider.getBalance(
                tokenOwner
        )
        const endingRentorBalance = await eternumpass.provider.getBalance(
                buyer.address
        )
        const endingPlatformOwnerBalance = await eternumpass.provider.getBalance(
            owner.address
        )
        const valueRecieved = endingPlatformOwnerBalance.sub(startingPlatformOwnerBalance)
        assert.equal(
                endingOwnerBalance.sub(startingOwnerBalance).toString(),
                startingRentorBalance.sub(endingRentorBalance).sub(valueRecieved).sub(gasCost).toString()
        )
        /********************************************/
        /// TO check the Rented User
        expect(await eternumpass.userOf(2)).to.be.equal(buyer.address)
        /// CHECK IF USER ALREADY EXIST , USER CANNOT SET RENTING
        expect(eternumpass.connect(creator).setUser(1,creator2.address,3000)).to.be.reverted
    })
     it("Check Minting Funds Transfer", async () => {
            /// TO check if funds are transferred properly in the time of subscribe
            /************** FUNDS TRANSFER FOR SUBSCRIPTION ******************* */
            // Assert
            const startingOwnerBalance = await eternumpass.provider.getBalance(
                owner.address
            )
            const startingBuyerBalance = await eternumpass.provider.getBalance(
                buyer.address
            )   
            ///ACT
            const transactionResponse = await eternumpass.connect(buyer).subscribe({value : publicSalePrice})
            const transactionReceipt = await transactionResponse.wait()
            let { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingOwnerBalance = await eternumpass.provider.getBalance(
                    owner.address
            )
            const endingBuyerBalance = await eternumpass.provider.getBalance(
                    buyer.address
            )
           
            assert.equal(
                    endingOwnerBalance.sub(startingOwnerBalance).toString(),
                    startingBuyerBalance.sub(endingBuyerBalance).sub(gasCost).toString()
            )
            
        })
        it("Check Cancel Subscription and Transfer of Funds ",async () => {
            /// Here Owner Account is Admin and Buyer is token Owner
            // TO check if funds are transferred properly in the time of  renewal of subscription
            /********************** RENEW SUBSCRIPTION **************************** */
             const startingOwnerBalance = await eternumpass.provider.getBalance(
                owner.address
            )
            const startingBuyerBalance = await eternumpass.provider.getBalance(
                buyer.address
            )   
            ///ACT
            const transactionResponse = await eternumpass.connect(buyer).renewSubscription(5,1,{value : subscriptionPerMonth})
            const transactionReceipt1 = await transactionResponse.wait()
            const { gasUsed , effectiveGasPrice } = transactionReceipt1
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingOwnerBalance = await eternumpass.provider.getBalance(
                    owner.address
            )
            const endingBuyerBalance = await eternumpass.provider.getBalance(
                    buyer.address
            )
           
            assert.equal(
                    endingOwnerBalance.sub(startingOwnerBalance).toString(),
                    startingBuyerBalance.sub(endingBuyerBalance).sub(gasCost).toString()
            )
            /********************************************* */
            // When other than owner of the token tries to cancel subscription
            expect(eternumpass.connect(creator).cancelSubscription(5)).to.be.revertedWith("EternumPass: Caller is owner nor approved")    
            // When token does not exist
            expect(eternumpass.connect(buyer).cancelSubscription(6)).to.be.revertedWith("EternumPass: Not a valid tokenId'")
            // When there is no subscription  
            expect(eternumpass.connect(operator).cancelSubscription(4)).to.be.revertedWith("Eternumpass: User subscription is not active")            
            /**
             * When subscription exists , Token Owner calls cancellation 
             * there will be two step process  in Cancelsubscription
            **/
            expect(await eternumpass.cancellationRequested(5)).to.be.false
            expect(await eternumpass.isRenewable(5)).to.be.false

            expect(await eternumpass.connect(buyer).cancelSubscription(5)).to.emit(eternumpass,"RequestedCancelSubscription")
        
            expect(await eternumpass.cancellationRequested(5)).to.be.true
            expect(await eternumpass.isRenewable(5)).to.be.true
         
            //When cancellation is in process new subscription cannot be done    
            await expect(eternumpass.connect(buyer).renewSubscription(5,1,{value : subscriptionPerMonth})).to.be.revertedWith("EternumPass: Cancellation is in process")
            // To make complete the cancellation request by Operator
            await eternumpass.cancelSubscription(5)

            expect(await eternumpass.cancellationRequested(5)).to.be.false
            expect(await eternumpass.isRenewable(5)).to.be.true
            
           /**
             * When subscription exists ,Operator calls cancellation 
             * there will be  one step process  in Cancelsubscription
            **/
            await eternumpass.connect(buyer).renewSubscription(5,1,{value : subscriptionPerMonth})    
            
            expect(await eternumpass.cancellationRequested(5)).to.be.false
            expect(await eternumpass.isRenewable(5)).to.be.false

            expect(await eternumpass.cancelSubscription(5)).to.emit(eternumpass,"RequestedCancelSubscription")
        
            expect(await eternumpass.cancellationRequested(5)).to.be.false
            expect(await eternumpass.isRenewable(5)).to.be.true

            /// If Subscription is Inactive then test fail
            await expect(eternumpass.cancelSubscription(1)).to.be.revertedWith("Eternumpass: Subscription is inactive")

        })
        it("Renew Subscription", async () => {
            /******** SUBSCRIPTION RENEWAL BY TOKEN OWNER ITSELF********* */
            const Month = await eternumpass.MONTH()
            // ##Failing Test 1 - > When 0 Months
            expect(eternumpass.connect(buyer).renewSubscription(5, 0)).to.be.reverted
            // ##Failing Test 2 -> when 13 Months
            expect(eternumpass.connect(buyer).renewSubscription(5, 13)).to.be.reverted
            // ##Failing Test 3 -> OTHER THAN OWNER OR OPERATOR
            expect(eternumpass.connect(creator).renewSubscription(5, 1)).to.be.reverted
            /// Subscription renewal by operator
            let previousSubscriptionPeriod = await eternumpass.expiresAt(5)
            expect(await eternumpass.renewSubscription(5, 1,{value : subscriptionPerMonth})).to.emit(eternumpass,"SubscriptionUpdate")
            let newSubscriptionPeriod = await eternumpass.expiresAt(5) 

            expect(
                newSubscriptionPeriod.sub(previousSubscriptionPeriod).sub(5)
            ).to.be.equal(Month)

            /// Subscription renewal by owner
            await eternumpass.cancelSubscription(5) 
            previousSubscriptionPeriod = await eternumpass.expiresAt(5)
            await eternumpass.renewSubscription(5,1)
            newSubscriptionPeriod = await eternumpass.expiresAt(5)
            expect(
                newSubscriptionPeriod.sub(previousSubscriptionPeriod).sub(1)
            ).to.be.equal(Month)
            
            // OWNER RENEWAL SUBSCRIPTION
            /// FAILING TEST CASE 4 -> when paid less subscription amount
            expect(
                eternumpass.connect(buyer).renewSubscription(5, 2,{value :subscriptionPerMonth})
            ).to.be.revertedWith("Eternumpass: Insufficient Payment")
            /// TO ADD SUBSCRIPTION WITH EXISTING SUBSCRIPTION
            expect(await eternumpass.isRenewable(5)).to.be.false
            await eternumpass.connect(buyer).renewSubscription(5, 1,{value :subscriptionPerMonth})
            let expire1 = await eternumpass.expiresAt(5)
            
            let diff1 = expire1.sub(newSubscriptionPeriod)
            let diff2 = expire1.sub(previousSubscriptionPeriod)

            expect(diff1).to.be.equal(Month)
            expect(diff2.sub(1)).to.be.equal(Month.mul(2))

        })
})

