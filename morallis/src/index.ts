import moralis from "moralis"

async function main() {
    moralis.start({
        appId: process.env.APP_ID,
        serverUrl: process.env.SERVER_URL
    })
    let res = await moralis.Cloud.run("NFTS")
    console.log(res);

}

main()