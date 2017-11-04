pragma solidity ^0.4.15;

contract ProofOfExistence3 {
    // state
    mapping (bytes32 => bool) private proofs;

    function storeProof(bytes32 proof) {
        proofs[proof] = true;
    }

    function notarize(string document) {
        bytes32 proof = proofFor(document);
        storeProof(proof);
    }

    function proofFor(string document) constant returns (bytes32) {
        return sha256(document);
    }

    function checkDocument(string document) constant returns (bool) {
        bytes32 proof = proofFor(document);
        return hasProof(proof);
    }

    function hasProof(bytes32 proof) constant returns (bool) {
        return proofs[proof];
    }
}
