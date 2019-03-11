pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './BracketCore.sol';

contract BracketMarketplace is Ownable {
  BracketCore public bracketContract;

  struct saleStatus {
    bool onSale;
    uint price;
  }

  mapping (uint=>saleStatus) onSale;

  //uint bracketPrice = 10 finney;

  event BracketCreated(uint tokenId, uint8[63] predictions);
  event BracketOnSale(uint tokenId, uint price);
  event BracketSold(uint tokenId, address from, address to);
  event ListingCleared(uint tokenId);

  constructor(address _bracketContract) public {
    bracketContract = BracketCore(_bracketContract);
  }

  /*function buyNewBracket(uint8[63] memory predictions) public payable {
    require(msg.value >= bracketPrice, "price paid not enough");

    uint tokenId = bracketContract.mintBracket(msg.sender, predictions);

    emit BracketCreated(tokenId, predictions);
  }*/

  function sellBracket(uint tokenId, uint price) public {
    require(bracketContract.ownerOf(tokenId) == msg.sender, "sender is not the owner");
    require(bracketContract.getApproved(tokenId) == address(this), "contract has not been approved for selling");

    onSale[tokenId].onSale = true;
    onSale[tokenId].price = price;

    emit BracketOnSale(tokenId, price);
  }

  function removeSellListing(uint tokenId) public {
    require(bracketContract.ownerOf(tokenId) == msg.sender);
    onSale[tokenId].onSale = false;
    if(bracketContract.getApproved(tokenId) == address(this)) {
      bracketContract.approve(address(0), tokenId);
    }
  }

  // in case the approval was revoked for some reason
  function clearListing(uint tokenId) public {
    require(onSale[tokenId].onSale);
    if(bracketContract.getApproved(tokenId) != address(this)) {
      onSale[tokenId].onSale = false;
      emit ListingCleared(tokenId);
    }
  }

  function buyBracketOnSale(uint tokenId) public payable {
    require(onSale[tokenId].onSale);
    require(msg.value >= onSale[tokenId].price);

    address payable owner = address(uint160(bracketContract.ownerOf(tokenId)));

    if(bracketContract.getApproved(tokenId) == address(this)) {
      executeTransfer(tokenId, owner, msg.sender);

      emit BracketSold(tokenId, owner, msg.sender);
    } else {
      msg.sender.transfer(msg.value);
      emit ListingCleared(tokenId);
    }

    onSale[tokenId].onSale = false;
  }

  function executeTransfer(uint tokenId, address payable from, address to) private {
    bracketContract.transferFrom(from, to, tokenId);
    from.transfer(onSale[tokenId].price);
  }

  function isOnSale(uint tokenId) public view returns (bool, uint) {
    return (onSale[tokenId].onSale, onSale[tokenId].price);
  }

  function withdrawFunds() public onlyOwner {
    _withdraw(msg.sender);
  }

  function _withdraw(address payable _to) private {
    _to.transfer(address(this).balance);
  }
}