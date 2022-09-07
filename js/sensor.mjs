import { lerp, getIntersection } from './utils.mjs';

export class Sensor {
  constructor(car, configs = {}) {
    const defaultConfigs = {
      rayCount: 3,
      rayLength: 100,
      raySpread: Math.PI / 4
    }
    const { rayCount, rayLength, raySpread } = { ...defaultConfigs, ...configs };
    
    this.car = car;
    this.rayCount = rayCount;
    this.rayLength = rayLength;
    this.raySpread = raySpread;

    this.rays = [];
    this.readings = [];
  }

  #casRays() {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = lerp(
        this.raySpread / 2,
        -this.raySpread / 2,
        this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
      ) + this.car.angle;

      const start = {
        x: this.car.x,
        y: this.car.y,
      };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  update(roadBorders) {
    this.#casRays();

    this.readings = [];

    this.rays.forEach(ray => {
      const reading = this.#getReading(ray, roadBorders);

      this.readings.push(reading);
    });
  }

  #getReading(ray, roadBorders) {
    let touches = [];

    roadBorders.forEach(roadBorder => {
      const touch = getIntersection(ray[0], ray[1], roadBorder[0], roadBorder[1]);

      if (touch) {
        touches.push(touch);
      }
    });

    if (touches.length === 0) {
      return null;
    }

    const offsets = touches.map(touch => touch.offset);
    const minOffset = Math.min(...offsets);

    return touches.find(touch => touch.offset = minOffset);
  }

  draw(ctx, damaged = false) {
    if (!damaged) {
      for (let i = 0; i < this.rayCount; i++) {
        let end = this.rays[i][1];

        if (this.readings[i]) {
          end = this.readings[i];
        }

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "yellow";
        ctx.moveTo(
          this.rays[i][0].x,
          this.rays[i][0].y,
        );
        ctx.lineTo(
          end.x,
          end.y,
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.moveTo(
          this.rays[i][1].x,
          this.rays[i][1].y,
        );
        ctx.lineTo(
          end.x,
          end.y,
        );
        ctx.stroke();
      }
    }
  }
}
