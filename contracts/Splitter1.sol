pragma solidity ^0.4.15;

contract Splitter1 {
    // state
    address[] private partners;
    uint256[] partnersWeight;

    event SplitValue(address receiver, uint256 weight, uint256 amount);
    event Sum(uint256 sum);

    function addPartner(address partner, uint256 weight) public {
        require(existsPartner(partner) == false);

        partners.push(partner);
        partnersWeight.push(weight);
    }

    function existsPartner(address partner) constant public returns (bool) {
        for (uint256 i = 0; i < partners.length; i++) {
            if (partner == partners[i]) {
                return true;
            }
        }

        return false;
    }

    function split() payable public {
        uint256 sum;
        for (uint256 i = 0; i < partners.length; i++) {
            sum = sum + partnersWeight[i];
        }

        Sum(sum);

        for (i = 0; i < partners.length; i++) {
            var dst = partners[i];
            var value = partnersWeight[i] / sum * msg.value;
            dst.transfer(value);

            SplitValue(dst, partnersWeight[i], value);
        }
    }
}
