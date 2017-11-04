pragma solidity ^0.4.15;

contract ProofOfExistence2 {
    // state
    bytes32[] public proofs;

    function storeProof(bytes32 proof) {
        proofs.push(proof);
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
        for (uint256 i = 0; i < proofs.length; i++) {
            if (proofs[i] == proof) {
                return true;
            }
        }
        return false;
    }
}
