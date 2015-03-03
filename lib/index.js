var RestClient = require('node-rest-client').Client;
var Q = require('q');
var extend = require('extend');
var cp = require('child_process');
var AWS = require('aws-sdk');

var apiKey = '8f1a7cc12b6584cd77c888180755b4e3', // <-- Your API Key here
    boardId = 'V8OrXkFa', // <-- The board to fetch here
    listNames = ['NEXT UP', 'TODO'], // <-- The lists to fetch here
    cardCount = 2; // <-- The number of cards to take from each list

var rest = new RestClient();

var baseBoardRequestArgs = {
    path: { boardId: boardId },
    parameters: { key: apiKey },
    requestConfig: {
        timeout: 2000
    },
    responseConfig: {
        timeout: 2000
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

var getLists = function () {
    return basePromiseRequest(rest.methods.getLists).then(function (data) {
        // TODO Check is array
        if(typeof data === 'string') data = JSON.parse(data);
        return data.filter(function (list) {
            return listNames.indexOf(list.name) !== -1;
        }).map(function (list) {
            return {id: list.id, name: list.name};
        });
        // TODO Re-order in the same 'listNames' order
    });
};

var getListCardNames = function (listId) {

    return basePromiseRequest(rest.methods.getCards, { path: {listId: listId}}).then(function (data) {
        // TODO Check is array
        if(typeof data === 'string') data = JSON.parse(data);

        var names = data.map(function (card) {
            return card.name;
        }) // TODO OrderBy .. ?
        .splice(0, cardCount);

        return names;
    });

};

var getCards = function(callback) {
    getLists().then(function (lists) {
        var cardsPromises = lists.map(function (list) {
            return getListCardNames(list.id).then(function (cardNames) {
                return {name: list.name, cards: cardNames};
            });
        });

        Q.all(cardsPromises).then(callback);
    });
};

exports.generateCardsImage = function(callback) {


    getCards(function(cards) {
        
            var shim = "function() { window.viewModel.lists(#!#); }";
            shim = shim.replace('#!#', JSON.stringify(cards));

            var phantomscript = '';
            phantomscript += "var page = require('webpage').create();";
            phantomscript += "page.open('https://s3.amazonaws.com/trello-badges/renderer.html', function(status) {";
            phantomscript += "page.viewPortSize = { width: 200, height: 75};";
            phantomscript += "page.evaluate(" + shim + ");";
            phantomscript += "page.render('/tmp/out.png');";
            phantomscript += "phantom.exit();";
            phantomscript += "});";

            var fs = require('fs');
            fs.writeFileSync('/tmp/phantom-script.js', phantomscript); 

            cp.exec('phantomjs /tmp/phantom-script.js', function(err, stdout, stderr) {
                var s3 = new AWS.S3();
                var imgContent = fs.readFileSync('/tmp/out.png');
                s3.putObject({
                    Bucket: 'trello-badges',
                    Key: 'lambdaws.png',
                    ACL: 'public-read',
                    Body: imgContent,
                    ContentType: 'image/png'
                }, function(err, res) {
                    console.log(err, res);
                    callback(res);
                });             
            });
    });
};