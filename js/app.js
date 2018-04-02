const ENEMIES = 3;

const TILE_WIDTH = 101;
const TILE_HEIGHT = 171;
const MAP_WIDTH = 5;
const MAP_HEIGHT = 6;

const SCORE_TO_WIN = 10;
const PLAYER_LIVES = 3;

var mapWidthPixels = TILE_WIDTH * MAP_WIDTH;
var allEnemies = [];
var player;
var isGameOver = false;
var playerWon = false;


// Utiliy functions for entity creation
function randomEnemyRow(){
  return Math.floor(Math.random() * 3) + 1;
}

// Random starting location for bugs offscreen
// Larger number gives greater variance of bug spread
function randomXOffset(){
  return -TILE_WIDTH - (Math.random() * 300);
}

// Random tile location in the x axis
function randomXTile(){
  return Math.floor(Math.random() * MAP_WIDTH);
}

// A random speed between 0 and 100
function randomSpeed(){
  return Math.floor(Math.random() * 100);
}

// Enemies our player must avoid
var Enemy = function(xSpeed, xStartLocation, yLocation) {
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';
  this.fasterSprite = 'images/enemy-bug-faster.png';
  this.fastestSprite = 'images/enemy-bug-fastest.png';

  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  this.baseSpeed = 200;
  this.speed = xSpeed + this.baseSpeed;
  this.x = xStartLocation;
  this.row = yLocation;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += dt * this.speed;

    if(this.x >= mapWidthPixels){
      this.x = randomXOffset();
      this.row = randomEnemyRow();
      this.speed = randomSpeed() + this.baseSpeed;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, (this.row * 83) - 25);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(gridX, gridY) {
  this.sprite = 'images/char-boy.png';
  this.gridX = gridX;
  this.gridY = gridY;
  this.score = 0;
  this.lives = PLAYER_LIVES;
  this.moves = 0;
}

Player.prototype.update = function(dt){
  // Check for collisions when on stone-block tiles
  if(this.gridY > 0 && this.gridY < 4){
    let player = this;
    allEnemies.forEach(function(enemy){
      if(enemy.row === player.gridY){
        // Actual enemy collision
        if(enemy.x + 20 < (player.gridX * TILE_WIDTH) + TILE_WIDTH && enemy.x + TILE_WIDTH - 20 > player.gridX * TILE_WIDTH){
          player.lives--;
          if(player.lives == 0){
            gameOver();
          }
          player.resetPlayerPosition();
        }
      }
    });
  }

  // Score condition
  if(this.gridY == 0){
    this.score++;

    switch(this.score){
      // Add faster and fastest enemy when specific points scored
      case 3: let enemyMed = new Enemy(randomSpeed(), randomXOffset(), randomEnemyRow());
      enemyMed.baseSpeed = 300;
      enemyMed.sprite = enemyMed.fasterSprite;
      allEnemies.push(enemyMed);
        break;
      case 7: let enemyFast = new Enemy(randomSpeed(), randomXOffset(), randomEnemyRow());
      enemyFast.baseSpeed = 350;
      enemyFast.sprite = enemyFast.fastestSprite;
      allEnemies.push(enemyFast);
        break;
      case SCORE_TO_WIN: gameOver();
      break;
    }
    this.resetPlayerPosition();
  }
}

Player.prototype.render = function(){
  ctx.drawImage(Resources.get(this.sprite), this.gridX * TILE_WIDTH, (this.gridY * 83) - 35);
}

// Handle valid inputs, increment moves on success
Player.prototype.handleInput = function(e){
  if(e == 'left' && !(this.gridX - 1 < 0)) {
    this.gridX--;
  } else if(e == 'right' && !(this.gridX + 1 > MAP_WIDTH - 1)) {
    this.gridX++;
  } else if(e == 'up' && !(this.gridY - 1 < 0)) {
    this.gridY--;
  } else if(e == 'down' && !(this.gridY + 1 > MAP_HEIGHT - 1)) {
    this.gridY++;
  } else return;

  this.moves++;
}

Player.prototype.resetPlayerPosition = function(){
  this.gridX = randomXTile();
  this.gridY = MAP_HEIGHT -1;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
generateEnemies = function(){
  for(let i = 0; i < ENEMIES; i++){
    allEnemies.push(new Enemy(randomSpeed(), randomXOffset(), randomEnemyRow()));
  }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // Press any button to restart
    if(isGameOver){
      // reset game and clear modal
      resetGame();
      return;
    }

    player.handleInput(allowedKeys[e.keyCode]);
});

renderScoreBoard = function(){
  // Draw initial boxes in black

  let livesBoxX = mapWidthPixels - 220;

  ctx.fillStyle = '#000';
  ctx.fillRect(20, 5, 200, 40);
  ctx.fillRect(livesBoxX, 5, 200, 40);
  // Draw white boxes on top
  ctx.fillStyle = '#fff';
  ctx.fillRect(22, 7, 196, 36);
  ctx.fillRect(livesBoxX + 2, 7, 196, 36);

  ctx.fillStyle = '#000';
  ctx.font = '36px Calibri';
  ctx.fillText("Score: " + player.score, 24, 37);
  ctx.fillText("Lives: " + player.lives, livesBoxX + 4, 37);
}

resetGame = function(){
  // Create new player to reset score and moves
  player = new Player(randomXTile(), MAP_HEIGHT - 1);

  // Clear enemies and repopulate to remove any additional from progress
  allEnemies = [];
  generateEnemies();

  isGameOver = false;
  playerWon = false;
}

gameOver = function(){
  isGameOver = true;
  playerWon = (player.lives == 0) ? false : true;
}

renderEndGameModal = function(){
  let modalGridX = 1;
  let modalGridY = 2;
  let modalX = modalGridX * TILE_WIDTH;
  let modalY = modalGridY * 83 - 35;
  let modalWidth = TILE_WIDTH * 3;
  let modalHeight = 4 * 83;
  let border = 2;

  // General panel rendering
  ctx.fillStyle = "#000";
  ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

  ctx.fillStyle = "#fff";
  ctx.fillRect(modalX + border, modalY + border, modalWidth - 2 * border, modalHeight - border * 2);

  let heading = (playerWon) ? "You won!" : "You lost..";
  let secondText = (playerWon) ? "Great job, check out these stats!" : (player.score >= 7) ? "You were so close! Give it another go" : "Watch out for those bugs, they'll getcha!";

  ctx.fillStyle = "#000";

  // Heading rendering
  ctx.font = "48px Calibri";
  let headingX = modalX + modalWidth/2 - (ctx.measureText(heading).width / 2);
  let headingY = modalY + modalHeight/3;
  ctx.fillText(heading, headingX, headingY);

  // Secondary text rendering
  ctx.font = "16px Calibri";
  let secondX = modalX + modalWidth/2 - (ctx.measureText(secondText).width / 2);
  let secondY = modalY + modalHeight/2;
  ctx.fillText(secondText, secondX, secondY);

  if(playerWon) {
    // Render moves
    ctx.fillText("Moves", modalX + modalWidth/4 - (ctx.measureText("Moves").width/2), secondY + 24);
    ctx.fillText(player.moves.toString(), modalX + modalWidth/4 - (ctx.measureText(player.moves.toString()).width/2), secondY + 40);

    // Render time
    ctx.fillText("Time", modalX + modalWidth/4*3 - (ctx.measureText("Time").width/2), secondY + 24);
    // ctx.fillText(timerString, modalX + modalWidth/2 - (ctx.measureText(timerString).width/2), secondY + 40);
  }
}

generateEnemies();
player = new Player(randomXTile(), MAP_HEIGHT - 1);
