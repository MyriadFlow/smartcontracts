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
    const StoreFront = await hre.ethers.getContractFactory("StoreFront");
    const storefront = await StoreFront.deploy("StoreFront V4", "SFv4", txReceipt.contractAddress);
    await storefront.deployed();
    console.log("StoreFront Deployed to:", storefront.address);

    if (process.env.script == "true") {
        //Print for processing in deployment script

        //Marketplace address 
        console.log(marketplace.address);

        //StoreFront address 
        console.log(storefront.address);
    }

    if (hre.network.name == "localhost") {
        await storefront.grantRole(await storefront.STOREFRONT_OPERATOR_ROLE(), await storefront.signer.getAddress())
        await storefront.grantRole(await storefront.STOREFRONT_CREATOR_ROLE(), await storefront.signer.getAddress())
        await storefront.grantRole(await storefront.STOREFRONT_CREATOR_ROLE(), await buyer.getAddress())
        await storefront.createAsset("https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF", 500)
        await marketplace.listItem(storefront.address, 1, 1, false, 0)
        await marketplace.connect(buyer).buyItem(1, { value: 1 })
        await storefront.revokeRole(await storefront.STOREFRONT_CREATOR_ROLE(), await buyer.getAddress())
        updateGraphAddress(storefront.address, marketplace.address, marketplace.deployTransaction.blockNumber, true)
    } else {
        updateGraphAddress(storefront.address, marketplace.address, marketplace.deployTransaction.blockNumber, false)
    }
}

function updateGraphAddress(storefrontAddr: string, marketPlaceAddr: string, startBlock: number | undefined, local: boolean) {
    // const urlSubgraphLocal = local ? `subgraph/subgraph.local.yaml` : `subgraph/subgraph.yaml`
    // const umlSubgraphLocal = yaml.load(fs.readFileSync(urlSubgraphLocal, 'utf8')) as any

    const urlMarketplaceSubgraphLocal = local ? `subgraph/subgraph.local.yaml` : `subgraph/marketplacev1/subgraph.yaml`
    const urlStorefrontSubgraphLocal = local ? `subgraph/storefront-v1/subgraph.local.yaml` : `subgraph/storefront-v1/subgraph.yaml`
    const umlMarketplaceSubgraphLocal = yaml.load(fs.readFileSync(urlMarketplaceSubgraphLocal, 'utf8')) as any
    const umlStorefrontSubgraphLocal = yaml.load(fs.readFileSync(urlStorefrontSubgraphLocal, 'utf8')) as any

    // umlSubgraphLocal.dataSources[0].source.address = storefrontAddr
    // umlSubgraphLocal.dataSources[1].source.address = marketPlaceAddr

    umlMarketplaceSubgraphLocal.dataSources[0].source.address = marketPlaceAddr
    umlStorefrontSubgraphLocal.dataSources[0].source.address = storefrontAddr

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
