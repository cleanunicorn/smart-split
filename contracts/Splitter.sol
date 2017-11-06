pragma solidity ^0.4.15;

contract Splitter {
    // state
    address owner;
    address[] private partners;
    uint256[] partnersWeight;

    // Constructor
    function Splitter() {
        owner = msg.sender;
    }

    modifier onlyOwnerOrPartner() {
        bool allowed = false;

        if (msg.sender == owner) {
            allowed = true;
        }

        for (uint256 i = 0; i < partners.length; i++) {
            if (msg.sender == partners[i]) {
                allowed = true;
            }
        }

        require(allowed);
        _;
    }

    event SplitValue(address receiver, uint256 weight, uint256 amount);
    event Sum(uint256 sum);
    event SplitValueReceived(uint256 amount);

    function partnerAdd(address partner, uint256 weight) onlyOwnerOrPartner public {
        require(partnerExists(partner) == false);

        partners.push(partner);
        partnersWeight.push(weight);
    }

    function partnerExists(address partner) constant public returns (bool) {
        for (uint256 i = 0; i < partners.length; i++) {
            if (partner == partners[i]) {
                return true;
            }
        }

        return false;
    }

    function partnerWeight(address partner) constant public returns (uint256) {
        for (uint256 i = 0; i < partners.length; i++) {
            if (partner == partners[i]) {
                return uint256(partnersWeight[i]);
            }
        }

        return uint256(0);
    }

    function split() payable public {
        uint256 sum;
        for (uint256 i = 0; i < partners.length; i++) {
            sum = sum + partnersWeight[i];
        }

        Sum(sum);

        for (i = 0; i < partners.length; i++) {
            address dst = partners[i];
            uint256 value = msg.value * partnersWeight[i] / sum;
            dst.transfer(value);

            SplitValue(dst, partnersWeight[i], value);
        }
    }
}
