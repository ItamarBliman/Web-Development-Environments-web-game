
var canvas; // the canvas
var context; // used for drawing on the canvas

// constants for game play
var TARGET_ROWS = 4; // number of rows in the target
var TARGET_COLUMNS = 5; // number of columns in the target
var TARGET_PIECES = TARGET_ROWS * TARGET_COLUMNS; // total number of target pieces
var TIME_INTERVAL = 25; // screen refresh interval in milliseconds
var interval = TIME_INTERVAL / 1000.0; // screen refresh interval in seconds
var Strikes; // number of strikes
var points = 5; // number of points
var score; // score

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
var heroVelocity; // hero speed multiplier during game
var defaultSpeed = 200; // default speed multiplier
var maxTimesVelocity; // maximum number of times to increase velocity
var velocityIncrement = 40; // amount to increase velocity each time
var heroHeight; // hero height
var heroWidth; // hero width
var shotHeight; // shot height
var shotWidth; // shot height

var hitStates; // is each target piece hit?
var targetPiecesHit; // number of target pieces hit (out of 20)

// variables for the shot
var heroShotVelocity; // shot's velocity
// var shotOnScreen; // is the cannonball on the screen
var shotsOfHero; // is the cannonball on the screen

// variables for sounds
var targetSound;
var shotSound;
var heroSound;
var themeSound;
var victorySound;
var defeatSound;

var keysDown; // Handle keyboard controls
var bgImage;
var heroImage;
var enemyImage;
var shotImage;
var hero;
var shot;
var enemyShots;
var enemyShotVelocity;

// called when the app first launches
function setupGame() {

   // stop timer if document unload event occurs
   document.addEventListener("unload", stopTimer, false);

   // get the canvas, its context and setup its click event handler
   canvas = document.getElementById("theCanvas");
   context = canvas.getContext("2d");

   // start a new game when user clicks Start Game button
   // document.getElementById("startButton").addEventListener(
   //    "click", newGame, false);

   // JavaScript Object representing game items
   target = new Object(); // object representing target line
   target.start = new Object(); // will hold x-y coords of line start
   target.end = new Object(); // will hold x-y coords of line end
   hero = new Object(); // object representing hero

   // Hero image
   heroImage = new Image();

   // Enemy image
   enemys = [];
   for (var i = 0; i < 4; i++) {
      enemys[i] = new Image();
      enemys[i].src = `images/enemy${i}.png`;
   }

   // Shot image
   shotImage = new Image();
   shotImage.src = "images/shot.png";

   // Enemy Shot image
   enemyShotImage = new Image();
   enemyShotImage.src = "images/enemyshot.png";

   // initialize hitStates as an array
   hitStates = new Array(TARGET_ROWS);
   for (var i = 0; i < TARGET_COLUMNS; i++)
      hitStates[i] = new Array(TARGET_COLUMNS);

   // get sounds
   targetSound = document.getElementById("targetSound");
   heroSound = document.getElementById("heroSound");
   shotSound = document.getElementById("shotSound");
   themeSound = document.getElementById("themeSound");
   victorySound = document.getElementById("victorySound");
   defeatSound = document.getElementById("defeatSound");
} // end function setupGame

// set up interval timer to update game
function startTimer() {
   // canvas.addEventListener("keypress", fireShot, false);
   addEventListener("keypress", fireShot, false);
   intervalTimer = window.setInterval(updatePositions, TIME_INTERVAL);
   // Check for keys pressed where key represents the keycode captured
   addEventListener("keydown", addkey, false);
   addEventListener("keyup", removekey, false);
} // end function startTimer

// terminate interval timer
function stopTimer() {
   // canvas.removeEventListener("keypress", fireShot, false);
   removeEventListener("keypress", fireShot, false);
   window.clearInterval(intervalTimer);
   if (!themeSound.paused) {
      themeSound.pause();
      themeSound.currentTime = 0;
   }
   removeEventListener("keydown", addkey, false);
   removeEventListener("keyup", removekey, false);

} // end function stopTimer

