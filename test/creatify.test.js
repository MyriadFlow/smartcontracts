// const { expect } = require("chai");
// const { assert } = require("hardhat");

// const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
// const { soliditySha3 } = require("web3-utils");

// const Creatify = artifacts.require("Creatify");
// const Marketplace = artifacts.require("Marketplace");

// let accounts;
// let creatify;
// let marketplace;
// let owner;
// let creator;
// let buyer;

// // Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
// describe("Creatify Marketplace Contract", function () {

// 	before(async function() {
// 		accounts = await web3.eth.getAccounts();
// 		owner = accounts[0];
// 		creator = accounts[1];
// 		buyer = accounts[2];
// 		marketplace = await Marketplace.new(300);
// 		creatify = await Creatify.new("Creatify", "CRFTY", "", marketplace.address);
// 	});
	
// 	it("Should return the right name and symbol of the token once Creatify is deployed", async function() {
// 		assert.equal(await creatify.name(), "Creatify");
// 		assert.equal(await creatify.symbol(), "CRFTY");
// 	});

// 	// If the callback function is async, Mocha will `await` it.
// 	it("Should get the right owner", async function () {
// 		// Expect receives a value, and wraps it in an Assertion object. These
// 		// objects have a lot of utility methods to assert values.
		
// 		// This test expects the owner variable stored in the contract to be equal
// 		// to our Signer's owner.
// 		expect(await marketplace.owner()).to.equal(owner);
// 	});
	
//   	it("Execute marketplace sales", async function () {
// 		const salePrice = ethers.utils.parseUnits("1", "ether");

// 		/* create two tokens */
// 		await creatify.delegateArtifactCreation(creator, "https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF");
// 		await creatify.delegateArtifactCreation(creator, "https://ipfs.infura.io/ipfs/QmbXvKra8Re7sxCMAEpquWJEq5qmSqis5VPCvo9uTA7AcF");

// 		console.log(await creatify.tokenURI(1));

// 		/* put both tokens for sale */
// 		await marketplace.createMarketItem(creatify.address, 1, salePrice);
// 		await marketplace.createMarketItem(creatify.address, 2, salePrice);

// 		/* execute sale of token to another user */
// 		await marketplace.createMarketSale(creatify.address, 1, { value: salePrice });

// 		/* query for and return the unsold items */
// 		let items = await marketplace.fetchMarketItems();
// 		items = await Promise.all(
// 			items.map(async (i) => {
// 				const tokenUri = await creatify.tokenURI(i.tokenId);
// 				let item = {
// 					price: i.price.toString(),
// 					tokenId: i.tokenId.toString(),
// 					seller: i.seller,
// 					owner: i.owner,
// 					tokenUri,
// 				};
// 				return item;
// 			})
// 		);
// 		console.log("items: ", items);
//   	});
// });
