import { map } from "./script.js";
import { player} from "./script.js";

var MAP_SIZE = 32;

function drawSmallMap(ctx, player) {
  var playerMapX = (player.x / map.scale) * 5
  var playerMapY = (player.y / map.scale) * 5

  for (var row = 0; row < map.size; row++) {
    for (var col = 0; col < map.size; col++) {
      var square = row * map.size + col;
      if (map.bluePrint[square] === 0) {
        ctx.fillStyle = '#aaa';
        ctx.fillRect( col * 5,  row * 5, 5, 5);
      }
    }
  }


  ctx.fillStyle = 'Red';
  ctx.beginPath();
  ctx.arc(playerMapX, playerMapY, 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = 'Red';
  ctx.lineWidht = 1;
  ctx.beginPath();
  ctx.moveTo(playerMapX, playerMapY);
  ctx.lineTo(playerMapX + Math.sin(player.angle) * 5, playerMapY + Math.cos(player.angle) * 5);
  ctx.stroke();
}

export { drawSmallMap };