// called by function newGame to scale the size of the game elements
// relative to the size of the canvas before the game begins
function resetElements() {
   shotSpeed = canvas.width * 3 / 2;
   shotWidth = canvas.width * 1 / 34;
   shotHeight = canvas.height * 1 / 12;

   // configure instance variables related to the target
   targetBeginningX = canvas.width * 3 / 10; // target 7/8 canvas width from left
   targetEndX = canvas.width * 8 / 10; // target 7/8 canvas width from left
   targetBeginningY = canvas.height / 18; // distance from top 1/8 canvas height
   targetEndY = canvas.height * 1 / 2; // distance from top 7/8 canvas height
   pieceLength = (targetEndY - targetBeginningY) / TARGET_ROWS;
   pieceWidth = (targetEndX - targetBeginningX) / TARGET_COLUMNS;
   target.start.x = targetBeginningX;
   target.start.y = targetBeginningY;
   target.end.x = targetEndX;
   target.end.y = targetEndY;
   hero.x = canvas.width / 2;
   hero.y = canvas.height - heroHeight * 1.1;
} // end function resetElements

// reset all the screen elements and start a new game
function newGame() {
   heroWidth = canvas.width / 16;
   heroHeight = canvas.height / 8;
   $('#inGame').toggle(true);
   resetElements(); // reinitialize all game elements
   stopTimer(); // terminate previous interval timer

   // Handle keyboard controls
   keysDown = {};

   // set every element of hitStates to false--restores target pieces
   for (var i = 0; i < TARGET_ROWS; ++i)
      for (var j = 0; j < TARGET_COLUMNS; ++j)
         hitStates[i][j] = false; // target piece not destroyed

   targetPiecesHit = 0; // no target pieces have been hit
   targetVelocity = parseInt($('input[name="drone"]:checked').val()); // set initial velocity
   veloctiyIncrementLevel = 0; // velocity has not been increased
   if (timetoPlay.value < 120)
      timeLeft = 120; // start the countdown at 120 seconds
   else
      timeLeft = timetoPlay.value; // start the countdown at 120 seconds

   timerCount = 0; // the timer has fired 0 times so far
   // shotOnScreen = false; // the shot is not on the screen
   shotsOfHero = []; // the hero has not fired any shots
   enemyShots = []; // the enemy has not fired any shots
   timeElapsed = 0; // set the time elapsed to zero
   Strikes = 3; // number of strikes before game over
   score = 0; // set the score to zero
   maxTimesVelocity = 4; // maximum number of times velocity can be increased
   heroShotVelocity = defaultSpeed; // set initial velocity
   enemyShotVelocity = parseInt($('input[name="drone"]:checked').val()); // set initial velocity
   heroImage.src = $('input[name="heroPlayer"]:checked').val();
   heroVelocity = defaultSpeed; // set initial velocity
   themeSound.volume = soundObject.value; // set the volume of the theme music
   targetSound.volume = soundObject.value;
   shotSound.volume = soundObject.value;
   heroSound.volume = soundObject.value;
   victorySound.volume = soundObject.value;
   defeatSound.volume = soundObject.value;

   // Handle keyboard controls
   keysDown = {};

   startTimer(); // starts the game loop
   themeSound.play(); // play the theme music
   themeSound.loop = true; // loop the theme music
} // end function newGame

