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
    const AccessMasterFactory = await hre.ethers.getContractFactory("AccessMaster");
    const AccessMaster = await AccessMasterFactory.deploy();
    await AccessMaster.deployed()
    console.log(
    `AccessMaster Deployed  to : ${AccessMaster.address}`
  );
  
    /// FLOW MARKETPLACE
    const TradeHub = await hre.ethers.getContractFactory("TradeHub");
    const tradehub = await TradeHub.deploy(300,"TheNftBazaar",AccessMaster.address);
    await tradehub.deployed();
    console.log("TradeHub Deployed to: ", tradehub.address);

    // Workaround: https://github.com/nomiclabs/hardhat/issues/2162
    const txHash = tradehub.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash);
    console.log("Confirming TradeHub Address:", txReceipt.contractAddress);

    // FLOW COLLECTION CONTRACT
    const FusionSeries = await hre.ethers.getContractFactory("FusionSeries");
    const fusionSeries = await FusionSeries.deploy("www.xyz.com", txReceipt.contractAddress, AccessMaster.address);
    await fusionSeries.deployed();
    console.log("FusionSeries Deployed to:", fusionSeries.address);

    if (process.env.script == "true") {
        //Print for processing in deployment script
        //TradeHub address 
        console.log(tradehub.address);
        //FusionSeries address 
        console.log(fusionSeries.address);
    }

    if (hre.network.name == "hardhat") {
        const salePrice = ethers.utils.parseEther("1.0")
        await AccessMaster.grantRole(await AccessMaster.FLOW_OPERATOR_ROLE(), await fusionSeries.signer.getAddress())
        await AccessMaster.grantRole(await AccessMaster.FLOW_CREATOR_ROLE(), await fusionSeries.signer.getAddress())
        await AccessMaster.grantRole(await AccessMaster.FLOW_CREATOR_ROLE(), await buyer.getAddress())
        await fusionSeries.createAsset( 500 ,"","https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF",)
        await tradehub.listItem(fusionSeries.address, 1, salePrice,1 , false, 0)
        await tradehub.connect(buyer).buyItem(1, 1 , { value: salePrice })
        await AccessMaster.revokeRole(await AccessMaster.FLOW_CREATOR_ROLE(), await buyer.getAddress())
        updateGraphAddress(fusionSeries.address, tradehub.address, tradehub.deployTransaction.blockNumber, true)
    } else {
        //AccessMaster
        await AccessMaster.deployTransaction.wait(6);
        await verify(AccessMaster.address, []);
        //TradeHub
        await tradehub.deployTransaction.wait(6);
        await verify(tradehub.address, [300,"TheNftBazaar",AccessMaster.address]);
        //FusionSeries
        await fusionSeries.deployTransaction.wait(6);
        await verify(fusionSeries.address, ["www.xyz.com", txReceipt.contractAddress, AccessMaster.address]);

        updateGraphAddress(fusionSeries.address, tradehub.address, tradehub.deployTransaction.blockNumber, false)
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

function updateGraphAddress(fusionSeriesnAddr: string, marketPlaceAddr: string, startBlock: number | undefined, local: boolean) {
    const urlTradeHubSubgraphLocal = local ? `subgraph/subgraph.local.yaml` : `subgraph/tradehubv2/subgraph.yaml`
    const urlCollectionSubgraphLocal = local ? `subgraph/nftCollection/subgraph.local.yaml` : `subgraph/nftCollection/subgraph.yaml`
    const umlTradeHubSubgraphLocal = yaml.load(fs.readFileSync(urlTradeHubSubgraphLocal, 'utf8')) as any
    const umlCollectionSubgraphLocal = yaml.load(fs.readFileSync(urlCollectionSubgraphLocal, 'utf8')) as any

    umlTradeHubSubgraphLocal.dataSources[0].source.address = marketPlaceAddr
    umlCollectionSubgraphLocal.dataSources[0].source.address = fusionSeriesnAddr

    if (startBlock) {
        umlTradeHubSubgraphLocal.dataSources[0].source.startBlock = startBlock
        umlCollectionSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
    fs.writeFileSync(urlTradeHubSubgraphLocal, yaml.dump(umlTradeHubSubgraphLocal));
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
