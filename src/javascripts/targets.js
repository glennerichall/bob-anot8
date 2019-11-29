import { normalize } from './normalize.js';
import store from "./storage.js";

let getIterator = root =>
  document.createNodeIterator(
    root,
    NodeFilter.SHOW_ALL,
    node => {
      // accept only comments (type == 8) containt tag
      if (node.nodeType == 8) {
        return node.nodeValue.includes(tag)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
      // reject pure text nodes
      if (node.nodeType == 3) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
    false
  );

// -------------------------------------

const tag = 'Annotate:';

function targetsFromComments(rootElem) {
  var targets = [];

  // Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
  var iterator = getIterator(rootElem);

  var curNode = iterator.nextNode();
  while (curNode) {
    let comment = curNode.nodeValue;
    let next = iterator.nextNode();
    // find comment nodes (type == 8)
    if (curNode.nodeType == 8) {
      let configs = JSON.parse(comment.replace(tag, ''));
      let target = { node: next, configs, comment: curNode };
      targets.push(target);
    }
    curNode = next;
  }
  return targets;
}


function targetsFromStorage() {
  let danglings = store.get('dangling', []);

  return danglings.map(x => {
    let {configs} = x;
    let node = document.querySelector(x.selector);
    return { node, configs };
  });
}

// -------------------------------------
export function getTargets(rootElem) {
  let targets = targetsFromComments(rootElem);
  let dangling = targetsFromStorage();

  for (let elem of dangling) {
    let found = false;
    for (let target of targets) {
      if (target.node == elem.node) {
        found = true;
        if (!Array.isArray(target.configs)) {
          target.configs = [target.configs];
        }
        target.configs.push(elem.configs);
      }
    }
    if (!found) {
      targets.push(elem);
    }
  }
  return targets;
}

export function annotate(target, configs) {
  let previous = target.previousSibling;
  // ignore text nodes
  while (!!previous && previous.nodeType == 3) {
    previous = previous.previousSibling;
  }

  if (!!previous && previous.nodeType == 8 && previous.nodeValue.includes(tag)) {
    let data = JSON.parse(previous.nodeValue.replace(tag, ''));
    data.push(configs);
    data = tag + JSON.stringify(data, null, 2);
    previous.nodeValue = data;
  } else {
    let parent = target.parentNode;
    let data = tag + '[\n' + JSON.stringify(configs, null, 2) + '\n]';
    let annotation = document.createComment(data);
    let newLine = document.createTextNode('\n');
    parent.insertBefore(newLine, target);
    parent.insertBefore(annotation, newLine);
  }
}
