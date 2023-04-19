// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre, { ethers } from "hardhat"
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

    if (hre.network.name == "localhost") {
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
        updateGraphAddress(flowCollection.address, marketplace.address, marketplace.deployTransaction.blockNumber, false)
    }
}

function updateGraphAddress(flowEditonAddr: string, marketPlaceAddr: string, startBlock: number | undefined, local: boolean) {
    // const urlSubgraphLocal = local ? `subgraph/subgraph.local.yaml` : `subgraph/subgraph.yaml`
    // const umlSubgraphLocal = yaml.load(fs.readFileSync(urlSubgraphLocal, 'utf8')) as any

    const urlMarketplaceSubgraphLocal = local ? `subgraph/subgraph.local.yaml` : `subgraph/marketplacev1/subgraph.yaml`
    const urlStorefrontSubgraphLocal = local ? `subgraph/flowEditon-v1/subgraph.local.yaml` : `subgraph/flowEditon-v1/subgraph.yaml`
    const umlMarketplaceSubgraphLocal = yaml.load(fs.readFileSync(urlMarketplaceSubgraphLocal, 'utf8')) as any
    const umlStorefrontSubgraphLocal = yaml.load(fs.readFileSync(urlStorefrontSubgraphLocal, 'utf8')) as any

    // umlSubgraphLocal.dataSources[0].source.address = flowEditonAddr
    // umlSubgraphLocal.dataSources[1].source.address = marketPlaceAddr

    umlMarketplaceSubgraphLocal.dataSources[0].source.address = marketPlaceAddr
    umlStorefrontSubgraphLocal.dataSources[0].source.address = flowEditonAddr

    // if (startBlock) {
    //     umlSubgraphLocal.dataSources[0].source.startBlock = startBlock
    //     umlSubgraphLocal.dataSources[1].source.startBlock = startBlock
    // }
    // fs.writeFileSync(urlSubgraphLocal, yaml.dump(umlSubgraphLocal));

    if (startBlock) {
        umlMarketplaceSubgraphLocal.dataSources[0].source.startBlock = startBlock
        umlStorefrontSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
    fs.writeFileSync(urlMarketplaceSubgraphLocal, yaml.dump(umlMarketplaceSubgraphLocal));
    fs.writeFileSync(urlStorefrontSubgraphLocal, yaml.dump(umlStorefrontSubgraphLocal));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
