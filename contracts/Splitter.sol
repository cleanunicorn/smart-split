pragma solidity ^0.4.15;

contract Splitter {
    // state
    address owner;
    address[] private partners;
    uint256[] partnersWeight;

    // Splitter constructs the contract and saves the owner of the contract
    function Splitter() public {
        owner = msg.sender;
    }

    // partnerAdd adds a new partner to the list
    // It saves the partner address and the weight of the partner
    function partnerAdd(address partner, uint256 weight) public onlyOwnerOrPartner  {
        require(partnerExists(partner) == false);

        partners.push(partner);
        partnersWeight.push(weight);
    }

    // partnerExists returns true if a partner exists in the list, false otherwise
    function partnerExists(address partner) public constant returns (bool) {
        for (uint256 i = 0; i < partners.length; i++) {
            if (partner == partners[i]) {
                return true;
            }
        }

        return false;
    }

    // partnerWeight returns the weight of the partner if it is found in the list
    function partnerWeight(address partner) public constant returns (uint256) {
        for (uint256 i = 0; i < partners.length; i++) {
            if (partner == partners[i]) {
                return uint256(partnersWeight[i]);
            }
        }

        return uint256(0);
    }

    // partnersRemove removes all partners
    function partnersRemove() public onlyOwnerOrPartner {
        partners.length = 0;
        partnersWeight.length = 0;
    }

    // fallback function is called when receiving funds
    // and it splits the funds to the partners according to the allocated weights
    //
    // Weight is used like this
    // == Example 1:
    // Different partners
    // partner A has weight 10
    // partner B has weight 20
    //
    // Contract receives 3 ETH
    // partner A receives 10 / ( 10 + 20 ) * 3 ETH = 1 ETH
    // partner B receives 20 / ( 10 + 20 ) * 3 ETH = 2 ETH
    //
    // == Example 2:
    // Equal partners
    // partner A has weight 500
    // partner B has weight 500
    //
    // Contract receives 10 ETH
    // partner A receives 500 / ( 500 + 500 ) * 10 ETH = 5 ETH
    // partner B receives 500 / ( 500 + 500 ) * 10 ETH = 5 ETH
    function () public payable {
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

    // onlyOwnerOrPartner modifier checks if the originator of the transaction is the owner or one of the partners
    modifier onlyOwnerOrPartner() {
        bool allowed = false;

        if (msg.sender == owner) {
            allowed = true;
        } else { //save some cycles?
            for (uint256 i = 0; i < partners.length; i++) {
                if (msg.sender == partners[i]) {
                    allowed = true;
                    break; //save some cycles?
                }
            }
        }


        require(allowed);
        _;
    }

    event SplitValue(address receiver, uint256 weight, uint256 amount);
    event Sum(uint256 sum);
    event SplitValueReceived(uint256 amount);
}
