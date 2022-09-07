import { Level } from "./level.mjs";

export class NeuralNetwork {
  /**
   * neural network
   * @param {number[]} neuronCounts
   */
  constructor(neuronCounts) {
    /**
     * @type {Level[]} levels array
     */
    this.levels = [];

    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  /**
   * feed forward
   * @param {number[]} givenInputs
   * @param {NeuralNetwork} network
   */
  static feedForward(givenInputs, network) {
    let outputs = Level.feedFoward(givenInputs, network.levels[0]);

    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedFoward(outputs, network.levels[i]);
    }

    return outputs;
  }
}
