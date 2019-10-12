import { getTargets } from './targets.js';
import styleSheets from './styles.js';
import { addStyleSheet } from './utils.js';
import createCallouts from './callout.js';
import {menu} from './menu.js';
import { resizeFull } from './positionning.js';

addStyleSheet(styleSheets);

document.addEventListener('DOMContentLoaded', () => {
  let targets = getTargets(document);
  let callouts = createCallouts(targets);

  if (!callouts.install()) {
    alert('unable to install callouts');
    return;
  }

  menu(callouts);

  
});
