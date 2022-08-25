
const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}


const log = (id, address, type, msg, callback) => {
	const act = (msg == 1) ? 'queued' : (msg == 2) ? 'executed' : 'failed';
	const message = `[${id}] address=${address}, type=${type} ${act}`;

	return console.log(callback(message));
}

module.exports = {
	sleep,
	log
}