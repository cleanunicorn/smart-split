console.log('Testing starting....');

var Splitter = artifacts.require("./Splitter.sol");
var BigNumber = require('bignumber.js');

contract('Splitter', function (accounts) {
    const owner = accounts[0];
    const partner_one = accounts[1];
    const partner_two = accounts[2];
    const payer = accounts[9];

    it('should not error', function (done) {
        assert.isTrue(true);
        done();
    });

    it('should save partner with correct weight', function () {
        var splitter;

        Splitter.new({ from: owner }).then(function (instance) {
            splitter = instance;
            return splitter.partnerAdd(partner_one, 100, { from: owner })
        }).then(function (result) {
            assert.equal(1, result.receipt.status, 'Transaction adding partner not successful');
            return splitter.partnerExists(partner_one);
        }).then(function (result) {
            assert.isTrue(result, 'existsPartner() should return true added partner');
        }).then(function () {
            return splitter.partnerWeight(partner_one);
        }).then(function (result) {
            assert.isTrue(result.equals(100), 'Weight should match the saved weight for a partner');
        })
    });

    it('should split funds to registered partners', function () {
        var splitter;

        var sendValue = new BigNumber(web3.toWei(100, "wei"))

        var partner_one_starting_balance = web3.eth.getBalance(partner_one);
        var partner_two_starting_balance = web3.eth.getBalance(partner_two);

        Splitter.new({ from: owner }).then(function (instance) {
            splitter = instance;
            splitter.partnerAdd(partner_one, 1, { from: owner });
        }).then(function () {
            splitter.partnerAdd(partner_two, 1, { from: owner });
        }).then(function () {
            return splitter.partnerExists.call(partner_one);
        }).then(function (result) {
            assert.isTrue(result, "Owner should be able to add partner");
            return splitter.partnerExists.call(partner_two);
        }).then(function (result) {
            assert.isTrue(result);
        }).then(function () {
            return splitter.split({ from: payer, value: sendValue });
        }).then(function (result) {
            assert.isTrue(result.receipt.gasUsed < 90000, "Split() should use less than 90000 gas")

            assert.equal(
                web3.eth.getBalance(partner_one).toNumber(),
                partner_one_starting_balance.add(sendValue.div(2)).toNumber(),
                "Partner one should receive 50 wei"
            )

            assert.equal(
                web3.eth.getBalance(partner_two).toNumber(),
                partner_two_starting_balance.add(sendValue.div(2)).toNumber(),
                "Partner two should receive 50 wei"
            )
        });
    });

    it('should allow only owner or partners to make changes', function () {
        var splitter;

        Splitter.new({ from: owner }).then(function (instance) {
            splitter = instance;
            return splitter.partnerAdd(partner_two, 1, { from: partner_one })
        }).then(function (result) {
            assert.equal(0, result.receipt.status, "Adding a partner by a non partner / non owner should fail");
            return splitter.partnerExists(partner_two);
        }).then(function (result) {
            assert.isTrue(!result, "Should not have been able to add a partner");
        });
    });

    it('should allow partners to add more partners', function () {
        var splitter;

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
    });
});
