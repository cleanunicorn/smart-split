console.log('Testing starting....');

var Splitter = artifacts.require("./Splitter.sol");
var BigNumber = require('bignumber.js');

contract('Splitter', function(accounts){
    const partner1 = web3.eth.accounts[0];
    const partner2 = web3.eth.accounts[1];

    it('Should not error', function(done) {
        assert.isTrue(true);
        done();
    });

    it('Should save partner with correct weight', function() {
        var instance;
        return Splitter.deployed().then(function(inst) {
            instance = inst;
            return instance.partnerAdd(partner1, 100)
        }).then(function(result) {
            assert.equal(1, result.receipt.status, 'Transaction adding partner not successful');
            return instance.partnersExists(partner1);
        }).then(function(result) {
            assert.isTrue(result, 'existsPartner() should return true added partner');
        }).then(function() {
            return instance.partnerWeight(partner1);
        }).then(function(result) {
            assert.isTrue(result.equals(100), 'Weight should match the saved weight for a partner');
        })
    });

    // TODO: test edge cases for adding / removing partners
});

contract('Splitter', function (accounts) {
    it('Should split funds to registered partners', function () {
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
            return splitter.partnersExists.call(partner_one);
        }).then(function (result) {
            assert.isTrue(result);
            return splitter.partnersExists.call(partner_one);            
        }).then(function (result) {
            assert.isTrue(result);
        })
        .then(function () {
            return splitter.split({value: sendValue});
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