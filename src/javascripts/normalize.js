// -------------------------------------
export function colorHexToName(color) {
  if (!color) return color;
  return color
    .replace('#ff0000', 'rouge')
    .replace('#00ff00', 'vert')
    .replace('#0000ff', 'bleu')
    .replace('#90ee90', 'vert pâle');
}

// -------------------------------------
export function borderStyle(style) {
  if (!style) return style;
  return style
    .replace('dashed', 'pointillé')
    .replace('dotted', 'à pois');
}

// -------------------------------------
export function colorToHex(color) {
  if (!color) return color;
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
  if (!value) return value;
  value = value.replace('px', ' pixels');
  let match = /(\d+\.\d+) pixels/.exec(value);
  if (match) {
    let v = Number.parseFloat(match[1]);
    v = Math.round(v);
    value = v + ' pixel' + (v <= 1 ? '' : 's');
  }
  return value;
}

const tagNames = {
  H1: 'Titre de niveau 1',
  H2: 'Titre de niveau 2',
  H3: 'Titre de niveau 3',
  H4: 'Titre de niveau 4',
  H5: 'Titre de niveau 5',
  H6: 'Titre de niveau 6',
  A: 'Lien hypertexte',
  B: 'À porter attention',
  CAPTION: 'Légende',
  CODE: 'Code en incise',
  DIV: 'Division',
  DD: 'Définition',
  DL: 'Liste de définitions',
  DT: 'Terme',
  FIGURE: 'Figure',
  FIGCAPTION: 'Légende de figure',
  FORM: 'Formulaire',
  I: 'Texte différencié',
  IMG: 'Image',
  INPUT: 'Champ de saisie',
  LI: 'Élément de liste',
  OL: 'Liste ordonnée',
  P: 'Paragraphe',
  SMALL: ' Commentaires',
  STRONG: 'Haute importance',
  SUP: 'Exposant',
  SUB: 'Indice',
  TABLE: 'Tableau de données',
  TH: 'Entête de tableau',
  TR: 'Ligne de tableau',
  TD: 'Cellule de tableau',
  UL: 'Liste non-ordonnée'
};
export function tagToDesc(value) {
  return tagNames[value] || value;
}


// -------------------------------------
export function normalize(value) {
  if (!value) return value;
  value = colorToHex(value);
  value = colorHexToName(value);
  value = normalizePixels(value);
  value = borderStyle(value);
  return value;
}
