importScripts('ext/promise-poly.js');
importScripts('ext/fetch-poly.js');

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const PATH_TO_LAYOUTS_FOLDER = '../layouts/';





onmessage = function (e) {
        const message = e.data;
    loadFile(message.layout);
};

/**
 onmessage = e => {
    const message = e.data;
    loadFile(message.layout);
};
*/
function makeRequest() {

}


function loadFile(layoutFile) {

    const prefix = PATH_TO_LAYOUTS_FOLDER;

    layoutFile = prefix + layoutFile;

   // console.log("layout........: ", layoutFile);


    fetch(layoutFile, {
        credentials: 'same-origin'
    }).then(function (response) {
        return response;
    }).then(function (data) {
        return data.text();
    }).then(function (xmlLayout) {


        // console.log(xmlLayout);
        let data = {};

        data.content = xmlLayout;

        postMessage(data);

    }).catch(function (err) {
        /* postMessage works when you return a string. */
        postMessage({error: err.message});

        setTimeout(function () {
            throw err;
        });
    });

}




makeRequest();
