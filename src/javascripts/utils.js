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
