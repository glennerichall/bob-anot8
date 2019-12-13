import { bounds } from "./bounds";
import { annotate } from "./targets.js";
import { parseMessage } from './parser.js';
import getPosition, { moveBy, removeOverlaps } from "./positionning.js";
import enableDrag from "./drag.js";
import * as SVG from "svg.js";
import "../css/callout.css";
import saveImg from "../images/save.svg";
import { createImage } from "./images.js";
import { createButton } from "./buttons.js";
import { events, onReady } from "./events.js";
import store from "./storage.js";
import uniqid from 'uniqid';
import clearImg from '../images/error.svg';
import pencilImg from '../images/pencil.svg';
import { editor, addEditor } from './editor.js';

let draw;
onReady(() => {
  // is used to draw callout lines
  let connectors = document.createElement("div");
  connectors.classList.add("connectors", "resize-to-body");
  connectors.id = "connectors";
  document.body.appendChild(connectors);

  let callouts = document.createElement("div");
  callouts.classList.add("callouts", "resize-to-body");
  callouts.id = "callouts";
  document.body.appendChild(callouts);

  // version 2
  draw = SVG("connectors").size("100%", "100%");

  // version 3.
  // draw = SVG()
  //   .addTo('#connectors')
  //   .size('100%', '100%');
});

function createCalloutMenu() {
  const menu = document.createElement('div');
  menu.classList.add('menu');

  const hover = document.createElement('div');
  hover.appendChild(menu);
  hover.classList.add('hover');

  const button2 = createButton(menu);
  button2.classList.add('edit');
  createImage(button2, pencilImg);

  const button1 = createButton(menu);
  button1.classList.add('delete');
  createImage(button1, clearImg);

  return hover;
}

function createElements(node, configs) {
  let content = document.createElement("div");
  let callouts = document.getElementById("callouts");
  content.classList.add("content", configs.type);

  let text = document.createElement('span');
  text.innerText = parseMessage(node, configs.message);
  text.classList.add('text');
  content.appendChild(text);
  callouts.appendChild(content);

  let ending = document.createElement("div");
  ending.classList.add("ending", configs.type);
  callouts.appendChild(ending);

  const menu = createCalloutMenu();
  content.appendChild(menu);
  return { content, ending, menu };
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
    .stroke({ width: 1, color: "black", dasharray: "3, 2" });
}

let tagId = 0;
class Callout {
  constructor(node, configs) {
    this.node = node;
    this.initialConfigs = configs;
    this.type = configs.type;

    if (!node.hasAttribute("tag-id")) {
      node.setAttribute("tag-id", tagId++);
    }
  }

  get tagId() {
    return this.node.getAttribute("tag-id");
  }

  clearStorage() {
    store.remove(JSON.stringify(this.initialConfigs.id));
  }

  get localStorageConfigs() {
    return store.get(JSON.stringify(this.initialConfigs.id), {});
  }

  get configs() {
    return {
      ...this.initialConfigs,
      ...this.localStorageConfigs
    };
  }

  updateArc() {
    if (!this.arc) {
      this.arc = connect(this.content, this.ending);
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
    bounds(ending)
      .setLeft(left)
      .setTop(top);
  }

  updateType() {
    let ending = this.ending;
    let content = this.content;
    let configs = this.configs;
    if (this.type !== configs.type) {
      content.classList.remove(this.type);
      ending.classList.remove(this.type);
      content.classList.add(configs.type);
      ending.classList.add(configs.type);
      this.type = configs.type;
    }
  }

  updateContent() {
    let configs = this.configs;
    let content = this.content;
    let ending = this.ending;
    const parent = document.querySelector("html").getBoundingClientRect();

    let top = Number.parseFloat(configs["callout-top"]) || 50;
    let left = Number.parseFloat(configs["callout-left"]) || 20;
    left += bounds(ending).left;
    top += bounds(ending).top;

    let rect = bounds(content);
    if (left + rect.width >= parent.right - 10) {
      left = parent.right - rect.width - 10;
    }

    content.querySelector('span.text').innerText = parseMessage(this.node, configs.message);
    bounds(content)
      .setLeft(left)
      .setTop(top);
  }

  reset() {
    bounds(this.content)
      .setLeft(null)
      .setTop(null);
    bounds(this.ending)
      .setLeft(null)
      .setTop(null);
  }

  update() {
    this.updateEnding();
    this.updateContent();
    this.updateArc();
    this.updateType();
  }

  saveState(state) {
    let configs = {
      ...this.localStorageConfigs,
      ...state
    };
    store.set(JSON.stringify(this.configs.id), configs);
  }

  install() {
    let node = this.node;
    let configs = this.configs;

    node.classList.add("annotated");
    let { content, ending, menu } = createElements(node, configs);
    this.content = content;
    this.ending = ending;
    this.menu = menu;

    addEditor(this);

    return true;
  }

  remove() {
    if (confirm('Êtes-vous certain de vouloir supprimer cette info-bulle?')) {
      this.callouts.remove(this);
      this.content.remove();
      this.ending.remove();
      this.arc.remove();
      this.clearStorage();
      let dangling = store.get('dangling');
      for (let i = 0; i < dangling.length; i++) {
        if (dangling[i].configs.id == this.configs.id) {
          dangling.splice(i, 1);
          break;
        }
      }
      store.set('dangling', dangling);
    }
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
    this.forEach(callout => (callout.callouts = this));
  }

  install() {
    return this.callouts.reduce(
      (res, callout) => res && callout.install(),
      true
    );
  }

  remove(callout) {
    const i = this.callouts.indexOf(callout);
    this.callouts.splice(i, 1);
  }

  update() {
    this.callouts.forEach(callout => callout.update());
    const contents = document.querySelectorAll(".callouts .content");
    removeOverlaps(contents);
    this.forEach(callout => callout.updateArc());
  }

  forEach(callback) {
    this.callouts.forEach(callback);
  }

  insertInto(dom) {
    this.forEach(callout => callout.insertInto(dom));
  }

  add(node, configs) {
    const callout = new Callout(node, configs);
    this.callouts.push(callout);
    callout.callouts = this;
    return callout;
  }

  nextId() {
    let ids = this.callouts.map(x => x.configs.id);
    let id = uniqid();
    while (ids.includes(id)) id = uniqid();
    return id;
  }
}

function createCallout(target) {
  let configs = target.configs;
  if (!!target.comment) target.comment.remove();
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
