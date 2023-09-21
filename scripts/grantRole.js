const { ethers, contract } = require("hardhat")
const fs = require("fs")
const { json } = require("node:stream/consumers")

async function main() {
    const accounts = await ethers.getSigners()

    const scripts = `scripts/grantRole.json`
    const data = fs.readFileSync(scripts, "utf8")
    const jsonContent = JSON.parse(data)

    const contractAddress = jsonContent.contractAddr
    const walletAddress = jsonContent.walletAddr

    /// fetching the abi
    const contractArtifact = await artifacts.readArtifact("AccessMaster")

    const FLOW_ADMIN_ROLE =
        "0x8f882e9b3b0c043c8507802fbb9a0ed808c8f0587361ab18424493e6841512a8"

    const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi,
        accounts[0]
    )

    const transactionResponse = await contract.grantRole(
        FLOW_ADMIN_ROLE,
        walletAddress
    )

    const transactionReceipt = await transactionResponse.wait()

    if (transactionReceipt.status === 1) {
        console.log("Transaction successful")
    } else {
        console.log("Transaction failed")
    }

    const isAdmin = await contract.isAdmin(walletAddress)
    console.log(`Is the Wallet Address ${walletAddress} is Admin :  ${isAdmin}`)
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
