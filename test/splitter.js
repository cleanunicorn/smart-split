console.log('Testing starting....');

var Splitter = artifacts.require("./Splitter.sol");
var BigNumber = require('bignumber.js');

const partner1 = web3.eth.accounts[0];
const partner2 = web3.eth.accounts[1];
const partner3 = web3.eth.accounts[2];

contract('Splitter', function(accounts){
    it('Should not error', function(done) {
        assert.isTrue(true);
        done();
    });

    it('Should save partner with correct weight', function() {
        var inst;
        return Splitter.deployed().then(function(instance) {
            inst = instance;
            return inst.partnerAdd(partner1, 100)
        }).then(function(result) {
            assert.equal(1, result.receipt.status, 'Transaction adding partner not successful');
            return inst.partnersExists(partner1);
        }).then(function(result) {
            assert.isTrue(result, 'existsPartner() should return true added partner');
        }).then(function() {
            return inst.partnerWeight(partner1);
        }).then(function(result) {
            assert.isTrue(result.equals(100), 'Weight should match the saved weight for a partner');
        })
    });
});