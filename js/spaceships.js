// Fig. 14.27 cannon.js
// Logic of the Cannon Game
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var TARGET_ROWS = 4; // sections in the target
var TARGET_COLUMNS = 5; // sections in the target
// var TARGET_PIECES = 7; // sections in the target
var MISS_PENALTY = 2; // seconds deducted on a miss
var HIT_REWARD = 3; // seconds added on a hit
var TIME_INTERVAL = 25; // screen refresh interval in milliseconds

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timerCount; // number of times the timer fired since the last second
var timeLeft; // the amount of time left in seconds
var shotsFired; // the number of shots the user has fired
var timeElapsed; // the number of seconds elapsed

var target; // start and end points of the target
var targetDistance; // target distance from left
var targetBeginning; // target distance from top
var targetEnd; // target bottom's distance from top
var pieceLength; // length of a target piece
var initialTargetVelocity; // initial target speed multiplier
var targetVelocity; // target speed multiplier during game

var lineWidth; // width of the target and blocker
var hitStates; // is each target piece hit?
var targetPiecesHit; // number of target pieces hit (out of 7)

// variables for the cannon and cannonball
var cannonball; // cannonball image's upper-left corner
var cannonballVelocity; // cannonball's velocity
var cannonballOnScreen; // is the cannonball on the screen
var cannonballRadius; // cannonball radius
var cannonballSpeed; // cannonball speed
var cannonBaseRadius; // cannon base radius
var cannonLength; // cannon barrel length
var barrelEnd; // the end point of the cannon's barrel
var canvasWidth; // width of the canvas
var canvasHeight; // height of the canvas

// variables for sounds
var targetSound;
var cannonSound;

var users;

var keysDown; // Handle keyboard controls
var bgImage;
var heroImage;
var enemyImage;
var shotImage;
var hero;
var shot;
// var enemy;

// called when the app first launches
function setupGame() {
   users = { "p": "testuser" }

   // stop timer if document unload event occurs
   document.addEventListener("unload", stopTimer, false);

   // get the canvas, its context and setup its click event handler
   canvas = document.getElementById("theCanvas");
   context = canvas.getContext("2d");

   // start a new game when user clicks Start Game button
   document.getElementById("startButton").addEventListener(
      "click", newGame, false);

   // JavaScript Object representing game items
   target = new Object(); // object representing target line
   target.start = new Object(); // will hold x-y coords of line start
   target.end = new Object(); // will hold x-y coords of line end
   cannonball = new Object(); // object representing cannonball point
   barrelEnd = new Object(); // object representing end of cannon barrel

   // Background image

   bgImage = new Image();
   bgImage.src = "images/background.png";


   // Hero image

   heroImage = new Image();
   heroImage.src = "images/hero.png";

   // Enemy image

   enemyImage = new Image();
   enemyImage.src = "images/enemy.png";

   shotImage = new Image();
   shotImage.src = "images/shot.jpg";

   // Game objects
   hero = { speed: 256 }; // movement in pixels per second
   // enemy = {};
   // monstersCaught = 0;

   // Handle keyboard controls
   keysDown = {};

   // Check for keys pressed where key represents the keycode captured
   addEventListener("keydown", function (e) { keysDown[e.keyCode] = true; }, false);

   addEventListener("keyup", function (e) { delete keysDown[e.keyCode]; }, false);

   // initialize hitStates as an array
   hitStates = new Array(TARGET_ROWS);
   for (var i = 0; i < TARGET_COLUMNS; i++)
      hitStates[i] = new Array(TARGET_COLUMNS);

   // get sounds
   targetSound = document.getElementById("targetSound");
   cannonSound = document.getElementById("cannonSound");
} // end function setupGame

// set up interval timer to update game
function startTimer() {
   canvas.addEventListener("click", fireCannonball, false);
   intervalTimer = window.setInterval(updatePositions, TIME_INTERVAL);
} // end function startTimer

// terminate interval timer
function stopTimer() {
   canvas.removeEventListener("click", fireCannonball, false);
   window.clearInterval(intervalTimer);
} // end function stopTimer

// called by function newGame to scale the size of the game elements
// relative to the size of the canvas before the game begins
function resetElements() {
   var w = canvas.width;
   var h = canvas.height;
   canvasWidth = w; // store the width
   canvasHeight = h; // store the height
   cannonBaseRadius = h / 18; // cannon base radius 1/18 canvas height
   cannonLength = w / 8; // cannon length 1/8 canvas width

   cannonballRadius = w / 36; // cannonball radius 1/36 canvas width
   cannonballSpeed = w * 3 / 2; // cannonball speed multiplier

   lineWidth = w / 24; // target and blocker 1/24 canvas width

   // configure instance variables related to the target
   targetDistance = w * 7 / 8; // target 7/8 canvas width from left
   targetBeginning = h / 8; // distance from top 1/8 canvas height
   targetEnd = h * 7 / 8; // distance from top 7/8 canvas height
   pieceLength = (targetEnd - targetBeginning) / TARGET_PIECES;
   initialTargetVelocity = -h / 4; // initial target speed multiplier
   target.start.x = targetDistance;
   target.start.y = targetBeginning;
   target.end.x = targetDistance;
   target.end.y = targetEnd;

   // end point of the cannon's barrel initially points horizontally
   barrelEnd.x = cannonLength;
   barrelEnd.y = h / 2;
} // end function resetElements

