import { events, onReady } from "./events.js";
import enableDrag from "./drag.js";
import { bounds } from "./bounds";
// import anime from "animejs/lib/anime.es.js";
import { diff } from "./utils.js";
import mask from "./mask.js";
import "../css/editor.css";


class Editor {
  constructor() {

  }

  install() {
    this.elem = document.createElement('div');
    this.elem.classList.add('editor');
    this.elem.onclick = evt => {
      evt.stopPropagation();
    };

    this.elem.innerHTML = `
      <div class="pane">
        <form id="configs">
          <label for="id">id</label>
          <input id="id" readonly value="">

          <span>Type</span>
          <span>
            <input id="ctype_css" type="radio" name="ctype" value="css">
            <label for="ctype_css">CSS</label>

            <input id="ctype_html" type="radio" name="ctype" value="html">
            <label for="ctype_html">HTML</label>
          </span>

          <span class="group-label">Terminaison horizontal</span>

          <label from="hsnap">Référentiel</label>
            <select id="hsnap" name="hsnap">
              <option value="margin-left">Marge gauche</option>
              <option value="border-left">Bordure gauche</option>
              <option value="padding-left">Remplissage gauche</option>
              <option value="content">Contenu</option>
              <option value="text">Texte</option>
              <option value="padding-right">Remplissage droit</option>
              <option value="border-right">Bordure droite</option>
              <option value="margin-right">Marge droite</option>
          </select>

          <label from="halign">Alignment</label>
          <select id="halign" name="halign">
            <option value="left">À gauche</option>
            <option value="center">Au centre</option>
            <option value="right">À droite</option>
          </select>

          <label from="hanchor">Ancrage</label>
          <select id="hanchor" name="hanchor">
            <option value="left">À gauche</option>
            <option value="center">Au centre</option>
            <option value="right">À droite</option>
          </select>

          <label for="hmargin">Décalage</label>
          <input type="number" name="hmargin" id="hmargin" size="3" style="width:4em">

          <span class="group-label">Terminaison verticale</span>

          <label from="vsnap">Référentiel</label>
            <select id="vsnap" name="vsnap">
              <option value="margin-top">Marge haut</option>
              <option value="border-top">Bordure haut</option>
              <option value="padding-top">Remplissage haut</option>
              <option value="content">Contenu</option>
              <option value="text">Texte</option>
              <option value="padding-bottom">Remplissage bas</option>
              <option value="border-bottom">Bordure bas</option>
              <option value="margin-bottom">Marge bas</option>
          </select>

          <label from="valign">Alignment</label>
          <select id="valign" name="valign">
            <option value="top">En haut</option>
            <option value="middle">Au millieu</option>
            <option value="bottom">En bas</option>
          </select>

          <label from="vanchor">Ancrage</label>
          <select id="vanchor" name="vanchor">
            <option value="top">En haut</option>
            <option value="middle">Au millieu</option>
            <option value="bottom">En bas</option>
          </select>

          <label for="vmargin">Décalage</label>
          <input type="number" name="vmargin" id="vmargin" size="3" style="width:4em">

          <span class="group-label">Info-bulle</span>

          <label for="cleft">Décalage horizontal</label>
          <input type="number" name="cleft" id="cleft" size="3" style="width:4em">

          <label for="ctop">Décalage vertical</label>
          <input type="number" name="ctop" id="ctop" size="3" style="width:4em">

          <span class="group-label" style="text-align:left">Message</span>
          <textarea class="group-label" id="msg" rows="5" style="text-align:left"></textarea>
        </form>
      </div>
    `
    document.body.appendChild(this.elem);
  }
  apply(callout, configs) {
    let initialConfigs = callout.initialConfigs;
    let d = diff(initialConfigs, configs);
    callout.clearStorage();
    callout.saveState(d);
    callout.update();
  }

  show(callout) {
    let configs = callout.configs;
    this.elem.querySelector('.pane').classList.add('show');

    const form = document.forms.configs;

    // Id
    this.elem.querySelector('#id').value = configs.id;

    const change = (elem, prop, transformer) => () => {
      transformer = transformer || (value => value);
      configs[prop] = transformer(elem.value);
      this.apply(callout, configs);
    }

    const bind = (elem, prop, transformer) => {
      transformer = transformer || (value => value);
      if (typeof elem.onchange == 'undefined') {
        Array.from(form.ctype).forEach(
          elem => elem.onchange = change(elem, prop, transformer)
        );
      } else {
        elem.onchange = change(elem, prop, transformer);
      }
      elem.value = transformer(configs[prop]);
    };

    // Callout type (html,css)
    bind(form.ctype, 'type');

    bind(form.halign, "horizontal-align");
    bind(form.hsnap, "horizontal-snap");
    bind(form.hanchor, "horizontal-anchor");
    bind(form.valign, "vertical-align");
    bind(form.vsnap, "vertical-snap");
    bind(form.vanchor, "vertical-anchor");
    bind(form.hmargin, "margin-left", value => Math.round(Number.parseFloat(value)));
    bind(form.vmargin, "margin-top", value => -Math.round(Number.parseFloat(value)));
    bind(form.cleft, "callout-left", value => Math.round(Number.parseFloat(value)));
    bind(form.ctop, "callout-top", value => -Math.round(Number.parseFloat(value)));
    // bind(form.msg, "message");

    form.msg.onkeyup = change(form.msg, 'message');
    form.msg.value = configs.message;

    mask.show();
  }

  hide() {
    this.elem.querySelector('.pane')
      .classList.remove('show');
    mask.hide();
  }
}

export const editor = new Editor();

onReady(() => {
  editor.install();
});

export function addEditor(callout) {
  const { content, ending, menu, node } = callout;
  let isEditing = false;

  function edit() {
    if (isEditing) return;
    isEditing = true;

    [content, ending, node]
      .forEach(elem => elem.classList.add("editing"));

    editor.show(callout);

    events(document.body).click.once.defer.to = () => {
      isEditing = false;
      [content, ending, node]
        .forEach(elem => elem.classList.remove("editing"));
      editor.hide();
      callout.callouts.update();
    }
  }

  events(menu.querySelector('.delete')).click = () => callout.remove();
  events(menu.querySelector('.edit')).click = edit;
  events(content).dblclick = edit;

  enableDrag(content);
  enableDrag(ending);

  // content dragging
  events(content).drop = evt => {
    let { delta } = evt.detail;
    if (delta.x == 0 && delta.y == 0) return;
    let r = bounds(content);
    let o = bounds(ending);
    callout.saveState({
      "callout-left": r.left - o.left + 10 + "px",
      "callout-top": r.top - o.top + 10 + "px"
    });
    callout.callouts.update();
  };

  events(content).drag = evt => {
    if (isEditing) evt.preventDefault();
    else callout.updateArc();
  };

  events(ending).drop = evt => {
    let r = bounds(content);
    let mt = callout.configs["margin-top"] || "0px";
    let ml = callout.configs["margin-left"] || "0px";
    mt = Number.parseFloat(mt);
    ml = Number.parseFloat(ml);
    let { delta } = evt.detail;
    callout.saveState({
      "margin-left": ml + delta.x + "px",
      "margin-top": mt + delta.y + "px",
      "callout-left": r.left,
      "callout-top": r.top
    });
  };

  events(ending).drag = evt => {
    if (isEditing) evt.preventDefault();
    else callout.updateArc();
  };
}
