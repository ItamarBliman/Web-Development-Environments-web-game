
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var TARGET_ROWS = 4; // sections in the target
var TARGET_COLUMNS = 5; // sections in the target
var TARGET_PIECES = TARGET_ROWS * TARGET_COLUMNS; // sections in the target
var HIT_REWARD = 3; // seconds added on a hit
var TIME_INTERVAL = 25; // screen refresh interval in milliseconds
var interval = TIME_INTERVAL / 1000.0;

// variables for the game loop and tracking statistics
var intervalTimer; // holds interval timer
var timerCount; // number of times the timer fired since the last second
var timeLeft; // the amount of time left in seconds
var timeElapsed; // the number of seconds elapsed

var target; // start and end points of the target
var targetBeginningX; // target distance from left
var targetEndX; // target distance from left
var targetBeginningY; // target distance from top
var targetEndY; // target bottom's distance from top
var pieceLength; // length of a target piece
var pieceWidth; // width of a target piece
var targetVelocity; // target speed multiplier during game

var hitStates; // is each target piece hit?
var targetPiecesHit; // number of target pieces hit (out of 20)

// variables for the shot
var shotVelocity; // shot's velocity
var shotOnScreen; // is the cannonball on the screen
var canvasWidth; // width of the canvas
var canvasHeight; // height of the canvas

// variables for sounds
var targetSound;
var shotSound;

var users;

var keysDown; // Handle keyboard controls
var bgImage;
var heroImage;
var enemyImage;
var shotImage;
var hero;
var shot;
var enemyShots;

// called when the app first launches
function setupGame() {
   users = { "p": "testuser" };

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

   canvasWidth = canvas.width; // store the width
   canvasHeight = canvas.height; // store the height

   // Background image
   bgImage = new Image();
   bgImage.src = "images/background.png";

   // Hero image
   heroImage = new Image();
   heroImage.src = "images/hero.png";

   // Enemy image
   enemyImage = new Image();
   enemyImage.src = "images/enemy.png";

   // Shot image
   shotImage = new Image();
   shotImage.src = "images/shot.jpg";

   // Game objects
   hero = { speed: 256 }; // movement in pixels per second
   shot = { speed: 256 }; // movement in pixels per second
   target.speed = 256; // movement in pixels per second

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
   shotSound = document.getElementById("shotSound");
} // end function setupGame

// set up interval timer to update game
function startTimer() {
   canvas.addEventListener("click", fireShot, false);
   intervalTimer = window.setInterval(updatePositions, TIME_INTERVAL);
} // end function startTimer

// terminate interval timer
function stopTimer() {
   canvas.removeEventListener("click", fireShot, false);
   window.clearInterval(intervalTimer);
} // end function stopTimer

// called by function newGame to scale the size of the game elements
// relative to the size of the canvas before the game begins
function resetElements() {

   shotImageRadius = shotImage.height / 2; 
   shotSpeed = canvasWidth * 3 / 2; 

   // configure instance variables related to the target
   targetBeginningX = canvasWidth * 1 / 4; // target 7/8 canvas width from left
   targetEndX = canvasWidth * 3 / 4; // target 7/8 canvas width from left
   targetBeginningY = canvasHeight / 8; // distance from top 1/8 canvas height
   targetEndY = canvasHeight * 1 / 2; // distance from top 7/8 canvas height
   pieceLength = (targetEndY - targetBeginningY) / TARGET_ROWS;
   pieceWidth = (targetEndX - targetBeginningX) / TARGET_COLUMNS;
   target.start.x = targetBeginningX;
   target.start.y = targetBeginningY;
   target.end.x = targetEndX;
   target.end.y = targetEndY;
   hero.x = canvasWidth / 2;
   hero.y = canvasHeight - heroImage.height * 2;
   enemyShots = [];



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
   targetVelocity = target.speed; // set initial velocity
   timeLeft = 120; // start the countdown at 120 seconds
   timerCount = 0; // the timer has fired 0 times so far
   shotOnScreen = false; // the shot is not on the screen
   timeElapsed = 0; // set the time elapsed to zero

   startTimer(); // starts the game loop
} // end function newGame

