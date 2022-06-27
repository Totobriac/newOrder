import { Map } from "./map.js";
import { drawSmallMap } from "./smallMap.js";
import { Player } from "./player.js";
import { Controls } from "./controls.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;

var map = new Map();
var player = new Player( map.scale + 20, map.scale + 20, Math.PI/3);
var controls = new Controls(player, map);

var playerMapX;
var playerMapY;

// graphics
const WALLS = [];

// load wall textures
for (var filename = 0; filename < 14; filename++) {
  var image = document.createElement('img');
  image.src = 'assets/walls/' + filename + '.png';
  WALLS.push(image);
}

function gameLoop() {

  // update player position
  var playerOffsetX = Math.sin(player.angle) * map.speed;
  var playerOffsetY = Math.cos(player.angle) * map.speed;
  var mapTargetX = Math.floor(player.y / map.scale) * map.size + Math.floor((player.x + playerOffsetX * player.moveX * 10) / map.scale);
  var mapTargetY = Math.floor((player.y + playerOffsetY * player.moveY * 10) / map.scale) * map.size + Math.floor(player.x / map.scale);

  if (player.moveX && map.bluePrint[mapTargetX] == 0) player.x += playerOffsetX * player.moveX;
  if (player.moveY && map.bluePrint[mapTargetY] == 0) player.y += playerOffsetY * player.moveY;
  if (player.moveAngle) player.angle += 0.03 * player.moveAngle;

  // calculate map.bluePrint & player offsets

  playerMapX = (player.x / map.scale) * 5
  playerMapY = (player.y / map.scale) * 5

  // draw floor and ceiling
  ctx.drawImage(WALLS[0], 0, 0,canvas.width , canvas.height );

  // raycasting
  var currentAngle = player.angle + player.FOV / 2;
  var rayStartX = Math.floor(player.x / map.scale) * map.scale;
  var rayStartY = Math.floor(player.y / map.scale) * map.scale;

  // loop over casted rays
  for (var ray = 0; ray < canvas.width; ray++) {
    // get current angle sin & cos
    var currentSin = Math.sin(currentAngle); currentSin = currentSin ? currentSin : 0.000001;
    var currentCos = Math.cos(currentAngle); currentCos = currentCos ? currentCos : 0.000001;

    // vertical line intersection
    var rayEndX, rayEndY, rayDirectionX, verticalDepth, textureEndY, textureY;
    if (currentSin > 0) { rayEndX = rayStartX + map.scale; rayDirectionX = 1 }
    else { rayEndX = rayStartX; rayDirectionX = -1 }
    for (var offset = 0; offset < map.range; offset += map.scale) {
      verticalDepth = (rayEndX - player.x) / currentSin;
      rayEndY = player.y + verticalDepth * currentCos;
      var mapTargetX = Math.floor(rayEndX / map.scale);
      var mapTargetY = Math.floor(rayEndY / map.scale);
      if (currentSin <= 0) mapTargetX += rayDirectionX;
      var targetSquare = mapTargetY * map.size + mapTargetX;
      if (targetSquare < 0 || targetSquare > map.bluePrint.length - 1) break;
      if (map.bluePrint[targetSquare] != 0) {
        textureY = map.bluePrint[targetSquare];
        if (map.bluePrint[targetSquare] == 14) textureY = 1;
        if (map.bluePrint[targetSquare] == 15) textureY = 5;
        break;
      }
      rayEndX += rayDirectionX * map.scale;
    } textureEndY = rayEndY;

    // vertical line intersection
    var rayEndY, rayEndX, rayDirectionY, horizontalDepth, textureEndX, textureX;
    if (currentCos > 0) { rayEndY = rayStartY + map.scale; rayDirectionY = 1 }
    else { rayEndY = rayStartY; rayDirectionY = -1 }
    for (var offset = 0; offset < map.range; offset += map.scale) {
      horizontalDepth = (rayEndY - player.y) / currentCos;
      rayEndX = player.x + horizontalDepth * currentSin;
      var mapTargetX = Math.floor(rayEndX / map.scale);
      var mapTargetY = Math.floor(rayEndY / map.scale);
      if (currentCos <= 0) mapTargetY += rayDirectionY;
      var targetSquare = mapTargetY * map.size + mapTargetX;
      if (targetSquare < 0 || targetSquare > map.bluePrint.length - 1) break;
      if (map.bluePrint[targetSquare] != 0) {
        textureX = map.bluePrint[targetSquare];
        if (map.bluePrint[targetSquare] == 14) textureX = 5;
        if (map.bluePrint[targetSquare] == 15) textureX = 1;
        break;
      }
      rayEndY += rayDirectionY * map.scale;
    } textureEndX = rayEndX;

    // calculate 3D projection
    var depth = verticalDepth < horizontalDepth ? verticalDepth : horizontalDepth;
    var textureImage = verticalDepth < horizontalDepth ? textureY : textureX;
    var textureOffset = verticalDepth < horizontalDepth ? textureEndY : textureEndX;
    textureOffset = Math.floor(textureOffset - Math.floor(textureOffset / map.scale) * map.scale);
    depth *= Math.cos(player.angle - currentAngle);
    var wallHeight = Math.min(Math.floor(map.scale * 280 / (depth + 0.0001)), 50000);

    // render textures
    ctx.drawImage(
      WALLS[textureImage],
      textureOffset,                                                       /* source image X offset */
      0,                                                                   /* source image Y offset */
      1,                                                                   /* source image width    */
      64,                                                                  /* source image height   */
      ray,                                                    /* target image X offset */
      (canvas.height / 2 - Math.floor(wallHeight)),             /* target image Y offset */
      1,                                                                   /* target image width    */
      wallHeight *2,                                                          /* target image height   */
    );

    currentAngle -= player.FOV / canvas.width;
  }

  if (map.dispMini) {
    drawSmallMap(ctx, WALLS);
  }

}

function animate() {
  gameLoop();
  requestAnimationFrame(animate)
}

animate();

export { playerMapX, playerMapY, player, map };
