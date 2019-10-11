import { addStyleSheet } from "./utils.js";

const styles = `
.menu .button {
  display: inline-block;
  min-width: 100px;
  height: 30px;
  border-radius: 5px;
  border: 1px solid grey;
  background-color: lightgrey;
  text-align: center;
  font-size: 0.6em;
  line-height: 30px;
  cursor: pointer;
  user-select: none;
  margin-right: 10px;
  font-size: 0.8em;
  padding-left: 5px;
  padding-right: 5px;
}
.menu .button:last-child{
  margin-right: inherit;
}
.menu {
    position: fixed;
    right: 10px;
    top: 10px;
    z-index: 1000;
    background-color: rgba(150,150,150,0.2);
    padding: 5px;
    border: 1px solid rgba(50,50,50,0.5);
    border-radius: 5px;
}
.menu .button:hover {
  background-color: grey;
}
.menu .button:active {
  background-color: rgb(50,50,50);
}
.menu .button.checked {
  background-color: rgb(60,60,60);
  color: white;
}
@media print {
  .menu .button {
    display: none;
  }
}
`;

addStyleSheet(styles);

let menu = document.createElement('div');
menu.classList.add('menu');
document.body.appendChild(menu);

export function createButton() {
  let button = document.createElement('div');
  button.classList.add('button');
  menu.appendChild(button);
  return button;
}

export function createToggleButton(){
  let button = createButton();
  button.classList.add('toggle');
  let checked = false;
  button.addEventListener('click', ()=>{
    checked = !checked;
    if(checked){
      button.classList.add('checked');
      if(button.onchecked) button.onchecked();
    } else {
      button.classList.remove('checked');
      if(button.onchecked) button.onunchecked();
    }
  });
  return button;
}