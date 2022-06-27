import { map } from "./map.js";
import { drawSmallMap } from "./smallMap.js";

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

// screen
const WIDTH = 600, HALF_WIDTH = 300;
const HEIGHT = 400, HALF_HEIGHT = 200;

// FPS
const FPS = 60;
const cycleDelay = Math.floor(1000 / FPS);
var oldCycleTime = 0;
var cycleCount = 0;
var fps_rate = '...';

// map
const MAP_SIZE = 32;
const MAP_SCALE = 64;
const MAP_RANGE = MAP_SCALE * MAP_SIZE;
const MAP_SPEED = (MAP_SCALE / 2) / 10;

var showMap = false;

// player
var playerX = MAP_SCALE + 20;
var playerY = MAP_SCALE + 20;
var playerAngle = Math.PI / 3;
var playerMoveX = 0;
var playerMoveY = 0;
var playerMoveAngle = 0;

var playerMapX;
var playerMapY;

// handle user input
document.onkeydown = function(event) {
  switch (event.code) {
    case "ArrowUp": playerMoveX = 1; playerMoveY = 1; break;         /* arrow up               */
    case "ArrowDown": playerMoveX = -1; playerMoveY = -1; break;       /* arrow down             */
    case "ArrowLeft": playerMoveAngle = 1; break;                      /* arrow left             */
    case "ArrowRight": playerMoveAngle = -1; break;                     /* arrow right            */
    case "ShiftRight": showMap = true; break;                           /* left shift (show map)  */
  }
}

document.onkeyup = function(event) {
  switch (event.code) {
    case "ArrowUp":
    case "ArrowDown": playerMoveX = 0; playerMoveY = 0; break;
    case "ArrowLeft":
    case "ArrowRight": playerMoveAngle = 0; break;
    case "ShiftRight": showMap = false; break;
  }
} 

// camera
const DOUBLE_PI = 2 * Math.PI;
// const FOV = Math.PI / 2;
const FOV = Math.PI / 3;

const HALF_FOV = FOV / 2;
const STEP_ANGLE = FOV / WIDTH;

// graphics
const WALLS = [];

// load wall textures
for (var filename = 0; filename < 14; filename++) {
  var image = document.createElement('img');
  image.src = 'assets/walls/' + filename + '.png';
  WALLS.push(image);
}

