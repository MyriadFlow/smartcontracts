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
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5
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
            constructorParam.param4,
            constructorParam.param5,
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
        constructorParam.param9
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
        ])
    }
    return Addr
}

async function eternalSoulDeploy() {
    const constructorParam = jsonContent.constructorParams
    const EternalSoul = await hre.ethers.getContractFactory("EternalSoul")
    const eternalsoul = await EternalSoul.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4
    )
    await eternalsoul.deployed()
    console.log("EternalSoul Deployed to:", eternalsoul.address)
    const Addr = eternalsoul.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await eternalsoul.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
        ])
    }
    return Addr
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
        constructorParam.param6
    )
    await flowsubscription.deployed()
    console.log("FlowSubscription Deployed to:", flowsubscription.address)
    const Addr = flowsubscription.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await flowsubscription.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
        ])
    }
    return Addr
}

async function flowOfferStationDeploy() {
    const constructorParam = jsonContent.constructorParams
    const OfferStation = await hre.ethers.getContractFactory(
        "MyriadFlowOfferStation"
    )
    const offerstation = await OfferStation.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3
    )
    await offerstation.deployed()
    console.log("Offerstation Deployed to:", offerstation.address)
    const Addr = offerstation.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await offerstation.deployTransaction.wait(6)
        await verify(Addr, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
        ])
    }
    return Addr
}

async function cyberMavenDeploy() {
    const CyberMavenFactory = await hre.ethers.getContractFactory("CyberMaven")
    const cybermaven = await CyberMavenFactory.deploy()
    await cybermaven.deployed()
    console.log(`CyberMaven Deployed  to : ${cybermaven.address}`)
    let Addr = cybermaven.address
    ///VERIFY
    if (hre.network.name != "hardhat") {
        await cybermaven.deployTransaction.wait(6)
        await verify(cybermaven.address, [])
    }
    return Addr
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
    const Addr = accountregistry.address
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await accountregistry.deployTransaction.wait(6)
        await verify(Addr, [constructorParam.param1])
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
    // ETERNALSOUL CONTRACT
    if (jsonContent.contractName == "EternalSoul") {
        contractAddress = await eternalSoulDeploy()
    }

    // FLOWSUBSCRIPTION
    if (jsonContent.contractName == "FlowSubscription") {
        contractAddress = await flowSubscriptionDeploy()
    }
    // FLOWOFFERSTATION
    if (jsonContent.contractName == "FlowOfferStation") {
        contractAddress = await flowOfferStationDeploy()
    }
    // CYBERMAVEN
    if (jsonContent.contractName == "CyberMaven") {
        contractAddress = await cyberMavenDeploy()
    }
    // ACCOUNT REGISTRY
    if (jsonContent.contractName == "CyberMavenRegistry") {
        contractAddress = await cybermavenRegistryDeploy()
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
