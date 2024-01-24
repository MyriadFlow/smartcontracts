const fs = require("fs")
const { ethers, run, network } = require("hardhat")

const scripts = `scripts/launch/launch.json`
const data = fs.readFileSync(scripts, "utf8")
const jsonContent = JSON.parse(data)

let contractAddress
let blockNumber
let Verified = false

async function AccessMasterDeploy() {
    const constructorParam = jsonContent.constructorParams

    const AccessMasterFactory = await hre.ethers.getContractFactory(
        "AccessMaster"
    )
    const AccessMaster = await AccessMasterFactory.deploy(
        constructorParam.param1
    )
    await AccessMaster.deployed()
    console.log(`AccessMaster Deployed  to : ${AccessMaster.address}`)
    //console.log(AccessMaster)
    contractAddress = AccessMaster.address
    blockNumber = AccessMaster.provider._maxInternalBlockNumber

    ///VERIFY
    if (hre.network.name != "hardhat") {
        await AccessMaster.deployTransaction.wait(6)
        await verify(AccessMaster.address, [constructorParam.param1])
    }
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

    contractAddress = tradehub.address
    blockNumber = tradehub.provider._maxInternalBlockNumber

    const txHash = tradehub.deployTransaction.hash
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`)
    const txReceipt = await hre.ethers.provider.waitForTransaction(txHash)
    console.log("Confirming TradeHub Address:", txReceipt.contractAddress)

    /// VERIFY
    if (hre.network.name != "hardhat") {
        await tradehub.deployTransaction.wait(6)
        await verify(tradehub.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
        ])
    }
}

async function fusionSeriesDeploy() {
    const constructorParam = jsonContent.constructorParams
    const FusionSeries = await hre.ethers.getContractFactory("FusionSeries")
    const fusionseries = await FusionSeries.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5
    )
    await fusionseries.deployed()
    console.log("FusionSeries Deployed to:", fusionseries.address)
    contractAddress = fusionseries.address
    blockNumber = fusionseries.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await fusionseries.deployTransaction.wait(6)
        await verify(fusionseries.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
        ])
    }
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
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7
    )
    console.log("SignatureSeries Deployed to:", signatureSeries.address)
    contractAddress = signatureSeries.address
    blockNumber = signatureSeries.provider._maxInternalBlockNumber

    /// VERIFY
    if (hre.network.name != "hardhat") {
        await signatureSeries.deployTransaction.wait(6)
        await verify(signatureSeries.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
        ])
    }
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
    contractAddress = instaGen.address
    blockNumber = instaGen.provider._maxInternalBlockNumber - 1
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await instaGen.deployTransaction.wait(6)
        await verify(instaGen.address, [
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
        constructorParam.param9
    )
    await eternumpass.deployed()
    console.log("EternumPass Deployed to:", eternumpass.address)
    contractAddress = eternumpass.address
    blockNumber = eternumpass.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await eternumpass.deployTransaction.wait(6)
        await verify(eternumpass.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
            constructorParam.param8,
            constructorParam.param9,
        ])
    }
}

async function eternalSoulDeploy() {
    const constructorParam = jsonContent.constructorParams
    const EternalSoul = await hre.ethers.getContractFactory("EternalSoul")
    const eternalsoul = await EternalSoul.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7
    )
    await eternalsoul.deployed()
    console.log("EternalSoul Deployed to:", eternalsoul.address)
    contractAddress = eternalsoul.address
    blockNumber = eternalsoul.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await eternalsoul.deployTransaction.wait(6)
        await verify(eternalsoul.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
        ])
    }
}

async function phygitalDeploy() {
    const constructorParam = jsonContent.constructorParams
    const Phygital = await hre.ethers.getContractFactory("Phygital")
    const phygital = await Phygital.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4
    )
    await phygital.deployed()
    console.log("Phygital Deployed to:", phygital.address)
    contractAddress = phygital.address
    blockNumber = phygital.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await phygital.deployTransaction.wait(6)
        await verify(phygital.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
        ])
    }
}

async function phygitalADeploy() {
    const constructorParam = jsonContent.constructorParams
    const PhygitalA = await hre.ethers.getContractFactory("PhygitalA")
    const phygitala = await PhygitalA.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7
    )
    await phygitala.deployed()
    console.log("PhygitalA Deployed to:", phygitala.address)
    contractAddress = phygitala.address
    blockNumber = phygitala.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await phygitala.deployTransaction.wait(6)
        await verify(phygitala.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
        ])
    }
}

async function flowSubscriptionDeploy() {
    const constructorParam = jsonContent.constructorParams
    const FlowSubscription = await hre.ethers.getContractFactory(
        "FlowSubscription"
    )
    const flowsubscription = await FlowSubscription.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7
    )
    await flowsubscription.deployed()
    console.log("FlowSubscription Deployed to:", flowsubscription.address)
    contractAddress = flowsubscription.address
    blockNumber = flowsubscription.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await flowsubscription.deployTransaction.wait(6)
        await verify(flowsubscription.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7,
        ])
    }
}

async function cyberMavenDeploy() {
    const CyberMavenFactory = await hre.ethers.getContractFactory("CyberMaven")
    const cybermaven = await CyberMavenFactory.deploy()
    await cybermaven.deployed()
    console.log(`CyberMaven Deployed  to : ${cybermaven.address}`)
    contractAddress = cybermaven.address
    blockNumber = cybermaven.provider._maxInternalBlockNumber
    ///VERIFY
    if (hre.network.name != "hardhat") {
        await cybermaven.deployTransaction.wait(6)
        await verify(cybermaven.address, [])
    }
}

async function cybermavenRegistryDeploy() {
    const constructorParam = jsonContent.constructorParams
    const AccountRegistry = await hre.ethers.getContractFactory(
        "CyberMavenRegistry"
    )
    const accountregistry = await AccountRegistry.deploy(
        constructorParam.param1
    )
    await accountregistry.deployed()
    console.log("CyberMaven Registry Deployed to:", accountregistry.address)
    contractAddress = accountregistry.address
    blockNumber = accountregistry.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await accountregistry.deployTransaction.wait(6)
        await verify(accountregistry.address, [constructorParam.param1])
    }
}

async function main() {
    //AccessMaster
    if (jsonContent.contractName == "AccessMaster") {
        await AccessMasterDeploy()
    }
    /// TRADEHUB CONTRACT
    if (jsonContent.contractName == "TradeHub") {
        await TradeHubDeploy()
    }
    // FUSION-SERIES CONTRACT
    if (jsonContent.contractName == "FusionSeries") {
        await fusionSeriesDeploy()
    }
    // SIGNATURE-SERIES CONTRACT
    if (jsonContent.contractName == "SignatureSeries") {
        await signatureSeriesDeploy()
    }
    // INSTAGEN CONTRACT
    if (jsonContent.contractName == "InstaGen") {
        await instaGenDeploy()
    }
    //ETERNUMPASS CONTRACT
    if (jsonContent.contractName == "EternumPass") {
        await eternumPassDeploy()
    }
    // ETERNALSOUL CONTRACT
    if (jsonContent.contractName == "EternalSoul") {
        await eternalSoulDeploy()
    }
    //PHGITAL CONTRACT
    if (jsonContent.contractName == "Phygital") {
        await phygitalDeploy()
    }
    //PHYGITALA CONTRACT
    if (jsonContent.contractName == "PhygitalA") {
        await phygitalADeploy()
    }
    // FLOWSUBSCRIPTION
    if (jsonContent.contractName == "FlowSubscription") {
        await flowSubscriptionDeploy()
    }
    // FLOWOFFERSTATION
    if (jsonContent.contractName == "FlowOfferStation") {
        await flowOfferStationDeploy()
    }
    // CYBERMAVEN
    if (jsonContent.contractName == "CyberMaven") {
        await cyberMavenDeploy()
    }
    // ACCOUNT REGISTRY
    if (jsonContent.contractName == "CyberMavenRegistry") {
        await cybermavenRegistryDeploy()
    }

    let chainId

    if (network.config.chainId != undefined) {
        chainId = network.config.chainId
    } else {
        chainId = network.config.networkId
    }

    console.log(`The chainId is ${chainId}`)
    const data = { chainId, contractAddress, Verified, blockNumber }
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
