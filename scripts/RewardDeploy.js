// imports
const { ethers, run, network } = require("hardhat")
// async main
async function main() {
    const accounts = await ethers.getSigners()
    const deplpoyer = accounts[0].address
    const RewardTokenNftFactory = await ethers.getContractFactory("RewardToken")
    console.log("Deploying contract...")
    const RewardToken = await RewardTokenNftFactory.deploy(
        "ipfs://bafkreib7oqdtji6xhcsf3usbzt4mzefds7bs3ye2t3aedg2ssy6nyn36gq",
        "RewardToken",
        "RTS",
        "0xaf5793324C9de8e164E822652278AB8FC174C78e",
        "0xcA1DE631D9Cb2e64C863BF50b83D18249dFb7054"
    )
    await RewardToken.deployed()
    console.log(`Deployed contract to: ${RewardToken.address}`)

    if (hre.network.name != "hardhat") {
        console.log("Waiting for block confirmations...")
        await RewardToken.deployTransaction.wait(6)
        await verify(RewardToken.address, [
            "ipfs://bafkreib7oqdtji6xhcsf3usbzt4mzefds7bs3ye2t3aedg2ssy6nyn36gq",
            "RewardToken",
            "RTS",
            "0xaf5793324C9de8e164E822652278AB8FC174C78e",
            "0xcA1DE631D9Cb2e64C863BF50b83D18249dFb7054",
        ])
    }
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
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
