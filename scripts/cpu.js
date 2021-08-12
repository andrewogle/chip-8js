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
  }
}
