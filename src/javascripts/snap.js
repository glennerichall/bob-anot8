import { Context, onReady } from './events';
import { bounds } from './bounds.js';
import '../css/snap.css';

let selector;
onReady(() => {
  selector = document.createElement('div');
  selector.id = 'selector';
  selector.classList.add('selector');
  document.body.appendChild(selector);
});

export function selectAnElement(parent, listener) {
  let selection = null;
  let onclick = null;

  let ctx = new Context();
  let events = ctx.events;

  const applySelection = elem => {
    if (elem != selection) {
      if (!!selection) {
        selection.classList.remove('isHover');
        selection.onclick = onclick;
      }
      if (!!elem) {
        elem.classList.add('isHover');
        bounds(selector).from(elem);
        selector.setAttribute('tag-name', elem.tagName);
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
    listener(elem);
  };
}

export function selectASnap(elem, listener) {
  let ctx = new Context();
  let events = ctx.events;

  let html = document.querySelector('html');
  html.classList.add('select-a-snap');

  let b = bounds(elem);
  let done = snap => {
    ctx.clear();
    html.classList.remove('select-a-snap');
    listener(snap);
  };

  let selection;
  events(elem.parentNode).mousemove = evt => {};
  events(document.body).key('KeyQ').once = () => done();
  events(elem.parentNode).click.once = () => done(selection);
}