// reset all the screen elements and start a new game
function newGame() {
   resetElements(); // reinitialize all game elements
   stopTimer(); // terminate previous interval timer

   // set every element of hitStates to false--restores target pieces
   for (var i = 0; i < TARGET_ROWS; ++i)
      for (var j = 0; j < TARGET_COLUMNS; ++j)
         hitStates[i][j] = false; // target piece not destroyed

   targetPiecesHit = 0; // no target pieces have been hit
   targetVelocity = initialTargetVelocity; // set initial velocity
   timeLeft = 10; // start the countdown at 10 seconds
   timerCount = 0; // the timer has fired 0 times so far
   cannonballOnScreen = false; // the cannonball is not on the screen
   shotsFired = 0; // set the initial number of shots fired
   timeElapsed = 0; // set the time elapsed to zero

   startTimer(); // starts the game loop
} // end function newGame

// called every TIME_INTERVAL milliseconds
function updatePositions() {
   // update the target's position
   var targetUpdate = TIME_INTERVAL / 1000.0 * targetVelocity;
   target.start.x += targetUpdate;
   target.end.x += targetUpdate;

   // if the target hit the walls, reverse direction
   if (target.start.x < 0 || target.end.x > canvasWidth)
      targetVelocity *= -1;

   if (cannonballOnScreen) // if there is currently a shot fired
   {
      // update cannonball position
      var interval = TIME_INTERVAL / 1000.0;

      cannonball.y += interval * cannonballVelocityY;

      // check for collisions with top and bottom walls
      if (cannonball.y + cannonballRadius > canvasHeight) {
         cannonballOnScreen = false; // make the cannonball disappear
      } // end else if
      // check for cannonball collision with target
      else if (cannonballVelocityY > 0 &&
         cannonball.x + cannonballRadius >= targetDistance &&
         cannonball.x + cannonballRadius <= targetDistance + lineWidth &&
         cannonball.y - cannonballRadius > target.start.y &&
         cannonball.y + cannonballRadius < target.end.y) {
         // determine target section number (0 is the top)
         var section =
            Math.floor((cannonball.y - target.start.y) / pieceLength);

         // check whether the piece hasn't been hit yet
         if ((section >= 0 && section < TARGET_PIECES) &&
            !hitStates[section]) {
            targetSound.play(); // play target hit sound
            hitStates[section] = true; // section was hit
            cannonballOnScreen = false; // remove cannonball
            timeLeft += HIT_REWARD; // add reward to remaining time

            // if all pieces have been hit
            if (++targetPiecesHit == TARGET_PIECES) {
               stopTimer(); // game over so stop the interval timer
               draw(); // draw the game pieces one final time
               showGameOverDialog("You Won!"); // show winning dialog
            } // end if
         } // end if
      } // end else if
   } // end if

   ++timerCount; // increment the timer event counter

   // if one second has passed
   if (TIME_INTERVAL * timerCount >= 1000) {
      --timeLeft; // decrement the timer
      ++timeElapsed; // increment the time elapsed
      timerCount = 0; // reset the count
   } // end if

   draw(); // draw all elements at updated positions

   // if the timer reached zero
   if (timeLeft <= 0) {
      stopTimer();
      showGameOverDialog("You lost"); // show the losing dialog
   } // end if
} // end function updatePositions

// fires a cannonball
function fireCannonball(event) {
   if (cannonballOnScreen) // if a cannonball is already on the screen
      return; // do nothing

   // move the cannonball to be inside the cannon
   cannonball.x = hero.x; // align x-coordinate with cannon
   cannonball.y = hero.y; // centers ball vertically

   // get the x component of the total velocity
   cannonballVelocityX = 0;

   // get the y component of the total velocity
   cannonballVelocityY = cannonballSpeed;
   cannonballOnScreen = true; // the cannonball is on the screen
   ++shotsFired; // increment shotsFired

   // play cannon fired sound
   cannonSound.play();
} // end function fireCannonball


// draws the game elements to the given Canvas
function draw() {
   canvas.width = canvas.width; // clears the canvas (from W3C docs)

   // display time remaining
   context.fillStyle = "black";
   context.font = "bold 24px serif";
   context.textBaseline = "top";
   context.fillText("Time remaining: " + timeLeft, 5, 5);

   // if a cannonball is currently on the screen, draw it
   if (cannonballOnScreen) {
      ctx.drawImage(shotImage, shot.x, shot.y); // draw the hero
   } // end if

   ctx.drawImage(heroImage, hero.x, hero.y); // draw the hero

   // initialize currentPoint to the starting point of the target
   var currentPoint = new Object();
   currentPoint.y = target.start.y;

   // draw the target
   for (var i = 0; i < TARGET_ROWS; ++i) {
      currentPoint.x = target.start.x;
      for (var j = 0; j < TARGET_COLUMNS; ++j) {
         if (!hitStates[i][j]) {
            ctx.drawImage(enemyImage, currentPoint.x, currentPoint.y);
         }
         currentPoint.x += pieceWidth;
      }
      // move currentPoint to the start of the next piece
      currentPoint.y += pieceLength;
   } // end for
} // end function draw

// display an alert when the game ends
function showGameOverDialog(message) {
   alert(message + "\nShots fired: " + shotsFired +
      "\nTotal time: " + timeElapsed + " seconds ");
} // end function showGameOverDialog

window.addEventListener("load", setupGame, false);
