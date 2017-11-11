console.log('Testing starting....');

var Splitter = artifacts.require("./Splitter.sol");
var BigNumber = require('bignumber.js');

contract('Splitter', function (accounts) {
    const owner = accounts[0];
    const partner_one = accounts[1];
    const partner_two = accounts[2];
    const partner_three = accounts[3];
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

        const tx = await splitter.send(sendValue, { from: payer });

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
        assert.equal(1, partner_one_added.receipt.status, "Owner should be allowed to add partners");

        const partner_two_added = await splitter.partnerAdd(partner_two, 1, { from: partner_one });
        assert.equal(1, partner_two_added.receipt.status, "Owner should be allowed to add partners");

        const partner_two_exists = await splitter.partnerExists(partner_two);
        assert.isTrue(partner_two_exists, "Partner one should be able to add more partners");
    });

    it('should allow clearing all partners', async function () {
        const splitter = await Splitter.new({ from: owner });

        const partner_one_added = await splitter.partnerAdd(partner_one, 1, { from: owner });
        assert.equal(1, partner_one_added.receipt.status, "Owner should be allowed to add partners ");
        const partner_two_added = await splitter.partnerAdd(partner_two, 1, { from: owner });
        assert.equal(1, partner_two_added.receipt.status, "Owner should be allowed to add partners ");

        try {
            const partners_removed = await splitter.partnerRemove({ from: somebody });
            assert.fail("Non owner or partner should not be able to remove")
        } catch (e) {
            const partner_one_exists = await splitter.partnerExists(partner_one);
            assert.isTrue(partner_one_exists, "Partner one should still be there")

            const partner_two_exists = await splitter.partnerExists(partner_two);
            assert.isTrue(partner_two_exists, "Partner two should still be there");
        }

        const partners_removed = await splitter.partnersRemove({ from: partner_one });
        assert.equal(1, partner_one_added.receipt.status, "Partner one should be able to remove himself");
        assert.isTrue(
            ! await splitter.partnerExists.call(partner_one),
            "Partner one should not be there anymore"
        );
        assert.isTrue(
            ! await splitter.partnerExists.call(partner_two),
            "Partner two should not be there anymore"
        );
    });

    it('should allow adding partners after removing all', async function () {
        const splitter = await Splitter.new({ from: owner });
        splitter.partnersRemove({ from: owner });

        const partner_three_added_after_delete = await splitter.partnerAdd(partner_three, 1, { from: owner })
        assert.equal(
            1,
            partner_three_added_after_delete.receipt.status,
            "Should be able to add partner three after deleting all of them"
        );

        assert.isTrue(
            await splitter.partnerExists.call(partner_three),
            "Partner three should be added"
        );
    });

    it('should save how much each person should receive', async function () {
        const sendValue = new BigNumber(web3.toWei(100, "wei"));

        const partner_one_starting_balance = web3.eth.getBalance(partner_one);
        const partner_two_starting_balance = web3.eth.getBalance(partner_two);
        const partner_three_starting_balance = web3.eth.getBalance(partner_three);

        const splitter = await Splitter.new({ from: owner });
        splitter.partnerAdd(partner_one, 1, { from: owner });
        splitter.partnerAdd(partner_two, 9, { from: owner });

        await splitter.send(sendValue, { from: payer });
        assert.equal(
            10,
            await splitter.partnerWithdrawAvailable.call(partner_one),
            "Partner one should have 10 wei available to withdraw"
        );
        assert.equal(
            90,
            await splitter.partnerWithdrawAvailable.call(partner_two),
            "Partner two should have 90 wei available to withdraw"
        );
    });

    it('should allow partners to withdraw available funds', async function () {
        const sendValue = new BigNumber(web3.toWei(100, "wei"));

        var partner_one_starting_balance = web3.eth.getBalance(partner_one);
        var partner_two_starting_balance = web3.eth.getBalance(partner_two);
        var partner_three_starting_balance = web3.eth.getBalance(partner_three);

        const splitter = await Splitter.new({ from: owner });
        splitter.partnerAdd(partner_one, 1, { from: owner });
        splitter.partnerAdd(partner_two, 9, { from: owner });

        await splitter.send(sendValue, { from: payer });

        assert.equal(
            10, // = ( 1 / 1 + 9 ) * 100
            await splitter.partnerWithdrawAvailable.call(partner_one),
            "Partner one should have another 10 wei available"
        );
        assert.equal(
            90, // = ( 9 / 1 + 9 ) * 100
            await splitter.partnerWithdrawAvailable.call(partner_two),
            "Partner two should have another 90 wei available"
        );

        var tx_partner_one_withdraw = await splitter.withdraw({ from: partner_one, gasPrice: 0 });
        assert.equal(
            partner_one_starting_balance.add(10).toNumber(),
            web3.eth.getBalance(partner_one).toNumber(),
            "Partner one should withdraw 10 wei"
        );

        // Add a third partner
        await splitter.partnerAdd(partner_three, 10, { from: owner });

        // Send a new value to be split but this time we have 3 partners
        await splitter.send(sendValue, { from: payer });

        assert.equal(
            5, // = ( 1 / 1 + 9 + 10 ) * 100
            await splitter.partnerWithdrawAvailable.call(partner_one),
            "Partner one should have another 5 wei available"
        );
        partner_one_starting_balance = web3.eth.getBalance(partner_one);
        await splitter.withdraw({ from: partner_one, gasPrice: 0 });
        assert.equal(
            partner_one_starting_balance.add(5).toNumber(),
            web3.eth.getBalance(partner_one).toNumber(),
            "Partner one should withdraw 5 wei"
        );

        assert.equal(
            90 + 45, // = ( 9 / 1 + 9 ) * 100 + ( 9 / 1 + 9 + 10 ) * 100
            await splitter.partnerWithdrawAvailable.call(partner_two),
            "Partner two should have 90 + 45 wei available"
        );
        partner_two_starting_balance = web3.eth.getBalance(partner_two);
        await splitter.withdraw({ from: partner_two, gasPrice: 0 });
        assert.equal(
            partner_two_starting_balance.add(90 + 45).toNumber(),
            web3.eth.getBalance(partner_two).toNumber(),
            "Partner two should withdraw 90 + 45 wei"
        );

        assert.equal(
            50, // = ( 10 / 1 + 9 + 10 ) * 100
            await splitter.partnerWithdrawAvailable.call(partner_three),
            "Partner three should have 50 wei available"
        );
        partner_three_starting_balance = web3.eth.getBalance(partner_three);
        await splitter.withdraw({ from: partner_three, gasPrice: 0 });
        assert.equal(
            partner_three_starting_balance.add(50).toNumber(),
            web3.eth.getBalance(partner_three).toNumber(),
            "Partner three should withdraw 50 wei"
        );
    });
});
