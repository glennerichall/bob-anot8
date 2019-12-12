import "../css/menu.css";

import { createToggleButton, createButton } from "./buttons.js";
import { createImage } from "./images.js";
import enableDrag from "./drag.js";
import { events } from "./events.js";

import logo_calma from "../images/logo_calma.svg";
import printImg from "../images/printer.svg";
import fileImg from "../images/file.svg";
import trashImg from "../images/trash.svg";
import plusImg from "../images/plus.svg";
import paperImg from "../images/paper.svg";
import eyeImg from "../images/eye.svg";

export function menu(callouts, actions) {
  // add menu bar
  let menu = document.createElement("div");
  menu.classList.add("menu", "action-bar");
  document.body.appendChild(menu);

  enableDrag(menu);
  events(menu).drag = () => {
    menu.classList.add("dragged");
  };

  // add logo
  let logo = createImage(menu, logo_calma);
  logo.id = "logo";
  menu.appendChild(logo);

  function createControl(text, image, action, create) {
    let btn = create(menu);
    btn.innerText = text;
    createImage(btn, image);
    btn.onclick = () => actions[action]();
  }

  function addButton(text, image, action) {
    createControl(text, image, action, createButton);
  }

  function addToggle(text, image, action, saveState) {
    createControl(text, image, action, createToggleButton(saveState));
  }

  // Application version
  let version = document.createElement("div");
  version.id = "version";
  version.innerText = process.env.version;
  menu.appendChild(version);

  addToggle("Affichage", paperImg, "togglePage", "togglePageState");
  addToggle("Masquer", eyeImg, "toggleVisible", "toggleVisibleState");
  addButton("Imprimer", printImg, "print");
  addButton("Effacer", trashImg, "clear");
  addButton("Télécharger", fileImg, "export");
  addButton("Ajouter", plusImg, "add");

  // Print handler
  window.addEventListener("resize", () => actions.requestUpdate());
  window.onbeforeprint = () => {
    if (actions.requestedFromMenu) return true;
    alert(
      "Pour un placement optimal des annotations, veuillez utiliser le bouton <Imprimer> dans le menu."
    );
    return false;
  };
}
