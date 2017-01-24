// JQUERY UI WIDGETS
$( "#volume-slider" ).slider({
  value: 100,
  slide: function( event, ui ) {
    changeVolume(ui.value)
  }
});

// JQUERY SAMPLE UPLOAD
$("#file").change(function(el) {
  var file    = document.querySelector('input[type=file]').files[0];

  $('.panel-waveform label.wave-label').html($(this).val().substring($(this).val().lastIndexOf("\\") + 1));
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    sound_url = reader.result;
    wavesurfer.load(sound_url);
    init();
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
});


// show - unshow keyboard
$('#toggle-keyboard').click(function() {
  $('.show-keyboard').toggleClass('hidden-keyboard');
  $(this).find('#toggle-key-icon').toggleClass('fa-chevron-up fa-chevron-down');
});

// set sampler variables
var sound_url = 'assets/audio/flute/C4.wav';
var oct = 2;
var start_pos = 0;
var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#ecf0f1',
    progressColor: '#2c3e50',
    barWidth: '1',
    cursorWidth: '4',
    cursorColor: '#e74c3c',
    height: '100'
});

// move wavesurfer starting point
wavesurfer.on('seek', function (pos) {
    start_pos = pos;
});

$(document).ready(function() {
  // LOAD AUDIO WAVEFORM
  wavesurfer.load(sound_url);
  $('.panel-waveform label.wave-label').html(sound_url.substring(sound_url.lastIndexOf("/") + 1));

  // KEYBOARD BINDING
  $(document).keydown(function(e) {
    handleKeyboard(e.which, 0);
  });
  $(document).keyup(function(e) {
    handleKeyboard(e.which, 1);
  });
});
function handleKeyboard(key, functionType) {
  switch(key) {
    case 90: // z : octave down
      if (oct > 1) {
        if (functionType == 0) {
          oct = oct - 1;
          setOctave();
        }
      }
      break;
    case 88: // x : octave up
      if (oct < 3) {
        if (functionType == 0) {
          oct = oct + 1;
          setOctave();
        }
      }
      break;
    case 65: // a: C
      if (functionType == 0) {
        noteDown('c', 0);
      }
      else if (functionType == 1) {
        noteUp('c', 0);
      }
      break;
    case 87: // w: C#
      if (functionType == 0) {
        noteDown('c-sharp', 1);
      }
      else if (functionType == 1) {
        noteUp('c-sharp', 1);
      }
      break;
    case 83: // s: D
      if (functionType == 0) {
        noteDown('d', 2);
      }
      else if (functionType == 1) {
        noteUp('d', 2);
      }
      break;
    case 69: // e: D#
      if (functionType == 0) {
        noteDown('d-sharp', 3);
      }
      else if (functionType == 1) {
        noteUp('d-sharp', 3);
      }
      break;
    case 68: // d: E
      if (functionType == 0) {
        noteDown('e', 4);
      }
      else if (functionType == 1) {
        noteUp('e', 4);
      }
      break;
    case 70: // f: F
      if (functionType == 0) {
        noteDown('f', 5);
      }
      else if (functionType == 1) {
        noteUp('f', 5);
      }
      break;
    case 84: // t: F#
      if (functionType == 0) {
        noteDown('f-sharp', 6);
      }
      else if (functionType == 1) {
        noteUp('f-sharp', 6);
      }
      break;
    case 71: // g: G
      if (functionType == 0) {
        noteDown('g', 7);
      }
      else if (functionType == 1) {
        noteUp('g', 7);
      }
      break;
    case 89: // y: G#
      if (functionType == 0) {
        noteDown('g-sharp', 8);
      }
      else if (functionType == 1) {
        noteUp('g-sharp', 8);
      }
      break;
    case 72: // h: A
      if (functionType == 0) {
        noteDown('a', 9);
      }
      else if (functionType == 1) {
        noteUp('a', 9);
      }
      break;
    case 85: // u: A#
      if (functionType == 0) {
        noteDown('a-sharp', 10);
      }
      else if (functionType == 1) {
        noteUp('a-sharp', 10);
      }
      break;
    case 74: // j: B
      if (functionType == 0) {
        noteDown('b', 11);
      }
      else if (functionType == 1) {
        noteUp('b', 11);
      }
      break;
    default:
      break;
  }
}

// set active midi octave
function setOctave() {
  $('.midi-oct .midi-selected').removeClass('selected');
  $('#oct-' + oct + ' .midi-selected').addClass('selected');
}

// flash pressed note
function noteDown(note, pitch) {
  $('#oct-' + oct + ' .' + note).css({'background-color' : '#e74c3c'});
  playSound(oct, pitch);
}

// flash up note
function noteUp(note, pitch) {
  $('#oct-' + oct + ' .' + note).css({'background-color' : '#ecf0f1'});
  stopSound(oct, pitch);
}

// webaudio
window.onload = init;
var context;
var source = [];
var gainNode = [];

function init() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  var getSound = new XMLHttpRequest();
  getSound.open("GET", sound_url, true);
  getSound.responseType = "arraybuffer";
  getSound.onload = function() {
  context.decodeAudioData(getSound.response, function(buffer){
    audio_buffer = buffer;
  });
  }
  getSound.send();
}

function playSound(oct, pitch) {  // polyphony
  var semitones = ((oct - 2) * 12) + pitch; // sample root is in C
  var semitones_index = semitones + 12; // no negative indexes
  if (source[semitones_index] == null) {
    source[semitones_index] = context.createBufferSource();
    source[semitones_index].buffer = audio_buffer;
    source[semitones_index].detune.value = semitones * 100; // detune sound sample
    gainNode[semitones_index] = context.createGain();
    source[semitones_index].connect(gainNode[semitones_index]);
    gainNode[semitones_index].connect(context.destination);
    gainNode[semitones_index].gain.value = parseInt($('#volume-slider').slider( "value" )) / 100; // sample volume
    source[semitones_index].start(0,start_pos * audio_buffer.duration);
  }
}

function stopSound(oct, pitch) {
  var semitones = ((oct - 2) * 12) + pitch;
  var semitones_index = semitones + 12;
  // fade out stop
  gainNode[semitones_index].gain.setTargetAtTime(0, context.currentTime, 0.015);
  setTimeout(function() {
    source[semitones_index].stop();
    source[semitones_index] = null;
  }, 50);
}

changeVolume = function(value) {
  var fraction = parseInt(value) / 100;
  gainNode.forEach(function(element) {
    if (element != null) {
      element.gain.value = fraction * fraction;
    }
  });
};
