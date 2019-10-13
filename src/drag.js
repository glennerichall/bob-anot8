export default function enableDrag(elem, events) {
  let drag = false;
  let origin;
  let position;
  elem.style.setProperty('position', 'absolute');
  elem.addEventListener('mousedown', evt => {
    drag = true;
    origin = {
      x: evt.screenX,
      y: evt.screenY
    };
    position = {
      x: elem.offsetLeft,
      y: elem.offsetTop
    };
    if (!!events && events.onstart) events.onstart(origin);
  });
  document.body.addEventListener('mousemove', evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x + position.x,
        y: evt.screenY - origin.y + position.y
      };
      elem.style.setProperty('left', `${delta.x}px`);
      elem.style.setProperty('top', `${delta.y}px`);
      if (!!events && events.ondrag) events.ondrag(delta);
    }
  });
  document.body.addEventListener('mouseup', evt => {
    if (drag) {
      let delta = {
        x: evt.screenX - origin.x + position.x,
        y: evt.screenY - origin.y + position.y
      };
      if (!!events && events.ondrop) events.ondrop(delta);
      drag = false;
    }
  });
}
