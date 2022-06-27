import { map } from "./script.js";
import { playerMapX, playerMapY, player} from "./script.js";

var MAP_SIZE = 32;
const DOUBLE_PI = 2 * Math.PI;


function drawSmallMap(ctx, WALLS) {
  for (var row = 0; row < MAP_SIZE; row++) {
    for (var col = 0; col < MAP_SIZE; col++) {
      var square = row * MAP_SIZE + col;
      if (map.bluePrint[square] != 0) {
        var materialTexture  = map.bluePrint[square] > 13 ? 1 : map.bluePrint[square];
        ctx.drawImage(WALLS[materialTexture], 0, 0, 64, 64,  col * 5, row * 5, 5, 5);
      } else {
        ctx.fillStyle = '#aaa';
        ctx.fillRect( col * 5,  row * 5, 5, 5);
      }
    }
  }
  
  
  ctx.fillStyle = 'Red';
  ctx.beginPath();
  ctx.arc(playerMapX, playerMapY, 2, 0, DOUBLE_PI);
  ctx.fill();
  ctx.strokeStyle = 'Red';
  ctx.lineWidht = 1;
  ctx.beginPath();
  ctx.moveTo(playerMapX, playerMapY);
  ctx.lineTo(playerMapX + Math.sin(player.angle) * 5, playerMapY + Math.cos(player.angle) * 5);
  ctx.stroke();
}

export { drawSmallMap };