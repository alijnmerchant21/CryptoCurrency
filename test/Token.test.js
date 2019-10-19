//Start

const Token = artifacts.require('./Token')

import {tokens, EVM_Revert} from './helpers'

require('chai')
.use(require('chai-as-promised'))
.should()



contract('Token', ([deployer, reciever, exchange]) => {

	const name = 'Paise Coin'
	const symbol = 'Paise'
	const decimals = '18'
	const totalSupply = tokens(1000000).toString()
	let token

	beforeEach(async() => {
		token = await Token.new()
	})
	
	describe('Deployment', () => {
		it('Tracks the name', async() => {
			const result = await token.name()
			result.should.equal(name)
		})

		it('Tracks the symbol', async() => {
			const result = await token.symbol()
			result.should.equal(symbol)
		})

		it('Tracks the decimals', async() => {
			const result = await token.decimals()
			result.toString().should.equal(decimals)
		})

		it('Tracks the total supply', async() => {
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply.toString())
		})

		it('Tracks the total supply to the deployer', async() => {
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply.toString())
		})
	})

	describe('Sending token', () => {
		let amount 
		let result

	describe('Success', async () => {
      	beforeEach(async () => {
        amount = tokens(100)
        result = await token.transfer(reciever, amount, { from: deployer })
      })


		it('transfers token balances', async () => {
        let balanceOf
        balanceOf = await token.balanceOf(deployer)
        balanceOf.toString().should.equal(tokens(999900).toString())
        balanceOf = await token.balanceOf(reciever)
        balanceOf.toString().should.equal(tokens(100).toString())
    	})	
      

		it('Emits a transfer event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Transfer')
			const event = log.args
			event.from.toString().should.equal(deployer, 'From is correct')
			event.to.toString().should.equal(reciever, 'To is correct')
			event.value.toString().should.equal(amount.toString(), 'Value is correct')
		})

	})

	describe('Failure', async () => {
		it('Rejects insufficient balances', async() => {
			let invalidAmount
			invalidAmount = tokens(100000000)
			await token.transfer(reciever, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_Revert);

			invalidAmount = tokens(10)
			await token.transfer(deployer, invalidAmount, {from: reciever}).should.be.rejectedWith(EVM_Revert);
		})

		it('Rejects invalid recepient', async() => {
			await token.transfer(0X0, amount, {from: deployer}).should.be.rejected
		})
	})
	})	



	describe('Approving Tokens', () => {
		let result 
		let amount

	beforeEach(async () => {
		amount = tokens(100)
		result = await token.approve(exchange, amount, {from: deployer})
	})

		describe('Success', () => {
			it('Allocates an allowance for delegated token spending on an exchange', async() => {
				const allowance = await token.allowance(deployer,exchange)
				allowance.toString().should.equal(amount.toString())
			
		})


			it('Emits a approval event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Approval')
			const event = log.args
			event.owner.toString().should.equal(deployer, 'Owner is correct')
			event.spender.toString().should.equal(exchange, 'Spender is correct')
			event.value.toString().should.equal(amount.toString(), 'Value is correct')
		})


		})

		describe('failure', () => {
			it('Rejects invalid spender', async() => {
			await token.approve(0X0, amount, { from: deployer }).should.be.rejected
		})
		})
	})

describe('Delegated token transfer', () => {
		let amount; 
		let result;


	beforeEach(async () => {
		amount = tokens(100)
		await token.approve(exchange, amount, {from: deployer})
	})


	describe('Success', async () => {
      	beforeEach(async () => {
        result = await token.transferFrom(deployer, reciever, amount, { from: exchange })
      })


		it('transfers token balances', async () => {
        let balanceOf
        balanceOf = await token.balanceOf(deployer)
        balanceOf.toString().should.equal(tokens(999900).toString())
        balanceOf = await token.balanceOf(reciever)
        balanceOf.toString().should.equal(tokens(100).toString())
    	})	


		it('resets the allowance', async() => {
				const allowance = await token.allowance(deployer,exchange)
				allowance.toString().should.equal('0')
		})	  
      

		it('Emits a transfer event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Transfer')
			const event = log.args
			event.from.toString().should.equal(deployer, 'From is correct')
			event.to.toString().should.equal(reciever, 'To is correct')
			event.value.toString().should.equal(amount.toString(), 'Value is correct')
		
	})

})		

describe('Failure', async () => {
		it('Rejects insufficient amounts', async() => {
			const invalidAmount = tokens(100000000)
			await token.transferFrom(deployer, reciever, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_Revert);
		})

		it('Rejects invalid recepients', async() => {
			await token.transferFrom(deployer, 0X0, amount, {from: exchange}).should.be.rejected
		})
	})
})

})	

	