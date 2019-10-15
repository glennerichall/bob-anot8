export default function enableDrag(elem, events) {
  let drag = false;
  let origin;
  let position;
  elem.addEventListener('mousedown', evt => {
    drag = true;
    origin = {
      x: evt.screenX,
      y: evt.screenY
    };
    let r = elem.getBoundingClientRect();
    position = {
      x: r.left,
      y: r.top
    };
    if (!!events && events.onstart) events.onstart(origin);
  });
  document.body.addEventListener('mousemove', evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x,
        y: evt.screenY - origin.y
      };
      if (!!events && events.ondrag) drag = events.ondrag(delta);
      if(!drag) return;
      elem.style.setProperty('left', `${position.x + delta.x}px`);
      elem.style.setProperty('top', `${position.y + delta.y}px`);
    }
  });
  document.body.addEventListener('mouseup', evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x,
        y: evt.screenY - origin.y
      };
      if (!!events && events.ondrop) events.ondrop(delta);
      drag = false;
    }
  });
}
