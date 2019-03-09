import EVMThrow from './helpers/EVMThrow';
import revert from './helpers/revert';

import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BracketCore = artifacts.require("BracketCore");
const BracketMarketplace = artifacts.require("BracketMarketplace");

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

  describe('Bracket creation', () => {
    let BracketCoreInstance;
    let BracketMarketplaceInstance;

    before(async () => {
      BracketCoreInstance = await BracketCore.new();
      BracketMarketplaceInstance = await BracketMarketplace.new(BracketCoreInstance.address);
      await BracketCoreInstance.addMinter(BracketMarketplaceInstance.address);
    });

    it('Should be able to buy a new bracket with correct tx value', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketMarketplaceInstance.buyNewBracket(predictionsArray, {from:accounts[2], value:10000000000000000});
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[2]);
    });

  });

});
