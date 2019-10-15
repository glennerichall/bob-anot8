import { bounds } from './utils.js';
import { parseMessage, annotate } from './targets.js';
import getPosition, { moveBy, removeOverlaps } from './positionning.js';
import enableDrag from './drag.js';
import * as SVG from 'svg.js';
import '../css/callout.css';
import saveImg from '../images/save.svg';
import { createImage } from './images.js';
import { createButton } from './buttons.js';
import { events } from './events.js';

let draw;
document.addEventListener('DOMContentLoaded', () => {
  // is used to draw callout lines
  let connectors = document.createElement('div');
  connectors.classList.add('connectors', 'resize-to-body');
  connectors.id = 'connectors';
  document.body.appendChild(connectors);

  let callouts = document.createElement('div');
  callouts.classList.add('callouts', 'resize-to-body');
  callouts.id = 'callouts';
  document.body.appendChild(callouts);

  let mask = document.createElement('div');
  mask.id = 'mask';
  mask.classList.add('mask', 'resize-to-body');
  document.body.appendChild(mask);

  // version 2
  draw = SVG('connectors').size('100%', '100%');
  console.log('callouts elements ready');

  // version 3.
  // draw = SVG()
  //   .addTo('#connectors')
  //   .size('100%', '100%');
});

function createElements(node, configs) {
  let content = document.createElement('div');
  let callouts = document.getElementById('callouts');
  content.classList.add('content', configs.type);
  content.innerText = parseMessage(node, configs.message);
  callouts.appendChild(content);

  let ending = document.createElement('div');
  ending.classList.add('ending', configs.type);
  callouts.appendChild(ending);

  return { content, ending };
}

function updateLine(line, a, b) {
  let r1 = bounds(a);
  let r2 = bounds(b);
  return line.plot(
    r1.left + r1.width / 2,
    r1.top + r1.height / 2,
    r2.left + r2.width / 2,
    r2.top + r2.height / 2
  );
}

function connect(a, b) {
  let r1 = bounds(a);
  let r2 = bounds(b);
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

  get tagId() {
    return this.node.getAttribute('tag-id');
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
    let configs = this.configs;
    const { left, top } = getPosition(ending, node, configs);
    ending.style.setProperty('left', `${left}px`);
    ending.style.setProperty('top', `${top}px`);
  }

  updateContent() {
    // this.reset();
    let configs = this.configs;
    let content = this.content;
    let ending = this.ending;
    const e = ending.getBoundingClientRect();
    const w = document.body.getBoundingClientRect().width;

    let top = Number.parseFloat(configs['callout-top']);
    let left = Number.parseFloat(configs['callout-left']);

    if (typeof left !== 'number' || isNaN(left)) {
      left = Number.parseFloat(ending.style.getPropertyValue('left')) + 20;
    }
    if (typeof top !== 'number' || isNaN(top)) {
      top = Number.parseFloat(ending.style.getPropertyValue('top')) + 50;
    }

    let rect = content.getBoundingClientRect();
    if (left + rect.width >= w - 10) {
      left = w - rect.width - 10;
    }

    content.style.setProperty('left', left + 'px');
    content.style.setProperty('top', top + 'px');
  }

  reset() {
    let content = this.content;
    let ending = this.ending;
    content.style.setProperty('left', null);
    content.style.setProperty('top', null);
    ending.style.setProperty('left', null);
    ending.style.setProperty('top', null);
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
    let { content, ending } = createElements(node, configs);
    this.content = content;
    this.ending = ending;

    let canDrag = true;
    let isEditing = false;

    let mask = document.getElementById('mask');
    let editor;
    events(content).dblclick = () => {
      if (isEditing) return;
      isEditing = true;
      canDrag = false;
      content.classList.add('editing');
      ending.classList.add('editing');
      node.classList.add('editing');
      editor = document.createElement('textarea');
      editor.classList.add('editor');
      content.appendChild(editor);
      editor.textContent = JSON.stringify(this.configs, null, 2);
      mask.classList.add('visible');
      setTimeout(() => editor.classList.add('show'));
      events(editor).transitionend.once = () => console.log('to');
    };

    mask.addEventListener('click', () => {
      if (!isEditing) return;
      content.classList.remove('editing');
      ending.classList.remove('editing');
      node.classList.remove('editing');

      editor.style.setProperty(
        'transition',
        'width 0.5s, height 0.5s, opacity 0.5s'
      );
      editor.style.setProperty('width', '0px');
      editor.classList.remove('show');
      mask.classList.remove('visible');
      isEditing = false;
    });

    enableDrag(content);
    enableDrag(ending);

    // content dragging
    events(content).drop = evt => {
      let {delta} = evt.detail;
      if (delta.x == 0 && delta.y == 0) return;
      let r = bounds(content);
      this.saveState({
        'callout-left': r.left + 10 + 'px',
        'callout-top': r.top + 10 + 'px'
      });
      this.callouts.update();
    };

    events(content).drag = () => {
      this.updateArc();
      return canDrag;
    };

    events(ending).drop = evt => {
      let r = bounds(content);
      let mt = this.configs['margin-top'] || '0px';
      let ml = this.configs['margin-left'] || '0px';
      mt = Number.parseFloat(mt);
      ml = Number.parseFloat(ml);
      let {delta} = evt.detail;
      this.saveState({
        'margin-left': ml + delta.x + 'px',
        'margin-top': mt + delta.y + 'px',
        'callout-left': r.left,
        'callout-top': r.top
      });
    };

    events(ending).drag = () => this.updateArc();

    return true;
  }

  insertInto(dom) {
    let configs = this.configs;
    let other = dom.querySelector(`[tag-id="${this.tagId}"]`);
    annotate(other, configs);
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
    const contents = document.querySelectorAll('.callouts .content');
    removeOverlaps(contents);
    this.callouts.forEach(callout => callout.updateArc());
  }

  update() {
    console.log('updating callouts');
    this.callouts.forEach(callout => callout.update());
    this.updatePositions();
  }

  forEach(callback) {
    this.callouts.forEach(callback);
  }

  insertInto(dom) {
    this.callouts.forEach(callout => callout.insertInto(dom));
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
