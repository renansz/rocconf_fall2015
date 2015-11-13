
/* video players setup */
var main_video = videojs('main-video-player');

var sec_video_1 = videojs('sec-video-player');
var sec_video_2 = videojs('sec-video-player');
var sec_video_3 = videojs('sec-video-player');
var sec_video_4 = videojs('sec-video-player');




/* main video setup */
main_video.autoplay(0);
main_video.poster('static/img/video_background.png');
//main_video.controlBar.hide()
//main_video.bigPlayButton.hide();

main_video.on('timeupdate',function(){
  /* called every time playback time is changed */
  
});

main_video.on('play',function(){
  /* called every time playback is fired up */
  console.log("video length: "+ main_video.duration());
  console.log("video timeleft: "+ main_video.remainingTime());

  /* setup slider values */
  $("#main-video-slider").slider("option","max",main_video.duration());
  $("#main-video-slider").slider("option","min",0);
});




/* general functions */
$(document).ready(function(){

  // create slider instance
  $("#main-video-slider").slider();

  /* create handlers on the slider */
  $("#main-video-slider").on("slidechange",function(){
    console.log("new time: "+$("#main-video-slider").slider("value"));
    main_video.currentTime($("#main-video-slider").slider("value"));
  });

 /* slider and buttons handles */
  $('#main-video-play-btn').click(function(){
    main_video.play();
  });

  $('#main-video-pause-btn').click(function(){
    main_video.pause();
  });

  

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

  function hover_word(word,dimension,mouse_event){
    var c = $("#word-cloud-canvas")[0];
    var ctx = c.getContext("2d");

    if (!dimension){
      ctx.clearRect(0,0,$("#word-cloud-canvas").width(),$("#word-cloud-canvas").height());
      ctx.putImageData(original_cloud,0,0);
    }else{
      if (dimension != last_dimension){
        ctx.clearRect(0,0,$("#word-cloud-canvas").width(),$("#word-cloud-canvas").height());
        ctx.putImageData(original_cloud,0,0);
      }
      last_dimension = dimension;
      ctx.strokeRect(dimension.x,dimension.y,dimension.w,dimension.h);
    }
  }

  var options = {list : wordlist,
                gridSize: Math.round(16 * $('#word-cloud-canvas').width() / 1024),
                weightFactor: function (size) {
                  return Math.pow(size, 2.3) * $('#word-cloud-canvas').width() / 1024;
                },
                fontFamily: 'Times, serif',
                rotateRatio: 0.1,
                minRotation: -Math.PI /2.0,
                maxRotation: -Math.PI /2.0,
                backgroundColor: '#fff',
                hover: hover_word,
                click: click_word};

  WordCloud($('#word-cloud-canvas')[0], options);

  $("#word-cloud-canvas").on('wordcloudstop',function(){
    var c = $("#word-cloud-canvas")[0];
    var ctx = c.getContext("2d");
    original_cloud = ctx.getImageData(0,0,$("#word-cloud-canvas").width(),$("#word-cloud-canvas").height());
  });
});
