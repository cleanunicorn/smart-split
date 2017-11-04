pragma solidity ^0.4.15;

contract ProofOfExistence1 {
  // state
  bytes32 public proof;

  function notarize(string document) {
    proof = proofFor(document);
  }

  function proofFor(string document) constant returns (bytes32) {
    return sha256(document);
  }
}
