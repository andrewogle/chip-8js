class Renderer {
  constructor(scale) {
    // chip-8 display is 64 x 32 pixels
    this.cols = 64;
    this.rows = 32;
    // scaling display to make easier to see on modern devices
    this.scale = scale;
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.cols * this.scale;
    this.canvas.height = this.rows * this.scale;
    this.display = new Array(this.cols * this.rows);
  }
  //sprites are XORed into the display
  setPixel(x, y) {
    // if a pixel appears outside the bounds of the display then it should wrap around to the otherside
    if (x > this.cols) {
      x -= this.cols;
    } else if (x < 0) {
      x += this.cols;
    }
    if (y > this.rows) {
      y -= this.rows;
    } else if (y < 0) {
      y += this.rows;
    }
    let pixelLoc = x + y * this.cols;
    // toggle value at pixelLoc 0 to 1 or 1 to 0, 1 means draw a pixel 0 means erase
    this.display[pixelLoc] ^= 1;
    // if this returns true then a pixel was erased false means nothing was erased
    return !this.display[pixelLoc];
  }
  // clear out display array by reinitializing it
  clear() {
    this.display = new Array(this.cols * this.rows);
  }

  render() {
    // clear the display every render cycle
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // loop through display array
    for (let i = 0; i < this.cols * this.rows; i++) {
      // get the x position of the pixel
      let x = (i % this.cols) * this.scale;
      // get the y position
      let y = Math.floor(i / this.cols) * this.scale;
      // if the value at this.display[i] == 1 draw a pixel
      if (this.display[i]) {
        // set pixel color to black
        this.ctx.fillStyle = "#1FC742";
        // place a pixel at (x , y) with a width and hieght of scale
        this.ctx.fillRect(x, y, this.scale, this.scale);
      }
    }
  }
  // test renderer by placing pixels on the screen
  testRender() {
    this.setPixel(0, 0);
    this.setPixel(5, 2);
  }
}

export default Renderer;
