// step selection
$('.drum .step').click(function(){
  $(this).toggleClass("active");
});

// volume change
$( "#volume-slider" ).slider({
  value: 100,
  slide: function( event, ui ) {
    changeVolume(ui.value)
  }
});

// play / stop
$('#play-button').click(function() {
  var play_html = "<i class='fa fa-play'></i> Play";
  var stop_html = "<i class='fa fa-stop'></i> Stop";
  if ($(this).hasClass('playing')) {
    $(this).html(play_html);
    stop();
  }
  else {
    $(this).html(stop_html);
    play();
  }
  $(this).toggleClass('playing');
});

// load audio samples
window.onload = init;
var context;
var source = [];
var gainNode = [];
var bpm = 120;
var steps = 32;
var step_length = 60 / 120;

function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      'assets/audio/drums/kick.wav',
      'assets/audio/drums/sd.wav',
      'assets/audio/drums/chh.wav',
      'assets/audio/drums/crash.wav'
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
  source[0] = context.createBufferSource();
  source[1] = context.createBufferSource();
  source[2] = context.createBufferSource();
  source[3] = context.createBufferSource();
  source[0].buffer = bufferList[0];
  source[1].buffer = bufferList[1];
  source[2].buffer = bufferList[2];
  source[3].buffer = bufferList[3];

  source[0].connect(context.destination);
  source[1].connect(context.destination);
  source[2].connect(context.destination);
  source[3].connect(context.destination);
}

// read the drum sheet and play accordingly
function play() {
  $.each($('.drum'), function(drum_index, drum_obj) {
    $.each($(drum_obj).find('.sequence .step'), function(step, step_obj) {
      if ($(step_obj).hasClass('active')) {
        console.log(drum_index + " " + step);
        playSound(drum_index, step * step_length);
      }
    });
  });
}

function playSound(index, time) {
  gainNode[index] = context.createGain();
  source[index].connect(gainNode[index]);
  gainNode[index].connect(context.destination);
  gainNode[index].gain.value = parseInt($('#volume-slider').slider( "value" )) / 100; // sample volume
  source[index].start(time);
}

function stop() {
  gainNode.forEach(function(node, i) {
    if (gainNode[i] != null) {
      setTimeout(function() {
        source[i].stop();
        gainNode[i] = null;
      }, 50);
    }
  });
}

changeVolume = function(value) {
  var fraction = parseInt(value) / 100;
  gainNode.forEach(function(element) {
    if (element != null) {
      element.gain.value = fraction * fraction;
    }
  });
};
