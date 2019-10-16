import { events, onReady } from './events.js';
import enableDrag from './drag.js';
import { bounds } from './bounds';

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

  let input;
  let isEditing = false;

  events(content).dblclick = () => {
    if (isEditing) return;
    isEditing = true;

    content.classList.add('editing');
    ending.classList.add('editing');
    node.classList.add('editing');

    input = document.createElement('textarea');
    input.classList.add('editor');

    callouts.appendChild(input);
    let rect = bounds(content);
    bounds(input)
      .setLeft(rect.left)
      .setTop(rect.bottom)
      .setWidth(rect.width)
      .keepInViewport();
    input.textContent = JSON.stringify(callout.configs, null, 2);

    mask.classList.add('visible');
    setTimeout(() => input.classList.add('show'));

    events(input).transitionend.once = () =>
      input.style.setProperty('transition', 'none');
  };

  events(mask).click = () => {
    if (!isEditing) return;
    content.classList.remove('editing');
    ending.classList.remove('editing');
    node.classList.remove('editing');
    
    mask.classList.remove('visible');

    events(input).transitionend.once = () => {
        mask.classList.remove('hiding');
        ending.classList.remove('hiding');
        node.classList.remove('hiding');
        content.classList.remove('hiding');
        input.remove();
    }

    mask.classList.add('hiding');
    ending.classList.add('hiding');
    node.classList.add('hiding');
    content.classList.add('hiding');

    input.style.removeProperty('transition');
    input.classList.remove('show');

    isEditing = false;
  };

  enableDrag(content);
  enableDrag(ending);

  // content dragging
  events(content).drop = evt => {
    let { delta } = evt.detail;
    if (delta.x == 0 && delta.y == 0) return;
    let r = bounds(content);
    callout.saveState({
      'callout-left': r.left + 10 + 'px',
      'callout-top': r.top + 10 + 'px'
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
