/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*
function addClass(element, className) {
    if (element.className.length === 0) {
        element.className = className;
    } else {
        let arr = element.className.split(" ");
        if (arr.indexOf(className) === -1) {
            element.className += " " + className;
        }
    }
}
*/


function addClass(element, className) {
    if (element.className.length === 0) {
        element.className = className;
    } else {
        if(element.className.indexOf(className) === -1){
            element.className += " " + className;
        }
    }
}

function removeClass(element, className) {
    element.classList.remove(className);
}

function isDomEntity(entity) {
    return typeof entity === 'object' && entity.nodeType !== undefined;
}