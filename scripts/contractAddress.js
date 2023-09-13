const { ethers } = require("hardhat")
const fs = require("fs")

async function main() {
    const scripts = `scripts/txhash.json`
    const data = fs.readFileSync(scripts, "utf8")
    const jsonContent = JSON.parse(data)
    txHash = jsonContent.txhash
    const provider = ethers.provider
    const tx = await provider.getTransaction(txHash)
    console.log(tx.to)
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
