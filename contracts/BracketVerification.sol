pragma solidity ^0.5.0;

import './BracketCore.sol';

contract BracketVerification {

  BracketCore bracketContract;

  struct BracketScoring {
    uint score;
    bool[5] verifications;
  }

  mapping(uint=>BracketScoring) bracketScorings;

  // Saturday 23 March 2019 11:00:00 GMT
  uint round1End = 1553338800;
  // Monday 25 March 2019 11:00:00 GMT
  uint round2End = 1553511600;
  // Saturday 30 March 2019 11:00:00 GMT
  uint round3End = 1553943600;
  // Monday 1 April 2019 10:00:00 GMT
  uint round4End = 1554112800;
  // Tuesday 9 April 2019 07:00:00 GMT
  uint tournamentEnd = 1554793200;

  uint8[63] tournamentResults;

  constructor(address _bracketContract) public {
    bracketContract = BracketCore(_bracketContract);
  }

  function scoreRound1(uint256 tokenId) public {
    require(now >= round1End);
    require(!bracketScorings[tokenId].verifications[0]);

    uint8[63] memory results = bracketContract.getPredictions(tokenId);
    for(uint i=0;i<32;i++) {
      if (results[i]==tournamentResults[i]) {
          bracketScorings[tokenId].score++;
      }
    }
    bracketScorings[tokenId].verifications[0] = true;
  }

  function scoreRound2(uint256 tokenId) public {
    require(now >= round2End);
    require(!bracketScorings[tokenId].verifications[1]);

    uint8[63] memory results = bracketContract.getPredictions(tokenId);
    for(uint i=32;i<48;i++) {
      if (results[i]==tournamentResults[i]) {
          bracketScorings[tokenId].score = bracketScorings[tokenId].score+2;
      }
    }
    bracketScorings[tokenId].verifications[1] = true;
  }

  function scoreRound3(uint256 tokenId) public {
    require(now >= round3End);
    require(!bracketScorings[tokenId].verifications[2]);

    uint8[63] memory results = bracketContract.getPredictions(tokenId);
    for(uint i=48;i<56;i++) {
      if (results[i]==tournamentResults[i]) {
          bracketScorings[tokenId].score = bracketScorings[tokenId].score+4;
      }
    }
    bracketScorings[tokenId].verifications[2] = true;
  }

  function scoreRound4(uint256 tokenId) public {
    require(now >= round4End);
    require(!bracketScorings[tokenId].verifications[3]);

    uint8[63] memory results = bracketContract.getPredictions(tokenId);
    for(uint i=56;i<60;i++) {
      if (results[i]==tournamentResults[i]) {
          bracketScorings[tokenId].score = bracketScorings[tokenId].score+8;
      }
    }
    bracketScorings[tokenId].verifications[3] = true;
  }

  function scoreFinalFour(uint256 tokenId) public {
    require(now >= tournamentEnd);
    require(!bracketScorings[tokenId].verifications[4]);

    uint8[63] memory results = bracketContract.getPredictions(tokenId);
    for(uint i=60;i<62;i++) {
      if (results[i]==tournamentResults[i]) {
          bracketScorings[tokenId].score = bracketScorings[tokenId].score+16;
      }
    }
    if(results[62]==tournamentResults[62]) {
      bracketScorings[tokenId].score = bracketScorings[tokenId].score+32;
    }
    bracketScorings[tokenId].verifications[4] = true;
  }

  function getCurrentScore(uint tokenId) public view returns (uint) {
    return bracketScorings[tokenId].score;
  }

  function getRound1Score(uint tokenId) public view returns (uint) {
    uint score = 0;
    uint8[63] memory results = bracketContract.getPredictions(tokenId);

    for(uint i=0; i<32;i++) {
      if (results[i]==tournamentResults[i]) {
          score++;
      }
    }
    return score;
  }

  function getRound2Score(uint tokenId) public view returns (uint) {
    uint score = 0;
    uint8[63] memory results = bracketContract.getPredictions(tokenId);

    for(uint i=32; i<48;i++) {
      if (results[i]==tournamentResults[i]) {
          score = score+2;
      }
    }
    return score;
  }

  function getRound3Score(uint tokenId) public view returns (uint) {
    uint score = 0;
    uint8[63] memory results = bracketContract.getPredictions(tokenId);

    for(uint i=48; i<56;i++) {
      if (results[i]==tournamentResults[i]) {
          score = score+4;
      }
    }
    return score;
  }

  function getRound4Score(uint tokenId) public view returns (uint) {
    uint score = 0;
    uint8[63] memory results = bracketContract.getPredictions(tokenId);

    for(uint i=56; i<60;i++) {
      if (results[i]==tournamentResults[i]) {
          score = score+8;
      }
    }
    return score;
  }

  function getFinalFourScore(uint tokenId) public view returns (uint) {
    uint score = 0;
    uint8[63] memory results = bracketContract.getPredictions(tokenId);

    for(uint i=60; i<62;i++) {
      if (results[i]==tournamentResults[i]) {
          score = score+16;
      }
    }

    if (results[62]==tournamentResults[62]) {
        score = score+32;
    }
    return score;
  }
}