// called every TIME_INTERVAL milliseconds
function updatePositions() {
   heroWidth = canvas.width / 16;
   heroHeight = canvas.height / 8;
   pieceLength = (canvas.height * 4 / 9) / TARGET_ROWS;
   pieceWidth = (canvas.width * 0.5) / TARGET_COLUMNS;
   shotWidth = canvas.width * 1 / 34;
   shotHeight = canvas.height * 1 / 12;

   if ((38 in keysDown)) { // Player holding up
      if (hero.y > canvas.height * 0.6)
         hero.y -= heroVelocity * interval;
   }
   if ((40 in keysDown)) { // Player holding down
      if (hero.y < canvas.height - heroHeight)
         hero.y += heroVelocity * interval;
   }
   if (37 in keysDown) { // Player holding left
      if (hero.x > 0)
         hero.x -= heroVelocity * interval;
   }
   if (39 in keysDown) { // Player holding right
      if (hero.x < canvas.width - heroWidth)
         hero.x += heroVelocity * interval;
   }


   // update the target's position
   var targetUpdate = TIME_INTERVAL / 1000.0 * targetVelocity;
   target.start.x += targetUpdate;
   target.end.x += targetUpdate;

   // if the target hit the walls, reverse direction
   if (target.start.x < 0 || target.end.x > canvas.width)
      targetVelocity *= -1;

   if (shotsOfHero.length > 0) {
      if (shotsOfHero[0].y <= 0) //check for collisions with bottom walls
         shotsOfHero.shift();
      for (var i = 0; i < shotsOfHero.length; i++) {
         // update shot position
         shotsOfHero[i].y -= interval * heroShotVelocity;

         // check for shot collision with target
         if (heroShotVelocity > 0 &&
            shotsOfHero[i].y + shotHeight >= target.start.y &&
            shotsOfHero[i].y - shotHeight <= target.end.y &&
            shotsOfHero[i].x + shotWidth >= target.start.x &&
            shotsOfHero[i].x - shotWidth <= target.end.x) {
            // determine target section number (0 is the top)
            var sectionX =
               Math.floor((shotsOfHero[i].x - target.start.x) / pieceWidth);
            var sectionY =
               Math.floor((shotsOfHero[i].y - target.start.y) / pieceLength);

            // check whether the piece hasn't been hit yet
            if ((sectionX >= 0 && sectionX < TARGET_COLUMNS) && (sectionY >= 0 && sectionY < TARGET_ROWS) &&
               !hitStates[sectionY][sectionX]) {
               heroSound.play(); // play target hit sound
               hitStates[sectionY][sectionX] = true; // section was hit
               shotsOfHero.splice(i, 1); // remove
               i--;
               // shotOnScreen = false; // remove shot

               score += (TARGET_ROWS - sectionY) * points;

               // if all pieces have been hit
               if (++targetPiecesHit == TARGET_PIECES) {
                  draw(); // draw the game pieces one final time
                  victorySound.play(); // play the victory sound
                  gameOver("Champion!");
               } // end if
            } // end if
         } // end else if
      } // end if
   }

   // update enemy shots position
   if (enemyShots.length > 0) {
      if (enemyShots[0].y > canvas.height) //check for collisions with bottom walls
         enemyShots.shift();

      for (var i = 0; i < enemyShots.length; i++) {
         enemyShots[i].y += interval * enemyShotVelocity;

         // check for enemy shot collision witßh hero
         if (
            Math.abs(enemyShots[i].y - hero.y) <= shotHeight &&
            Math.abs(enemyShots[i].x - hero.x) <= shotWidth) {

            targetSound.play(); // play target hit sound
            Strikes--;
            if (Strikes == 0) {
               defeatSound.play(); // play the defeat sound
               gameOver("You Lost!");
            }
            hero.x = canvas.width / 2;
            hero.y = canvas.height - heroHeight * 1.1;
            enemyShots = [];
            // shotOnScreen = false;
            shotsOfHero = [];

         }
      }
   }

   ++timerCount; // increment the timer event counter

   // if one second has passed
   if (TIME_INTERVAL * timerCount >= 1000) {
      --timeLeft; // decrement the timer
      ++timeElapsed; // increment the time elapsed
      timerCount = 0; // reset the count
      if (timeElapsed % 5 == 0 && 0 < maxTimesVelocity) {
         if (targetVelocity < 0)
            targetVelocity -= velocityIncrement;
         else
            targetVelocity += velocityIncrement;

         heroShotVelocity += velocityIncrement;
         enemyShotVelocity += velocityIncrement;
         // heroVelocity += velocityIncrement;
         maxTimesVelocity--;
      } // end if
   }


   shootingEnemy();
   draw(); // draw all elements at updated positions

   // if the timer reached zero
   if (timeLeft <= 0) {
      if (score < 100) {
         defeatSound.play(); // play the defeat sound
         gameOver("you can do better, you only got " + score + " points");
      }
      else {
         victorySound.play(); // play the victory sound
         gameOver("Winner!!");
      }
   } // end if
} // end function updatePositions

function shootingEnemy() {
   if ((enemyShots.length >= 2) || (enemyShots.length == 1 && enemyShots[0].y + shotHeight < canvas.height * 3 / 4))
      return;
   let oneShot = new Object();
   let randomRow = Math.floor(Math.random() * (TARGET_ROWS - 1));
   let randomCol = Math.floor(Math.random() * (TARGET_COLUMNS - 1));
   for (let i = randomRow; i < TARGET_ROWS && !oneShot.x; i++) {
      for (let j = randomCol; j < TARGET_COLUMNS; j++) {
         if (hitStates[i][j] == false) {
            oneShot.x = target.start.x + j * pieceWidth + pieceWidth / 2;
            oneShot.y = target.start.y + i * pieceLength + pieceLength / 2;
            break;
         }
      }
   }
   if (!oneShot.x) {
      for (let i = 0; i < randomRow && !oneShot.x; i++) {
         for (let j = 0; j < randomCol; j++) {
            if (hitStates[i][j] == false) {
               oneShot.x = target.start.x + j * pieceWidth + pieceWidth / 2;
               oneShot.y = target.start.y + i * pieceLength + pieceLength / 2;
               break;
            }
         }
      }
   }
   if (oneShot.x)
      enemyShots.push(oneShot);

}

