import { getTargets } from './targets.js';
import styleSheets from './styles.js';
import { addStyleSheet, debounce } from './utils.js';
import createCallouts from './callout.js';
import { createToggleButton, createButton } from './menu.js';
import { resizeFull } from './positionning.js';

addStyleSheet(styleSheets);

document.addEventListener('DOMContentLoaded', () => {
  let targets = getTargets(document);
  let callouts = createCallouts(targets);

  if (!callouts.install()) {
    alert('unable to install callouts');
  }



  
});
