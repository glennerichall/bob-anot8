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
    this.elem.onclick = evt=>{
      evt.stopPropagation();
    };

    this.elem.innerHTML = `
      <div class="pane">
        <div>
          <label for="id">id</label><input id="id" readonly value="">
        </div>
      </div>
    `
    document.body.appendChild(this.elem);
  }

  show(callout) {
    this.elem.querySelector('.pane').classList.add('show');
    this.elem.querySelector('#id').value = callout.options.id;
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
  //  () => {

  // mask.show();

  // events(input).input = () => {
  //   output.innerText = null;
  //   try {
  //     let configs = JSON.parse(input.value);
  //     let initialConfigs = callout.initialConfigs;
  //     let d = diff(initialConfigs, configs);
  //     callout.clearStorage();
  //     callout.saveState(d);
  //     callout.update();
  //     callout.updateArc();
  //   } catch (e) {
  //     output.innerText = e.message;
  //   }
  // };
  // };

  // events(mask.node).click = () => {
  //   if (!isEditing) return;

  //   [node, content, ending].forEach(elem => elem.classList.add("hiding"));

  //   mask.hide();

  //   anime({
  //     targets: input,
  //     height: "0px",
  //     opacity: 0,
  //     duration,
  //     complete: () => input.remove(),
  //     easing
  //   });

  //   anime({
  //     targets: output,
  //     height: "0px",
  //     top: "-=200px",
  //     duration,
  //     easing,
  //     complete: () => {
  //       [node, content, ending].forEach(elem =>
  //         elem.classList.remove("hiding")
  //       );
  //       output.remove();
  //     }
  //   });

  //   // anime({
  //   //   targets: node,
  //   //   'box-shadow': '0px 0px 0px red',
  //   //   duration,
  //   //   complete: () => {
  //   //     node.style.removeProperty('box-shadow');
  //   // [node, content, ending].forEach(elem => elem.classList.remove('hiding'));
  //   //   },
  //   //   easing
  //   // });


  //   isEditing = false;
  //   callout.callouts.update();
  // };

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
