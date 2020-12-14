/**
 * LED Spiral Canvas
 *
 * Copyright (c) 2020 Uri Shaked
 *
 * Released under the MIT license.
 */

const root = document.getElementById('led-spiral');
const pixels = [];

const urlParams = new URL(location.href).searchParams;

function clamp(n, min, max) {
  return n < min ? min : n > max ? max : n;
}

const numLeds = clamp(parseInt(urlParams.get('leds'), 10), 0, 1024) || 128;
const c = clamp(parseFloat(urlParams.get('c')), 0.01, 16) || 6;
const r = clamp(parseFloat(urlParams.get('r')), 50, 1000) || 200;
const spirals = clamp(parseFloat(urlParams.get('spirals')), 1, 16) || 1;
const ledRadius = clamp(parseFloat(urlParams.get('ledr')), 1, 16) || 2;
const svgns = 'http://www.w3.org/2000/svg';
const size = { width: (r + ledRadius + 1) * 2, height: (r + ledRadius + 1) * 2 };
root.setAttribute('width', size.width);
root.setAttribute('height', size.height);
const center = { x: size.width / 2, y: size.height / 2 };
let pixelIndex = 0;
for (let spiralIndex = 0; spiralIndex < spirals; spiralIndex++) {
  const spiral = document.createElementNS(svgns, 'g');
  spiral.classList.add('spiral');
  spiral.setAttribute(
    'transform',
    `rotate(${(360 / spirals) * spiralIndex} ${center.x} ${center.y})`,
  );
  root.appendChild(spiral);

  let theta = 0;
  for (let index = 0; index < numLeds; index++) {
    const radius = Math.sqrt((index / c) * 8 + 1);
    theta += Math.asin(1 / radius);
    const x = (r / Math.sqrt((numLeds / c) * 8)) * radius * Math.cos(theta);
    const y = (r / Math.sqrt((numLeds / c) * 8)) * radius * Math.sin(theta);
    const circle = document.createElementNS(svgns, 'circle');
    circle.setAttribute('cx', center.x + x);
    circle.setAttribute('cy', center.y + y);
    circle.setAttribute('r', ledRadius);
    spiral.appendChild(circle);
    pixels[pixelIndex++] = circle;
  }
}

parent.postMessage({ app: 'wokwi', command: 'listen', version: 1 }, 'https://wokwi.com');

window.addEventListener('message', ({ data }) => {
  if (data.neopixels) {
    const { neopixels } = data;
    for (let i = 0; i < neopixels.length; i++) {
      const value = neopixels[i];
      const b = value & 0xff;
      const r = (value >> 8) & 0xff;
      const g = (value >> 16) & 0xff;
      if (pixels[i]) {
        pixels[i].setAttribute('fill', `rgb(${r}, ${g}, ${b})`);
      }
    }
  }
});
