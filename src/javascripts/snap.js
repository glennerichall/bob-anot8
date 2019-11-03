import { Context, onReady } from './events';
import { bounds } from './bounds.js';
import mask from './mask.js';

import '../css/snap.css';

let selector;
let boxModel;
onReady(() => {
  selector = document.createElement('div');
  selector.id = 'selector';
  selector.classList.add('selector');
  document.body.appendChild(selector);

  boxModel = document.createElement('div');
  boxModel.id = 'box-model';
  boxModel.classList.add('box-model');
  selector.appendChild(boxModel);

  const border = document.createElement('div');
  border.classList.add('border');
  boxModel.appendChild(border);

  const padding = document.createElement('div');
  padding.classList.add('padding');
  border.appendChild(padding);
});

export function selectAnElement(parent, listener) {
  let selection = null;
  let onclick = null;

  let ctx = new Context();
  let events = ctx.events;

  const applySelection = elem => {
    if (elem != selection) {
      selector.classList.remove('small');
      if (!!selection) {
        selection.classList.remove('is-hover');
        selection.onclick = onclick;
      }
      if (!!elem) {
        elem.classList.add('is-hover');
        bounds(selector).from(elem);
        selector.setAttribute('tag-name', elem.tagName);
        if (bounds(elem).width <= 100) {
          selector.classList.add('small');
        }
        onclick = elem.onclick;
        elem.onclick = () => false;
      }
      selection = elem;
    }
  };

  let x, y;
  events(document).mousemove.debounce(50).to = evt => {
    x = evt.clientX;
    y = evt.clientY;
    let elem = document.elementFromPoint(x, y);
    applySelection(elem);
  };

  events(document.body).key('KeyW').to = () => {
    if (!!selection && selection.tagName != 'HTML') {
      applySelection(selection.parentNode);
    }
  };

  events(document.body).key('KeyE').to = () => {
    if (!!selection) {
      let child = Array.from(selection.children).filter(elem =>
        bounds(elem).contains(x + window.scrollX, y + window.scrollY)
      );
      if (!!child && child.length) {
        applySelection(child[0]);
      }
    }
  };

  events(document.body).key('KeyQ').once = () => done();
  events(document.body).click.once.defer = () => done(selection);

  parent.classList.add('select-an-element');
  let done = elem => {
    ctx.clear();
    if (!!selection) selection.onclick = onclick;
    parent.classList.remove('select-an-element');
    selector.classList.remove('small');
    listener(elem);
  };
}

export function selectASnap(elem, listener) {
  let ctx = new Context();
  let events = ctx.events;

  mask.show();
  let html = document.querySelector('html');
  html.classList.add('select-a-snap');
  elem.classList.add('target');

  let selection;
  events(selector).mousemove = evt => {
    let x = evt.clientX;
    let y = evt.clientY;
    let elem = document.elementFromPoint(x, y);
    if (selection != elem) {
      if (!!selection) {
        selection.classList.remove('is-hover');
      }
      if (!!elem) {
        elem.classList.add('is-hover');
      }
      selection = elem;
    }
  };
  events(selector).mouseout = () => {
    if (!!selection) selection.classList.remove('is-hover');
    selection = null;
  };

  let b = bounds(elem);
  let done = snap => {
    console.log('done')
    ctx.clear();
    mask.hide();
    elem.classList.remove('target');
    html.classList.remove('select-a-snap');
    listener(snap);
  };

  events(document.body).key('KeyQ').once = () => done();
  events(selector).click.once = () => done(selection);
}
