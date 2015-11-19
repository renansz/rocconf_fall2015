/* video players variables */
var main_video = videojs('main-video-player');
var main_audio = videojs('main-video-audio');

var sec_video_1 = videojs('secondary-video-player-1');
var sec_video_2 = videojs('secondary-video-player-2');
var sec_video_3 = videojs('secondary-video-player-3');
var sec_video_4 = videojs('secondary-video-player-4');


/* video global variables */
var video_duration = 0;
var slider_pos = 0;
var current_time = 0;

/* main video setup */
main_video.autoplay(0);
main_video.load();
main_video.poster('static/img/video_background.png');
//main_video.controlBar.hide()
//main_video.bigPlayButton.hide();


/* secondary video setup */
sec_video_1.autoplay(0);
sec_video_2.autoplay(0);
sec_video_3.autoplay(0);
sec_video_4.autoplay(0);

sec_video_1.load();
sec_video_2.load();
sec_video_3.load();
sec_video_4.load();

sec_video_1.poster('static/img/video_background.png');
sec_video_2.poster('static/img/video_background.png');
sec_video_3.poster('static/img/video_background.png');
sec_video_4.poster('static/img/video_background.png');


/* hiding main audio div */
main_audio.hide();



/* slider setup when video is loaded */
main_video.on('loadeddata',function(){
  /* called every time playback is fired up */
  //DEBUG console.log("video length: "+ main_video.duration());
  //DEBUG console.log("video timeleft: "+ main_video.remainingTime());

  video_duration = main_video.duration();
});



/* video helper functions */
function play_videos(){
    sec_video_1.play();
    sec_video_2.play();
    sec_video_3.play();
    sec_video_4.play();

    main_video.play();
    main_audio.play();
}


function pause_videos(){
    sec_video_1.pause();
    sec_video_2.pause();
    sec_video_3.pause();
    sec_video_4.pause();

    main_video.pause();
    main_audio.pause();
}


function update_videos_times(new_time){
    main_video.currentTime(new_time);
    main_audio.currentTime(new_time);

    sec_video_1.currentTime(new_time);
    sec_video_2.currentTime(new_time);
    sec_video_3.currentTime(new_time);
    sec_video_4.currentTime(new_time);
}


function update_playback_time(new_time){
  var time_left = video_duration - new_time;
  var formatted_time = "";
  var minutes = Math.floor(time_left / 60);
  var seconds = Math.round(time_left % 60)

  if (seconds == 60){
    minutes++;
    seconds = 0;
  }

  /* add minutes */
  if (minutes < 10){
    formatted_time += ''+0+''+minutes
  }else{
    formatted_time += ''+minutes
  }

  /* add seconds */
  if (seconds < 10){
    formatted_time += ':' + 0 + '' + seconds
  }else{
    formatted_time += ':' + seconds
  }

  /* update the text itself */
  document.getElementById('video-time').innerHTML = formatted_time;
}




/* general functions + main execution scripts */
$(document).ready(function(){

  /* canvas vertical alignment */
  $("#main-content-container").height($('#main-video-container').height());
  $("#wordcloud-placeholder").css({'height':$('#main-video-container').height()});
//                                   'line-height':$('#main-video-container').height()+'px'});


  /* buttons setup */
  $('#buttons-container').height($('#main-video-player').height());
  $("#buttons-container").css({'height':$('#main-video-player').height(),
                               'line-height':$('#main-video-player').height()/5+'px'});



  // create slider instance
  $("#main-video-slider").slider();

  $("#main-video-slider").ready(function(){
    $("#main-video-slider").position({
      my:'center',
      at:'center',
      of:'#slider-placeholder'
    });
  });


  /* setup slider values */
  //DEBUG console.log('hit here and the video duration is: '+video_duration);
  $("#main-video-slider").slider("option","max",video_duration);
  $("#main-video-slider").slider("option","min",0);
  update_playback_time(0);


  /* create handlers on the slider for users manually changing the slider */
  $("#main-video-slider").on("slide",function(event,ui){
    //DEBUG console.log("new time: "+ ui.value);

    /* changing the slider will reflect on all the videos */
    update_videos_times(ui.value);

    /* update the time left info */
    update_playback_time(ui.value);
  });


  /* slider and buttons handles */
  $('#main-video-play-btn').click(function(){
    play_videos();
  });

  $('#main-video-pause-btn').click(function(){
    pause_videos();
  });

  /* slider updater on video time update */
  main_video.on('timeupdate',function(){
    current_time = main_video.currentTime();
    /* called every time playback time is changed -- updates slider's values*/
    $("#main-video-slider").slider('option','value',current_time);

    /* update playback time */
    update_playback_time(current_time);
  });

  /* formatting secodanry video panels */
  var secondary_videos_width = $('#secondary-video-1').width();
  $('.secondary-video-div').width(secondary_videos_width-10);
  $('.secondary-video-div').css('margin-left','4px');
  $('.secondary-video-div').css('margin-right','4px');
  $('.secondary-video-div').css('margin-right','4px');


  /* user changing buttons */
  $('.change-user').click(function(){
    
  });



  /***************** Chart area ********************/
  $('.bottom-side').height($('#chart-area').height());


  /*************** Change User Buttons *************/
  var changing_video_main = undefined;
  var changing_video_sec = undefined;
  var main_video_width = undefined;
  var main_video_height = undefined;
  var sec_video_width = undefined;
  var sec_video_height = undefined;

  $('.change-user').click(function(e){

    if(!$(this).children().hasClass('disabled')){
      // getting the dimensions first
      main_video_width =  $('#main-video-player').width();
      main_video_height = $('#main-video-player').height();
      sec_video_width = $('#secondary-video-player-1').width();
      sec_video_height = $('#secondary-video-player-1').height();


      // detaching the elements
      changing_video_main = $('#main-video-player').detach();
      changing_video_sec = $('#secondary-video-player-1').detach()

      // attaching back
      changing_video_sec.prependTo($("#main-video"));
      changing_video_main.prependTo($("#secondary-player-panel-1"));

      // resizing
      $('#main-video-player').width(sec_video_width);
      $('#main-video-player').height(sec_video_height);
      $('#secondary-video-player-1').width(main_video_width);
      $('#secondary-video-player-1').height(main_video_height);

    }

  });

});
