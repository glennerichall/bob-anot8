import { nthEventListener } from './utils';

export function events(elem) {
  let type;
  let n = Infinity;
  let add = listener => nthEventListener(n, elem, type, listener);
  let times = {
    set once(listener) {
      n = 1;
      add(listener);
    },
    times: m => {
      n = m;
      return add;
    },
    add
  };

  let events = [
    'click',
    'transitionend',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'startDrag',
    'drag',
    'drop',
    'change',
    'input',
    'resize'
  ];

  return events.reduce((obj, event) => {
    Object.defineProperty(obj, event, {
      get: function() {
        type = event;
        return times;
      },
      set: function(listener) {
        type = event;
        if (event == 'resize') {
          addResizeEvent(elem);
        }
        add(listener);
      }
    });
    return obj;
  }, {});
}

export function onReady(listener) {
  document.addEventListener('DOMContentLoaded', listener);
}

// This fiddle shows how to simulate a resize event on a
// textarea
// Tested with Firefox 16-25 Linux / Windows
// Chrome 24-30 Linux / Windows

export function addResizeEvent(elem) {
  if (!!elem.hasResizeEvent) return;

  elem.hasResizeEvent = true;
  var resizeInt = null;

  // the handler function
  var resizeEvent = () => {
    let event = new CustomEvent('resize');
    elem.dispatchEvent(event);
  };

  // This provides a "real-time" (actually 15 fps)
  // event, while resizing.
  // Unfortunately, mousedown is not fired on Chrome when
  // clicking on the resize area, so the real-time effect
  // does not work under Chrome.
  events(elem).mousedown = e =>
    (resizeInt = setInterval(resizeEvent, 1000 / 15));

  // The mouseup event stops the interval,
  // then call the resize event one last time.
  // We listen for the whole window because in some cases,
  // the mouse pointer may be on the outside of the textarea.
  events(window).mouseup = e => {
    if (resizeInt !== null) {
      clearInterval(resizeInt);
    }
    resizeEvent();
  };
}
