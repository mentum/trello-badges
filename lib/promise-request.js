var RestClient 	= require('node-rest-client').Client;
var extend 		= require('extend');
var Q 			= require('q');

var rest = new RestClient();

var baseTrelloBoardRequestArgs = {
    parameters: { key: '8f1a7cc12b6584cd77c888180755b4e3' },
    requestConfig: {timeout: 2000},
    responseConfig: {timeout: 2000}
};

module.exports = function (url, args) {
    var deferred = new Q.defer();
    args = extend({}, baseTrelloBoardRequestArgs, args);
    rest.get(url, args, function (data){
        deferred.resolve(data);
    })
    .on('requestTimeout', function () { deferred.reject('Request timed out') })
    .on('responseTimeout', function () { deferred.reject('Response timed out') })
    .on('error', function () { deferred.reject('Request errored') });

    return deferred.promise;
};
