/// Deploy.json would be different for every contract
/// INPUt :  Contract Name , Constructor Params
/// OUTPUT -ChainId: .Address{Contract Address} : 0X0ERT  ,Verified : true or false

const fs = require("fs")
const { ethers, run, network } = require("hardhat")

const scripts = `scripts/deploy/deploy.json`
const data = fs.readFileSync(scripts, "utf8")
const jsonContent = JSON.parse(data)
// console.log(jsonContent)

let contractAddress
let Verified = false

async function flowAccessControlDeploy() {
    const FlowAccessControlFactory = await hre.ethers.getContractFactory(
        "FlowAccessControl"
    )
    const FlowAccessControl = await FlowAccessControlFactory.deploy()
    await FlowAccessControl.deployed()
    console.log(`FlowAccessControl Deployed  to : ${FlowAccessControl.address}`)
    let Addr = FlowAccessControl.address

    ///VERIFY
    if (hre.network.name != "hardhat") {
        await FlowAccessControl.deployTransaction.wait(6)
        await verify(FlowAccessControl.address, [])
    }
    return Addr
}

async function flowMarketPlaceDeploy() {
    const constructorParam = jsonContent.constructorParams

    const Marketplace = await hre.ethers.getContractFactory("FlowMarketplace")
    const marketplace = await Marketplace.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3
    )

    await marketplace.deployed()
    console.log("FlowMarketplace Deployed to: ", marketplace.address)

    const Addr = marketplace.address

    const txHash = marketplace.deployTransaction.hash
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`)
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash)
    console.log("Confirming Marketplace Address:", txReceipt.contractAddress)

    /// VERIFY
    if (hre.network.name != "hardhat") {
        await marketplace.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
        ])
    }
    return Addr
}

async function flowCollectionDeploy() {
    const constructorParam = jsonContent.constructorParams
    const FlowCollection = await hre.ethers.getContractFactory("FlowCollection")
    const flowCollection = await FlowCollection.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3
    )
    await flowCollection.deployed()
    console.log("FlowCollection Deployed to:", flowCollection.address)
    const Addr = flowCollection.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await flowCollection.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
        ])
    }

    return Addr
}

async function flowEditionDeploy() {
    const constructorParam = jsonContent.constructorParams
    const FlowEdition = await hre.ethers.getContractFactory("FlowEdition")
    const flowEdition = await FlowEdition.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4
    )
    await flowEdition.deployed()
    console.log("FlowEdition Deployed to:", flowEdition.address)
    const Addr = flowEdition.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await flowEdition.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
        ])
    }

    return Addr
}

async function flowGenEditionDeploy() {
    const constructorParam = jsonContent.constructorParams
    const FlowGenEdition = await hre.ethers.getContractFactory("FlowGenEdition")
    const flowGenEdition = await FlowGenEdition.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7,
        constructorParam.param8,
        constructorParam.param9,
        constructorParam.param10
    )
    await flowGenEdition.deployed()
    console.log("FlowGenEdition Deployed to:", flowGenEdition.address)
    const Addr = flowGenEdition.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await flowGenEdition.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
            constructorParam.param8,
            constructorParam.param9,
            constructorParam.param10,
        ])
    }

    return Addr
}

async function main() {
    //FlowAccessControl
    if (jsonContent.contractName == "FlowAccessControl") {
        contractAddress = await flowAccessControlDeploy()
    }
    /// FLOW MARKETPLACE
    if (jsonContent.contractName == "FlowMarketplace") {
        contractAddress = await flowMarketPlaceDeploy()
    }
    // FLOW COLLECTION CONTRACT
    if (jsonContent.contractName == "FlowCollection") {
        contractAddress = await flowCollectionDeploy()
    }

    // FLOW EDITION CONTRACT
    if (jsonContent.contractName == "FlowEdition") {
        contractAddress = await flowEditionDeploy()
    }

    // FLOW GEN-EDITION CONTRACT
    if (jsonContent.contractName == "FlowGenEdition") {
        contractAddress = await flowGenEditionDeploy()
    }

    console.log(`The chainId is ${network.config.networkId}`)
    //console.log(network)
    const chainId = network.config.networkId
    const data = { chainId, contractAddress, Verified }
    const jsonString = JSON.stringify(data)
    // Log the JSON string
    console.log(jsonString)
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        Verified = true
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
