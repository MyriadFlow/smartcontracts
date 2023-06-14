import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {

  // we have to take the input through an API
  const tradehubAddr = "0x0"
  const AccessMasterAddr ="0x0" 
    // FLOW COLLECTION CONTRACT
    const FusionSeries = await hre.ethers.getContractFactory("FusionSeries");
    const fusionSeries = await FusionSeries.deploy("www.xyz.com", tradehubAddr, AccessMasterAddr);
    await fusionSeries.deployed();
    console.log("FusionSeries Deployed to:", fusionSeries.address);

    if (process.env.script == "true") {
        //Print for processing in deployment script
        //FusionSeries address 
        console.log(fusionSeries.address);
    }
    if (hre.network.name == "hardhat") {       
        await fusionSeries.createAsset( 500 ,"","https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF",)
        updateGraphAddress(fusionSeries.address, fusionSeries.deployTransaction.blockNumber, true)
    } else {
        //FusionSeries
        await fusionSeries.deployTransaction.wait(6);
        await verify(fusionSeries.address, ["www.xyz.com", tradehubAddr,AccessMasterAddr]);
        //updateGraphAddress(fusionSeries.address, fusionSeries.deployTransaction.blockNumber, false)
    }
}

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

function updateGraphAddress(fusionSeriesAddr: string,startBlock: number | undefined, local: boolean) {
    const urlFusionSeriesSubgraphLocal = local ? `subgraph/nftFusionSeries/subgraph.local.yaml` : `subgraph/nftFusionSeries/subgraph.yaml`
    const umlFusionSeriesSubgraphLocal = yaml.load(fs.readFileSync(urlFusionSeriesSubgraphLocal, 'utf8')) as any
    
    umlFusionSeriesSubgraphLocal.dataSources[0].source.address = fusionSeriesAddr

    if (startBlock) {
        umlFusionSeriesSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
    fs.writeFileSync(urlFusionSeriesSubgraphLocal, yaml.dump(umlFusionSeriesSubgraphLocal));
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
