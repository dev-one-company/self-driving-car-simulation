import { NeuralNetwork } from "./brain/neural-network.mjs";
import { Car } from "./car.mjs";
import { Road } from "./road.mjs";
import { Visualizer } from "./visualizer.mjs";

const carCanvas = document.querySelector("#car-canvas");
const networkCanvas = document.querySelector("#network-canvas");

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

function save() {
  localStorage.setItem("@best-brain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("@best-brain");
}

function applyButtonsEvents() {
  document.getElementById("on-save").onclick = save;
  document.getElementById("on-discard").onclick = discard;
}

function generateCars(N) {
  const cars = [];

  for (let i = 1; i <= N; i++) {
    cars.push(new Car("AI", road.getLaneCenter(1), 100));
  }

  return cars;
}

carCanvas.width = 200;
networkCanvas.width = 500;

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1000;
const cars = generateCars(N);
const bestCar = cars[0];

const traffic = [
  new Car("DUMMY", road.getLaneCenter(1), -100),
  new Car("DUMMY", road.getLaneCenter(0), -300),
  new Car("DUMMY", road.getLaneCenter(2), -300),
];

if (localStorage.getItem("@best-brain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("@best-brain"));

    if (i !== 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.3);
    }
  }
}

function animate(time) {
  if (cars.every((car) => car.damaged)) {
    window.location.reload();
  }

  traffic.forEach((trafficCar) => {
    trafficCar.update(road.borders, []);
  });

  cars.forEach((car) => {
    car.update(road.borders, traffic);
  });

  const bestCar = cars.find(
    (car) => car.y === Math.min(...cars.map((_car) => _car.y))
  );

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);

  traffic.forEach((trafficCar) => {
    trafficCar.draw(carCtx);
  });

  carCtx.globalAlpha = 0.3;

  cars.forEach((car) => {
    car.draw(carCtx, false, bestCar.id === car.id);
  });

  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, true, true);

  carCtx.restore();

  networkCtx.lineDashOffset = -Math.abs(time / 30);

  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  requestAnimationFrame(animate);
}

applyButtonsEvents();
animate(1);
