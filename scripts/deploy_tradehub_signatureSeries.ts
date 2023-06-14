import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {
    const [_, buyer] = await hre.ethers.getSigners()
    /// FLOW ACCESSCONTROL
  const AccessMasterFactory = await hre.ethers.getContractFactory("AccessMaster");
  const AccessMaster = await AccessMasterFactory.deploy();
  await AccessMaster.deployed()
  console.log(
    `AccessMaster Deployed  to : ${AccessMaster.address}`
  );
  
    /// TradeHub
    const TradeHub = await hre.ethers.getContractFactory("TradeHub");
    const marketplace = await TradeHub.deploy(200,"TheNftBazaar2",AccessMaster.address);
    await marketplace.deployed();
    console.log("TradeHub Deployed to: ", marketplace.address);

    // Workaround: https://github.com/nomiclabs/hardhat/issues/2162
    const txHash = marketplace.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash);
    console.log("Confirming TradeHub Address:", txReceipt.contractAddress);

    // FLOW EDITION CONTRACT
    const SignatureSeries = await hre.ethers.getContractFactory("SignatureSeries");
    const signatureSeries = await SignatureSeries.deploy("SignatureSeries V4", "FEv4",marketplace.address, AccessMaster.address);
    await signatureSeries.deployed();
    console.log("SignatureSeries Deployed to:", signatureSeries.address);

    if (process.env.script == "true") {
        //Print for processing in deployment script
        //TradeHub address 
        console.log(marketplace.address);
        //SignatureSeries address 
        console.log(signatureSeries.address);
    }
    if (hre.network.name == "hardhat"){
        const salePrice = ethers.utils.parseEther("1.0")
        await AccessMaster.grantRole(await AccessMaster.FLOW_OPERATOR_ROLE(), await signatureSeries.signer.getAddress())
        await AccessMaster.grantRole(await AccessMaster.FLOW_CREATOR_ROLE(), await signatureSeries.signer.getAddress())
        await AccessMaster.grantRole(await AccessMaster.FLOW_CREATOR_ROLE(), await buyer.getAddress())
        await signatureSeries.createAsset("https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF", 500)
        await marketplace.listItem(signatureSeries.address, 1, salePrice,1 , false, 0)
        await marketplace.connect(buyer).buyItem(1, 1 , { value: salePrice })
        await AccessMaster.revokeRole(await AccessMaster.FLOW_CREATOR_ROLE(), await buyer.getAddress())
        //updateGraphAddress(signatureSeries.address, marketplace.address, marketplace.deployTransaction.blockNumber, true)
    } else {
         //AccessMaster
        await AccessMaster.deployTransaction.wait(6);
        await verify(AccessMaster.address, []);
        //FlowTradeHub
        await marketplace.deployTransaction.wait(6);
        await verify(marketplace.address, [200,"TheNftBazaar2",AccessMaster.address]);
        //FlowCollection
        await signatureSeries.deployTransaction.wait(6);
        await verify(signatureSeries.address, ["SignatureSeries V1", "FEv1", marketplace.address, AccessMaster.address]);
        //updateGraphAddress(signatureSeries.address, marketplace.address, marketplace.deployTransaction.blockNumber, false)
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

function updateGraphAddress(signatureSeriesAddr: string, marketPlaceAddr: string, startBlock: number | undefined, local: boolean) {
    const urlTradeHubSubgraphLocal = local ? `subgraph/marketplacev2/subgraph.local.yaml` : `subgraph/marketplacev2/subgraph.yaml`
    const urlEditionSubgraphLocal = local ? `subgraph/nftEdition/subgraph.local.yaml` : `subgraph/nftEdition/subgraph.yaml`
    const umlTradeHubSubgraphLocal = yaml.load(fs.readFileSync(urlTradeHubSubgraphLocal, 'utf8')) as any
    const umlEditionSubgraphLocal = yaml.load(fs.readFileSync(urlEditionSubgraphLocal, 'utf8')) as any

    umlTradeHubSubgraphLocal.dataSources[0].source.address = marketPlaceAddr
    umlEditionSubgraphLocal.dataSources[0].source.address = signatureSeriesAddr

    if (startBlock) {
        umlTradeHubSubgraphLocal.dataSources[0].source.startBlock = startBlock
        umlEditionSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
    fs.writeFileSync(urlTradeHubSubgraphLocal, yaml.dump(umlTradeHubSubgraphLocal));
    fs.writeFileSync(urlEditionSubgraphLocal, yaml.dump(umlEditionSubgraphLocal));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
