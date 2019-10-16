export function addStyleSheet(content) {
  let style = document.createElement('style');
  style.innerHTML = content;
  document.head.appendChild(style);
  return style;
}

export function addScript(url) {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  document.head.appendChild(script);
  return script;
}

document.addEventListener('DOMContentLoaded', () => {
  // dummy is used to calculate string width with given font
  let dummy = document.createElement('div');
  dummy.classList.add('dummy');
  document.body.appendChild(dummy);
});

let dummy;
String.prototype.width = function(font, weight) {
  if (!dummy) {
    dummy = document.createElement('div');
    dummy.classList.add('dummy');
    document.body.appendChild(dummy);
  }
  let f = font || '12px arial';
  dummy.innerText = this;
  dummy.style.setProperty('font', f);
  dummy.style.setProperty('font-weight', weight);
  return dummy.getBoundingClientRect().width;
};

export function debounce(f) {
  let executing = false;
  let executionPending = false;

  return function executor() {
    if (executing) {
      executionPending = true;
      return;
    }
    executing = true;

    f();
    executing = false;
    if (executionPending) {
      executionPending = false;
      setTimeout(executor, 0);
    }
    // return () => requestAnimationFrame(f);
  };
}

export function nthEventListener(n, elem, type, listener) {
  let count = 0;
  let callback = evt => {
    count++;
    listener(evt);
    if (count >= n) elem.removeEventListener(type, callback);
  };
  elem.addEventListener(type, callback);
}

export function once(elem, type, listener) {
  nthEventListener(1, elem, type, listener);
}

export function diff(o1, o2) {
  return Object.keys(o2).reduce((diff, key) => {
    if (o1[key] === o2[key]) return diff;
    return {
      ...diff,
      [key]: o2[key]
    };
  }, {});
}

// export function each() {
//   let elems = Array.from(arguments);
//   var proxy = new Proxy(
//     {},
//     {
//       get: function(target, name, receiver) {
//         let val = elems[0][name];
//         if (typeof val == 'function') {
//           return each(elems.map(elem => elem[name])());
//         } else {
//           return each(elems.map(elem => elem[name]));
//         }
//       }
//     }
//   );
//   return proxy;
// }
