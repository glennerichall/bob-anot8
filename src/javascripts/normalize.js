// -------------------------------------
export function colorHexToName(color) {
  if(!color) return color;
  return color
    .replace('#ff0000', 'rouge')
    .replace('#00ff00', 'vert')
    .replace('#0000ff', 'bleu');
}

// -------------------------------------
export function colorToHex(color) {
  if(!color) return color;
  if (color.substr(0, 1) === '#') {
    return color;
  }
  var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

  if (digits) {
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);

    var rgb = blue | (green << 8) | (red << 16);
    return digits[1] + '#' + rgb.toString(16).padStart(6, '0');
  }
  return color;
}

// -------------------------------------
export function normalizePixels(value) {
  if(!value) return value;
  value = value.replace('px', ' pixels');
  let match = /(\d+\.\d+) pixels/.exec(value);
  if (match) {
    let v = Number.parseFloat(match[1]);
    v = Math.round(v * 10) / 10;
    value = v + ' pixel' + (v <= 1 ? '' : 's');
  }
  return value;
}


// -------------------------------------
export function normalize(value) {
  if(!value) return value;
    value = colorToHex(value);
    value = colorHexToName(value);
    value = normalizePixels(value);
    return value;
  }
  