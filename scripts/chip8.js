import Renderer from "./renderer.js";
import Keyboard from "./keyboard.js";
import Speaker from "./speaker.js";

const renderer = new Renderer(15);
const keyboard = new Keyboard();
const speaker = new Speaker();

let loop;

let fps = 60,
  fpsInterval,
  startTime,
  now,
  then,
  elapsed;

function init() {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;

  // remove after done testing
  // renderer.testRender();
  // renderer.render();

  loop = requestAnimationFrame(step);
}

function step() {
  now = Date.now();
  elapsed = now - then;
  if (elapsed > fpsInterval) {
  }
  loop = requestAnimationFrame(step);
}
init();
