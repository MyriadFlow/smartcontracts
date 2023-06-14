import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {
    const [_, buyer] = await hre.ethers.getSigners()
    // We get the contract to deploy
    const tradehubAddr = "0x0335DD44f170657FEe88D693989C4f01324a9116"
    const accessMasterAddr ="0xbc9cD4bD303af002C0D65EDc5D6F5738be89B7D5"
    // FLOW EDITION CONTRACT
    const SignatureSeries = await hre.ethers.getContractFactory("SignatureSeries");
    const signatureSeries = await SignatureSeries.deploy("SignatureSeries V1", "FEv4", tradehubAddr,accessMasterAddr);
    await signatureSeries.deployed();
    console.log("SignatureSeries Deployed to:", signatureSeries.address);

    if (hre.network.name == "hardhat") {
        await signatureSeries.createAsset("https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF", 500)
        //updateGraphAddress(signatureSeries.address, signatureSeries.deployTransaction.blockNumber, true)
    } else {
        //FlowCollection
        await signatureSeries.deployTransaction.wait(6);
        await verify(signatureSeries.address, ["SignatureSeries V1", "FEv1", tradehubAddr, accessMasterAddr]);
        //updateGraphAddress(signatureSeries.address,  signatureSeries.deployTransaction.blockNumber, false)
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

function updateGraphAddress(signatureSeriesAddr: string, startBlock: number | undefined ,local: boolean) {
    const urlEditionSubgraphLocal = local ? `subgraph/nftEdition/subgraph.local.yaml` : `subgraph/nftEdition/subgraph.yaml`
    const umlEditionSubgraphLocal = yaml.load(fs.readFileSync(urlEditionSubgraphLocal, 'utf8')) as any

    umlEditionSubgraphLocal.dataSources[0].source.address = signatureSeriesAddr
    if (startBlock){
        umlEditionSubgraphLocal.dataSources[0].source.startBlock = startBlock
    }
    fs.writeFileSync(urlEditionSubgraphLocal, yaml.dump(umlEditionSubgraphLocal));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
