console.log('Testing starting....');

var Splitter = artifacts.require("./Splitter.sol");
var BigNumber = require('bignumber.js');

contract('Splitter', function (accounts) {
    const owner = accounts[0];
    const partner_one = accounts[1];
    const partner_two = accounts[2];
    const somebody = accounts[8];
    const payer = accounts[9];

    it('should not error', async function () {
        assert.isTrue(true);
    });

    it('should save partner with correct weight', async function () {

        const instance = await Splitter.new({ from: owner });
        const result = await instance.partnerAdd(partner_one, 100, { from: owner });
        assert.equal(1, result.receipt.status, 'Transaction adding partner not successful');

        const existsRes = await instance.partnerExists(partner_one);
        assert.isTrue(existsRes, 'existsPartner() should return true added partner');

        const weightRes = await instance.partnerWeight(partner_one);
        assert.isTrue(weightRes.equals(100), 'Weight should match the saved weight for a partner');
    });

    it('should split funds to registered partners', async function () {
        const sendValue = new BigNumber(web3.toWei(100, "wei"))
        
        const partner_one_starting_balance = web3.eth.getBalance(partner_one);
        const partner_two_starting_balance = web3.eth.getBalance(partner_two);
        
        const splitter = await Splitter.new({ from: owner });
        
        const partner_one_add_result = await splitter.partnerAdd(partner_one, 1, { from: owner });
        const partner_two_add_result = await splitter.partnerAdd(partner_two, 1, { from: owner });

        assert.isTrue(
            await splitter.partnerExists.call(partner_one),
            "Owner should be able to add partner one"
        );

        assert.isTrue(
            await splitter.partnerExists.call(partner_two),
            "Owner should be able to add partner one"
        );

        const tx = await splitter.send(sendValue, {from: payer});

        assert.isTrue(
            tx.receipt.gasUsed < 90000,
            "Split() should use less than 90000 gas"
        );

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

    it('should allow only owner or partners to make changes', async function () {
        const splitter = await Splitter.new({ from: owner })

        try {
            const partner_add_result = await splitter.partnerAdd(partner_one, 1, { from: somebody })
            assert.fail("Trying to add a partner by somebody unauthorized should fail");
        } catch (e) {
            const partner_one_exists = await splitter.partnerExists(partner_one);
            assert.isTrue(!partner_one_exists, "Should not have been able to add a partner");
        }
    });

    it('should allow partners to add more partners', async function () {
        const splitter = await Splitter.new({ from: owner });

        const partner_one_added = await splitter.partnerAdd(partner_one, 1, { from: owner });
        assert.equal(1, partner_one_added.receipt.status, "Owner should be able allowed to add partners");
            
        const partner_two_added = await splitter.partnerAdd(partner_two, 1, { from: partner_one });
        assert.equal(1, partner_two_added.receipt.status, "Owner should be able allowed to add partners");

        const partner_two_exists = await splitter.partnerExists(partner_two);
        assert.isTrue(partner_two_exists, "Partner one should be able to add more partners");
    });
});
