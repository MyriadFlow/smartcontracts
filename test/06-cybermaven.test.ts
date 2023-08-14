import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import {expect } from "chai"
import { artifacts, ethers} from "hardhat"
import { CyberMaven, CyberMavenRegistry , NFT , Token , SFT} from "../typechain-types"

describe("CyberMaven contract", () => {
                                    
    let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
    before(async () => {
        [owner,creator, creator2, buyer,operator] = await ethers.getSigners()
        
    })
    let accountRegistry : CyberMavenRegistry
    let cybermaven: CyberMaven
    let nft : NFT
    let token : Token
    let sft : SFT
    let Addr : string
    let contractArtifact : any
    let contract : any
    before(async () => {

        //deploying Cybermaven
        let CyberMavenV1Factory = await ethers.getContractFactory("CyberMaven")
        cybermaven =  await CyberMavenV1Factory.deploy()
        await cybermaven.deployed()
        
        // deploying AccountRegistry
        let AccountRegistryFactory = await ethers.getContractFactory("CyberMavenRegistry")
        accountRegistry = await AccountRegistryFactory.deploy(cybermaven.address);
        await accountRegistry.deployed()

        /// deploying mocks
        ///ERC721
        const NFTFactory = await ethers.getContractFactory("NFT")
        nft = await NFTFactory.deploy()
        await nft.deployed()
        /// ERC20
        const TokenFactory = await ethers.getContractFactory("Token")
        token = await TokenFactory.deploy()
        await token.deployed()
        /// ERC1155
        const SFTFactory = await ethers.getContractFactory("SFT")
        sft = await SFTFactory.deploy()
        await sft.deployed()

        await nft.mintNFT(creator.address)
        await nft.mintNFT(creator2.address)
    })
     it("To check Account Registry is working or not",async () => {
        /// intiateWallet function
        await accountRegistry.intiateWallet(nft.address,1,[]);
        let userAccount = await accountRegistry.accounts(1)
        Addr = userAccount[2]
        /// fetching the abi
        contractArtifact = await artifacts.readArtifact("CyberMaven");

        contract = new ethers.Contract(userAccount[2],contractArtifact.abi,creator)
        await contract.deployed()

        expect(await contract.owner()).to.be.equal(await nft.ownerOf(1))

        /// createAccount  function
          expect(await accountRegistry.createAccount(cybermaven.address,31337,nft.address,2,700,[])).to.emit(accountRegistry,"AccountCreated");

         userAccount = await accountRegistry.accounts(2)

         expect(await accountRegistry.account(cybermaven.address,31337,nft.address,2,700)).to.be.equal(userAccount[2])
    })
    it("To check recieve and  executeCall ",async()=>{
        // recieve
        let startingBalance = await contract.getBalance()
        let val =  ethers.utils.parseEther("1")
        const txResponse = await owner.sendTransaction({
            to: Addr,
            value: val, 
        }); 
        // Wait for the transaction to be mined and get the transaction receipt
        const receipt = await txResponse.wait();

        let endingBalance = await contract.getBalance()
        
        expect(endingBalance).to.be.equal(val.add(startingBalance))

        /// ExecuteCall
        const startingCreatorBalance =  await contract.provider.getBalance(
                operator.address
        )
        let val2 = val.div(2)       

        /// checking if other than owner can call executeCall
        expect(contract.connect(owner).executeCall(operator.address,val2,[])).to.be.reverted

        await contract.executeCall(operator.address,val2,[])
       
        const endingCreatorBalance = await cybermaven.provider.getBalance(
                operator.address
        )        
        expect(endingCreatorBalance.sub(startingCreatorBalance)).to.be.equal(val2)
    })
    it("To check ERC20", async() => {  
        let val  = ethers.utils.parseEther("1")
        await token.transfer(contract.address,val)
        // Transfer
        expect(await contract.erc20Transfer(token.address,creator.address,val.div(2))).to.emit(contract,"ERC6551ERC20Transfer")
        expect(await token.balanceOf(creator.address)).to.be.equal(val.div(2))
        // Approve
        val =  ethers.utils.parseEther("0.1")
        expect(await contract.erc20Approve(token.address,creator.address,val)).to.emit(contract,"ERC6551ERC20Approve")
        expect(await token.allowance(contract.address,creator.address)).to.be.equal(val)
    })
    it("To check ERC721", async()=> {
        // /// Transfer
        for (let index = 0; index < 4; index++) {
            await nft.mintNFT(contract.address)    
        }
        ///SAFE TRANSFER
        expect(await nft.ownerOf(3)).to.be.equal(contract.address)
       
        expect(await contract.erc721SafeTransferFrom(nft.address,creator.address,3)).to.emit(contract,"ECR6551ERC721SafeTransferFrom")
        
        expect(await nft.ownerOf(3)).to.be.equal(creator.address)

        /// TRANSFER
        expect(await nft.ownerOf(4)).to.be.equal(contract.address)
        
        expect(await contract.erc721Transfer(nft.address,creator.address,4)).to.emit(contract,"ECR6551ERC721Transfer")

        expect(await nft.ownerOf(4)).to.be.equal(creator.address)
        /// Approve
        expect(await contract.erc721Approve(nft.address,operator.address,5)).to.emit(contract,"ECR6551ERC721Approve")

       expect(await nft.getApproved(5)).to.be.equal(operator.address)

       /// APPROVALL FOR ALL
        expect(await contract.erc721setApprovalForAll(nft.address,operator.address,true)).to.emit(contract,"ERC6551ERC721SetApprovalForAll")

        expect(await nft.isApprovedForAll(contract.address,operator.address)).to.be.true

        /// TO Check if safe transfer is working for the wallet contract or not
        await nft.connect(creator).transferAsset(creator.address,contract.address,3)
    })
    it("To check ERc1155",async () => {
        //// RECIEVE &&  TRANSFER
        await sft.mintSFT(contract.address ,10)

        expect(await sft.balanceOf(contract.address,1)).to.be.equal(10)

        expect(await contract.erc1155SafeTransferFrom(sft.address,creator.address,1,1,[])).to.emit(contract,"ECR6551ERC1155Transfer")

        expect(await sft.balanceOf(contract.address,1)).to.be.equal(9)
        expect(await sft.balanceOf(creator.address,1)).to.be.equal(1)

        //// APPROVE
        expect(await contract.erc1155setApprovalForAll(sft.address,creator2.address,true)).to.emit(contract,"ERC6551ERC1155SetApprovalForAll")

        expect(await sft.isApprovedForAll(contract.address,creator2.address)).to.be.true
    })
    it("to check callSetter",async () => {
         const abi = ["function mintToken(address user,uint256 value)"];
        const iface = new ethers.utils.Interface(abi);
        const encoded = iface.encodeFunctionData("mintToken",[contract.address,1]);

        ///ERC20
        expect(await token.balanceOf(contract.address)).to.be.equal(ethers.utils.parseEther("0.5"))

        await contract.callSetter(token.address,encoded)

        expect(await token.balanceOf(contract.address)).to.be.equal(ethers.utils.parseEther("1.5"))
        /// ERC721
        expect(await nft.balanceOf(contract.address)).to.be.equal(3)

        const abi2 = ["function mintNFT(address user)"];
        const iface2 = new ethers.utils.Interface(abi2);
        const encoded2 = iface2.encodeFunctionData("mintNFT",[contract.address]);

        await contract.callSetter(nft.address,encoded2)

        expect(await nft.balanceOf(contract.address)).to.be.equal(4)
        ///ERC1155 
        const abi3 = ["function mintSFT(address user,uint256 value)"];
        const iface3 = new ethers.utils.Interface(abi3);
        const encoded3 = iface3.encodeFunctionData("mintSFT",[contract.address,10]);

         expect(await sft.balanceOf(contract.address,2)).to.be.equal(0)

         await contract.callSetter(sft.address,encoded3)

         expect(await sft.balanceOf(contract.address,2)).to.be.equal(10)
    })  
    it("set the wallet Name",async() =>{
        const updatedName =  "Rohan Wallet"
        const updatedSymbol =  "RW"

        await contract.setWalletName(updatedName)
        await contract.setWalletSymbol(updatedSymbol)

        let name = await contract.name()
        let symbol  = await contract.symbol()

        expect(name).to.be.equal(updatedName)
        expect(symbol).to.be.equal(updatedSymbol)
    })

})