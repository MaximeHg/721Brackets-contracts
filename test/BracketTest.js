import EVMThrow from './helpers/EVMThrow';
import revert from './helpers/revert';

import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BracketCore = artifacts.require("BracketCore");
const BracketMarketplace = artifacts.require("BracketMarketplace");

const BigNumber = require('bignumber.js');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('BracketCore', function(accounts) {

  describe('Constructor', () => {
    let BracketCoreInstance;

    before(async () => {
      BracketCoreInstance = await BracketCore.new();
    });

    it('ERC721 parameters should be correctly set', async () => {
      let name = await BracketCoreInstance.name();
      let symbol = await BracketCoreInstance.symbol();
      assert.equal(name, "March Madness Bracket");
      assert.equal(symbol, "MMBK");
    });

  });

  describe('Minting & predictions', () => {
    let BracketCoreInstance;

    before(async () => {
      BracketCoreInstance = await BracketCore.new();
    });

    it('Should be able to mint a token id #0 with no predictions', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketCoreInstance.mintBracket(accounts[0], predictionsArray);
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[0]);
    });

    it('Should be able to mint a token id #1 with no predictions', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketCoreInstance.mintBracket(accounts[0], predictionsArray);
      let owner = await BracketCoreInstance.ownerOf(1);
      assert.equal(owner, accounts[0]);
    });

    it('Should be able to change predictions before tournament starts', async () => {
      let predictionsArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketCoreInstance.changePredictions(0, predictionsArray);
      let predictions = await BracketCoreInstance.getPredictions(0);
      assert.equal(predictions[0].toNumber(), predictionsArray[0]);
    });

    it('Next token id should be #2', async () => {
      let nextTokenId = await BracketCoreInstance.getNextTokenId();
      assert.equal(nextTokenId.toNumber(), 2);
    });

  });

});

contract('BracketMarketplace', function(accounts) {

  describe('Constructor', () => {
    let BracketCoreInstance;
    let BracketMarketplaceInstance;

    before(async () => {
      BracketCoreInstance = await BracketCore.new();
      BracketMarketplaceInstance = await BracketMarketplace.new(BracketCoreInstance.address);
    });

    it('BracketCore instance should be set', async () => {
      let addressCore = await BracketMarketplaceInstance.bracketContract();
      assert.equal(addressCore, BracketCoreInstance.address);
    });

  });

  describe('Bracket buying and selling', () => {
    let BracketCoreInstance;
    let BracketMarketplaceInstance;

    before(async () => {
      BracketCoreInstance = await BracketCore.new();
      BracketMarketplaceInstance = await BracketMarketplace.new(BracketCoreInstance.address);
      await BracketCoreInstance.addMinter(BracketMarketplaceInstance.address);
    });

    it('Should be able to buy a new bracket with correct tx value', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketMarketplaceInstance.buyNewBracket(predictionsArray, {from:accounts[2], value:"10000000000000000"});
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[2]);
    });

    it('Should be able to buy a new bracket with superior tx value', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketMarketplaceInstance.buyNewBracket(predictionsArray, {from:accounts[2], value:"10000000000000001"});
      let owner = await BracketCoreInstance.ownerOf(1);
      assert.equal(owner, accounts[2]);
    });

    it('Shouldnt be able to buy a new bracket with inferior tx value', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketMarketplaceInstance.buyNewBracket(predictionsArray, {from:accounts[2], value:"9999999999999999"}).should.be.rejectedWith(revert);
    });

    it('Should be able to list a bracket for sale', async () => {
      await BracketCoreInstance.approve(BracketMarketplaceInstance.address, 0, {from:accounts[2]})
      await BracketMarketplaceInstance.sellBracket(0, "1000000000000000", {from:accounts[2]});
      let listing = await BracketMarketplaceInstance.isOnSale(0);
      assert.equal(listing[0], true);
      assert.equal(listing[1].toNumber(), 1000000000000000)
    });

    it('Shouldnt be able to list a bracket for sale that is not mine', async () => {
      // in fact what will throw is the lack of approval
      await BracketMarketplaceInstance.sellBracket(1, 10000, {from:accounts[1]}).should.be.rejectedWith(revert);
    });

    it('Should be able to buy a listed bracket', async () => {
      await BracketMarketplaceInstance.buyBracketOnSale(0, {from:accounts[1], value: "100000000000000000"})
      let listing = await BracketMarketplaceInstance.isOnSale(0);
      assert.equal(listing[0], false);
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[1]);
    });

    it('Approval should be cleared after a resell', async () => {
      let approved = await BracketCoreInstance.getApproved(0);
      assert.equal(approved, "0x0000000000000000000000000000000000000000");
    });

    it('Should be able to clean up a listing', async () => {
      await BracketCoreInstance.approve(BracketMarketplaceInstance.address, 0, {from:accounts[1]})
      await BracketMarketplaceInstance.sellBracket(0, "1000000000000000", {from:accounts[1]});
      let listing = await BracketMarketplaceInstance.isOnSale(0);
      assert.equal(listing[0], true);
      await BracketCoreInstance.approve("0x0000000000000000000000000000000000000000", 0, {from:accounts[1]})
      await BracketMarketplaceInstance.clearListing(0);
      listing = await BracketMarketplaceInstance.isOnSale(0);
      assert.equal(listing[0], false);
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[1]);
    });

    it('Should be able to clean up a listing during a resell tentative', async () => {
      await BracketCoreInstance.approve(BracketMarketplaceInstance.address, 0, {from:accounts[1]})
      await BracketMarketplaceInstance.sellBracket(0, "1000000000000000", {from:accounts[1]});
      let listing = await BracketMarketplaceInstance.isOnSale(0);
      assert.equal(listing[0], true);
      let balanceBefore = await web3.eth.getBalance(accounts[3])
      await BracketCoreInstance.approve("0x0000000000000000000000000000000000000000", 0, {from:accounts[1]})
      await BracketMarketplaceInstance.buyBracketOnSale(0, {from:accounts[3], value: "100000000000000000"})
      let balanceAfter = await web3.eth.getBalance(accounts[3])
      balanceBefore = new BigNumber(balanceBefore);
      balanceAfter = new BigNumber(balanceAfter);
      assert.isTrue(balanceBefore.minus(new BigNumber(1000000000000000)).isLessThan(balanceAfter))
      listing = await BracketMarketplaceInstance.isOnSale(0);
      assert.equal(listing[0], false);
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[1]);
    });

  });

});
