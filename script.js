import { Map } from "./map.js";
import { drawSmallMap } from "./smallMap.js";
import { Player } from "./player.js";
import { Controls } from "./controls.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// screen
const WIDTH = 600, HALF_WIDTH = 300;
const HEIGHT = 400, HALF_HEIGHT = 200;

// FPS
const FPS = 60;
const cycleDelay = Math.floor(1000 / FPS);
var oldCycleTime = 0;
var cycleCount = 0;
var fps_rate = '...';

// map.bluePrint
const MAP_SIZE = 32;
const MAP_SCALE = 64;
const MAP_RANGE = MAP_SCALE * MAP_SIZE;
const MAP_SPEED = (MAP_SCALE / 2) / 7;


var map = new Map();
var player = new Player( MAP_SCALE + 20, MAP_SCALE + 20, Math.PI/3);
var controls = new Controls(player, map);

var playerMapX;
var playerMapY;


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
  var playerOffsetX = Math.sin(player.angle) * MAP_SPEED;
  var playerOffsetY = Math.cos(player.angle) * MAP_SPEED;
  var mapTargetX = Math.floor(player.y / MAP_SCALE) * MAP_SIZE + Math.floor((player.x + playerOffsetX * player.moveX * 10) / MAP_SCALE);
  var mapTargetY = Math.floor((player.y + playerOffsetY * player.moveY * 10) / MAP_SCALE) * MAP_SIZE + Math.floor(player.x / MAP_SCALE);
  
  if (player.moveX && map.bluePrint[mapTargetX] == 0) player.x += playerOffsetX * player.moveX;
  if (player.moveY && map.bluePrint[mapTargetY] == 0) player.y += playerOffsetY * player.moveY;
  if (player.moveAngle) player.angle += 0.03 * player.moveAngle;
  
  // calculate map.bluePrint & player offsets
  
  playerMapX = (player.x / MAP_SCALE) * 5 
  playerMapY = (player.y / MAP_SCALE) * 5 

  // draw floor and ceiling
  ctx.drawImage(WALLS[0], 0, 0,canvas.width , canvas.height );
  
  // raycasting
  var currentAngle = player.angle + HALF_FOV;
  var rayStartX = Math.floor(player.x / MAP_SCALE) * MAP_SCALE;
  var rayStartY = Math.floor(player.y / MAP_SCALE) * MAP_SCALE;
  
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
      verticalDepth = (rayEndX - player.x) / currentSin;
      rayEndY = player.y + verticalDepth * currentCos;
      var mapTargetX = Math.floor(rayEndX / MAP_SCALE);
      var mapTargetY = Math.floor(rayEndY / MAP_SCALE);
      if (currentSin <= 0) mapTargetX += rayDirectionX;
      var targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
      if (targetSquare < 0 || targetSquare > map.bluePrint.length - 1) break;
      if (map.bluePrint[targetSquare] != 0) {
        textureY = map.bluePrint[targetSquare];
        if (map.bluePrint[targetSquare] == 14) textureY = 1;
        if (map.bluePrint[targetSquare] == 15) textureY = 5;
        break;
      }
      rayEndX += rayDirectionX * MAP_SCALE;
    } textureEndY = rayEndY;
    
    // vertical line intersection
    var rayEndY, rayEndX, rayDirectionY, horizontalDepth, textureEndX, textureX;
    if (currentCos > 0) { rayEndY = rayStartY + MAP_SCALE; rayDirectionY = 1 }
    else { rayEndY = rayStartY; rayDirectionY = -1 }
    for (var offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
      horizontalDepth = (rayEndY - player.y) / currentCos;
      rayEndX = player.x + horizontalDepth * currentSin;
      var mapTargetX = Math.floor(rayEndX / MAP_SCALE);
      var mapTargetY = Math.floor(rayEndY / MAP_SCALE);
      if (currentCos <= 0) mapTargetY += rayDirectionY;
      var targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
      if (targetSquare < 0 || targetSquare > map.bluePrint.length - 1) break;
      if (map.bluePrint[targetSquare] != 0) {
        textureX = map.bluePrint[targetSquare];
        if (map.bluePrint[targetSquare] == 14) textureX = 5;
        if (map.bluePrint[targetSquare] == 15) textureX = 1;
        break;
      }
      rayEndY += rayDirectionY * MAP_SCALE;
    } textureEndX = rayEndX;
    
    // calculate 3D projection
    var depth = verticalDepth < horizontalDepth ? verticalDepth : horizontalDepth;
    var textureImage = verticalDepth < horizontalDepth ? textureY : textureX;
    var textureOffset = verticalDepth < horizontalDepth ? textureEndY : textureEndX;
    textureOffset = Math.floor(textureOffset - Math.floor(textureOffset / MAP_SCALE) * MAP_SCALE);
    depth *= Math.cos(player.angle - currentAngle);
    var wallHeight = Math.min(Math.floor(MAP_SCALE * 280 / (depth + 0.0001)), 50000);
    
    // render textures
    ctx.drawImage(
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
  
  // draw map.bluePrint on left shift press
  if (map.dispMini) { 
    drawSmallMap(ctx, WALLS); 
  }
  
    // infinite loop
  setTimeout(gameLoop, cycleDelay);
  
  // render FPS to screen
 
  
} window.onload = function() { gameLoop(); }

export { playerMapX, playerMapY, player, map };
