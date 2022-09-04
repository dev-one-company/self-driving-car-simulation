import { Controls } from './controls.mjs';

export class Car {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.width = width;
    this.height = height;
    this.controls = new Controls();
  }

  update() {
    if (this.controls.forward) {
      this.y -= this.speed;
    }
    if (this.controls.reverse) {
      this.y += this.speed;
    }
    if (this.controls.left) {
      this.x -= this.speed;
    }
    if (this.controls.right) {
      this.x += this.speed;
    }
  }

  draw(ctx){
    ctx.beginPath();
    ctx.rect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.fill();
  }
}
