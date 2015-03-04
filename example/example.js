var trello = require('../');

// TODO : uplpad to aws lambda using lambdaws once lambdaws accepts project specific dependencies
// lambdaws.config({
// 	credentials: {
// 		accessKey: '***',
// 		secretKey: '*****'
// 	},
// 	region: 'us-east-1',
// 	role: '****'
// });
//
// lambdaws.create()

var params = {
	boardId : 'V8OrXkFa',
	listNames : ['TODO', 'NEXT UP']
}

trello.generateCardsImage(params, function(data){
	console.log(data);
});
