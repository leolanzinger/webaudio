// Create a new AudioContext instance
var audioContext = new AudioContext();
var gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);
var bpmValue = 120;
var stepsAmount = 16;
var totalDuration = 1;
var timerId;
var counter = 0;

// playing steps of the 16th step sequencer
var steps = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false
]

// kick, snare, hi-hat, crash buffers
var stepBuffer = [];

// URLs of the wave files you want to load
var audioFiles = [
  'assets/audio/drums/kick.wav',
  'assets/audio/drums/sd.wav',
  'assets/audio/drums/chh.wav',
  'assets/audio/drums/crash.wav'
];

// Function to load a single audio file
function loadAudioFile(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(decodedData => resolve(decodedData))
            .catch(error => reject(error));
    });
}

/// Store the loaded buffers for later use
var loadedBuffers = null;

// Update loadAudioFiles to save the loaded buffers
function loadAudioFiles(files) {
    var promises = files.map(file => loadAudioFile(file));
    Promise.all(promises)
        .then(buffers => {
            loadedBuffers = buffers;
        })
        .catch(error => console.error('Audio file loading error:', error));
}

// Function to play the loaded buffers
function playBuffers(indices) {
  indices.forEach(index => {
      var buffer = loadedBuffers[index];
      if(buffer) {  // check if buffer exists
          var source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(gainNode).connect(audioContext.destination);
          source.start();
      }
  });
}

// Load audio files
loadAudioFiles(audioFiles);

// Example function to play the loaded buffers again later
function playSounds(indices) {
  console.log('attempting to play sounds: ', indices);
  if (loadedBuffers) {
      playBuffers((indices));
  }
}

// set the volume
function setVolume(volume) {
  // Assuming volume is a value between 0 and 1
  console.log('set volume');
  gainNode.gain.value = volume;
}

//read the bpm
$(document).ready(function(){
  bpmValue = $('#bpm').val();
  totalDuration = (60 / bpmValue) * stepsAmount
  $('#bpm').on('input', function() {
    bpmValue = $(this).val();
    totalDuration = (60 / bpmValue) * stepsAmount;
  });
  setVolume(0.5);
});

// step selection
$('.drum .step').click(function(){
  $(this).toggleClass("armed");
});

// volume change
$( "#volume-slider").slider({
  value: 50,
  slide: function( event, ui ) {
    var fraction = parseInt(ui.value) / 100;
    console.log('setting the volume to: ', fraction);
    setVolume(fraction);
  }
});

// upload file
$(document).ready(function(){
  $('#kick-file').on('change', function() {
    var fileInput = $(this)[0];
    if (fileInput.files && fileInput.files[0]) {
      var file = fileInput.files[0];
      processAudioFile(file, 0);
    }
  });
  $('#snare-file').on('change', function() {
    var fileInput = $(this)[0];
    if (fileInput.files && fileInput.files[0]) {
      var file = fileInput.files[0];
      processAudioFile(file, 1);
    }
  });
  $('#hihat-file').on('change', function() {
    var fileInput = $(this)[0];
    if (fileInput.files && fileInput.files[0]) {
      var file = fileInput.files[0];
      processAudioFile(file, 2);
    }
  });
  $('#crash-file').on('change', function() {
    var fileInput = $(this)[0];
    if (fileInput.files && fileInput.files[0]) {
      var file = fileInput.files[0];
      processAudioFile(file, 3);
    }
  });
});

function processAudioFile(file, index) {
  var reader = new FileReader();
  reader.onload = function(event) {
      var arrayBuffer = event.target.result;
      audioContext.decodeAudioData(arrayBuffer)
          .then(function(buffer) {
              loadedBuffers[index] = buffer;
              console.log('Audio file processed and added to buffer.');
          })
          .catch(function(error) {
              console.error('Audio decoding error:', error);
          });
  };
  reader.readAsArrayBuffer(file);
}

// play / pause
$(document).ready(function(){
  document.getElementById('play-button').addEventListener('click', function() {
    // reset play button
    var play_html = "<i class='fa fa-play'></i> Play";
    var stop_html = "<i class='fa fa-stop'></i> Stop";
    if ($('#play-button').hasClass('active')) {
      // reset play button
      $('#play-button').html(play_html);
      // reset drum machine
      var elementsWithActiveClass = $('.active');
        elementsWithActiveClass.each(function(){
          $(this).removeClass('active');
        });
      counter = 0;
      steps = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
      if (timerId) {
        clearInterval(timerId);
        $('#play-button').removeClass('active');
      }
    }
    else {
      // reset play button
      $('#play-button').html(stop_html);
      $('#play-button').addClass('active');
      timerId = setInterval(function() {
        // if counter is bigger than 0, then clear the previous step
        if (counter > 0) {
          steps[counter-1] = false;
          var previousElementsWithActiveClass = $('.' + (counter-1));
          previousElementsWithActiveClass.each(function(){
            $(this).removeClass('active');
          });
        }
        // then, set the current step to true
        steps[counter] = true;
        var elementsWithActiveClass = $('.' + counter);
        elementsWithActiveClass.each(function(){
          $(this).addClass('active');
          // create the playing buffer
          if ($(this).hasClass('armed')) {
            // kick
            if ($(this).parent('.kick').length > 0) {
              stepBuffer.push(0);
            }
            else if ($(this).parent('.snare').length > 0) {
              stepBuffer.push(1);
            }
            else if ($(this).parent('.hihat').length > 0) {
              stepBuffer.push(2);
            }
            else if ($(this).parent('.crash').length > 0) {
              stepBuffer.push(3);
            }
          }
        });

        // play sounds
        playSounds(stepBuffer)

        // reset playing buffer
        stepBuffer = [];

        // if the counter is still below 15, then increase
        if (counter < 15) {
          counter++;
        }
        // if it reached the end, clear the last step
        else {
          steps[15] = false;
          var previousElementsWithActiveClass = $('.15');
          previousElementsWithActiveClass.each(function(){
            $(this).removeClass('active');
          });
          // and set the counter to 0
          counter = 0;
        }
      }, ((totalDuration * 1000) / stepsAmount / 2));
    }
  });
});
