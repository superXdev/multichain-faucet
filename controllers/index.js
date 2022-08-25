require('dotenv').config();

const { Queue, Request } = require('../models/index.js');


// helper functions

const diffHours = (dt2, dt1) => {
	let diff =(dt1.getTime() - dt2.getTime()) / 1000;
	diff /= (60 * 60);

	return Math.abs(Math.round(diff));
}
 

const isRequestValid = async (req) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	const requested = await Request.findOne({
		where: {
			walletAddress: req.body.address,
			type: req.body.type
		}
	});

	const ipRequested = await Request.findAndCountAll({
		select: ['id'],
		where: {
			ipAddress: ip,
			type: req.body.type
		}
	});

	// allow if wallet address never request
	if(requested === null && ipRequested.count == 0) {
		await Request.create({
			walletAddress: req.body.address,
			ipAddress: ip,
			type: req.body.type
		});

		return true;
	}

	if(requested === null) {
		return false;
	}

	if(diffHours(new Date(requested.updatedAt), new Date()) < 24) {
		return false;
	}

	await Request.update({ ipAddress: ip }, {
		where: {
			walletAddress: req.body.address,
			type: req.body.type
		}
	});

	return true;
}


const index = async (req,res) => {
   const queues = await Queue.findAndCountAll({
      limit: 5,
      order: [
         ['createdAt', 'DESC']
      ],
   });

   const amounts = {
   	eth: process.env.ETH_AMOUNT,
   	bnb: process.env.BNB_AMOUNT,
   	matic: process.env.MATIC_AMOUNT,
   	avax: process.env.AVAX_AMOUNT,
   	fantom: process.env.FANTOM_AMOUNT,
   	cronos: process.env.CRONOS_AMOUNT,
   }

   const messages = {
      success: req.flash('success'),
      error: req.flash('error')
   }

   res.render('index', { queues: queues, messages: messages, amounts: amounts });
}

const request = async (req, res) => {
   try {

		const isValid = await isRequestValid(req);

		if(!isValid) {
			throw Error('Please wait until 24 hours before request again')
		}

		const result = await Queue.create({
			address: req.body.address,
			type: req.body.type
		});

      req.flash('success', 'Your request has been successfully submitted');
   } catch(err) {
      req.flash('error', err.message);
   }

   res.redirect('/');
}

module.exports = {
	index,
	request
}