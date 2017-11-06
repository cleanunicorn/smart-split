console.log('Testing starting....');

var Splitter = artifacts.require("./Splitter.sol");
var BigNumber = require('bignumber.js');

contract('Splitter', function (accounts) {
    const owner = accounts[0];
    const partner1 = accounts[1];
    const partner2 = accounts[2];

    it('should not error', function (done) {
        assert.isTrue(true);
        done();
    });

    it('should save partner with correct weight', function () {
        var instance;
        return Splitter.deployed().then(function (inst) {
            instance = inst;
            return instance.partnerAdd(partner1, 100, { from: owner })
        }).then(function (result) {
            assert.equal(1, result.receipt.status, 'Transaction adding partner not successful');
            return instance.partnerExists(partner1);
        }).then(function (result) {
            assert.isTrue(result, 'existsPartner() should return true added partner');
        }).then(function () {
            return instance.partnerWeight(partner1);
        }).then(function (result) {
            assert.isTrue(result.equals(100), 'Weight should match the saved weight for a partner');
        })
    });

    // TODO: test edge cases for adding / removing partners
});

contract('Splitter', function (accounts) {
    it('should split funds to registered partners', function () {
        var splitter;

        var partner_one = "0x905efee6442b06dc78af204f7df0afbfa52cede6";
        var partner_two = "0xd71e7b8ffe88568d88b67f28089483c62e23f798";
        var payer = accounts[0];

        var sendValue = new BigNumber(web3.toWei(100, "wei"))

        var partner_one_starting_balance = web3.eth.getBalance(partner_one);
        var partner_one_ending_balance;
        var partner_two_starting_balance = web3.eth.getBalance(partner_two);
        var partner_two_ending_balance;

        return Splitter.deployed().then(function (inst) {
            splitter = inst;
            splitter.partnerAdd(partner_one, 1);
        }).then(function () {
            splitter.partnerAdd(partner_two, 1);
        }).then(function () {
            return splitter.partnerExists.call(partner_one);
        }).then(function (result) {
            assert.isTrue(result);
            return splitter.partnerExists.call(partner_one);
        }).then(function (result) {
            assert.isTrue(result);
        }).then(function () {
            return splitter.split({ value: sendValue });
        }).then(function (result) {
            assert.equal(
                web3.eth.getBalance(partner_one).toNumber(),
                partner_one_starting_balance.add(sendValue.div(2)).toNumber(),
                "Partner one should increase its balance by 50 wei"
            )

            assert.equal(
                web3.eth.getBalance(partner_two).toNumber(),
                partner_two_starting_balance.add(sendValue.div(2)).toNumber(),
                "Partner two should increase its balance by 50 wei"
            )
        });
    })
});

contract('Splitter', function (accounts) {
    it('should allow only owner or partners to make changes', function () {
        var splitter;

        owner = accounts[0];
        partner_one = accounts[1];
        partner_two = accounts[2];

        Splitter.new({ from: owner }).then(function (instance) {
            splitter = instance;
            return splitter.partnerAdd(partner_two, 1, { from: partner_one })
        }).then(function (result) {
            assert.equal(0, result.receipt.status, "Adding a partner by a non partner / non owner should fail");
            return splitter.partnerExists(partner_two);
        }).then(function( result) {
            assert.isTrue(!result, "Should not have been able to add a partner");
        });
    });

    it('should allow partners to add more partners', function () {
        var splitter;

        var owner = accounts[0];
        var partner_one = accounts[1];
        var partner_two = accounts[2];

        Splitter.new({ from: owner }).then(function (instance) {
            splitter = instance;
            return splitter.partnerAdd(partner_one, 1, { from: owner });
        }).then(function (result) {
            assert.equal(1, result.receipt.status, "Owner should be able allowed to add partners");
            return splitter.partnerAdd(partner_two, 1, { from: owner });
        }).then(function (result) {
            assert.equal(1, result.receipt.status, "Partner should be able allowed to add more partners");
            return splitter.partnerExists(partner_two);
        }).then(function (result) {
            assert.isTrue(result, "Partner one should be able to add more partners");
        })
    })
})