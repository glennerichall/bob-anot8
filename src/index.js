import { getTargets } from './targets.js';
import styleSheets from './styles.js';
import { addStyleSheet, addScript, debounce } from './utils.js';
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

  let toggleBorder = createToggleButton();
  toggleBorder.innerText = 'Afficher les bordures';
  toggleBorder.onchecked = () =>
    callouts.forEach(callout => callout.elem.classList.add('bordered'));
  toggleBorder.onunchecked = () =>
    callouts.forEach(callout => callout.elem.classList.remove('bordered'));

  let requestedFromMenu = false;
  let print = createButton();
  print.innerText = 'Imprimer';
  print.onclick = () => {
    document.body.classList.add('print');
    requestUpdate();
    requestedFromMenu = true;
    window.print();
    requestedFromMenu = false;
    document.body.classList.remove('print');
  };

  const requestUpdate = debounce(() => {
    let elems = document.querySelectorAll('.resize-to-body');
    Array.from(elems).forEach(elem => resizeFull(elem));
    callouts.update();
  });

  requestUpdate();
  window.addEventListener('resize', requestUpdate);
  window.onbeforeprint = () => {
    if (requestedFromMenu) return true;
    alert(
      'Pour un placement optimal des annotations, veuillez utiliser le bouton <Imprimer> dans le menu.'
    );
    return false;
  };
});
