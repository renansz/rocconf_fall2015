$(document).ready(function(){

  /* setting wordcloud dimensions */
  $("#wordcloud-canvas").width(250);
});

//==================================================
// Setup the Word Cloud
//==================================================
function setup_word_cloud(wordlist)
{
    /* function to handle word clicking */
    function click_word(word, dimension, mouse_event) {
        console.log('word ');
        console.log(word);
        console.log('Dimension: ');
        console.log(dimension);
        /*alert('word: '+ item + ' with coordinates: '+ JSON.stringify(dimension));*/
    }


    /* fix for erasing the word selection with html5 only */
    var original_cloud = undefined;
    var last_dimension = undefined;


    /* handling hover over the words in the wordcloud */
    function hover_word(word, dimension, mouse_event) {
        var c = $("#wordcloud-canvas")[0];
        var ctx = c.getContext("2d");

        if (!dimension) {
            ctx.clearRect(0, 0, $("#wordcloud-canvas").width(), $("#wordcloud-canvas").height());
            ctx.putImageData(original_cloud, 0, 0);
        } else {
            if (dimension != last_dimension) {
                ctx.clearRect(0, 0, $("#wordcloud-canvas").width(), $("#wordcloud-canvas").height());
                ctx.putImageData(original_cloud, 0, 0);
            }
            last_dimension = dimension;
            ctx.strokeRect(dimension.x, dimension.y, dimension.w, dimension.h);
        }
    }


    /* instantiating the wordcloud */
    var options = {
        list: wordlist,
        gridSize: Math.round(16 * $('#wordcloud-canvas').width() / 1024),
        weightFactor: function (size) {
            return Math.pow(size, 2.5) * $('#wordcloud-canvas').width() / 1024;
        },
        fontFamily: 'Times, serif',
        rotateRatio: 0.1,
        minRotation: -Math.PI / 2.0,
        maxRotation: -Math.PI / 2.0,
        backgroundColor: '#ffffff'
    };

    WordCloud($('#wordcloud-canvas')[0], options);

    $("#wordcloud-canvas").on('wordcloudstop', function () {
        var c = $("#wordcloud-canvas")[0];
        var ctx = c.getContext("2d");
        original_cloud = ctx.getImageData(0, 0, $("#wordcloud-canvas").width(), $("#wordcloud-canvas").height());
    });

}

