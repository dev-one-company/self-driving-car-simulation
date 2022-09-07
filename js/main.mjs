import { Car } from "./car.mjs";
import { Road } from "./road.mjs";
import { Visualizer } from "./visualizer.mjs";

const carCanvas = document.querySelector("#car-canvas");
carCanvas.width = 200;

const networkCanvas = document.querySelector("#network-canvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const car = new Car("AI", road.getLaneCenter(1), 100);

const traffic = [new Car("DUMMY", road.getLaneCenter(1), -100)];

function animate(time) {
  traffic.forEach((trafficCar) => {
    trafficCar.update(road.borders, []);
  });

  car.update(road.borders, traffic);

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -car.y + carCanvas.height * 0.7);

  road.draw(carCtx);

  traffic.forEach((trafficCar) => {
    trafficCar.draw(carCtx);
  });

  car.draw(carCtx);

  carCtx.restore();

  networkCtx.lineDashOffset = -Math.abs(time / 30);

  Visualizer.drawNetwork(networkCtx, car.brain);

  requestAnimationFrame(animate);
}

animate(1);
