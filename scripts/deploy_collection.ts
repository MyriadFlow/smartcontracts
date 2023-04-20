import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {

  // we have to take the input through an API
  const marketplaceAddr = "0x0"
  const flowAccessControlAddr ="0x0" 
    // FLOW COLLECTION CONTRACT
    const FlowCollection = await hre.ethers.getContractFactory("FlowCollection");
    const flowCollection = await FlowCollection.deploy("www.xyz.com", marketplaceAddr, flowAccessControlAddr);
    await flowCollection.deployed();
    console.log("FlowCollection Deployed to:", flowCollection.address);

    if (process.env.script == "true") {
        //Print for processing in deployment script
        //FlowCollection address 
        console.log(flowCollection.address);
    }
    if (hre.network.name == "hardhat") {       
        await flowCollection.createAsset( 500 ,"","https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF",)
        updateGraphAddress(flowCollection.address, flowCollection.deployTransaction.blockNumber, true)
    } else {
        //FlowCollection
        await flowCollection.deployTransaction.wait(6);
        await verify(flowCollection.address, ["www.xyz.com", marketplaceAddr,flowAccessControlAddr]);
        updateGraphAddress(flowCollection.address, flowCollection.deployTransaction.blockNumber, false)
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

function updateGraphAddress(flowEditonAddr: string,startBlock: number | undefined, local: boolean) {
    const urlCollectionSubgraphLocal = local ? `subgraph/nftCollection/subgraph.local.yaml` : `subgraph/nftCollection/subgraph.yaml`
    const umlCollectionSubgraphLocal = yaml.load(fs.readFileSync(urlCollectionSubgraphLocal, 'utf8')) as any
    
    umlCollectionSubgraphLocal.dataSources[0].source.address = flowEditonAddr

    if (startBlock) {
        umlCollectionSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
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
