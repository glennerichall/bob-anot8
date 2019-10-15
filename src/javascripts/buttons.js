import { events } from './events.js';

export function createButton(menu) {
  let button = document.createElement('div');
  button.classList.add('button');
  if (menu) menu.appendChild(button);
  return button;
}

export function createToggleButton(menu) {
  let button = createButton(menu);
  button.classList.add('toggle');
  let checked = false;

  events(button).click = () => {
    checked = !checked;
    if (checked) {
      // todo custom events
      button.classList.add('checked');
      if (button.onchecked) button.onchecked();
    } else {
      button.classList.remove('checked');
      if (button.onchecked) button.onunchecked();
    }
  };

  return button;
}
