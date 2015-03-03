var lambdaws = require('lambdaws');
var trello = require('./index');

lambdaws.config({
	credentials: {
		accessKey: '***',
		secretKey: '*****'
	},
	region: 'us-east-1',
	role: '****'
});


var clouded = lambdaws.create('./index', 'generateCardsImage',
	['node-rest-client', 'q', 'extend', ':phantomjs'],
	{ name: 'TRELLOOOO', timeout: '10', memory: 1024 });

clouded(function(err, data) {
	console.log(err, data);
});

setTimeout(function() {}, 100 * 1000);