import {Rectangle, removeOverlaps as rmvOverlaps} from 'webcola';

// -------------------------------------
export default function getPosition(callout, target, configs) {
  let top = null;
  let left = null;
  var rect = target.getBoundingClientRect();
  var css = getComputedStyle(target);

  configs = configs || {};
  configs = {
    'vertical-align': 'bottom',
    'horizontal-align': 'middle',
    position: 'border-bottom',
    ...configs
  };

  let position = configs.position;

  var value = v => Number.parseFloat(v.replace('px'));
  css.v = name => value(css[name]);

  if (position == 'border-bottom') {
    top = rect.bottom - css.v('borderBottomWidth') / 2;
    left = rect.left;
  }

  if (position == 'border-bottom-right') {
    top = rect.bottom - css.v('border-bottom-width') / 2;
    left = rect.right - css.v('border-right-width') / 2;
  } else if (position == 'border-left') {
    left = rect.left + css.v('border-left-width') / 2;
    top = rect.top;
  } else if (position == 'border-top-left') {
    left = rect.left + css.v('border-left-width') / 2;
    top = rect.top + css.v('border-top-width') / 2;
  } else if (position == 'border-right') {
    left = rect.right - css.v('border-right-width') / 2;
    top = rect.top;
  } else if (position == 'padding-left') {
    left = rect.left + css.v('padding-left') / 2;
    top = rect.top;
  } else if (position == 'padding-right') {
    left = rect.right - css.v('padding-right') / 2;
    top = rect.top;
  } else if (position == 'text-right') {
    let font = css['font-size'] + ' ' + css['font-family'];
    let weight = css['font-weight'];
    left = rect.left + target.innerText.width(font, weight);
    top = rect.top;
  } else if (position == 'text-middle-right') {
    let font = css['font-size'] + ' ' + css['font-family'];
    let weight = css['font-weight'];
    let height = css.v('font-size');
    left = rect.left + target.innerText.width(font, weight);
    top = rect.top + height / 2;
  }

  if (configs['vertical-align'] == 'bottom') {
    top -= callout.getBoundingClientRect().height;
  } else if (configs['vertical-align'] == 'top') {
  } else if (configs['vertical-align'] == 'middle') {
    top -= callout.getBoundingClientRect().height / 2;
  }

  if (configs['horizontal-align'] == 'left') {
  } else if (configs['horizontal-align'] == 'right') {
    left -= callout.getBoundingClientRect().width;
  } else if (configs['horizontal-align'] == 'center') {
    left -= callout.getBoundingClientRect().width / 2;
  }

  if (configs['margin-top']) {
    top += Number.parseFloat(configs['margin-top']);
  }

  if (configs['margin-left']) {
    left += Number.parseFloat(configs['margin-left']);
  }

  if (top != null && top < 10) top = 10;
  if (left != null && left < 10) left = 10;

  return { left, top };
}

export function getRects(nodes) {
  let i = 0;
  const margin = 10;
  let rects = Array.from(nodes).map(node => {
    let rect = node.getBoundingClientRect();
    // epsilon values because of bug in cola: https://github.com/tgdwyer/WebCola/issues/279
    let j = Number.EPSILON * 500 * i++;
    return new Rectangle(
      rect.left + j - margin,
      rect.right + margin,
      rect.top + j - margin,
      rect.bottom + margin
    );
  });
  return rects;
}

export function applyRects(nodes, rects) {
  let parents = Array.from(nodes).map(node =>
    node.parentNode.getBoundingClientRect()
  );

  for (let i = 0; i < nodes.length; i++) {
    nodes[i].style.setProperty('left', `${rects[i].x - parents[i].left}px`);
    nodes[i].style.setProperty('top', `${rects[i].y - parents[i].top}px`);
  }
}

export function resizeFull(elem) {
  let r = document.body.getBoundingClientRect();
  let css = getComputedStyle(document.body);

  var value = v => Number.parseFloat(v.replace('px'));
  css.v = name => value(css[name]);

  elem.style.setProperty(
    'width',
    `${r.width + css.v('margin-left') + css.v('margin-right')}px`
  );
  elem.style.setProperty(
    'height',
    `${r.height + css.v('margin-top') + css.v('margin-bottom')}px`
  );
}

export function removeOverlaps(nodes, anchors) {
  let rects = getRects(nodes);
  if (!!anchors) {
    let a = getRects(anchors);
    a = rects.concat(a);
    rmvOverlaps(a);
    applyRects(nodes, rects);
  } else {
    rmvOverlaps(rects);
    applyRects(nodes, rects);
  }
}

// export function moveBy(ref, node, delta) {
//   const r1 = ref.getBoundingClientRect();
//   const r2 = node.getBoundingClientRect();

//   node.style.setProperty('left', `${r1.left + delta.x}px`);
//   node.style.setProperty('top', `${r1.top + delta.y}px`);
// }

export function moveBy(node, delta) {
  const r = node.getBoundingClientRect();

  node.style.setProperty('left', `${r.left + delta.x}px`);
  //   node.style.setProperty('top', `${r.top + delta.y}px`);
}
