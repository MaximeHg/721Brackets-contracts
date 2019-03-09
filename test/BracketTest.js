import EVMThrow from './helpers/EVMThrow';
import revert from './helpers/revert';

import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BracketCore = artifacts.require("BracketCore");

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

  describe('Minting from Core', () => {
    let BracketCoreInstance;

    before(async () => {
      BracketCoreInstance = await BracketCore.new();
    });

    it('Should be able to mint a token id #0 with no predictions', async () => {
      let predictionsArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      await BracketCoreInstance.mint(accounts[0], predictionsArray);
      let owner = await BracketCoreInstance.ownerOf(0);
      assert.equal(owner, accounts[0]);
    });

  });

});
