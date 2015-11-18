$(document).ready(function(){
  /* wordcloud scripts */
  var wordlist = [['Web Technologies',26],
                ['HTML',20],
                ['<canvas>',20],
                ['CSS',15],
                ['JavaScript',15],
                ['Document Object Model',12],
                ['<audio>',12],
                ['<video>',12],
                ['Web Workers',12],
                ['XMLHttpRequest',12],
                ['SVG',12],
                ['JSON.parse()',9],
                ['Geolocation',9],
                ['data attribute',9],
                ['transform',9],
                ['transition',9],
                ['animation',9],
                ['setTimeout',7],
                ['@font-face',7],
                ['Typed Arrays',7],
                ['FileReader API',7],
                ['FormData',7],
                ['IndexedDB',7],
                ['getUserMedia()',7],
                ['postMassage()',7],
                ['CORS',7],
                ['strict mode',6],
                ['calc()',6],
                ['supports()',6],
                ['media queries',6],
                ['full screen',6],
                ['notification',6],
                ['orientation',6],
                ['requestAnimationFrame',6],
                ['border-radius',5],
                ['box-sizing',5],
                ['rgba()',5],
                ['text-shadow',5],
                ['box-shadow',5],
                ['flexbox',5],
                ['viewpoint',5]];


  /* function to handle word clicking */
  function click_word(word,dimension,mouse_event){
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
  function hover_word(word,dimension,mouse_event){
    var c = $("#wordcloud-canvas")[0];
    var ctx = c.getContext("2d");

    if (!dimension){
      ctx.clearRect(0,0,$("#wordcloud-canvas").width(),$("#wordcloud-canvas").height());
      ctx.putImageData(original_cloud,0,0);
    }else{
      if (dimension != last_dimension){
        ctx.clearRect(0,0,$("#wordcloud-canvas").width(),$("#wordcloud-canvas").height());
        ctx.putImageData(original_cloud,0,0);
      }
      last_dimension = dimension;
      ctx.strokeRect(dimension.x,dimension.y,dimension.w,dimension.h);
    }
  }


  /* instantiating the wordcloud */
  var options = {list : wordlist,
                gridSize: Math.round(16 * $('#wordcloud-canvas').width() / 1024),
                weightFactor: function (size) {
                  return Math.pow(size, 2.3) * $('#wordcloud-canvas').width() / 1024;
                },
                fontFamily: 'Times, serif',
                rotateRatio: 0.1,
                minRotation: -Math.PI /2.0,
                maxRotation: -Math.PI /2.0,
                backgroundColor: '#eeeeee',
                hover: hover_word,
                click: click_word};

  WordCloud($('#wordcloud-canvas')[0], options);

  $("#wordcloud-canvas").on('wordcloudstop',function(){
    var c = $("#wordcloud-canvas")[0];
    var ctx = c.getContext("2d");
    original_cloud = ctx.getImageData(0,0,$("#wordcloud-canvas").width(),$("#wordcloud-canvas").height());
  });
});
