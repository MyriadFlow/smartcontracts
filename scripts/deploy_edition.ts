import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {
    const [_, buyer] = await hre.ethers.getSigners()
    // We get the contract to deploy
    const marketplaceAddr = "0x0"
    const flowAccessControlAddr ="0x0"
    // FLOW EDITION CONTRACT
    const FlowEdition = await hre.ethers.getContractFactory("FlowEdition");
    const flowEdition = await FlowEdition.deploy("FlowEdition V1", "FEv4", marketplaceAddr,flowAccessControlAddr);
    await flowEdition.deployed();
    console.log("FlowEdition Deployed to:", flowEdition.address);

    if (process.env.script == "true") {
        //FlowEdition address 
        console.log(flowEdition.address);
    }

    if (hre.network.name == "hardhat") {
        await flowEdition.createAsset("https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF", 500)
        updateGraphAddress(flowEdition.address, flowEdition.deployTransaction.blockNumber, true)
    } else {
        //FlowCollection
        await flowEdition.deployTransaction.wait(6);
        await verify(flowEdition.address, ["FlowEdition V1", "FEv1", marketplaceAddr, flowAccessControlAddr]);
        updateGraphAddress(flowEdition.address,  flowEdition.deployTransaction.blockNumber, false)
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

function updateGraphAddress(flowEditonAddr: string, startBlock: number | undefined ,local: boolean) {
    const urlEditionSubgraphLocal = local ? `subgraph/nftEdition/subgraph.local.yaml` : `subgraph/nftEdition/subgraph.yaml`
    const umlEditionSubgraphLocal = yaml.load(fs.readFileSync(urlEditionSubgraphLocal, 'utf8')) as any

    umlEditionSubgraphLocal.dataSources[0].source.address = flowEditonAddr
    if (startBlock){
        umlEditionSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
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
