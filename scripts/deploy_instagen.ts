import hre, { ethers , run } from "hardhat"
import yaml from "js-yaml"
import fs from "fs"
async function main() {
    const [_, buyer] = await hre.ethers.getSigners()
    // We get the contract to deploy
    const tradehubAddr = "0x0335DD44f170657FEe88D693989C4f01324a9116"
    const accessMasterAddr ="0xbc9cD4bD303af002C0D65EDc5D6F5738be89B7D5"
    let salePrice =  await ethers.utils.parseEther("0.01")
    let preSalePrice =  await ethers.utils.parseEther("0.005")
    // InstaGen CONTRACT
    const InstaGenFactory = await hre.ethers.getContractFactory("InstaGen");
    const instaGen = await InstaGenFactory.deploy("InstaGen V1", "FEv4", tradehubAddr,accessMasterAddr ,salePrice,preSalePrice,86400,1000,50,"www.abc.com");
    await instaGen.deployed();
    console.log("FlowEdition Deployed to:", instaGen.address);

    if (hre.network.name == "hardhat") {
        await instaGen.mint(1,{value : preSalePrice});
        //updateGraphAddress(instaGen.address, instaGen.deployTransaction.blockNumber, true)
    } else {
        //FlowCollection
        await instaGen.deployTransaction.wait(6);
        await verify(instaGen.address, ["FlowEdition V1", "FEv1", tradehubAddr, accessMasterAddr,salePrice,preSalePrice,84600,1000,50,"www.abc.com"]);
        //updateGraphAddress(instaGen.address,  instaGen.deployTransaction.blockNumber, false)
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

function updateGraphAddress(instaGenAddr: string, startBlock: number | undefined ,local: boolean) {
    const urlEditionSubgraphLocal = local ? `subgraph/nftEdition/subgraph.local.yaml` : `subgraph/nftEdition/subgraph.yaml`
    const umlEditionSubgraphLocal = yaml.load(fs.readFileSync(urlEditionSubgraphLocal, 'utf8')) as any

    umlEditionSubgraphLocal.dataSources[0].source.address = instaGenAddr
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