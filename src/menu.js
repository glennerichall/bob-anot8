import './menu.css';
import { createToggleButton, createButton } from './buttons.js';

export default function menu(callouts) {
  let menu = document.createElement('div');
  menu.classList.add('menu');
  document.body.appendChild(menu);

  // Border toggle button
  let toggleBorder = createToggleButton(elem);
  toggleBorder.innerText = 'Afficher les bordures';
  toggleBorder.onchecked = () =>
    callouts.forEach(callout => callout.elem.classList.add('bordered'));
  toggleBorder.onunchecked = () =>
    callouts.forEach(callout => callout.elem.classList.remove('bordered'));

  // Print action
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

  // Print handler
  window.addEventListener('resize', requestUpdate);
  window.onbeforeprint = () => {
    if (requestedFromMenu) return true;
    alert(
      'Pour un placement optimal des annotations, veuillez utiliser le bouton <Imprimer> dans le menu.'
    );
    return false;
  };
}
