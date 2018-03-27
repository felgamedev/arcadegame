const ENEMIES = 3;

const TILE_WIDTH = 101;
const TILE_HEIGHT = 171;
const MAP_WIDTH = 5;
const MAP_HEIGHT = 6;


var mapWidthPixels = TILE_WIDTH * MAP_WIDTH;
var worldGrid = [MAP_WIDTH][6];

var allEnemies = [];
// Distance of 83px between tile rows
var enemyYPositions = [65, 148, 231];

function randomEnemyRow(){
  return Math.floor(Math.random() * 3) + 1;
}

function randomXOffset(){
  return -TILE_WIDTH - (Math.random() * 150);
}

function randomPlayerXTile(){
  return Math.floor(Math.random() * MAP_WIDTH);
}

function randomSpeed(){
  return 100 + Math.floor(Math.random() * 100);
}

// Enemies our player must avoid
var Enemy = function(xSpeed, xStartLocation, yLocation) {
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';

  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  this.speed = xSpeed;
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
      this.speed = randomSpeed();
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
}

Player.prototype.update = function(dt){
  // Check for collisions when on stone-block tiles
  if(this.gridY > 0 && this.gridY < 4){
    let player = this;
    allEnemies.forEach(function(enemy){
      if(enemy.row === player.gridY){
        // Actual enemy collision
        if(enemy.x < (player.gridX * TILE_WIDTH) + TILE_WIDTH && enemy.x + TILE_WIDTH > player.gridX * TILE_WIDTH){
          player.resetPlayer();
        }
      }
    });
  }
}

Player.prototype.render = function(){
  ctx.drawImage(Resources.get(this.sprite), this.gridX * TILE_WIDTH, (this.gridY * 83) - 35);
}

Player.prototype.handleInput = function(e){
  if(e == 'left') this.gridX--;
  if(e == 'right') this.gridX++;
  if(e == 'up') this.gridY--;
  if(e == 'down') this.gridY++;
  if(this.gridX < 0) this.gridX = 0;
  if(this.gridX > MAP_WIDTH - 1) this.gridX = MAP_WIDTH - 1;
  if(this.gridY < 0) this.gridY = 0;
  if(this.gridY > MAP_HEIGHT - 1) this.gridY = MAP_HEIGHT - 1;
}

Player.prototype.resetPlayer = function(){
  this.gridX = randomPlayerXTile();
  this.gridY = MAP_HEIGHT -1;
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

for(let i = 0; i < ENEMIES; i++){
  allEnemies.push(new Enemy(randomSpeed(), randomXOffset(), randomEnemyRow()));
}
var player = new Player(randomPlayerXTile(), MAP_HEIGHT - 1);





// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