// called every TIME_INTERVAL milliseconds
function updatePositions() {

   if ((38 in keysDown)) { // Player holding up
      if (hero.y > canvasHeight * 0.6)
         hero.y -= hero.speed * interval;
   }
   if ((40 in keysDown)) { // Player holding down
      if (hero.y < canvasHeight - heroImage.height)
         hero.y += hero.speed * interval;
   }
   if (37 in keysDown) { // Player holding left
      if (hero.x > heroImage.width)
         hero.x -= hero.speed * interval;
   }
   if (39 in keysDown) { // Player holding right
      if (hero.x < canvasWidth - heroImage.width)
         hero.x += hero.speed * interval;
   }


   // update the target's position
   var targetUpdate = TIME_INTERVAL / 1000.0 * targetVelocity;
   target.start.x += targetUpdate;
   target.end.x += targetUpdate;

   // if the target hit the walls, reverse direction
   if (target.start.x < 0 || target.end.x > canvasWidth)
      targetVelocity *= -1;

   if (shotOnScreen) // if there is currently a shot fired
   {
      // update shot position
      shot.y -= interval * shotVelocity;

      // check for collisions with top walls
      if (shot.y <= 0) {
         shotOnScreen = false; // make the shot disappear
      } // end else if

      // check for shot collision with target
      else if (shotVelocity > 0 &&
         shot.y + shotImageRadius >= target.start.y &&
         shot.y - shotImageRadius <= target.end.y &&
         shot.x + shotImageRadius >= target.start.x &&
         shot.x - shotImageRadius <= target.end.x) {
         // determine target section number (0 is the top)
         var sectionX =
            Math.floor((shot.x - target.start.x) / pieceWidth);
         var sectionY =
            Math.floor((shot.y - target.start.y) / pieceLength);

         // check whether the piece hasn't been hit yet
         if ((sectionX >= 0 && sectionX < TARGET_COLUMNS) && (sectionY >= 0 && sectionY < TARGET_ROWS) &&
            !hitStates[sectionY][sectionX]) {
            targetSound.play(); // play target hit sound
            hitStates[sectionY][sectionX] = true; // section was hit
            shotOnScreen = false; // remove shot
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

   shootingEnemy();

   draw(); // draw all elements at updated positions

   // if the timer reached zero
   if (timeLeft <= 0) {
      stopTimer();
      showGameOverDialog("You lost"); // show the losing dialog
   } // end if
} // end function updatePositions

function shootingEnemy(){
   if ((enemyShots.size() >= 2) || (enemyShots.size() == 1 && enemyShots.peek().y < canvasHeight * 3/4 ))
      return;
   let randomRow = Math.floor(Math.random() * (TARGET_ROWS - 1));
   let randomCol = Math.floor(Math.random() * (TARGET_COLUMNS - 1));
   for (randomRow, )

}

// fires a shot
function fireShot(event) {

   if (shotOnScreen) // if a shot is already on the screen
      return; // do nothing

   // move the shot to be inside the hero
   shot.x = hero.x; // align x-coordinate with hero
   shot.y = hero.y; // centers shot vertically


   // get the y component of the total velocity
   shotVelocity = shot.speed;
   shotOnScreen = true; // the shot is on the screen

   // play shot fired sound
   shotSound.play();
} // end function fireShot


// draws the game elements to the given Canvas
function draw() {
   canvas.width = canvas.width; // clears the canvas (from W3C docs)

   // display time remaining
   context.fillStyle = "black";
   context.font = "bold 24px serif";
   context.textBaseline = "top";
   context.fillText("Time remaining: " + timeLeft, 5, 5);

   // if a shot is currently on the screen, draw it
   if (shotOnScreen) {
      context.drawImage(heroImage, shot.x, shot.y); // draw the shot
   } // end if

   context.drawImage(heroImage, hero.x, hero.y); // draw the hero

   // initialize currentPoint to the starting point of the target
   var currentPoint = new Object();
   currentPoint.y = target.start.y;

   // draw the target
   for (var i = 0; i < TARGET_ROWS; ++i) {
      currentPoint.x = target.start.x;
      for (var j = 0; j < TARGET_COLUMNS; ++j) {
         if (!hitStates[i][j]) {
            context.drawImage(enemyImage, currentPoint.x, currentPoint.y);
         }
         currentPoint.x += pieceWidth;
      }
      // move currentPoint to the start of the next piece
      currentPoint.y += pieceLength;
   } // end for
} // end function draw

// display an alert when the game ends
function showGameOverDialog(message) {
   alert(message +
      "\nTotal time: " + timeElapsed + " seconds ");
} // end function showGameOverDialog

window.addEventListener("load", setupGame, false);
