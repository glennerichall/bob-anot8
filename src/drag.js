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
  });
  document.body.addEventListener('mousemove', evt => {
    if (drag) {
      elem.style.setProperty(
        'left',
        `${evt.screenX - origin.x + position.x}px`
      );
      elem.style.setProperty('top', `${evt.screenY - origin.y + position.y}px`);
      if (!!events && events.ondrag) events.ondrag();
    }
  });
  document.body.addEventListener('mouseup', () => {
    if (!!events && events.ondrop && drag) events.ondrop();
    drag = false;
    origin = undefined;
  });
}
