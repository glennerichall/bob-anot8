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
    'drop'
  ];

  return events.reduce((obj, event) => {
    Object.defineProperty(obj, event, {
      get: function() {
        type = event;
        return times;
      },
      set: function(listener) {
        type = event;
        add(listener);
      }
    });
    return obj;
  }, {});
}
