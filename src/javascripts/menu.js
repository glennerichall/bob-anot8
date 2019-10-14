import '../css/menu.css';

import { createToggleButton, createButton } from './buttons.js';
import { createImage } from './images.js';
// import { xml as beautify } from 'vkbeautify';

import logo_calma from '../images/logo_calma.svg';
import printImg from '../images/printer.svg';
import fileImg from '../images/file.svg';
import trashImg from '../images/trash.svg';
import saveImg from '../images/save.svg';
import plusImg from '../images/plus.svg';
import Actions from './actions.js';

export function menu(callouts) {
  // add menu bar
  let menu = document.createElement('div');
  menu.classList.add('menu');
  document.body.appendChild(menu);

  // add logo
  let logo = createImage(menu, logo_calma);
  logo.id = 'calma-logo';
  menu.appendChild(logo);

  if (process.env.target == 'dev') {
    // Border toggle action
    let toggleBorder = createToggleButton(menu);
    toggleBorder.innerText = 'Afficher les bordures';
    toggleBorder.classList.add('debug');
    toggleBorder.onchecked = () =>
      callouts.forEach(callout => callout.elem.classList.add('bordered'));
    toggleBorder.onunchecked = () =>
      callouts.forEach(callout => callout.elem.classList.remove('bordered'));
  }

  let actions = new Actions(callouts);

  function addButton(text, image, action){
    let btn = createButton(menu);
    btn.innerText = text;
    createImage(btn, image);
    btn.onclick = () => actions[action]();
  }

  // Application version
  let version = document.createElement('div');
  version.id = 'version';
  version.innerText = process.env.version;
  menu.appendChild(version);

  addButton('Imprimer', printImg, 'print');
  addButton('Effacer', trashImg, 'clear');
  addButton('Télécharger', fileImg, 'export');
  addButton('Ajouter', plusImg, 'add');

  // Print handler
  window.addEventListener('resize', () => actions.requestUpdate());
  window.onbeforeprint = () => {
    if (actions.requestedFromMenu) return true;
    alert(
      'Pour un placement optimal des annotations, veuillez utiliser le bouton <Imprimer> dans le menu.'
    );
    return false;
  };

  actions.requestUpdate();
}
