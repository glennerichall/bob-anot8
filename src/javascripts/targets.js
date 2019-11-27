import { normalize } from './normalize.js';

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
export function parseMessage(node, message) {
  let regexCss = /\$css\(([^)]*)\)/g;
  let match = regexCss.exec(message);

  let styles = getComputedStyle(node);
  let msg = message;
  while (match) {
    let value = styles[match[1]];
    msg = msg.replace(match[0], normalize(value));
    match = regexCss.exec(message);
  }
  message = msg;

  let regexAttr = /\$attr\((.*)\)/g;
  match = regexAttr.exec(message);

  while (match) {
    let value = node.getAttribute(match[1]);
    msg = msg.replace(match[0], normalize(value));
    match = regexAttr.exec(message);
  }

  let regexType = /\$tag/g;
  match = regexType.exec(message);

  while (match) {
    let value = node.tagName;
    msg = msg.replace(match[0], normalize(value));
    match = regexAttr.exec(message);
  }

  return msg;
}

const tag = 'Annotate:';
// -------------------------------------
export function getTargets(rootElem) {
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
