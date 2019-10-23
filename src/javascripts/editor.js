import { events, onReady } from './events.js';
import enableDrag from './drag.js';
import { bounds } from './bounds';
import anime from 'animejs/lib/anime.es.js';
import { diff } from './utils.js';
import '../css/editor.css';

let mask;
onReady(() => {
  mask = document.createElement('div');
  mask.id = 'mask';
  mask.classList.add('mask', 'resize-to-body');
  document.body.appendChild(mask);
});

export default function addEditor(callout) {
  const content = callout.content;
  const ending = callout.ending;
  const node = callout.node;
  const duration = 500;
  const easing = 'easeOutExpo';

  let input;
  let output;
  let isEditing = false;

  events(content).dblclick = () => {
    if (isEditing) return;
    isEditing = true;

    [content, ending, node].forEach(elem => elem.classList.add('editing'));

    input = document.createElement('textarea');
    input.classList.add('editor', 'input');

    output = document.createElement('div');
    output.classList.add('log', 'editor');

    callouts.appendChild(input);
    callouts.appendChild(output);

    let rect = bounds(content);

    let bottom = bounds(input)
      .setLeft(rect.left)
      .setTop(rect.bottom)
      .setWidth(rect.width)
      .keepInViewport().bottom;

    let width = bounds(input).width;

    mask.classList.add('visible');
    bounds(output)
      .setLeft(rect.left)
      .setTop(bottom)
      .setWidth(width);

    let resizeListener = () => {
      let bi = bounds(input).keepInViewport();
      if (bi.left < bounds(content).left) {
        bi.left = window.innerWidth - bi.width - 30;
      } else if (bi.left > bounds(content).left) {
        bi.left = bounds(content).left;
      }
      bounds(output)
        .setLeft(bi.left)
        .setTop(bi.bottom + 5)
        .setWidth(bi.width);
    };

    events(input).resize = resizeListener;
    events(input).mouseup = resizeListener;

    input.value = JSON.stringify(callout.configs, null, 2);

    anime({
      targets: mask,
      opacity: 0.9,
      duration,
      easing
    });

    anime({
      targets: input,
      height: '200px',
      duration,
      easing
    });

    anime({
      targets: output,
      height: '200px',
      top: '+=200px',
      duration,
      easing
    });

    anime({
      targets: node,
      'box-shadow': '0px 0px 20px red',
      duration,
      easing
    });

    events(input).input = () => {
      output.innerText = null;
      try {
        let configs = JSON.parse(input.value);
        let initialConfigs = callout.initialConfigs;
        let d = diff(initialConfigs, configs);
        callout.clearStorage();
        callout.saveState(d);
        callout.update();
        callout.updateArc();
      } catch (e) {
        output.innerText = e.message;
      }
    };
  };

  events(mask).click = () => {
    if (!isEditing) return;

    [node, mask, content, ending].forEach(elem => elem.classList.add('hiding'));

    anime({
      targets: mask,
      opacity: 0,
      duration,
      complete: () => {
        mask.style.removeProperty('opacity');
        mask.classList.remove('visible', 'hiding');
      },
      easing
    });

    anime({
      targets: input,
      height: '0px',
      opacity: 0,
      duration,
      complete: () => input.remove(),
      easing
    });

    anime({
      targets: output,
      height: '0px',
      top: '-=200px',
      duration,
      easing,
      complete: () => output.remove()
    });

    anime({
      targets: node,
      'box-shadow': '0px 0px 0px red',
      duration,
      complete: () => {
        node.style.removeProperty('box-shadow');
        [node, content, ending].forEach(elem =>
          elem.classList.remove('hiding')
        );
      },
      easing
    });

    [content, ending, node].forEach(elem => elem.classList.remove('editing'));

    isEditing = false;
    callout.callouts.update();
  };

  enableDrag(content);
  enableDrag(ending);

  // content dragging
  events(content).drop = evt => {
    let { delta } = evt.detail;
    if (delta.x == 0 && delta.y == 0) return;
    let r = bounds(content);
    let o = bounds(ending);
    callout.saveState({
      'callout-left': r.left - o.left + 10 + 'px',
      'callout-top': r.top - o.top + 10 + 'px'
    });
    callout.callouts.update();
  };

  events(content).drag = evt => {
    if (isEditing) evt.preventDefault();
    else callout.updateArc();
  };

  events(ending).drop = evt => {
    let r = bounds(content);
    let mt = callout.configs['margin-top'] || '0px';
    let ml = callout.configs['margin-left'] || '0px';
    mt = Number.parseFloat(mt);
    ml = Number.parseFloat(ml);
    let { delta } = evt.detail;
    callout.saveState({
      'margin-left': ml + delta.x + 'px',
      'margin-top': mt + delta.y + 'px',
      'callout-left': r.left,
      'callout-top': r.top
    });
  };

  events(ending).drag = evt => {
    if (isEditing) evt.preventDefault();
    else callout.updateArc();
  };
}
