var cp          = require('child_process');
var AWS         = require('aws-sdk');
var Q           = require('q');
var fs 			= require('fs');

var basePromiseRequest = require('./promise-request');
var writePhantomScript = require('./write-phantom-script');

var PHANTOM_SCRIPT_FILE_PATH    = '/tmp/phantom-script.js';
var DEFAULT_CARD_COUNT          = 5;

function getLists(boardId, listNames) {
    var requestArgs = {path: {boardId: boardId}};
    return basePromiseRequest('https://api.trello.com/1/boards/${boardId}/lists', requestArgs).then(function (lists) {
        if(typeof lists === 'string') lists = JSON.parse(lists);

        var listNamesAndIds = lists.filter(function (list) {
            return listNames.indexOf(list.name) !== -1;
        }).map(function (list) {
            return {id: list.id, name: list.name};
        });

        return listNamesAndIds;
    });
}

function getListCardNames(listId, cardCount) {
    var requestArgs = {path: {listId: listId}};
    return basePromiseRequest('https://api.trello.com/1/lists/${listId}/cards', requestArgs).then(function (cards) {
        if(typeof cards === 'string') cards = JSON.parse(cards);

        var names = cards.map(function (card) {
            return card.name;
        })
        .splice(0, cardCount);

        return names;
    });
}

function getCards(params, callback) {
    getLists(params.boardId, params.listNames).then(function (lists) {
        var cardsPromises = lists.map(function (list) {
            return getListCardNames(list.id, params.cardCount).then(function (cardNames) {
                return {name: list.name, cards: cardNames};
            });
        });

        Q.all(cardsPromises).then(callback);
    });
}

exports.generateCardsImage = function(params, callback) {
    if (!params) {
        callback('params are required');
        return;
    } 
    params.cardCount = params.cardCount || DEFAULT_CARD_COUNT;
    getCards(params, function(cards) {
        writePhantomScript(cards, params.cardCount, PHANTOM_SCRIPT_FILE_PATH);

        cp.exec('phantomjs ' + PHANTOM_SCRIPT_FILE_PATH, function(err, stdout, stderr) {
            
            var s3 = new AWS.S3({
                accessKey: 'AKIAIGQD3L3A6CPHMLSQ',
                secretAccessKey: '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',
                region: 'us-east-1'
            });

            var imgContent = fs.readFileSync('out.png');
            s3.putObject({
                Bucket: 'invoked-trello-bages',
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
