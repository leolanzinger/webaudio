// DRAG AND DROP AUDIO SAMPLE
Dropzone.options.dropzone = {
  paramName: "file", // The name that will be used to transfer the file
  maxFilesize: 0,
  acceptedFiles: ".wav, .mp3, .wma, .mp4, .aiff, .aac",
  accept: function(file, done) {
    if (file.name == "justinbieber.jpg") {
      done("Naha, you don't.");
    }
    else { done(); }
  }
};

/*dropzone.on("complete", function(file) {
  dropzone.removeFile(file);
});*/

// set sampler variables
var sound_url = 'assets/audio/flute/C4.wav';
var oct = 2;
var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#999',
    progressColor: '#444',
    barWidth: '2',
    cursorWidth: '0',
    height: '100'
});

$(document).ready(function() {
  // LOAD AUDIO WAVEFORM
  wavesurfer.load(sound_url);

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
  $('#oct-' + oct + ' .' + note).css({'background-color' : '#fefa4a'});
  playSound(oct, pitch);
}

// flash up note
function noteUp(note, pitch) {
  $('#oct-' + oct + ' .' + note).css({'background-color' : '#fff'});
  stopSound(oct, pitch);
}

// webaudio
window.onload = init;
var context;
var source = [];

function init() {
  // Fix up prefixing
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


function playSound(oct, pitch) {  //polyphony
  var semitones = ((oct - 2) * 12) + pitch;
  if (source[semitones] == null) {
    source[semitones] = context.createBufferSource();
    source[semitones].buffer = audio_buffer;
    source[semitones].detune.value = semitones * 100;
    var gainNode = context.createGain();
    // Connect the source to the gain node.
    source[semitones].connect(gainNode);
    // Connect the gain node to the destination.
    gainNode.connect(context.destination);
    gainNode.gain.value = 0.6;
    source[semitones].start(0);
  }
}

function stopSound(oct, pitch) {
  var semitones = ((oct - 2) * 12) + pitch;
  source[semitones].stop();
  source[semitones] = null;
}
