/* video players variables */
var main_video = videojs('video-player-1');
var main_audio = videojs('main-video-audio');

var sec_video_2 = videojs('video-player-2');
var sec_video_3 = videojs('video-player-3');
var sec_video_4 = videojs('video-player-4');
var sec_video_5 = videojs('video-player-5');


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
sec_video_2.autoplay(0);
sec_video_3.autoplay(0);
//sec_video_4.autoplay(0);
//sec_video_5.autoplay(0);

sec_video_2.load();
sec_video_3.load();
//sec_video_4.load();
//sec_video_5.load();

sec_video_2.poster('static/img/video_background.png');
sec_video_3.poster('static/img/video_background.png');
//sec_video_4.poster('static/img/video_background.png');
//sec_video_5.poster('static/img/video_background.png');


/* hiding main audio div */
main_audio.hide();







/* video helper functions */
function play_videos(){
    sec_video_2.play();
    sec_video_3.play();
//   sec_video_4.play();
//   sec_video_5.play();

    main_video.play();
    main_audio.play();
}


function pause_videos(){
    sec_video_2.pause();
    sec_video_3.pause();
//    sec_video_4.pause();
//    sec_video_5.pause();

    main_video.pause();
    main_audio.pause();
}


function update_videos_times(new_time){
    main_video.currentTime(new_time);
    main_audio.currentTime(new_time);

    sec_video_2.currentTime(new_time);
    sec_video_3.currentTime(new_time);
//    sec_video_4.currentTime(new_time);
//    sec_video_5.currentTime(new_time);
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


/* slider setup when video is loaded */
main_video.one('loadeddata',function(){
  /* called every time the main video is loaded*/

  // create slider instance
  $("#main-video-slider").slider();

  $("#main-video-slider").ready(function(){
    $("#main-video-slider").position({
      my:'center',
      at:'center',
      of:'#slider-placeholder'
    });
  });
  //DEBUG console.log("video length: "+ main_video.duration());
  //DEBUG console.log("video timeleft: "+ main_video.remainingTime());
  video_duration = main_video.duration();

  /* setup slider min-max values */
  //DEBUG console.log('hit here and the video duration is: '+video_duration);
  //DEBUG console.log(video_duration);
  $("#main-video-slider").slider("option","max",video_duration);
  $("#main-video-slider").slider("option","min",0);
  update_playback_time(0);

});



/* general functions + main execution scripts */
$(document).ready(function(){

  /* canvas vertical alignment 
  $("#main-content-container").height($('#main-video-container').height());
  $("#main-video-container").css({'height':$('#wordcloud-placeholder').height()});
//                                   'line-height':$('#main-video-container').height()+'px'});
*/

  /* making all the middle panels have the same vertical length 
  $("#wordcloud-canvas").on('wordcloudstop',function(){
    $("#left-panel-info").height($('#wordcloud-placeholder').height());
    $("#left-panel-info").css({'height':$('#wordcloud-placeholder').height()});
    $('#wordcloud-panel').height($('#left-panel-info').height());
  });*/



  /* create handlers on the slider for users manually changing the slider */
  $("#main-video-slider").on("slide",function(event,ui){
    //DEBUG console.log("new time: "+ ui.value);

    /* changing the slider will reflect on all the videos */
    update_videos_times(ui.value);

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
    console.log("current time"+ main_video.currentTime());
    $("#main-video-slider").slider("option","value",current_time);
    /* update playback time */
    update_playback_time(current_time);
  });




  /* formatting secondary video panels */
  var secondary_videos_width = $('#video-2').width();
  $('.secondary-video-div').width(secondary_videos_width-10);
  $('.secondary-video-div').css('margin-left','4px');
  $('.secondary-video-div').css('margin-right','4px');
  /* temporary fix for making all the panels have the same height*/
  $('.secondary-video-div>.panel-body>.row').height(85);



  /* more height fixes for demo day */
  $('#wordlcoud-panel').height(592);
  $('#left-panel-info').height(592);

  /***************** Chart area ********************/
  $('.bottom-side').height($('#chart-area').height());


  /*************** Change User Buttons *************/
  var changing_video_main = undefined;
  var changing_video_sec = undefined;
  var main_video_width = undefined;
  var main_video_height = undefined;
  var sec_video_width = undefined;
  var sec_video_height = undefined;
  var sec_panel = undefined;
  var main_user = undefined;
  var sec_user = undefined;

  var main_player = undefined;
  var sec_player = undefined;

  $('.change-user').click(function(e){

    // get the new user number that will be in the main player
    if ($(this).attr('change_user')){
      sec_user = $(this).attr('change_user');
    }else{
      sec_user = $(this).attr('user');
    }

    // get panel numbers *** main video is always panel 1
    // jquery trick to get the panel
    sec_panel = $('div[user='+sec_user+']').parent();

    // get the user numbers (which user video is there)
    main_user = $('.video-custom-center').attr('user');


    main_player = $('div[user=' + main_user + ']');
    sec_player = $('div[user=' + sec_user + ']');

    //alert('main panel: '+main_panel_number+'\nsec panel: '+sec_panel_number);

    // for now, stop playing the videos before changes
    pause_videos();


    if(!$(this).children().hasClass('disabled')){
      // getting the dimensions first
      main_video_width  = main_player.width();
      main_video_height = main_player.height();
      sec_video_width   = sec_player.width();
      sec_video_height  = sec_player.height();

      //alert('main panel width: '+ main_video_width +' height: '+ main_video_height +'\nsec panel height: '+ sec_video_height+' width: ' + sec_video_width);

      // detaching the elements
      changing_video_main = main_player.detach();
      changing_video_sec  = sec_player.detach();

      // attaching back
      changing_video_sec.prependTo($('#video-player-panel-1')); // main panel 
      changing_video_main.prependTo(sec_panel);

      // resizing
      main_player.width(sec_video_width);
      main_player.height(sec_video_height);
      sec_player.width(main_video_width);
      sec_player.height(main_video_height);

      // fixing classes on main-video
      main_player.toggleClass('secondary-video');
      main_player.toggleClass('video-custom-center');

      // fixing classes on sec-video
      sec_player.toggleClass('secondary-video');
      sec_player.toggleClass('video-custom-center');

      // change user attribute values on the video element
      sec_player.attr('user',main_user);
      main_player.attr('user',sec_user);

      // Finally, start playing the videos again
      play_videos();
    }
  });
});
