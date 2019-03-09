pragma solidity ^0.5.0;

import './BracketCore.sol';

contract BracketMarketplace {
  BracketCore bracketContract;

  struct saleStatus {
    bool onSale;
    uint price;
  }

  uint bracketPrice = 10 finney;

  constructor(address _bracketContract) public {
    bracketContract = BracketCore(_bracketContract);
  }

  function buyNewBracket(uint8[63] memory predictions) public payable {
    require(msg.value >= bracketPrice);
    bracketContract.mint(msg.sender, predictions);
  }

  function sellBracket(uint tokenId, uint price) public {
    require(bracketContract.ownerOf(tokenId) == msg.sender);
  }

}