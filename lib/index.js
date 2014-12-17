var RestClient = require('node-rest-client').Client;
var Q = require('q');
var extend = require('extend');

var apiKey = '8f1a7cc12b6584cd77c888180755b4e3', // <-- Your API Key here
    boardId = 'V8OrXkFa', // <-- The board to fetch here
    listNames = ['Blog posts', 'Test', 'Test 2'], // <-- The lists to fetch here
    cardCount = 2; // <-- The number of cards to take from each list

var rest = new RestClient();

var baseBoardRequestArgs = {
    path: { boardId: boardId },
    parameters: { key: apiKey },
    requestConfig: {
        timeout: 1000
    },
    responseConfig: {
        timeout: 1000
    }
};

rest.registerMethod('getLists', 'https://api.trello.com/1/boards/${boardId}/lists', 'GET');
rest.registerMethod('getCards', 'https://api.trello.com/1/lists/${listId}/cards', 'GET');

var basePromiseRequest = function (req, args) {
    var deferred = new Q.defer();

    req(extend({}, baseBoardRequestArgs, args || {}), function (data) {
        deferred.resolve(data);
    })
    .on('requestTimeout', function () { deferred.reject('Request timed out') })
    .on('responseTimeout', function () { deferred.reject('Response timed out') })
    .on('error', function () { deferred.reject('Request errored') });

    return deferred.promise;
};

var getListsIds = function () {
    return basePromiseRequest(rest.methods.getLists).then(function (data) {
        // TODO Check is array
        return data.filter(function (list) {
            return listNames.indexOf(list.name) !== -1;
        }).map(function (list) {
            return list.id;
        });
        // TODO Re-order in the same 'listNames' order
    });
};

var getListCardNames = function (listId) {

    return basePromiseRequest(rest.methods.getCards, { path: {listId: listId}}).then(function (data) {
        // TODO Check is array
        var names = data.map(function (card) {
            return card.name;
        }); // TODO OrderBy .. ?

        return {listId: listId, cards: names};
    });

};

getListsIds().then(function (listIds) {
    listIds.map(function (listId) {
        getListCardNames(listId).then(function (cardNames) {
            console.log(cardNames);
        });
    });
});

setTimeout(function () { }, 10000); // Keep Alive
