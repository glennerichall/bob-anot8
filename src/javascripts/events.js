import { nthEventListener as nth, eventListener } from './utils';

export class Context {
  constructor() {
    this.close = [];
  }
  get events() {
    return this._register.bind(this);
  }

  _register(elem) {
    return events(elem, this);
  }

  add(done) {
    this.close.push(done);
  }

  clear() {
    this.close.forEach(done => done());
  }
}

export function events(elem, context) {
  let type;

  let check = (pred, listener) => evt => {
    let v = pred(evt);
    if (!v) evt.preventDefault();
    return v && listener(evt);
  };

  let builder = predicate => {
    if (!predicate) predicate = () => true;
    return {
      get once() {
        return this.times(1);
      },
      set once(listener) {
        this.once.to = listener;
      },
      set to(listener) {
        this.add(listener);
      },
      set defer(listener) {
        this.defer.to = listener;
      },
      get defer() {
        let self = this;
        return {
          set to(listener) {
            this.add(listener);
          },
          add: listener => {
            let done;
            setTimeout(() => (done = self.add(listener)));
            return () => done();
          }
        };
      },
      times: n => {
        return {
          set to(listener) {
            this.add(listener);
          },
          add: listener => {
            let done = nth(n, elem, type, check(predicate, listener));
            if (!!context) {
              context.add(done);
            }
            return done;
          },
          set defer(listener) {
            this.defer.to = listener;
          },
          get defer() {
            let self = this;
            return {
              set to(listener) {
                this.add(listener);
              },
              add: listener => {
                let done;
                setTimeout(() => (done = self.add(listener)));
                return () => done();
              }
            };
          }
        };
      },
      add: listener => {
        let done = eventListener(elem, type, check(predicate, listener));
        if (!!context) {
          context.add(done);
        }
        return done;
      },
      debounce: dt => {
        return {
          set to(listener) {
            this.add(listener);
          },
          add: listener => {
            let callback = check(predicate, listener);
            let cancel;
            let debouncer = evt => {
              if (!!cancel) clearTimeout(cancel);
              cancel = setTimeout(() => callback(evt), dt);
            };
            let done = eventListener(elem, type, debouncer);
            if (!!context) {
              context.add(done);
            }
          }
        };
      }
    };
  };

  let events = [
    'click',
    'transitionend',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseover',
    'mouseout',
    'keypress',
    'startDrag',
    'drag',
    'drop',
    'change',
    'input',
    'resize'
  ];

  let shim = {
    key(value) {
      type = 'keypress';
      return builder(evt => evt.code == value);
    }
  };

  return events.reduce((obj, event) => {
    Object.defineProperty(obj, event, {
      get: function() {
        type = event;
        return builder();
      },
      set: function(listener) {
        type = event;
        if (event == 'resize') {
          addResizeEvent(elem);
        }
        let done = eventListener(elem, type, listener);
        if (!!context) {
          context.add(done);
        }
      }
    });
    return obj;
  }, shim);
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
