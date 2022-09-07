import { Sensor } from "./sensor.mjs";
import { Controls } from "./controls.mjs";
import { guid, polysIntersect } from "./utils.mjs";
import { NeuralNetwork } from "./brain/neural-network.mjs";

export class Car {
  /**
   * car
   * @param {("DUMMY" | "CONTROLLED" | "AI")} type car type
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} width car width
   * @param {number} height car height
   */
  constructor(type = "DUMMY", x, y, width = 30, height = 50) {
    this.id = guid();

    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.speed = 0;
    this.maxSpeed = ["CONTROLLED", "AI"].includes(type) ? 3 : 2;
    this.acceleration = 0.1;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false;
    this.type = type;

    this.useBrain = type === "AI";

    if (type !== "DUMMY") {
      this.sensor = new Sensor(this, {
        rayCount: 10,
        raySpread: Math.PI / 2,
        rayLength: 150,
      });
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    } else {
      this.sensor = null;
      this.brain = null;
    }

    this.controls = new Controls(type);
  }

  #createPolygon() {
    const points = [];

    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);

    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });

    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });

    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    // turn more slow when going back
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    // adding friction
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }

    // fixing infinite moviment bug
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1;

      const angle = 0.03 * flip;

      if (this.controls.left) {
        this.angle += angle;
      }
      if (this.controls.right) {
        this.angle -= angle;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }

    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((reading) =>
        reading === null ? 0 : 1 - reading.offset
      );

      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #assessDamage(roadBorders, traffic = []) {
    return (
      roadBorders.some((border) => polysIntersect(this.polygon, border)) ||
      traffic.some((element) => polysIntersect(this.polygon, element.polygon))
    );
  }

  draw(ctx, drawSensors = false, best = false) {
    if (this.damaged) {
      ctx.fillStyle = "red";
    } else {
      ctx.fillStyle = best ? "green" : "black";
    }

    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);

    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }

    ctx.fill();

    if (this.sensor && drawSensors) {
      this.sensor.draw(ctx, this.damaged);
    }
  }
}
