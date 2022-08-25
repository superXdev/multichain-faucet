require('dotenv').config();
const chalk = require('chalk');
const Web3 = require('web3');

const { Queue } = require('../models/index.js');
const utils = require('./utils.js');
const {
	getRpcUrl,
	getFaucetAmount,
	signTransaction,
	sendingTransaction
} = require('./web3.js');


(async function() {
	console.log(chalk.yellow('Worker started!'));
	while(true) {
		const queues = await Queue.findAll();

		if(queues === null) {
			await utils.sleep(1000);
			continue;
		}

		queues.forEach(data => {
			utils.log(data.id, data.address, data.type, 1, chalk.white);
		});

		const sendFaucet = queues.map(async data => {
			try {
				const rpcConfig = JSON.parse(getRpcUrl(data.type));
				const web3 = new Web3(rpcConfig[0]);

				let privateKey = process.env.WALLET_PRIVATEKEY;
				privateKey = (privateKey.substr(0, 2) === "0x") 
					? privateKey.substr(2, privateKey.length)
					: privateKey;
				const account = web3.eth.accounts.privateKeyToAccount(privateKey);

				const amount = getFaucetAmount(data.type);
				const [gasPrice, nonce] = await Promise.all([
					web3.eth.getGasPrice(), 
					web3.eth.getTransactionCount(account.address)
				]);

				const txSigned = await signTransaction(web3, {
					destination: data.address,
					from: account.address,
					nonce: nonce,
					value: web3.utils.toWei(amount),
					gasLimit: 21000,
					gasPrice: gasPrice,
					chainId: rpcConfig[1],
					privateKey: privateKey
				});

				await sendingTransaction(web3, txSigned);

				utils.log(data.id, data.address, data.type, 2, chalk.green);
			} catch(err) {
				utils.log(data.id, data.address, data.type, 3, chalk.yellow);
			}

			await data.destroy();
		});

		await Promise.all(sendFaucet);
	}

	await utils.sleep(1000);
})();