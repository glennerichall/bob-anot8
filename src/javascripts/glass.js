import * as SVG from 'svg.js';
import { onReady } from './events.js';
import '../css/glass.css';

let draw;

onReady(() => {
  // is used to draw callout lines
  let glass = document.createElement('div');
  glass.classList.add('glass', 'resize-to-body');
  glass.id = 'glass';
  document.body.appendChild(glass);

  // version 2
  draw = SVG('connectors').size('100%', '100%');

  // version 3.
  // draw = SVG()
  //   .addTo('#connectors')
  //   .size('100%', '100%');
});

export default () => draw;
