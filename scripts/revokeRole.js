const { ethers, contract } = require("hardhat")
const fs = require("fs")
const { json } = require("node:stream/consumers")

async function main() {
    const accounts = await ethers.getSigners()

    const scripts = `scripts/revokeRole.json`
    const data = fs.readFileSync(scripts, "utf8")
    const jsonContent = JSON.parse(data)

    const contractAddress = jsonContent.contractAddr
    const walletAddress = jsonContent.walletAddr

    /// fetching the abi
    const contractArtifact = await artifacts.readArtifact("AccessMaster")

    /// TO revoke Admin Role
    const FLOW_ADMIN_ROLE =
        "0x8f882e9b3b0c043c8507802fbb9a0ed808c8f0587361ab18424493e6841512a8"

    const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi,
        accounts[0]
    )

    const transactionResponse = await contract.revokeRole(
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

    // To revoke Operator Role
    const FLOW_CREATOR_ROLE =
        "0xb75d0c3e4b0e01fa592ef743acc55a0b7765ffd271595abd71aa99cbf3518c07"

    const transactionResponse1 = await contract.revokeRole(
        FLOW_CREATOR_ROLE,
        walletAddress
    )
    
    const transactionReceipt1 = await transactionResponse1.wait()

    if (transactionReceipt1.status === 1) {
        console.log("Transaction successful")
        console.log(`The operator role is also revoked for ${contractAddress}`)
    } else {
        console.log("Transaction failed")
    }
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
