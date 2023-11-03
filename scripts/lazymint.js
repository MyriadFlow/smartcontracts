const { ethers , network} = require("hardhat")
const fs = require("fs")

const scripts = `scripts/launch/launch.json`
const data = fs.readFileSync(scripts, "utf8")
const jsonContent = JSON.parse(data)
const accounts = await ethers.getSigner()

const SIGNING_DOMAIN_NAME = "Voucher-Domain"
const SIGNING_DOMAIN_VERSION = "1"

let networkId
if (network.config.chainId != undefined) {
    networkId = network.config.chainId
} else {
    networkId = network.config.networkId
}
const chainId = networkId

const contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B" // Put the address here from remix
const signerAddress = accounts[0] // private key that I use for address 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
console.log(signer)

const domain = {
    name: SIGNING_DOMAIN_NAME,
    version: SIGNING_DOMAIN_VERSION,
    verifyingContract: contractAddress,
    chainId
}
async function createVoucher(price, uri) {
    const voucher = {price, uri}
    const types = {
        LazyNFTVoucher: [
            { name: "price", type: "uint256" },
            { name: "uri", type: "string" }
        ]
    }
    const signature = await signer._signTypedData(domain, types, voucher)
    return {
        ...voucher,
        signature
    }
}
async function main() {
    const voucher = await createVoucher(50,"uri","0x5B38Da6a701c568545dCfcB03FcB875f56beddC4") // the address is the address which receives the NFT
    console.log(`[${voucher.price}, "${voucher.uri}","${voucher.signature}"]`)
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })