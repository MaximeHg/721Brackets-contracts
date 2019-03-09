pragma solidity ^0.5.0;

import './BracketCore.sol';

contract BracketMarketplace {
  BracketCore public bracketContract;

  struct saleStatus {
    bool onSale;
    uint price;
  }

  mapping (uint=>saleStatus) onSale;

  uint bracketPrice = 10 finney;

  event BracketCreated(uint tokenId, uint8[63] predictions);
  event BracketOnSale(uint tokenId, uint price);
  event BracketSold(uint tokenId, address from, address to);

  constructor(address _bracketContract) public {
    bracketContract = BracketCore(_bracketContract);
  }

  function buyNewBracket(uint8[63] memory predictions) public payable {
    require(msg.value >= bracketPrice, "price paid not enough");

    uint tokenId = bracketContract.mintBracket(msg.sender, predictions);

    emit BracketCreated(tokenId, predictions);
  }

  function sellBracket(uint tokenId, uint price) public {
    require(bracketContract.ownerOf(tokenId) == msg.sender);

    onSale[tokenId].onSale = true;
    onSale[tokenId].price = price;
    bracketContract.approve(address(this), tokenId);

    emit BracketOnSale(tokenId, price);
  }

  function removeSellListing(uint tokenId) public {
    require(bracketContract.ownerOf(tokenId) == msg.sender);
    onSale[tokenId].onSale = false;
    bracketContract.approve(msg.sender, tokenId);
  }

  function buyBracketOnSale(uint tokenId) public payable {
    require(onSale[tokenId].onSale);
    require(msg.value >= onSale[tokenId].price);

    address payable owner = address(uint160(bracketContract.ownerOf(tokenId)));

    executeTransfer(tokenId, owner, msg.sender);

    owner.transfer(onSale[tokenId].price);

    emit BracketSold(tokenId, owner, msg.sender);
  }

  function executeTransfer(uint tokenId, address from, address to) private {
    bracketContract.transferFrom(from, to, tokenId);
  }
}