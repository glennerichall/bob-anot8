import { debounce } from './utils.js';
import { parseMessage, annotate } from './targets.js';
import getPosition, { moveBy, removeOverlaps } from './positionning.js';
import enableDrag from './drag.js';
import * as SVG from 'svg.js';
import style from './callout.css';

let connectors = document.createElement('div');
connectors.classList.add('connectors', 'resize-to-body');
connectors.id = 'connectors';
document.body.appendChild(connectors);
// style.use();

let draw;
document.addEventListener('DOMContentLoaded', () => {
  // is used to draw callout lines

  // version 2
  draw = SVG('connectors').size('100%', '100%');

  // version 3.
  // draw = SVG()
  //   .addTo('#connectors')
  //   .size('100%', '100%');

  style.id = 'bob';
});

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
    this.initialConfigs = configs;
  }

  get content() {
    return this.elem.querySelector('.content');
  }

  get ending() {
    return this.elem.querySelector('.ending');
  }

  get localStorageConfigs() {
    let storage = localStorage.getItem(JSON.stringify(this.initialConfigs.id));
    if (storage) {
      storage = JSON.parse(storage);
    } else {
      storage = {};
    }
    return storage;
  }

  get configs() {
    return {
      ...this.initialConfigs,
      ...this.localStorageConfigs
    };
  }

  updateArc() {
    if (!this.arc) {
      this.arc = connect(
        this.content,
        this.ending
      );
      if (!this.arc) setTimeout(() => this.updateArc(), 100);
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
    this.reset();
    let configs = this.configs;
    let content = this.content;
    const r = content.getBoundingClientRect();
    const w = document.body.getBoundingClientRect().width;

    let top = configs['callout-top'];
    let left = configs['callout-left'];

    if (left) {
      content.style.setProperty('left', left);
    }
    if (top) {
      content.style.setProperty('top', top);
    }

    let rect = content.getBoundingClientRect();
    if (rect.right > w) {
      const p = this.elem.getBoundingClientRect().left;
      moveBy(content, { x: w - rect.right - p, y: 0 });
    }
  }

  reset() {
    let content = this.content;
    content.style.setProperty('left', null);
    content.style.setProperty('top', null);
  }

  update() {
    this.updateEnding();
    this.updateContent();
  }

  saveState(state) {
    let configs = {
      ...this.localStorageConfigs,
      ...state
    };
    localStorage.setItem(
      JSON.stringify(this.configs.id),
      JSON.stringify(configs)
    );
  }

  install() {
    let node = this.node;
    let configs = this.configs;

    node.classList.add('annotated');
    this.elem = createElement(node, configs);
    let content = this.content;

    // content dragging
    let requestUpdate = debounce(() => this.update());
    enableDrag(content, {
      ondrop: () => {
        this.saveState({
          'callout-left': (content.offsetLeft + 10) + 'px',
          'callout-top': (content.offsetTop + 10) + 'px'
        });
        this.callouts.update();
      },
      ondrag: () => this.updateArc()
    });

    let origin = {};
    // ending dragging
    enableDrag(this.ending, {
      onstart: ()=> {
        let configs = this.configs;
        let mt = configs['margin-top'] || '0px';
        let ml = configs['margin-left'] || '0px';
        mt = Number.parseFloat(mt);
        ml = Number.parseFloat(ml);
        origin.x = ml;
        origin.y = mt;
      },
      ondrop: (delta) => {
        let ending = this.ending;
        let mt = this.initialConfigs['margin-top'] || '0px';
        let ml = this.initialConfigs['margin-left'] || '0px';
        mt = Number.parseFloat(mt);
        ml = Number.parseFloat(ml);
        console.log(mt + delta.x);
        this.saveState({
          'margin-left': (ml + delta.x) + 'px',
          'margin-top': (mt + delta.y) + 'px'
        });
      },
      ondrag: () => this.updateArc()
    });

    return true;
  }

  reinsert() {
    let configs = this.configs;
    let node = this.node;
    node.classList.remove('annotated');
    annotate(node, configs);
  }
}

class CalloutCollection {
  constructor(callouts) {
    this.callouts = callouts;
    callouts.forEach(callout => (callout.callouts = this));
  }

  install() {
    return this.callouts.reduce(
      (res, callout) => res && callout.install(),
      true
    );
  }

  updatePositions() {
    const contents = document.querySelectorAll('.callout .content');
    removeOverlaps(contents);
    this.callouts.forEach(callout => callout.updateArc());
  }

  update() {
    this.callouts.forEach(callout => callout.update());
    this.updatePositions();
  }

  forEach(callback) {
    this.callouts.forEach(callback);
  }

  reinsert() {
    this.callouts.forEach(callout => callout.reinsert());
    // document.querySelectorAll('.callout').forEach(node=>node.remove());
  }
}

function createCallout(target) {
  let configs = target.configs;
  target.comment.remove();
  if (Array.isArray(configs)) {
    return configs.map(config => createCallout({ ...target, configs: config }));
  }

  if (!configs.id) {
    console.error(`annotations must have a unique id `);
    console.error(target.comment);
    console.error(target.node);
  }
  return new Callout(target.node, configs);
}

export default function createCallouts(targets) {
  let callouts = targets.flatMap(createCallout);
  return new CalloutCollection(callouts);
}
