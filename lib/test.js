var trello = require('./index');

var params = {
	boardId : 'V8OrXkFa',
	listNames : ['TODO', 'NEXT UP']
}

trello.generateCardsImage(params, function(data){
	console.log(data);
});
