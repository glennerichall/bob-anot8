import { Rectangle } from 'webcola';

export function bounds(elem) {
  let rect = elem.getBoundingClientRect();
  return {
    contains(x, y) {
      return !(
        this.left >= x ||
        this.right <= x ||
        this.top >= y ||
        this.bottom <= y
      );
    },
    from(other) {
      let b = bounds(other);
      this.width = b.width;
      this.height = b.height;
      this.top = b.top;
      this.left = b.left;
    },
    setTop(value) {
      this.top = value;
      rect = elem.getBoundingClientRect();
      return this;
    },
    setLeft(value) {
      this.left = value;
      rect = elem.getBoundingClientRect();
      return this;
    },
    setWidth(value) {
      this.width = value;
      rect = elem.getBoundingClientRect();
      return this;
    },
    setLeft(value) {
      this.left = value;
      rect = elem.getBoundingClientRect();
      return this;
    },
    keepInViewport() {
      let html = document.querySelector('html');
      if (this.left < 0) {
        this.left = 0;
      } else if (this.right > window.innerWidth - 30) {
        this.left = window.innerWidth - rect.width - 30;
      }
      return this;
    },
    get isInViewport() {
      let vp = document.body.getBoundingClientRect();
      return this.left >= 0 && this.right <= vp.width;
    },
    set width(value) {
      if (typeof value == 'number') {
        elem.style.setProperty('width', value + 'px');
      } else {
        elem.style.setProperty('width', value);
      }
      rect = elem.getBoundingClientRect();
    },
    set height(value) {
      if (typeof value == 'number') {
        elem.style.setProperty('height', value + 'px');
      } else {
        elem.style.setProperty('height', value);
      }
      rect = elem.getBoundingClientRect();
    },
    get top() {
      return rect.top + window.scrollY;
    },
    set top(value) {
      if (typeof value == 'number') {
        elem.style.setProperty('top', value + 'px');
      } else {
        elem.style.setProperty('top', value);
      }
      rect = elem.getBoundingClientRect();
    },
    get left() {
      return rect.left + window.scrollX;
    },
    set left(value) {
      if (typeof value == 'number') {
        elem.style.setProperty('left', value + 'px');
      } else {
        elem.style.setProperty('left', value);
      }
      rect = elem.getBoundingClientRect();
    },
    get width() {
      return rect.width;
    },
    get height() {
      return rect.height;
    },
    get right() {
      return rect.right + window.scrollX;
    },
    set right(value) {
      if (typeof value == 'number') {
        elem.style.setProperty('right', value + 'px');
      } else {
        elem.style.setProperty('right', value);
      }
      rect = elem.getBoundingClientRect();
    },
    get bottom() {
      return rect.bottom + window.scrollY;
    }
  };
}
