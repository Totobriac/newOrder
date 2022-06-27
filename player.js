class Player {
  constructor(x, y, angle, map) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.moveX = 0;
    this.moveY = 0;
    this.moveAngle = 0;
    this.FOV = Math.PI / 3;
    this.map = map;
  }
  update() {
    var playerOffsetX = Math.sin(this.angle) * this.map.speed;
    var playerOffsetY = Math.cos(this.angle) * this.map.speed;
    var mapTargetX = Math.floor(this.y / this.map.scale) * this.map.size + Math.floor((this.x + playerOffsetX * this.moveX * 10) / this.map.scale);
    var mapTargetY = Math.floor((this.y + playerOffsetY * this.moveY * 10) / this.map.scale) * this.map.size + Math.floor(this.x / this.map.scale);

    if (this.moveX && this.map.bluePrint[mapTargetX] == 0) this.x += playerOffsetX * this.moveX;
    if (this.moveY && this.map.bluePrint[mapTargetY] == 0) this.y += playerOffsetY * this.moveY;
    if (this.moveAngle) this.angle += 0.03 * this.moveAngle;
  }
}

export { Player };
