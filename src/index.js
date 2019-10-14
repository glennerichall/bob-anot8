import { getTargets } from './javascripts/targets.js';
import { addStyleSheet } from './javascripts/utils.js';
import createCallouts from './javascripts/callout.js';
import { menu } from './javascripts/menu.js';
import './css/index.css';

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    let targets = getTargets(document);
    let callouts = createCallouts(targets);

    if (!callouts.install()) {
      alert('unable to install callouts');
      return;
    }

    menu(callouts);
  }, 1000);
});
