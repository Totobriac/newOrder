class Player {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.moveX = 0;
    this.moveY = 0;
    this.moveAngle = 0;
    this.FOV = Math.PI / 3;
  }
}

export { Player };
