export function createImage(elem, src){
    let image = document.createElement('img');
    image.src = src
    elem.appendChild(image);
    return image;
}