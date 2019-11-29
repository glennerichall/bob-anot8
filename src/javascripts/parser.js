import { normalize, tagToDesc } from './normalize.js';

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
        msg = msg.replace(match[0], tagToDesc(value));
        match = regexAttr.exec(message);
    }

    return msg;
}
