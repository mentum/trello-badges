var PHANTOM_SCRIPT_TRIM_COMMENT = '//TRIM';

module.exports = function(cards, maxCardCountPerList, phantomScriptFileName){
    var fs = require('fs');
    var phantomScript = function(){
        //TRIM
        var cards = '__cards__';
        var width = cards.length * 240;
        var height = '__maxCardCountPerList__' * 70;
        
        var page = require('webpage').create();
        page.viewportSize = {width : width, height:height}

        page.open('https://s3.amazonaws.com/trello-badges/renderer.html', function(status) {
            page.evaluate(function(cards){
                window.viewModel.lists(cards);
                document.getElementById('body').style.cssText = 'width: ' + width + 'px; overflow: hidden;';
            }, cards);
            page.clipRect = {top:0, left:0, width:width, height: height};
            page.render('out.png');
            phantom.exit();
        });
        //TRIM
    };
    var scriptStartIndex = phantomScript.toString().indexOf(PHANTOM_SCRIPT_TRIM_COMMENT) + PHANTOM_SCRIPT_TRIM_COMMENT.length;
    var scriptEndIndex = phantomScript.toString().lastIndexOf(PHANTOM_SCRIPT_TRIM_COMMENT);
    
    var plainStringPhantomScript = phantomScript.toString()
        .substring(scriptStartIndex, scriptEndIndex)
        .replace("'__cards__'", JSON.stringify(cards))
        .replace("'__maxCardCountPerList__'", maxCardCountPerList);

    fs.writeFileSync(phantomScriptFileName, plainStringPhantomScript);
}
