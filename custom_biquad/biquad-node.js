// ported from https://github.com/Ircam-RnD/biquad-filter

class BiquadNode extends AudioWorkletProcessor {
    constructor() {
      super()

      this.coefficients = []
      this.cascades = 1
      this.memories = [{
        xi1: 0,
        xi2: 0,
        yi1: 0,
        yi2: 0
      }]

      this.gn = 0

      this.port.onmessage = (e) => {
        const data = e.data

        this.cascades = data.cascades
        this.coefficients = []
        this.coefficients.g = data.coeffs[0]

        for (let i = 0; i < this.cascades; i += 1) {
          this.coefficients[i] = {
              b1: data.coeffs[1 + i * 4],
              b2: data.coeffs[2 + i * 4],
              a1: data.coeffs[3 + i * 4],
              a2: data.coeffs[4 + i * 4]
          }
        }

        this.memories = [{
          xi1: 0,
          xi2: 0,
          yi1: 0,
          yi2: 0
        }]
        
        for (let i = 1; i < this.cascades; i += 1) {
          this.memories[i] = {
              yi1: 0,
              yi2: 0
          }
        }

        this.port.postMessage(true)
      }
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0]
      const output = outputs[0]

      const inputBuffer = input[0]
      const outputBuffer = output[0]

      let x;
      let y = [];
      let b0, b1, b2, a1, a2;
      let xi1, xi2, yi1, yi2, y1i1, y1i2;

      for (let i = 0; i < inputBuffer.length; i++) {
        x = inputBuffer[i];
        // Save coefficients in local variables
        b1 = this.coefficients[0].b1;
        b2 = this.coefficients[0].b2;
        a1 = this.coefficients[0].a1;
        a2 = this.coefficients[0].a2;
        // Save memories in local variables
        xi1 = this.memories[0].xi1;
        xi2 = this.memories[0].xi2;
        yi1 = this.memories[0].yi1;
        yi2 = this.memories[0].yi2;

        // Formula: y[n] = x[n] + b1*x[n-1] + b2*x[n-2] - a1*y[n-1] - a2*y[n-2]
        // First biquad
        y[0] = x + b1 * xi1 + b2 * xi2 - a1 * yi1 - a2 * yi2;

        for (let e = 1; e < this.cascades; e++) {
          // Save coefficients in local variables
          b1 = this.coefficients[e].b1;
          b2 = this.coefficients[e].b2;
          a1 = this.coefficients[e].a1;
          a2 = this.coefficients[e].a2;
          // Save memories in local variables
          y1i1 = this.memories[e - 1].yi1;
          y1i2 = this.memories[e - 1].yi2;
          yi1 = this.memories[e].yi1;
          yi2 = this.memories[e].yi2;

          y[e] = y[e - 1] + b1 * y1i1 + b2 * y1i2 - a1 * yi1 - a2 * yi2;
        }

        // Write the output
        outputBuffer[i] = y[this.cascades - 1] * this.coefficients.g;

        // Update the memories
        this.memories[0].xi2 = this.memories[0].xi1;
        this.memories[0].xi1 = x;

        for (let p = 0; p < this.cascades; p++) {
          this.memories[p].yi2 = this.memories[p].yi1;
          this.memories[p].yi1 = y[p];
        }
      }

      return true
    }
  }
  
  registerProcessor('biquad-node', BiquadNode)