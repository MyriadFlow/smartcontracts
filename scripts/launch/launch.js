const fs = require("fs")
const { ethers, run, network } = require("hardhat")

const scripts = `scripts/launch/launch.json`
const data = fs.readFileSync(scripts, "utf8")
const jsonContent = JSON.parse(data)

let contractAddress
let Verified = false

async function AccessMasterDeploy() {
    const AccessMasterFactory = await hre.ethers.getContractFactory(
        "AccessMaster"
    )
    const AccessMaster = await AccessMasterFactory.deploy()
    await AccessMaster.deployed()
    console.log(`AccessMaster Deployed  to : ${AccessMaster.address}`)
    let Addr = AccessMaster.address

    ///VERIFY
    if (hre.network.name != "hardhat") {
        await AccessMaster.deployTransaction.wait(6)
        await verify(AccessMaster.address, [])
    }
    return Addr
}

async function TradeHubDeploy() {
    const constructorParam = jsonContent.constructorParams

    const TradeHub = await hre.ethers.getContractFactory("TradeHub")
    const tradehub = await TradeHub.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3
    )

    await tradehub.deployed()
    console.log("TradeHub Deployed to: ", tradehub.address)

    const Addr = tradehub.address

    const txHash = tradehub.deployTransaction.hash
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`)
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash)
    console.log("Confirming TradeHub Address:", txReceipt.contractAddress)

    /// VERIFY
    if (hre.network.name != "hardhat") {
        await tradehub.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
        ])
    }
    return Addr
}

async function fusionSeriesDeploy() {
    const constructorParam = jsonContent.constructorParams
    const FusionSeries = await hre.ethers.getContractFactory("FusionSeries")
    const fusionseries = await FusionSeries.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3
    )
    await fusionseries.deployed()
    console.log("FusionSeries Deployed to:", fusionseries.address)
    const Addr = fusionseries.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await fusionseries.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
        ])
    }

    return Addr
}

async function signatureSeriesDeploy() {
    const constructorParam = jsonContent.constructorParams
    const SignatureSeries = await hre.ethers.getContractFactory(
        "SignatureSeries"
    )
    const signatureSeries = await SignatureSeries.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4
    )
    await signatureSeries.deployed()
    console.log("SignatureSeries Deployed to:", signatureSeries.address)
    const Addr = signatureSeries.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await signatureSeries.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
        ])
    }

    return Addr
}

async function instaGenDeploy() {
    const constructorParam = jsonContent.constructorParams
    const InstaGen = await hre.ethers.getContractFactory("InstaGen")
    const instaGen = await InstaGen.deploy(
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
    await instaGen.deployed()
    console.log("InstaGen Deployed to:", instaGen.address)
    const Addr = instaGen.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await instaGen.deployTransaction.wait(6)
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

async function eternumPassDeploy() {
    const constructorParam = jsonContent.constructorParams
    const EternumPass = await hre.ethers.getContractFactory("EternumPass")
    const eternumpass = await EternumPass.deploy(
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
    await eternumpass.deployed()
    console.log("EternumPass Deployed to:", eternumpass.address)
    const Addr = eternumpass.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await eternumpass.deployTransaction.wait(6)
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

async function flowSubscriptionDeploy() {
    const constructorParam = jsonContent.constructorParams
    const EternumPass = await hre.ethers.getContractFactory("FlowSubscription")
    const eternumpass = await EternumPass.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7
    )
    await eternumpass.deployed()
    console.log("FlowSubscription Deployed to:", eternumpass.address)
    const Addr = eternumpass.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await eternumpass.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
        ])
    }
    return Addr
}

async function main() {
    //AccessMaster
    if (jsonContent.contractName == "AccessMaster") {
        contractAddress = await AccessMasterDeploy()
    }
    /// TRADEHUB CONTRACT
    if (jsonContent.contractName == "TradeHub") {
        contractAddress = await TradeHubDeploy()
    }
    // FUSION-SERIES CONTRACT
    if (jsonContent.contractName == "FusionSeries") {
        contractAddress = await fusionSeriesDeploy()
    }
    // SIGNATURE-SERIES CONTRACT
    if (jsonContent.contractName == "SignatureSeries") {
        contractAddress = await signatureSeriesDeploy()
    }
    // INSTAGEN CONTRACT
    if (jsonContent.contractName == "InstaGen") {
        contractAddress = await instaGenDeploy()
    }
    //ETERNUMPASS CONTRACT
    if (jsonContent.contractName == "EternumPass") {
        contractAddress = await eternumPassDeploy()
    }
    // FLOWSUBSCRIPTION
    if (jsonContent.contractName == "FlowSubscription") {
        contractAddress = await flowSubscriptionDeploy()
    }
    let chainId

    if (network.config.chainId != undefined) {
        chainId = network.config.chainId
    } else {
        chainId = network.config.networkId
    }

    console.log(`The chainId is ${chainId}`)
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
