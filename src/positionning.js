import {Rectangle, removeOverlaps as rmvOverlaps} from 'webcola';

const value = v => Number.parseFloat(v.replace('px'));
const cssV = css => ((css.v = name => value(css[name])), css);
const computedStyle = target => cssV(getComputedStyle(target));

function getSnapLocation(target, configs) {
  var rect = target.getBoundingClientRect();
  var css = computedStyle(target);

  configs = configs || {};
  configs = {
    'vertical-align': 'middle',
    'horizontal-align': 'center',
    'vertical-snap': 'content',
    'horizontal-snap': 'content',
    ...configs
  };

  let valign = configs['vertical-align'];
  let halign = configs['horizontal-align'];
  let vsnap = configs['vertical-snap'];
  let hsnap = configs['horizontal-snap'];

  let vdelta = {
    bottom: 0,
    middle: 0,
    top: 0
  };

  let hdelta = {
    left: 0,
    center: 0,
    right: 0
  };

  let left = 0,
    top = 0;

  if (vsnap == 'border-bottom') {
    top = rect.bottom;
    vdelta.top = -css.v('border-bottom-width');
    vdelta.middle = vdelta.top / 2;
  } else if (vsnap == 'padding-bottom') {
    top = rect.bottom;
    let padding = css.v('padding-bottom');
    vdelta.bottom = css.v('border-bottom-width');
    vdelta.top = vdelta.bottom + padding;
    vdelta.middle = vdelta.bottom + padding / 2;
  } else if (vsnap == 'content') {
    top = rect.top;
    let btop = css.v('border-top-width');
    let bbot = css.v('border-bottom-width');
    vdelta.top = btop;
    vdelta.bottom = rect.height - bbot;
    vdelta.middle = rect.height / 2;
  } else if (vsnap == 'padding-top') {
    top = rect.top;
    let padding = css.v('padding-top');
    vdelta.top = -css.v('border-top-width');
    vdelta.bottom = vdelta.top - padding;
    vdelta.middle = vdelta.top - padding / 2;
  } else if (vsnap == 'border-top') {
    top = rect.top;
    vdelta.bottom = css.v('border-top-width');
    vdelta.middle = vdelta.bottom / 2;
  }

  if (hsnap == 'border-left') {
    left = rect.left;
    hdelta.right = css.v('border-left-width');
    hdelta.center = hdelta.right / 2;
  } else if (hsnap == 'padding-left') {
    left = rect.left;
    let padding = css.v('padding-left');
    hdelta.left = css.v('border-left-width');
    hdelta.right = hdelta.left + padding;
    hdelta.center = hdelta.right - padding / 2;
  } else if (hsnap == 'content') {
    left = rect.left;
    hdelta.left = css.v('border-left-width');
    hdelta.right = hdelta.left + rect.width;
    hdelta.center = hdelta.right - rect.width / 2;
  } else if (hsnap == 'padding-right') {
    left = rect.right;
    let padding = css.v('padding-right');
    hdelta.right = -css.v('border-right-width');
    hdelta.left = hdelta.right - padding;
    hdelta.center = hdelta.right - padding / 2;
  } else if (hsnap == 'border-right') {
    left = rect.right;
    hdelta.left = -css.v('border-right-width');
    hdelta.center = hdelta.left / 2;
  } else if (hsnap == 'text') {
    let font = css['font-size'] + ' ' + css['font-family'];
    let weight = css['font-weight'];
    left = rect.left;
    // TODO calculate for text-alignment
    hdelta.right = target.innerText.width(font, weight);
    hdelta.center = hdelta.right / 2;
  }

  top += vdelta[valign];
  left += hdelta[halign];

  return { left, top };
}

function getMargin(target, configs) {
  var rect = target.getBoundingClientRect();

  configs = configs || {};
  configs = {
    'margin-top': '0px',
    'margin-left': '0px',
    ...configs
  };

  let x = 0,
    y = 0;

  let mt = configs['margin-top'].trim();
  let ml = configs['margin-left'].trim();

  y = Number.parseFloat(mt);
  if (mt.endsWith('px')) {
  } else if (mt.endsWith('%')) {
    y /= 100;
    y *= rect.height;
  }

  x = Number.parseFloat(ml);
  if (ml.endsWith('px')) {
  } else if (mt.endsWith('%')) {
    x /= 100;
    x *= rect.width;
  }

  return { x, y };
}

function getAnchorDelta(target, configs) {
  var rect = target.getBoundingClientRect();

  configs = configs || {};
  configs = {
    'vertical-anchor': 'middle',
    'horizontal-anchor': 'center',
    ...configs
  };

  let v = configs['vertical-anchor'];
  let h = configs['horizontal-anchor'];
  let x = 0,
    y = 0;

  if (v == 'middle') {
    y = -rect.height / 2;
  } else if (v == 'bottom') {
    y = -rect.height;
  }

  if (h == 'center') {
    x = -rect.width / 2;
  } else if (h == 'right') {
    x = -rect.width;
  }

  return { x, y };
}

export default function getPosition(callout, target, configs) {
  let { left, top } = getSnapLocation(target, configs);
  let anchor = getAnchorDelta(callout, configs);
  let margin = getMargin(target, configs);

  left += anchor.x + margin.x;
  top += anchor.y + margin.y;

  if (top < 10) top = 10;
  if (left < 10) left = 10;

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
