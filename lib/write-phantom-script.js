var PHANTOM_SCRIPT_TRIM_COMMENT = '//TRIM';

module.exports = function(cards, phantomScriptFileName){
    var fs = require('fs');
    var phantomScript = function(){
        //TRIM
        var page = require('webpage').create();

        // page.open('./renderer.html', function(status) {
        page.open('https://s3.amazonaws.com/trello-badges/renderer.html', function(status) {
            var cards = '__cards__';
            page.viewPortSize = { width: 200 * cards.length, height: 75};
            page.evaluate(function(){
                window.viewModel.lists(cards);
            });
            // TODO ::: page.render('/tmp/out.png');
            page.render('out.png');
            phantom.exit();
        });
        //TRIM
    };
    var scriptStartIndex = phantomScript.toString().indexOf(PHANTOM_SCRIPT_TRIM_COMMENT) + PHANTOM_SCRIPT_TRIM_COMMENT.length;
    var scriptEndIndex = phantomScript.toString().lastIndexOf(PHANTOM_SCRIPT_TRIM_COMMENT);
    var plainStringPhantomScript = phantomScript.toString().substring(scriptStartIndex, scriptEndIndex).replace("'__cards__'", JSON.stringify(cards));

    fs.writeFileSync(phantomScriptFileName, plainStringPhantomScript);    
}
