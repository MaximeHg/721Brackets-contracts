pragma solidity ^0.5.0;

import './BracketCore.sol';

contract BracketMarketplace {
  BracketCore bracketContract;

  constructor(address _bracketContract) public {
    bracketContract = BracketCore(_bracketContract);
  }

  function buyNewBracket(uint8[63] memory predictions) public {
    bracketContract.mint(msg.sender, predictions);
  }

}