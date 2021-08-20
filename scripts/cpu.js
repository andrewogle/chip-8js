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
  executeInstruction(opcode) {
    //increment program counter because each instruction is 2 bytes long the PC will increment by 2
    this.pc += 2;

    //get rid of everything but the 2nd nibble
    let x = (opcode & 0x0f00) >> 8;

    //get rid of everything but the 3rd nibble
    let y = (opcode & 0x00f0) >> 4;

    // logic for all 36 instructions
    switch (opcode & 0xf000) {
      case 0x0000:
        switch (opcode) {
          //00e0 - CLS
          //clear the display
          case 0x00e0:
            this.renderer.clear();
            break;
          case 0x00ee:
            //00ee - RET
            //pop the last element in the stack array and store it in pc
            // this will return us from a subroutine
            this.pc = this.stack.pop();
            break;
        }

        break;
      case 0x1000:
        //1nnn - jp addr
        // set the pc to the stored value in nnn
        this.pc = opcode & 0xfff;
        break;
      case 0x2000:
        //2nnn - call addr
        this.stack.push(this.pc);
        this.pc = opcode & 0xfff;
        break;
      case 0x3000:
        // 3xkk - SE Vx, byte
        //compares the value of the x register to kk
        //if equal increment by 2
        if (this.v[x] === (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x4000:
        // 4xkk - SNE Vx, byte
        // skips the next instruction are not equal
        if (this.v[x] !== (opcode & oxff)) {
          this.pc += 2;
        }
        break;
      case 0x5000:
        //5xy0 - SE Vx, Vy
        // if Vx is equal to Vy skip the next instruction
        if (this.v[x] === this.v[y]) {
          this.pc += 2;
        }
        break;
      case 0x6000:
        //6xkk - LD Vx, byte
        // set the value of Vx to value of kk
        this.v[x] = opcode & 0xff;
        break;
      case 0x7000:
        //7xkk - ADD Vx, byte
        // adds kk to Vx
        this.v[x] += opcode & 0xff;
        break;
      case 0x8000:
        //8xy0 - LD Vx, Vy
        switch (opcode & 0xf) {
          // set the value of Vx to the value of Vy
          case 0x0:
            this.v[x] = this.v[y];
            break;
            //8xy1 - OR Vx, Vy
            //set Vx to the value of Vx OR Vy
            this.v[x] |= this.v[y];
          case 0x1:
            //8xy2 - AND Vx, Vy
            // set Vx to value of Vx AND Vy
            this.v[x] &= this.v[y];
            break;
          case 0x2:
            //8xy3 - XOR Vx, Vy
            // set Vx to the value of Vx XOR Vy
            this.v[x] ^= this.v[y];
            break;
          case 0x3:
            //8xy4 - ADD Vx, Vy
            // sets Vx to Vx + Vy
            //If the result is greater than 8 bits (i.e., > 255,)
            //VF is set to 1, otherwise 0.
            //Only the lowest 8 bits of the result are kept, and stored in Vx
            let sum = (this.v[x] += this.v[y]);

            this.v[0xf] = 0;

            if (sum > 0xff) {
              this.v[0xf] = 1;
            }

            this.v[x] = sum;
            break;
          case 0x4:
            //
            break;
          case 0x5:
            break;
          case 0x6:
            break;
          case 0x7:
            break;
          case 0xe:
            break;
        }

        break;
      case 0x9000:
        break;
      case 0xa000:
        break;
      case 0xb000:
        break;
      case 0xc000:
        break;
      case 0xd000:
        break;
      case 0xe000:
        switch (opcode & 0xff) {
          case 0x9e:
            break;
          case 0xa1:
            break;
        }

        break;
      case 0xf000:
        switch (opcode & 0xff) {
          case 0x07:
            break;
          case 0x0a:
            break;
          case 0x15:
            break;
          case 0x18:
            break;
          case 0x1e:
            break;
          case 0x29:
            break;
          case 0x33:
            break;
          case 0x55:
            break;
          case 0x65:
            break;
        }

        break;

      default:
        throw new Error("Unknown opcode " + opcode);
    }
  }
}
