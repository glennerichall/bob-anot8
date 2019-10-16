import { bounds } from './bounds';
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
    var event = new CustomEvent('startDrag', {
      detail: { origin },
      cancelable: true
    });
    elem.dispatchEvent(event);
  };

  events(document.body).mousemove = evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x,
        y: evt.screenY - origin.y
      };

      var event = new CustomEvent('drag', {
        detail: { delta },
        cancelable: true
      });
      elem.dispatchEvent(event);
      if (event.defaultPrevented) {
        drag = false;
        return;
      }
      bounds(elem)
        .setLeft(position.x + delta.x)
        .setTop(position.y + delta.y);
    }
  };

  events(document.body).mouseup = evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x,
        y: evt.screenY - origin.y
      };

      var event = new CustomEvent('drop', { detail: { delta } });
      elem.dispatchEvent(event);

      drag = false;
    }
  };
}
