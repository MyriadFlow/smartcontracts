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
    const role = jsonContent.role

    /// fetching the abi
    const contractArtifact = await artifacts.readArtifact("AccessMaster")
    if(role == 'OPERATOR')
    {
        /// TO grant Operator Role
        const FLOW_OPERATOR_ROLE =
            "0x9e62e2fe49176359be731211a93beb8a4b41d6d0345b62f64c4f4e7b56ba5032"

        const contract = new ethers.Contract(
            contractAddress,
            contractArtifact.abi,
            accounts[0]
        )

        const transactionResponse = await contract.grantRole(
            FLOW_OPERATOR_ROLE,
            walletAddress
        )

        const transactionReceipt = await transactionResponse.wait()

        if (transactionReceipt.status === 1) {
            console.log("Transaction successful")
        } else {
            console.log("Transaction failed")
        }

        const isAdmin = await contract.isAdmin(walletAddress)
        console.log(`Is the Wallet Address ${walletAddress} is Operator :  ${isAdmin}`)
    }
    if(role == 'CREATOR'){
        // To grant Creator Role
        const FLOW_CREATOR_ROLE =
            "0xb75d0c3e4b0e01fa592ef743acc55a0b7765ffd271595abd71aa99cbf3518c07"

        const transactionResponse1 = await contract.grantRole(
            FLOW_CREATOR_ROLE,
            walletAddress
        )

        const transactionReceipt1 = await transactionResponse1.wait()

        if (transactionReceipt1.status === 1) {
            console.log("Transaction successful")
            console.log(`The creator role is also granted for ${contractAddress}`)
        } else {
            console.log("Transaction failed")
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
