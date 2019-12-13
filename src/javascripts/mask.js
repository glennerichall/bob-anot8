import { onReady } from './events.js';
import anime from 'animejs/lib/anime.es.js';
import '../css/mask.css';

const duration = 500;
const easing = 'easeOutExpo';

let mask;
onReady(() => {
  mask = document.createElement('div');
  mask.id = 'mask';
  mask.classList.add('mask');
  document.body.appendChild(mask);
});

export default {
  show() {
    mask.classList.add('visible');
    anime({
      targets: mask,
      opacity: 0.3,
      duration,
      easing
    });
  },
  hide() {
    mask.classList.add('hiding');
    anime({
      targets: mask,
      opacity: 0,
      duration,
      complete: () => {
        mask.style.removeProperty('opacity');
        mask.classList.remove('visible', 'hiding');
      },
      easing
    });
  },
  get node() {
    return mask;
  }
};
