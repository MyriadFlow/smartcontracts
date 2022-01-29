// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat"
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
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(30);
    await marketplace.deployed();
    console.log("Marketplace Deployed to: ", marketplace.address);

    // Workaround: https://github.com/nomiclabs/hardhat/issues/2162
    const txHash = marketplace.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash);
    console.log("Confirming Marketplace Address:", txReceipt.contractAddress);
    const Creatify = await hre.ethers.getContractFactory("Creatify");
    const creatify = await Creatify.deploy("Creatify", "CRFTY", "", txReceipt.contractAddress);
    await creatify.deployed();
    console.log("Creatify Deployed to:", creatify.address);


    if (hre.network.name == "localhost") {
        await creatify.grantRole(await creatify.OPERATOR_ROLE(), await creatify.signer.getAddress())
        await creatify.grantRole(await creatify.CREATOR_ROLE(), await creatify.signer.getAddress())
        await creatify.grantRole(await creatify.CREATOR_ROLE(), await buyer.getAddress())
        await creatify.createArtifact("https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF")
        await marketplace.createMarketItem(creatify.address, 1, 1)
        await marketplace.connect(buyer).createMarketSale(creatify.address, 1, { value: 1 })

        const graphs: ["marketplace", "creatify"] = ["marketplace", "creatify"]
        graphs.forEach(g => {
            const urlSubgraphLocal = `subgraphs/${g}/subgraph.local.yaml`
            const umlSubgraphLocal = yaml.load(fs.readFileSync(urlSubgraphLocal, 'utf8')) as any
            umlSubgraphLocal.dataSources[0].source.address = g == "marketplace" ? marketplace.address : creatify.address

            fs.writeFileSync(urlSubgraphLocal, yaml.dump(umlSubgraphLocal));
        })
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
