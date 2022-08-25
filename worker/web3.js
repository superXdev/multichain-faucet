require('dotenv').config();
const Web3 = require('web3');
const { Transaction } = require('@ethereumjs/tx');
const Common = require('@ethereumjs/common').default;


const getRpcUrl = (type) => {
	switch(type) {
		case "ETH":
			return process.env.GOERLI_RPC;
			break;
		case "BNB":
			return process.env.BSC_RPC;
			break;
		case "MATIC":
			return process.env.POLYGON_RPC;
			break;
		case "AVAX":
			return process.env.AVALANCHE_RPC;
			break;
		case "FTM":
			return process.env.FANTOM_RPC;
			break;
		case "CRO":
			return process.env.CRONOS_RPC;
			break;
	}
}

const getFaucetAmount = (type) => {
	switch(type) {
		case "ETH":
			return process.env.ETH_AMOUNT;
			break;
		case "BNB":
			return process.env.BNB_AMOUNT;
			break;
		case "MATIC":
			return process.env.MATIC_AMOUNT;
		case "FTM":
			return process.env.FANTOM_AMOUNT;
		case "AVAX":
			return process.env.AVAX_AMOUNT;
		case "CRO":
			return process.env.CRONOS_AMOUNT;
			break;
	}
}

// sign a transaction
const signTransaction = async (web3, data) => {
	// Build the transaction
	let txData = {
		nonce:    web3.utils.toHex(data.nonce),
		to:       data.destination,
		value:    web3.utils.toHex(data.value),
		gasLimit: web3.utils.toHex(data.gasLimit),
		gasPrice: web3.utils.toHex(data.gasPrice)
	}

	// Sign the transaction
	const common = Common.custom({ chainId: data.chainId });
	const tx = Transaction.fromTxData(txData, { common });
	return tx.sign(Buffer.from(data.privateKey, 'hex'));
}

// sending a transaction
const sendingTransaction = (web3, txSigned) => {
	const serializedTx = txSigned.serialize()
	return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
}

module.exports = {
	getRpcUrl,
	getFaucetAmount,
	signTransaction,
	sendingTransaction
}