// game loop
function gameLoop() {
  // calculate FPS
  cycleCount++;
  if (cycleCount >= 60) cycleCount = 0;
  var startTime = Date.now();
  var cycleTime = startTime - oldCycleTime;
  oldCycleTime = startTime;
  if (cycleCount % 60 == 0) fps_rate = Math.floor(1000 / cycleTime);
  
  // resize canvas
  canvas.width = 600;
  canvas.height = 400;
  
  // update player position
  var playerOffsetX = Math.sin(playerAngle) * MAP_SPEED;
  var playerOffsetY = Math.cos(playerAngle) * MAP_SPEED;
  var mapTargetX = Math.floor(playerY / MAP_SCALE) * MAP_SIZE + Math.floor((playerX + playerOffsetX * playerMoveX * 10) / MAP_SCALE);
  var mapTargetY = Math.floor((playerY + playerOffsetY * playerMoveY * 10) / MAP_SCALE) * MAP_SIZE + Math.floor(playerX / MAP_SCALE);
  
  if (playerMoveX && map[mapTargetX] == 0) playerX += playerOffsetX * playerMoveX;
  if (playerMoveY && map[mapTargetY] == 0) playerY += playerOffsetY * playerMoveY;
  if (playerMoveAngle) playerAngle += 0.03 * playerMoveAngle;
  
  // calculate map & player offsets
  
  playerMapX = (playerX / MAP_SCALE) * 5 
  playerMapY = (playerY / MAP_SCALE) * 5 

  // draw floor and ceiling
  context.drawImage(WALLS[0], 0, 0,canvas.width , canvas.height );
  
  // raycasting
  var currentAngle = playerAngle + HALF_FOV;
  var rayStartX = Math.floor(playerX / MAP_SCALE) * MAP_SCALE;
  var rayStartY = Math.floor(playerY / MAP_SCALE) * MAP_SCALE;
  
  // loop over casted rays
  for (var ray = 0; ray < WIDTH; ray++) {
    // get current angle sin & cos
    var currentSin = Math.sin(currentAngle); currentSin = currentSin ? currentSin : 0.000001;
    var currentCos = Math.cos(currentAngle); currentCos = currentCos ? currentCos : 0.000001;
  
    // vertical line intersection
    var rayEndX, rayEndY, rayDirectionX, verticalDepth, textureEndY, textureY;
    if (currentSin > 0) { rayEndX = rayStartX + MAP_SCALE; rayDirectionX = 1 }
    else { rayEndX = rayStartX; rayDirectionX = -1 }
    for (var offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
      verticalDepth = (rayEndX - playerX) / currentSin;
      rayEndY = playerY + verticalDepth * currentCos;
      var mapTargetX = Math.floor(rayEndX / MAP_SCALE);
      var mapTargetY = Math.floor(rayEndY / MAP_SCALE);
      if (currentSin <= 0) mapTargetX += rayDirectionX;
      var targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
      if (targetSquare < 0 || targetSquare > map.length - 1) break;
      if (map[targetSquare] != 0) {
        textureY = map[targetSquare];
        if (map[targetSquare] == 14) textureY = 1;
        if (map[targetSquare] == 15) textureY = 5;
        break;
      }
      rayEndX += rayDirectionX * MAP_SCALE;
    } textureEndY = rayEndY;
    
    // vertical line intersection
    var rayEndY, rayEndX, rayDirectionY, horizontalDepth, textureEndX, textureX;
    if (currentCos > 0) { rayEndY = rayStartY + MAP_SCALE; rayDirectionY = 1 }
    else { rayEndY = rayStartY; rayDirectionY = -1 }
    for (var offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
      horizontalDepth = (rayEndY - playerY) / currentCos;
      rayEndX = playerX + horizontalDepth * currentSin;
      var mapTargetX = Math.floor(rayEndX / MAP_SCALE);
      var mapTargetY = Math.floor(rayEndY / MAP_SCALE);
      if (currentCos <= 0) mapTargetY += rayDirectionY;
      var targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
      if (targetSquare < 0 || targetSquare > map.length - 1) break;
      if (map[targetSquare] != 0) {
        textureX = map[targetSquare];
        if (map[targetSquare] == 14) textureX = 5;
        if (map[targetSquare] == 15) textureX = 1;
        break;
      }
      rayEndY += rayDirectionY * MAP_SCALE;
    } textureEndX = rayEndX;
    
    // calculate 3D projection
    var depth = verticalDepth < horizontalDepth ? verticalDepth : horizontalDepth;
    var textureImage = verticalDepth < horizontalDepth ? textureY : textureX;
    var textureOffset = verticalDepth < horizontalDepth ? textureEndY : textureEndX;
    textureOffset = Math.floor(textureOffset - Math.floor(textureOffset / MAP_SCALE) * MAP_SCALE);
    depth *= Math.cos(playerAngle - currentAngle);
    var wallHeight = Math.min(Math.floor(MAP_SCALE * 280 / (depth + 0.0001)), 50000);
    
    // render textures
    context.drawImage(
      WALLS[textureImage],
      textureOffset,                                                       /* source image X offset */
      0,                                                                   /* source image Y offset */
      1,                                                                   /* source image width    */
      64,                                                                  /* source image height   */
      ray,                                                    /* target image X offset */
      (HALF_HEIGHT - Math.floor(wallHeight)),             /* target image Y offset */
      1,                                                                   /* target image width    */
      wallHeight *2,                                                          /* target image height   */
    );
  
    // update current angle
    currentAngle -= STEP_ANGLE;
  }
  
  // draw map on left shift press
  if (showMap) { 
    drawSmallMap(context, WALLS); 
  }
  
    // infinite loop
  setTimeout(gameLoop, cycleDelay);
  
  // render FPS to screen
 
  
} window.onload = function() { gameLoop(); }

export { playerMapX, playerMapY, playerAngle };
