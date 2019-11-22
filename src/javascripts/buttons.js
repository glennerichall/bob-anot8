import { events } from "./events.js";
import store from './storage.js';

export function createButton(menu) {
  let button = document.createElement("div");
  button.classList.add("button");
  if (menu) menu.appendChild(button);
  return button;
}

export const createToggleButton = saveStateId => menu => {
  let button = createButton(menu);
  button.classList.add("toggle");
  let checked = false;

  if (!!saveStateId) {
    var initCheck = store.get(saveStateId);
    if (initCheck) {
      setTimeout(() => button.click());
    }
  }

  events(button).click = () => {
    checked = !checked;
    if (checked) {
      // todo custom events
      button.classList.add("checked");
      if (button.onchecked) button.onchecked();
    } else {
      button.classList.remove("checked");
      if (button.onchecked) button.onunchecked();
    }
    if (!!saveStateId) {
      store.set(saveStateId, checked);
    }
  };

  return button;
};
