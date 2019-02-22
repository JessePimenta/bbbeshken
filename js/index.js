"use strict";
{
	////////////////////////////////////////////////////////////////
	const canvas = {
		init() {
			this.elem = document.querySelector("canvas");
			const gl = this.elem.getContext("webgl", { alpha: false });
			const vertexShader = gl.createShader(gl.VERTEX_SHADER);
			const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(vertexShader,	`
				uniform mat4 camProj, camView;
				attribute vec3 aPosition, aColor;
				varying vec4 vColor;
				void main(void) {
					vec4 pos = camView * vec4(aPosition, 3.5);
					vColor = vec4(aColor * 1.2, 1.0);
					gl_Position = camProj * pos;
				}
			`);
			gl.shaderSource(fragmentShader,	`
				precision highp float;
				varying vec4 vColor;
				void main(void) {
					gl_FragColor = vColor;
				}
			`);
			gl.compileShader(vertexShader);
			gl.compileShader(fragmentShader);
			this.program = gl.createProgram();
			gl.attachShader(this.program, vertexShader);
			gl.attachShader(this.program, fragmentShader);
			gl.linkProgram(this.program);
			gl.useProgram(this.program);
			return gl;
		},

		resize() {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = this.clientWidth;
  var displayHeight = this.clientHeight;

  // Check if the canvas is not the same size.
  if (this.width  != displayWidth ||
      this.height != displayHeight) {

    // Make the canvas the same size
    this.width  = displayWidth;
    this.height = displayHeight;
  }
				this.width = this.elem.width = this.elem.offsetWidth;
				this.height = this.elem.height = this.elem.offsetHeight;
				camera.proj.perspective(120, this.width / this.height).load();
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
		// resize() {
		// 	this.width = this.elem.width = this.elem.offsetWidth;
		// 	this.height = this.elem.height = this.elem.offsetHeight;
		// 	camera.proj.perspective(120, this.width / this.height).load();
		// 	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		// }
	};
	////////////////////////////////////////////////////////////////
	const Mat4 = class {
		constructor(program, uName) {
			this.u = gl.getUniformLocation(program, uName);
			this.data = new Float32Array([
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]);
		}
		identity() {
			const d = this.data;
			d[0] = 1;
			d[1] = 0;
			d[2] = 0;
			d[3] = 0;
			d[4] = 0;
			d[5] = 1;
			d[6] = 0;
			d[7] = 0;
			d[8] = 0;
			d[9] = 0;
			d[10] = 1;
			d[11] = 0;
			d[12] = 0;
			d[13] = 0;
			d[14] = 0;
			d[15] = 1;
			return this;
		}
		translate(x, y, z) {
			const d = this.data;
			d[12] = d[0] * x + d[4] * y + d[8] * z + d[12];
			d[13] = d[1] * x + d[5] * y + d[9] * z + d[13];
			d[14] = d[2] * x + d[6] * y + d[10] * z + d[14];
			d[15] = d[3] * x + d[7] * y + d[11] * z + d[15];
			return this;
		}
		rotateX(angle) {
			const d = this.data;
			const s = Math.sin(angle);
			const c = Math.cos(angle);
			const a10 = d[4];
			const a11 = d[5];
			const a12 = d[6];
			const a13 = d[7];
			const a20 = d[8];
			const a21 = d[9];
			const a22 = d[10];
			const a23 = d[11];
			d[4] = a10 * c + a20 * s;
			d[5] = a11 * c + a21 * s;
			d[6] = a12 * c + a22 * s;
			d[7] = a13 * c + a23 * s;
			d[8] = a10 * -s + a20 * c;
			d[9] = a11 * -s + a21 * c;
			d[10] = a12 * -s + a22 * c;
			d[11] = a13 * -s + a23 * c;
			return this;
		}
		rotateY(angle) {
			const d = this.data;
			const s = Math.sin(angle);
			const c = Math.cos(angle);
			const a00 = d[0];
			const a01 = d[1];
			const a02 = d[2];
			const a03 = d[3];
			const a20 = d[8];
			const a21 = d[9];
			const a22 = d[10];
			const a23 = d[11];
			d[0] = a00 * c + a20 * -s;
			d[1] = a01 * c + a21 * -s;
			d[2] = a02 * c + a22 * -s;
			d[3] = a03 * c + a23 * -s;
			d[8] = a00 * s + a20 * c;
			d[9] = a01 * s + a21 * c;
			d[10] = a02 * s + a22 * c;
			d[11] = a03 * s + a23 * c;
			return this;
		}
		rotateZ(angle) {
			const d = this.data;
			const s = Math.sin(angle);
			const c = Math.cos(angle);
			const a00 = d[0];
			const a01 = d[1];
			const a02 = d[2];
			const a03 = d[3];
			const a10 = d[4];
			const a11 = d[5];
			const a12 = d[6];
			const a13 = d[7];
			d[0] = a00 * c + a10 * s;
			d[1] = a01 * c + a11 * s;
			d[2] = a02 * c + a12 * s;
			d[3] = a03 * c + a13 * s;
			d[4] = a00 * -s + a10 * c;
			d[5] = a01 * -s + a11 * c;
			d[6] = a02 * -s + a12 * c;
			d[7] = a03 * -s + a13 * c;
			return this;
		}
		perspective(fov, aspect) {
			const d = this.data;
			const near = 0.01;
			const far = 100;
			const top = near * Math.tan(fov * Math.PI / 360);
			const right = top * aspect;
			const left = -right;
			const bottom = -top;
			d[0] = 2 * near / (right - left);
			d[1] = 0;
			d[2] = 0;
			d[3] = 0;
			d[4] = 0;
			d[5] = 2 * near / (top - bottom);
			d[6] = 0;
			d[7] = 0;
			d[8] = (right + left) / (right - left);
			d[9] = (top + bottom) / (top - bottom);
			d[10] = -(far + near) / (far - near);
			d[11] = -1;
			d[12] = 0;
			d[13] = 0;
			d[14] = -(2 * far * near) / (far - near);
			d[15] = 0;
			return this;
		}
		load() {
			gl.uniformMatrix4fv(this.u, gl.FALSE, this.data);
			return this;
		}
	};
	////////////////////////////////////////////////////////////////
	const gl = canvas.init();
	gl.enable(gl.DEPTH_TEST);
	const camera = {
		proj: new Mat4(canvas.program, "camProj").load(),
		view: new Mat4(canvas.program, "camView").load()
	};
	canvas.resize();
	window.addEventListener("resize", () => canvas.resize(), true);
	////////////////////////////////////////////////////////////////
	const decode = () => {
		const img = document.getElementById("heightmap");
		const width = img.width;
		const height = img.height;
		const cmap = document.createElement("canvas");
		cmap.width = width;
		cmap.height = height;
		const cty = cmap.getContext("2d");
    cty.drawImage(img, 0, 0);
		const hmap = cty.getImageData(0, 0, width, height).data;
		// brillance
		for (let i = 0; i < width * height * 4; i += 4) {
			hmap[i + 3] = 0.934 * hmap[i] + 0.95 * hmap[i + 1] + 0.16 * hmap[i + 2];
		}
		let vertices = new Float32Array(6000000);
		let iV = 0;
		const face = (x, z, l, h, w, r, g, b) => [x,h,z,r,g,b,x,h,z+w,r,g,b,x+l,h,z+w,r,g,b,x,h,z,r,g,b,x+l,h,z+w,r,g,b,x+l,h,z,r,g,b];
		const attribute = (program, name, data, size, stride, offset) => {
			if (data !== null) {
				const buffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
			}
			const index = gl.getAttribLocation(program, name);
			gl.enableVertexAttribArray(index);
			gl.vertexAttribPointer(index, size, gl.FLOAT, false, stride, offset);
		};
		const increaseArray = (oldArray) => {
			const newArray = new Float32Array(oldArray.length * 1.25);
			newArray.set(oldArray);
			return newArray;
		};
		const concat = (a1, a2, index) => {
			if (index + a2.length > vertices.length) vertices = increaseArray(vertices);
			for (let i = 0, l = a2.length; i < l; i++) {
				a1[index++] = a2[i];
			}
			return index;
		};
		const Rect = class {
			constructor(x0, y0, w0, h0) {
				this.x = x0;
				this.y = y0;
				this.w = w0;
				this.h = h0;
				x0 = Math.floor(x0);
				y0 = Math.floor(y0);
				w0 = Math.ceil(w0);
				h0 = Math.ceil(h0);
				const n = w0 * h0;
				let r = 0, g = 0, b = 0, l = 0;
				for (let x = x0; x < x0 + w0; x++) {
					for (let y = y0; y < y0 + h0; y++) {
						const p = (y * width + x) * 4;
						r += hmap[p + 0];
						g += hmap[p + 1];
						b += hmap[p + 2];
						l += hmap[p + 3];
					}
				}
				// average colors
				this.r = (r / n)|0;
				this.g = (g / n)|0;
				this.b = (b / n)|0;
				this.l = (l / n)|0;
				// standard deviation
				let sd = 0;
				for (let x = x0; x < x0 + w0; x++) {
					for (let y = y0; y < y0 + h0; y++) {
						const l = hmap[(y * width + x) * 4 + 3] - this.l;
						sd += (l * l);
					}
				}
				this.sd = Math.sqrt(sd / n);
			}
			draw() {
				if (this.l > 1) iV = concat(vertices, face(
					(this.x - width * 0.5) * 0.1,
					(this.y - height * 0.5) * 0.1,
					this.w * 0.1,
					this.l * 0.099,
					this.h * 0.1,
					this.r / 256,
					this.g / 256,
					this.b / 256
				), iV);
			}
		};
		const rect = new Rect(0, 0, width, height);
		const divide = (rect) => {
			if (rect.w > 1 || rect.h > 1) {
				if (rect.sd > 3) {
					const hw = rect.w * 0.5;
					const hh = rect.h * 0.5;
					divide(new Rect(rect.x, rect.y, hw, hh));
					divide(new Rect(rect.x + hw, rect.y, hw, hh));
					divide(new Rect(rect.x, rect.y + hh, hw, hh));
					divide(new Rect(rect.x + hw, rect.y + hh, hw, hh));
				} else {
					rect.draw();
				}
			} else {
				rect.draw();
			}
		}
		divide(rect);
		attribute(canvas.program, "aPosition", vertices, 3, 24, 0);
		attribute(canvas.program, "aColor", null, 3, 24, 12);
		return iV / 6;
	}
	const pointer = {
		init(canvas) {
			this.x = canvas.width * 0.5;
			this.y = canvas.height * 0.5;
			this.ex = this.x;
			this.ey = this.y;
			["mousemove", "touchstart", "touchmove"].forEach((event, touch) => {
				canvas.elem.addEventListener(
					event,
					e => {
						if (touch) {
							e.preventDefault();
							this.x = e.targetTouches[0].clientX;
							this.y = e.targetTouches[0].clientY;
						} else {
							this.x = e.clientX;
							this.y = e.clientY;
						}
					},
					false
				);
			});
		},
		ease(step) {
			this.ex += (this.x - this.ex) * step;
			this.ey += (this.y - this.ey) * step;
		}
	};
	pointer.init(canvas);
	////////////////////////////////////////////////////////////////
	const run = () => {
		requestAnimationFrame(run);
		pointer.ease(0.02);
		const rx = (pointer.ex - canvas.width * 0.5) / (canvas.width * 0.35);
		const ry = (-pointer.ey + canvas.height * 0.5) / (canvas.height * 0.35);
		camera.view
			.identity()
			.translate(0, ry * 5, -50 + Math.sqrt(rx * rx + ry * ry) * 20)
			.rotateX(Math.PI / 2)
			.rotateZ(rx)
			.rotateX(ry)
			.load();
		gl.drawArrays(gl.TRIANGLES, 0, numElements);
	};
	let numElements = 0;
	const start = () => {
		numElements = decode();
		run();
	};
	requestAnimationFrame(start);
}