// fires a shot
function fireShot(event) {
   if (event.code != keyboardTextBox.value) // if the spacebar was pressed
      return; // do nothing

   event.preventDefault();

   if (shotsOfHero.length >= numberOfShotsObject.value) // if a shot is already on the screen
      return; // do nothing

   let newShot = { x: hero.x, y: hero.y };

   shotsOfHero.push(newShot);

   // play shot fired sound
   shotSound.play();
} // end function fireShot


// draws the game elements to the given Canvas
function draw() {
   canvas.width = canvas.width; // clears the canvas (from W3C docs)
   let text = "Time remaining: " + timeLeft + " sec     Strikes remaining: " + Strikes + "     Score: " + score;
   context.font = `bold ${canvas.width * 0.2}% calibri`;

   // Create a gradient for the text
   const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
   gradient.addColorStop(0, '#ff0000');
   gradient.addColorStop(0.5, '#ffff00');
   gradient.addColorStop(1, '#ff0000');

   // Set the fill style to the gradient
   context.fillStyle = gradient;

   // Set the stroke style and width
   context.strokeStyle = 'red';
   context.lineWidth = 0.5;

   // Set the text to be centered horizontally and vertically
   context.textAlign = 'center';
   context.textBaseline = 'middle';

   // Draw the text on the canvas
   context.fillText(text, canvas.width / 2, 25);
   context.strokeText(text, canvas.width / 2, 25);

   // if a shot is currently on the screen, draw it
   for (let i = 0; i < shotsOfHero.length; i++) {
      context.drawImage(shotImage, shotsOfHero[i].x, shotsOfHero[i].y, shotWidth, shotHeight); // draw the shot
   }

   // draw the enemy shots
   for (let i = 0; i < enemyShots.length; i++) {
      context.drawImage(enemyShotImage, enemyShots[i].x, enemyShots[i].y, shotWidth, shotHeight); // draw the shot
   }

   context.drawImage(heroImage, hero.x, hero.y, heroWidth, heroHeight); // draw the hero

   // initialize currentPoint to the starting point of the target
   var currentPoint = new Object();
   currentPoint.y = target.start.y;

   // draw the target
   for (var i = 0; i < TARGET_ROWS; ++i) {
      currentPoint.x = target.start.x;
      for (var j = 0; j < TARGET_COLUMNS; ++j) {
         if (!hitStates[i][j]) {
            context.drawImage(enemys[i], currentPoint.x, currentPoint.y, pieceWidth, pieceLength);
         }
         currentPoint.x += pieceWidth;
      }
      // move currentPoint to the start of the next piece
      currentPoint.y += pieceLength;
   } // end for
} // end function draw

window.addEventListener("load", setupGame, false);

function addkey(e) {
   keysDown[e.keyCode] = true;
   if (e.code != keyboardTextBox.value)
      e.preventDefault();
}

function removekey(e) {
   delete keysDown[e.keyCode];
}

function gameOver(message) {
   stopTimer();
   let cols = { rank: "Rank", user_name: "User Name", score: "Score", time: "Time" };
   let newResult = { user_name: currentUser.user_name, score: score, time: timeElapsed }
   let pMessage = document.getElementById("messageResult");
   results.push(newResult);
   results.sort((a, b) => {
      if (a.score === b.score) {
         return a.time < b.time ? -1 : 1
      } else {
         return b.score < a.score ? -1 : 1
      }
   });
   let activeRow = false;
   let toTable = `<thead><tr><td>${cols.rank}</td><td>${cols.user_name}</td><td>${cols.score}</td><td>${cols.time}</td></tr></thead>`;
   toTable += `<tbody>`;
   for (let i = 0; i < results.length; i++) {
      if (!activeRow && newResult.score == results[i].score && newResult.time == results[i].time) {
         toTable += `<tr class="active-row">`;
         activeRow = true;
      }
      else {
         toTable += `<tr>`;
      }
      toTable += `<td>${i + 1}</td><td>${results[i].user_name}</td><td>${results[i].score}</td><td>${results[i].time}</td></tr>`;
   }
   toTable += `</tbody>`;
   tableResultsObject.innerHTML = toTable;
   pMessage.innerHTML = message;
   dialogPolyfill.registerDialog(gameOverDialogObject);
   gameOverDialogObject.showModal();
}