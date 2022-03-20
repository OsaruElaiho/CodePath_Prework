// Global Constants
const cluePauseTime = 333; // how long to pause in between clues
const nextClueWaitTime = 500; // how long to wait before starting playback of the clue sequence
// additional constants


// Global Variables
var pattern = [];
var clueHoldTime = 1000; // how long to hold each clue's light/sound
var strike = 0;
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;  // must be between 0.0 and 1.0
var guessCounter = 0;

function startGame(){
  // initialize game variables
  randomPattern(); // optional: generate random secret pattern
  progress = 0;
  strike = 0;
  gamePlaying = true;
  
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame(){
  // set gamePlaying to false --> game over
  gamePlaying = false;
  
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  pattern = []; // "empty" contents of secret pattern array 
  clueHoldTime = 1000; // reset how long to hold each clue's light/sound
}

// function responsible for populate pattern array with random
// button #1<-->#6 (inclusive)
function randomPattern(){
  // populate pattern array with random button #1<-->#6 inclusive
  var min = 1;
  var max = 6;
  for(let i=0;i<max;i++){ 
    var randomButton = Math.floor(Math.random() * (max - min + 1) + min)
    pattern.push(randomButton);
  }
  console.log("Pattern length is --> " + pattern.length);
}

// Sound Synthesis Functions
const freqMap = {
  1: 523, // "C"
  2: 587, // "D"
  3: 659, // "E"
  4: 698, // "F"
  // optional: edit freqMap to include pitch frequencies for the new buttons
  5: 784, // "G"
  6: 880 // "A"
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

// functions responsible for lighting or clearing a button
function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

// function responsible for playing a single clue
function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

// function responsible for playing the correct sequence of clues
function playClueSequence(){
  guessCounter = 0;
  let delay = nextClueWaitTime; // set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
    // optional: Speed up the clue playback on each turn
    clueHoldTime -= (clueHoldTime * (1/7));
  }
}

// function responsible for checking each guess
function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  // is guess correct?
  if(pattern[guessCounter] == btn){
    // correct guess --> is turn over?
    if(guessCounter == progress){
      // turn is over --> is this the last turn?
      if(progress == pattern.length - 1){
        winGame(); // game over --> user won :)
      }else{
        // this is not the last turn -->
        progress++; // increment progress
        playClueSequence(); // play next clue sequence
      }
    }else{
      guessCounter++; // wrong guess --> increment guessCounter
    }
  }else{
    // wrong guess --> check strike count
    if(strike < 2){
      strike++; // update strike count
      playClueSequence(); // play clue sequence again
    }else{
      loseGame(); // 3 strikes, game over --> user lost :(
    }
  }
}

// function responsible for handling if the user loses the game
function loseGame(){
  stopGame();
  alert("Game Over!!! You lost :(");
}

// function responsible for handling if the user wins the game
function winGame(){
  stopGame();
  alert("Congrats!!! You won :)");
}