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

});
