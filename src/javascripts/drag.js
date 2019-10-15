import { bounds } from './utils.js';
import { events } from './events';

export default function drag(elem) {
  let drag = false;
  let origin;
  let position;

  events(elem).mousedown = evt => {
    drag = true;
    origin = {
      x: evt.screenX,
      y: evt.screenY
    };
    let r = bounds(elem);
    position = {
      x: r.left,
      y: r.top
    };
    var event = new CustomEvent('startDrag', { detail: {origin} });
    elem.dispatchEvent(event);
  };

  events(document.body).mousemove = evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x,
        y: evt.screenY - origin.y
      };

      var event = new CustomEvent('drag', { detail: {delta} });
      elem.dispatchEvent(event);

      if (!drag) return;
      elem.style.setProperty('left', `${position.x + delta.x}px`);
      elem.style.setProperty('top', `${position.y + delta.y}px`);
    }
  };

  events(document.body).mouseup = evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x,
        y: evt.screenY - origin.y
      };

      var event = new CustomEvent('drop', { detail: {delta} });
      elem.dispatchEvent(event);

      drag = false;
    }
  };
}
