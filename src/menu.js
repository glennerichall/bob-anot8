import './menu.css';

import { createToggleButton, createButton } from './buttons.js';
import { debounce } from './utils.js';
import { resizeFull } from './positionning.js';
import { createImage } from './images.js';
import { saveAs } from 'file-saver';

import logo_calma from './logo_calma.svg';
import printImg from './printer.svg';
import fileImg from './file.svg';
import trashImg from './trash.svg';
import saveImg from './save.svg';

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
    toggleBorder.onchecked = () =>
      callouts.forEach(callout => callout.elem.classList.add('bordered'));
    toggleBorder.onunchecked = () =>
      callouts.forEach(callout => callout.elem.classList.remove('bordered'));
  }

  let version = document.createElement('div');
  version.id = 'version';
  version.innerText = process.env.version;
  menu.appendChild(version);


  // Print action
  let requestedFromMenu = false;
  let print = createButton(menu);
  print.innerText = 'Imprimer';
  createImage(print, printImg);
  print.onclick = () => {
    document.body.classList.add('print');
    requestUpdate();
    requestedFromMenu = true;
    window.print();
    requestedFromMenu = false;
    document.body.classList.remove('print');
  };

  // Clear action
  let clear = createButton(menu);
  clear.innerText = 'Effacer';
  createImage(clear, trashImg);
  clear.onclick = () => {
    localStorage.clear();
    requestUpdate();
  };

  // Download action
  let download = createButton(menu);
  download.innerText = 'Télécharger';
  createImage(download, fileImg);
  download.onclick = () => {
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/')+1);
    var file = new File(['Hello, world!'], filename, {
      type: 'text/html;charset=utf-8'
    });
    saveAs(file);
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

  requestUpdate();
}
