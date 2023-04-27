// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {
    const [_, buyer] = await hre.ethers.getSigners()
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    /// FLOW ACCESSCONTROL
     const FlowAccessControlFactory = await hre.ethers.getContractFactory("FlowAccessControl");
  const FlowAccessControl = await FlowAccessControlFactory.deploy();
  await FlowAccessControl.deployed()
  console.log(
    `FlowAccessControl Deployed  to : ${FlowAccessControl.address}`
  );
  
    /// FLOW MARKETPLACE
    const Marketplace = await hre.ethers.getContractFactory("FlowMarketplace");
    const marketplace = await Marketplace.deploy(300,"TheNftBazaar",FlowAccessControl.address);
    await marketplace.deployed();
    console.log("FlowMarketplace Deployed to: ", marketplace.address);

    // Workaround: https://github.com/nomiclabs/hardhat/issues/2162
    const txHash = marketplace.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash);
    console.log("Confirming Marketplace Address:", txReceipt.contractAddress);

    // FLOW COLLECTION CONTRACT
    const FlowCollection = await hre.ethers.getContractFactory("FlowCollection");
    const flowCollection = await FlowCollection.deploy("www.xyz.com", txReceipt.contractAddress, FlowAccessControl.address);
    await flowCollection.deployed();
    console.log("FlowCollection Deployed to:", flowCollection.address);

    if (process.env.script == "true") {
        //Print for processing in deployment script
        //Marketplace address 
        console.log(marketplace.address);
        //FlowCollection address 
        console.log(flowCollection.address);
    }

    if (hre.network.name == "hardhat") {
        const salePrice = ethers.utils.parseEther("1.0")
        await FlowAccessControl.grantRole(await FlowAccessControl.FLOW_OPERATOR_ROLE(), await flowCollection.signer.getAddress())
        await FlowAccessControl.grantRole(await FlowAccessControl.FLOW_CREATOR_ROLE(), await flowCollection.signer.getAddress())
        await FlowAccessControl.grantRole(await FlowAccessControl.FLOW_CREATOR_ROLE(), await buyer.getAddress())
        await flowCollection.createAsset( 500 ,"","https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF",)
        await marketplace.listItem(flowCollection.address, 1, salePrice,1 , false, 0)
        await marketplace.connect(buyer).buyItem(1, 1 , { value: salePrice })
        await FlowAccessControl.revokeRole(await FlowAccessControl.FLOW_CREATOR_ROLE(), await buyer.getAddress())
        updateGraphAddress(flowCollection.address, marketplace.address, marketplace.deployTransaction.blockNumber, true)
    } else {
        //FlowAccessControl
        await FlowAccessControl.deployTransaction.wait(6);
        await verify(FlowAccessControl.address, []);
        //FlowMarketplace
        await marketplace.deployTransaction.wait(6);
        await verify(marketplace.address, [300,"TheNftBazaar",FlowAccessControl.address]);
        //FlowCollection
        await flowCollection.deployTransaction.wait(6);
        await verify(flowCollection.address, ["www.xyz.com", txReceipt.contractAddress, FlowAccessControl.address]);

        updateGraphAddress(flowCollection.address, marketplace.address, marketplace.deployTransaction.blockNumber, false)
    }
}

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
};

function updateGraphAddress(flowEditonAddr: string, marketPlaceAddr: string, startBlock: number | undefined, local: boolean) {
    const urlMarketplaceSubgraphLocal = local ? `subgraph/subgraph.local.yaml` : `subgraph/marketplacev2/subgraph.yaml`
    const urlCollectionSubgraphLocal = local ? `subgraph/nftCollection/subgraph.local.yaml` : `subgraph/nftCollection/subgraph.yaml`
    const umlMarketplaceSubgraphLocal = yaml.load(fs.readFileSync(urlMarketplaceSubgraphLocal, 'utf8')) as any
    const umlCollectionSubgraphLocal = yaml.load(fs.readFileSync(urlCollectionSubgraphLocal, 'utf8')) as any

    umlMarketplaceSubgraphLocal.dataSources[0].source.address = marketPlaceAddr
    umlCollectionSubgraphLocal.dataSources[0].source.address = flowEditonAddr

    if (startBlock) {
        umlMarketplaceSubgraphLocal.dataSources[0].source.startBlock = startBlock
        umlCollectionSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
    fs.writeFileSync(urlMarketplaceSubgraphLocal, yaml.dump(umlMarketplaceSubgraphLocal));
    fs.writeFileSync(urlCollectionSubgraphLocal, yaml.dump(umlCollectionSubgraphLocal));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
