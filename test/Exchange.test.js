//Start

import {tokens, ether, EVM_Revert, ETHER_ADD} from './helpers'

const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai')
.use(require('chai-as-promised'))
.should()



contract('Exchange', ([deployer, feeAccount, user1]) => {
 
	let token
	let exchange 
	const feePercent = 10

	beforeEach(async() => {
		token = await Token.new()
		token.transfer(user1, tokens(100), { from: deployer })
		exchange = await Exchange.new(feeAccount, feePercent)
		
	})
	
	describe('Deployment', () => {
		it('Tracks the fee account', async() => {
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount)
		
		})

		it('Tracks the fee percent', async() => {
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString())
		
		})
	})

	describe('Fallback', () => {
		it('Reverts when Ether is sent' , async() => {
			await exchange.sendTransaction({value: 1, from: user1}).should.be.rejectedWith(EVM_Revert)
		})
	})

	describe('Depositing ETHER', async () => {
		let result
		let amount

		beforeEach(async() => {
			amount = ether(1)
			result = await exchange.depositEther({from: user1, value: amount})
		})


	it('Tracks the ether deposit', async () => {
		const balance = await exchange.tokens(ETHER_ADD, user1)
		balance.toString().should.equal(amount.toString())
	})

	it('Emits a deposit event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Deposit')
			const event = log.args
			event.token.should.equal(ETHER_ADD, 'Ether address is correct')
			event.user.should.equal(user1, 'User is correct')
			event.amount.toString().should.equal(amount.toString(), 'Amount is correct')
			event.balance.toString().should.equal(amount.toString(), 'Balance is correct')
		     
		})
	})

	describe('Depositing tokens', () => {
		let result
		let amount

		beforeEach(async () => {
			amount = tokens(10)
			await token.approve(exchange.address, amount, { from: user1 })
			result = await exchange.depositToken(token.address, amount, { from: user1 })
		})

		describe('Success', () => {
 			it("Tracks the token deposit", async() => {
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal(amount.toString())
			})

			it('Emits a deposit event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Deposit')
			const event = log.args
			event.token.should.equal(token.address, 'Token address is correct')
			event.user.should.equal(user1, 'User address is correct')
			event.amount.toString().should.equal(amount.toString(), 'Amount is correct')
			event.balance.toString().should.equal(amount.toString(), 'Balance is correct')
		     
			})

		})
 
		describe('Failure', async () => {
			it('Rejects Ether deposits', async() => {
				await exchange.depositToken(ETHER_ADD, tokens(10), {from: user1}).should.be.rejectedWith(EVM_Revert);
			})
			it('Fails when no tokens are approved', async() => {
				await exchange.depositToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_Revert);
			})
		})
	})
})
	