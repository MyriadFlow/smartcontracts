import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { EternumPass , AccessMaster} from "../typechain-types"
describe("Eternumpass Contract", () => {
                                    
    let [owner, operator , creator, creator2, buyer,  ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
        
    })
    let accessmaster: AccessMaster
    let eternumpass: EternumPass


    let baseURI = "www.xyz.com"
    let publicSalePrice = ethers.utils.parseEther("0.1")
    let subscriptionPerMonth = ethers.utils.parseEther("0.0001")

    const metadata = {
        name: "StoreFront V1",
        symbol: "SFv1",
        baseTokenURI: "",
        tradehubAddress: ""
    }
    
    before(async () => {
        const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
        accessmaster = await AccessMasterFactory.deploy()
        const  EternumPassFactory = await ethers.getContractFactory("EternumPass")        
        eternumpass = await EternumPassFactory.deploy(metadata.name, metadata.symbol,baseURI,publicSalePrice,30,subscriptionPerMonth,500,true,accessmaster.address);
    })
    it("Should return the right name and symbol of the token once StoreFront is deployed", async () => {
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
            await eternumpass.delegateSubscribe(creator2.address,true)
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
    it("withdraws ETH from the contract", async () => {
            // Assert
            const startingNftBalance = await eternumpass.provider.getBalance(
                eternumpass.address
            )
            const startingDeployerBalance = await eternumpass.provider.getBalance(
                owner.address
            )
            // Act
            const transactionResponse = await eternumpass.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingNftBalance = await eternumpass.provider.getBalance(
                eternumpass.address
            )
            const endingDeployerBalance = await eternumpass.provider.getBalance(
                owner.address
            )
            expect(endingNftBalance).to.be.equal(0)
            assert.equal(
                startingNftBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
    it("should destroy Asset",async () => {
        await eternumpass.connect(creator).subscribe({value : publicSalePrice});
        expect(await eternumpass.connect(creator).revokeSubscription(3)).to.emit(eternumpass,"NFTBurnt");
        expect(eternumpass.ownerOf(3)).to.reverted;
    })
    it("To check ERC4907 for eternumpass",async () => {
        await eternumpass.connect(operator).subscribe({value : publicSalePrice})

        let rentFee = ethers.utils.parseUnits("100","wei");
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
         //## TEST CASE 3 - IF THE TIME IS LESS THAN ONE HOUR  ,IT FAILS
        expect(eternumpass.connect(buyer).rent(2,0)).to.be.reverted
        //## TEST CASE 3 - IF THE TIME IS MORE THAN SIX MONTHS  ,IT FAILS
        expect(eternumpass.connect(buyer).rent(4321,0,{value : rentFee.mul(4321)})).to.be.reverted
        ///## TEST CASE 2 - NORMAL SCENARIO
        //// SET RENT INFO TEST CASE 1 - IF SOMEELSE TRIES TO SET USER OTHER THAN OWNER , IT FAILS
        expect(eternumpass.connect(creator).setRentInfo(2,true,rentFee)).to.be.reverted
         //// SET RENT INFO TEST CASE 2 - NORMAL SCENARIO
        expect(await eternumpass.connect(creator2).setRentInfo(2,true,rentFee)).to.emit(eternumpass,"RentalInfo")
        
        expect(await eternumpass.connect(buyer).rent(2,2,{value : rentFee.mul(2)}))
        expect(await eternumpass.userOf(2)).to.be.equal(buyer.address)
        /// CHECK IF USER ALREADY EXIST , USER CANNOT SET RENTING
         expect(eternumpass.connect(creator).setUser(1,creator2.address,3000)).to.be.reverted
    })
     it("should cancel Subscription", async () => {
            await eternumpass.setFreeSubscriptionStatus(false)
            await eternumpass.connect(operator).subscribe({value : publicSalePrice})
            // When other than owner of the token tries to cancel subscription
            expect(eternumpass.cancelSubscription(2)).to.be.reverted    
            //// When token does not exist
            expect(eternumpass.cancelSubscription(3)).to.be.reverted
            // /// When there is no subscription
            expect(eternumpass.connect(operator).cancelSubscription(5)).to.be.reverted            
            /// When subscription exists , owner calls cancellation, PASS
            //renew subscription
             await eternumpass.connect(operator).renewSubscription(5,1,{value : subscriptionPerMonth})
            ///cancelsubscription
            expect(await eternumpass.connect(operator).cancelSubscription(5)).to.emit(eternumpass,"RequestedCancelSubscription")
            ///When cancellation is in process new subscription cannot be done
             expect(eternumpass.connect(operator).renewSubscription(5,1,{value : subscriptionPerMonth})).to.be.reverted
            /// When Cancellation is in process repeated cancellation cannot be done
             expect(eternumpass.connect(operator).cancelSubscription(5)).to.be.reverted
             
        })
        it("to check if the renewal can be done by both Owner or Operator", async () => {
            const Month = await eternumpass.MONTH()
            // ##Failing Test 1 - > When 0 Months
            expect(eternumpass.connect(creator2).renewSubscription(2, 0)).to.be.reverted
            // ##Failing Test 2 -> when 13 Months
            expect(eternumpass.connect(creator2).renewSubscription(2, 13)).to.be.reverted
            // ##Failing Test 3 -> OTHER THAN OWNER OR OPERATOR
            expect(eternumpass.connect(buyer).renewSubscription(2, 1)).to.be.reverted
            /// Subscription renewal by operator
            let previousSubscriptionPeriod = await eternumpass.expiresAt(2)
            expect(await eternumpass.renewSubscription(2, 1)).to.emit(eternumpass,"SubscriptionUpdate")
            let newSubscriptionPeriod = await eternumpass.expiresAt(2)
            expect(
                newSubscriptionPeriod.sub(previousSubscriptionPeriod)
            ).to.be.equal(Month)
             /// Subscription renewal by owner
            previousSubscriptionPeriod = await eternumpass.expiresAt(2)
            await eternumpass.renewSubscription(2, 1,{value: subscriptionPerMonth})
            newSubscriptionPeriod = await eternumpass.expiresAt(2)
            expect(
                newSubscriptionPeriod.sub(previousSubscriptionPeriod)
            ).to.be.equal(Month)
            // OWNER RENEWAL SUBSCRIPTION
            /// FAILING TEST CASE 4 -> when paid less subscription amount
            expect(
                eternumpass.connect(creator).renewSubscription(1, 2,{value :subscriptionPerMonth})
            ).to.be.revertedWith("Eternumpass: Insufficient Payment")
            
        })
})

