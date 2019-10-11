import { addStyleSheet, addScript } from './utils.js';
import { parseMessage } from './targets.js';
import getPosition, { moveBy, removeOverlaps } from './positionning.js';
// import * as SVG from './svg.min.js';

let svgSrc = addScript(
  'https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.0.13/svg.min.js'
);

const styles = `
.callout {
    user-select: none;
    position: absolute;
    width: 400px;
}
.callout.bordered {
    border: 1px solid black;
}
.callout.css {
    counter-increment: callout-css;
}
.callout.html {
    counter-increment: callout-html;
}
.callout .content {
    border: 1px dashed black;
    background: white;
    padding: 2px 4px 2px 4px;
    position: absolute;
    top: 50px;
    left: 50px;
    cursor: move;
}
.callout::before,
.callout .content {
  box-shadow: 2px 2px rgba(0, 0, 0, .3);
}
.callout .content::before {
    position: absolute;
    top: -10px;
    left: -15px;
    width: 20px;
    height: 20px;
    text-align: center;
    background: white;
    border: 1px solid black;
}
.callout.css .content::before {
    content: counter(callout-css);
    border-radius: 10px;
    background-color: lightgreen;
}
.callout.html  .content::before {
    content: counter(callout-html, lower-alpha);
    background-color: lightblue;
}
.connectors {
    position:absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 0;
}
.callout .ending {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1px solid black;
    top: 0px;
    left: 0px;
    background: white;
}
.callout.css .ending {
    border-radius: 5px;
}
`;

var elem = addStyleSheet(styles);
elem.id = 'callout-stylesheet';

// glass is used to draw callout lines
let connectors = document.createElement('div');
connectors.classList.add('connectors', 'resize-to-body');
connectors.id = 'connectors';
document.body.appendChild(connectors);

let draw;
svgSrc.onload = () => {
  draw = SVG()
    .addTo('#connectors')
    .size('100%', '100%');
};

function createElement(node, config) {
  let callout = document.createElement('div');
  callout.classList.add('callout', config.type);
  document.body.appendChild(callout);

  let content = document.createElement('div');
  content.classList.add('content');
  content.innerText = parseMessage(node, config.message);
  callout.appendChild(content);

  let ending = document.createElement('div');
  ending.classList.add('ending');
  callout.appendChild(ending);

  return callout;
}

function updateLine(line, a, b) {
  let r1 = a.getBoundingClientRect();
  let r2 = b.getBoundingClientRect();
  return line.plot(
    r1.left + r1.width / 2,
    r1.top + r1.height / 2,
    r2.left + r2.width / 2,
    r2.top + r2.height / 2
  );
}

function connect(a, b) {
  if (typeof SVG === 'undefined') return;

  let r1 = a.getBoundingClientRect();
  let r2 = b.getBoundingClientRect();
  return draw
    .line(
      r1.left + r1.width / 2,
      r1.top + r1.height / 2,
      r2.left + r2.width / 2,
      r2.top + r2.height / 2
    )
    .stroke({ width: 1, color: 'black', dasharray: '3, 2' });
}

class Callout {
  constructor(node, configs) {
    this.node = node;
    this.configs = configs;
  }

  get content() {
    return this.elem.querySelector('.content');
  }

  get ending() {
    return this.elem.querySelector('.ending');
  }

  updateArc() {
    if (!this.arc) {
      this.arc = connect(
        this.content,
        this.ending
      );
      if(!this.arc) setTimeout(()=>this.updateArc(), 100);
    } else {
      updateLine(this.arc, this.content, this.ending);
    }
  }

  updateEnding() {
    let ending = this.ending;
    let node = this.node;
    let elem = this.elem;
    let configs = this.configs;
    const { left, top } = getPosition(ending, node, configs);

    elem.style.setProperty('left', null);
    elem.style.setProperty('top', null);

    if (left != null) {
      elem.style.setProperty('left', `${left}px`);
    }

    if (top != null) {
      elem.style.setProperty('top', `${top}px`);
    }
  }

  updateContent() {
    let ending = this.ending;
    let content = this.content;

    content.style.setProperty('left', null);
    content.style.setProperty('top', null);

    const r = content.getBoundingClientRect();
    const w = document.body.getBoundingClientRect().width;
    const p = this.elem.getBoundingClientRect().left;
    if (r.right > w) {
      moveBy(content, { x: w - r.right - p, y: 0 });
    }
  }

  update() {
    let elem = this.elem;
    this.updateEnding();
    this.updateContent();
  }

  install() {
    let node = this.node;
    let configs = this.configs;

    node.classList.add('annotated');
    this.elem = createElement(node, configs);

    return true;
  }
}

class CalloutCollection {
  constructor(callouts) {
    this.callouts = callouts;
  }

  install() {
    return this.callouts.reduce(
      (res, callout) => res && callout.install(),
      true
    );
  }

  update() {
    this.callouts.forEach(callout => callout.update());
    const contents = document.querySelectorAll('.callout .content');
    removeOverlaps(contents);
    this.callouts.forEach(callout => callout.updateArc());
  }

  forEach(callback) {
    this.callouts.forEach(callback);
  }
}

export function createCallout(target) {
  let configs = target.configs;
  target.comment.remove();
  if (Array.isArray(configs)) {
    return configs.map(config => createCallout({ ...target, configs: config }));
  }

  return new Callout(target.node, configs);
}

export default function createCallouts(targets) {
  let callouts = targets.flatMap(createCallout);
  return new CalloutCollection(callouts);
}
