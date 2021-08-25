import Renderer from './renderer.js';
import Keyboard from './keyboard.js';
import Speaker from './speaker.js';
import CPU from './cpu.js';

const renderer = new Renderer(10);
const keyboard = new Keyboard();
const speaker = new Speaker();
const cpu = new CPU(renderer, keyboard, speaker);

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;
const button = document.getElementsByClassName('rom')
function changeRom(){
	let rom = btn.textContent;
	cpu.loadRom(rom)
	console.log(rom)
}
// button.forEach(element => {
// 	element.addEventListener('click',()=>{
// 		let rom = element.textContent;
// 		cpu.loadRom(rom);
// 		console.log(rom);
// 	})
// });
for(let btn of button){
	btn.addEventListener('click', ()=>{
		let rom = btn.textContent;
		renderer.clear()
		cpu.loadRom(rom)
		console.log(rom)
	},false)
}
console.log('here is the button var', button)
// button[0].addEventListener('click', changeRom,false)
function init() {
	fpsInterval = 1000 / fps;
	then = Date.now();
	startTime = then;

	cpu.loadSpritesIntoMemory();
	cpu.loadRom('BLITZ');
	loop = requestAnimationFrame(step);
	
}

function step() {
	now = Date.now();
	elapsed = now - then;

	if (elapsed > fpsInterval) {
		cpu.cycle();
	}

	loop = requestAnimationFrame(step);
}

init();