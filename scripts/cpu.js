class CPU {
  constructor(renderer, keyboard, speaker) {
    this.renderer = renderer;
    this.keyboard = keyboard;
    this.speaker = speaker;

    //4kb of memorey
    this.memory = new Uint8Array(4096);

    //16 8 bit registers
    this.registers = new Uint8Array(16);

    //special 16-bit register that accesses a specific point in memory
    this.i = 0;

    //timers
    this.delayTimer = 0;
    this.soundTimer = 0;

    //program counter stores the current excuting address
    this.pc = 0x200;

    //some instructions require pausing
    this.paused = false;

    this.speed = 10;

    this.stack = new Array();
  }
  loadSpritesIntoMemory() {
    // Array of hex values for each sprite. Each sprite is 5 bytes.
    // The technical reference provides us with each one of these values.
    const sprites = [
      0xf0,
      0x90,
      0x90,
      0x90,
      0xf0, // 0
      0x20,
      0x60,
      0x20,
      0x20,
      0x70, // 1
      0xf0,
      0x10,
      0xf0,
      0x80,
      0xf0, // 2
      0xf0,
      0x10,
      0xf0,
      0x10,
      0xf0, // 3
      0x90,
      0x90,
      0xf0,
      0x10,
      0x10, // 4
      0xf0,
      0x80,
      0xf0,
      0x10,
      0xf0, // 5
      0xf0,
      0x80,
      0xf0,
      0x90,
      0xf0, // 6
      0xf0,
      0x10,
      0x20,
      0x40,
      0x40, // 7
      0xf0,
      0x90,
      0xf0,
      0x90,
      0xf0, // 8
      0xf0,
      0x90,
      0xf0,
      0x10,
      0xf0, // 9
      0xf0,
      0x90,
      0xf0,
      0x90,
      0x90, // A
      0xe0,
      0x90,
      0xe0,
      0x90,
      0xe0, // B
      0xf0,
      0x80,
      0x80,
      0x80,
      0xf0, // C
      0xe0,
      0x90,
      0x90,
      0x90,
      0xe0, // D
      0xf0,
      0x80,
      0xf0,
      0x80,
      0xf0, // E
      0xf0,
      0x80,
      0xf0,
      0x80,
      0x80, // F
    ];

    //sprites are stored in the interpreter section of memory starting at hex 0x000
    for (let i = 0; i < sprites.length; i++) {
      this.memory[i] = sprites[i];
    }
  }

  //programs start at location 0x200
  loadProgramIntoMemory(program) {
    for (let loc = 0; loc < program.length; loc++) {
      this.memory[0x200 + loc] = program[loc];
    }
  }
  loadRom(romName) {
    const request = new XMLHttpRequest();
    const self = this;

    // handles the response
    request.onerror = function () {
      // if the request has content
      if (request.response) {
        // store the contents in 8 bit array
        let program = new Uint8Array(request.response);

        // load rom into memory
        self.loadProgramIntoMemory(program);
      }
    };
    // GET roms
    request.open("GET", "/roms" + romName);
    request.responseType = "arraybuffer";

    request.send();
  }
  cycle() {
    for (let i = 0; i < this.speed; i++) {
      if (!this.paused) {
        // grab both halves of 16 bit opcode a piece them together using bitwaise operations left shift and bitwise Or
        let opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        this.executeInstruction(opcode);
      }
    }
    if (!this.paused) {
      this.updateTimers();
    }
    this.playSound();
    this.renderer.render();
  }
  updateTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }
    if (this.soundTimer > 0) {
      this.soundTimer -= 1;
    }
  }
  playSound() {
    if (this.soundTimer > 0) {
      this.speaker.play(440);
    } else {
      this.speaker.stop();
    }
  }
}
