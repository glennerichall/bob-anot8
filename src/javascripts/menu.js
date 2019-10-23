import '../css/menu.css';

import { createToggleButton, createButton } from './buttons.js';
import { createImage } from './images.js';
import enableDrag from './drag.js';
import { events } from './events.js';

import logo_calma from '../images/logo_calma.svg';
import printImg from '../images/printer.svg';
import fileImg from '../images/file.svg';
import trashImg from '../images/trash.svg';
import plusImg from '../images/plus.svg';
import paperImg from '../images/paper.svg';

export function menu(callouts, actions) {
  // add menu bar
  let menu = document.createElement('div');
  menu.classList.add('menu');
  document.body.appendChild(menu);

  enableDrag(menu);
  events(menu).drag = () => {
    menu.classList.add('dragged');
  };

  // add logo
  let logo = createImage(menu, logo_calma);
  logo.id = 'calma-logo';
  menu.appendChild(logo);

  // if (process.env.target == 'dev') {
  //   // Border toggle action
  //   let toggleBorder = createToggleButton(menu);
  //   toggleBorder.innerText = 'Afficher les bordures';
  //   toggleBorder.classList.add('debug');
  //   toggleBorder.onchecked = () =>
  //     callouts.forEach(callout => callout.elem.classList.add('bordered'));
  //   toggleBorder.onunchecked = () =>
  //     callouts.forEach(callout => callout.elem.classList.remove('bordered'));
  // }

  function createControl(text, image, action, create) {
    let btn = create(menu);
    btn.innerText = text;
    createImage(btn, image);
    btn.onclick = () => actions[action]();
  }

  function addButton(text, image, action) {
    createControl(text, image, action, createButton);
  }

  function addToggle(text, image, action) {
    createControl(text, image, action, createToggleButton);
  }

  // Application version
  let version = document.createElement('div');
  version.id = 'version';
  version.innerText = process.env.version;
  menu.appendChild(version);

  addToggle('Affichage', paperImg, 'togglePage');
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
}
