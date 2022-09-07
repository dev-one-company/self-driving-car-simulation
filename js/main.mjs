import { Car } from "./car.mjs";
import { Road } from "./road.mjs";

const canvas = document.querySelector("#canvas");

canvas.width = 200;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9);
const car = new Car("CONTROLLED", road.getLaneCenter(1), 100);

const traffic = [
  new Car("DUMMY", road.getLaneCenter(0), -100),
  new Car("DUMMY", road.getLaneCenter(1), -100),
  new Car("DUMMY", road.getLaneCenter(2), -100),
];

function animate() {
  traffic.forEach((trafficCar) => {
    trafficCar.update(road.borders);
  });

  car.update(road.borders);

  canvas.height = window.innerHeight;

  ctx.save();
  ctx.translate(0, -car.y + canvas.height * 0.7);

  road.draw(ctx);

  traffic.forEach((trafficCar) => {
    trafficCar.draw(ctx);
  });

  car.draw(ctx);

  ctx.restore();
  requestAnimationFrame(animate);
}

animate();
