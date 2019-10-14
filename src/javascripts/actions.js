import printImg from '../images/printer.svg';
import { debounce } from './utils.js';
import { resizeFull } from './positionning.js';
import { saveAs } from 'file-saver';

function clean(dom) {
  dom
    .querySelectorAll('.callouts,.menu,.dummy,.connectors,#SvgjsSvg1001,#callout-styles')
    .forEach(elem => elem.remove());

  dom.querySelectorAll('.annotated').forEach(elem => {
    elem.classList.remove('annotated');
    elem.removeAttribute('tag-id');
  });

  dom.querySelectorAll('[class=""]').forEach(elem => {
    elem.removeAttribute('class');
  });

  let scripts = dom.querySelectorAll('script');
  Array.from(scripts).forEach(script => {
    let previous = script.previousSibling;
    while (!!previous && previous.nodeType != 8)
      previous = previous.previousSibling;
    if (
      !!previous &&
      previous.nodeValue.includes('Code injected by live-server')
    ) {
      script.remove();
      previous.remove();
    }
  });
}

function deepClone(dom) {
  let xml = new XMLSerializer().serializeToString(dom);
  xml = xml.replace(' xmlns="http://www.w3.org/1999/xhtml"', '');
  return new DOMParser().parseFromString(xml, 'text/html');
}

function save(dom, filename) {
  let xml = new XMLSerializer().serializeToString(dom);
  // xml = beautify(xml);

  var file = new File([xml], filename, {
    type: 'text/html;charset=utf-8'
  });
  saveAs(file);
}

export default class Actions {
  constructor(callouts) {
    this.callouts = callouts;

    this.requestUpdate = debounce(() => {
      let elems = document.querySelectorAll('.resize-to-body');
      Array.from(elems).forEach(elem => resizeFull(elem));
      this.callouts.update();
    });
  }

  print() {
    document.body.classList.add('print');
    this.requestUpdate();
    this.requestedFromMenu = true;
    window.print();
    this.requestedFromMenu = false;
    document.body.classList.remove('print');
  }

  clear() {
    localStorage.clear();
    this.requestUpdate();
  }

  export() {
    let clone = deepClone(document);
    this.callouts.insertInto(clone);
    clean(clone);
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/') + 1);
    save(clone, filename);
  }

  add() {}
}
