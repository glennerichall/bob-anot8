import printImg from "../images/printer.svg";
import { debounce } from "./utils.js";
import { resizeFull } from "./positionning.js";
import { saveAs } from "file-saver";
import glass from "./glass.js";
import { bounds } from "./bounds.js";
import { selectAnElement, selectASnap } from "./snap";
import store from "./storage.js";
import finder from "@medv/finder";

function clean(dom) {
  dom
    .querySelectorAll(
      ".callouts,.menu,.dummy,.connectors,#SvgjsSvg1001,#callout-styles,#mask,#glass,#selector"
    )
    .forEach(elem => elem.remove());

  dom.querySelectorAll(".annotated").forEach(elem => {
    elem.classList.remove("annotated");
    elem.removeAttribute("tag-id");
  });

  dom.querySelectorAll('[class=""]').forEach(elem => {
    elem.removeAttribute("class");
  });

  dom.getElementsByTagName("html")[0].classList.remove("page");

  let scripts = dom.querySelectorAll("script");
  Array.from(scripts).forEach(script => {
    let previous = script.previousSibling;
    while (!!previous && previous.nodeType != 8)
      previous = previous.previousSibling;
    if (
      !!previous &&
      previous.nodeValue.includes("Code injected by live-server")
    ) {
      script.remove();
      previous.remove();
    }
  });
}

function deepClone(dom) {
  let xml = new XMLSerializer().serializeToString(dom);
  xml = xml.replace(' xmlns="http://www.w3.org/1999/xhtml"', "");
  return new DOMParser().parseFromString(xml, "text/html");
}

function save(dom, filename) {
  let xml = new XMLSerializer().serializeToString(dom);
  // xml = beautify(xml);

  var file = new File([xml], filename, {
    type: "text/html;charset=utf-8"
  });
  saveAs(file);
}

export default class Actions {
  constructor(callouts) {
    this.callouts = callouts;

    this.requestUpdate = debounce(() => {
      console.log("update requested");
      let elems = document.querySelectorAll(".resize-to-body");
      Array.from(elems).forEach(elem => resizeFull(elem));
      this.callouts.update();
    });
  }

  get html() {
    return document.querySelector("html");
  }

  print() {
    let html = this.html;
    html.classList.add("print");
    this.requestUpdate();
    this.requestedFromMenu = true;
    window.print();
    this.requestedFromMenu = false;
    html.classList.remove("print");
  }

  clear() {
    store.clearAll();
    this.requestUpdate();
  }

  export() {
    let clone = deepClone(document);
    this.callouts.insertInto(clone);
    clean(clone);
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf("/") + 1);
    save(clone, filename);
  }

  get isHidden() {
    return this.html.classList.contains("hide-callouts");
  }

  add() {
    selectAnElement(this.html, elem => {
      if (!!elem) {
        // selectASnap(elem, snap => {
        //   console.log(snap);
        // });

        let selector = finder(elem, {
          root: document.body,
          seedMinLength: 3,
          className: () => false
          // className: (name) => name != 'is-hover' && name != 'annotated',
        });
        let id = this.callouts.nextId();
        let configs = {
          id,
          type: "html",
          message: "$tag",
          "horizontal-snap": "border-right",
          "vertical-snap": "content",
          "horizontal-align": "right",
          "vertical-align": "middle",
          "horizontal-anchor": "center",
          "vertical-anchor": "middle",
          "margin-left": "0px",
          "margin-top": "0px",
          "callout-left": "0px",
          "callout-top": "0px"
        };
        let callout = this.callouts.add(elem, configs);
        callout.install();
        callout.update();
        store.push("dangling", {
          selector,
          configs
        });
      }
    });
  }

  hide() {
    this.html.classList.add("hide-callouts");
  }

  show() {
    this.html.classList.remove("hide-callouts");
  }

  toggleVisible() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  togglePage() {
    let html = this.html;
    if (html.classList.contains("page")) {
      html.classList.remove("page");
      Array.from(document.querySelectorAll(".page-break")).forEach(sep =>
        sep.remove()
      );
    } else {
      html.classList.add("page");

      let rect = bounds(html);
      const ph = 11 * 96;
      let n = Math.ceil(rect.height / ph);
      for (let i = 1; i < n; i++) {
        let y = rect.top + i * n + 30;
        let separator = glass()
          .line(rect.left, y, rect.right, y)
          .stroke({ width: 2, color: "black", dasharray: "10, 5" });
        separator.node.classList.add("page-break");
      }
    }

    this.requestUpdate();
  }
}
