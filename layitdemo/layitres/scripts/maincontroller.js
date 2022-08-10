/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




/* global ViewController */

MainController.prototype = Object.create(ViewController.prototype);
MainController.prototype.constructor = MainController;

function MainController(workspace) {
    ViewController.call(this, workspace);
}


/**
 * Don't try to access your views here please.
 * The views may or may not be ready yet!
 * This only signifies that your ViewController has been created.
 * @param {Workspace} wkspc The workspace
 * @returns {undefined}
 */
MainController.prototype.onCreate = function (wkspc) {
    ViewController.prototype.onCreate.call(this, wkspc);
//Your code goes below here
};

/**
 * You may now begin to use your views.
 * @param {Workspace} wkspc The workspace
 * @returns {undefined}
 */
MainController.prototype.onViewsReady = function (wkspc) {
    ViewController.prototype.onViewsReady.call(this, wkspc);
//Your code goes below here


    let controller = this;
    let data = wkspc.templateData;

    let btn1 = this.findHtmlViewById('nav_btn_1');
    let btn2 = this.findHtmlViewById('nav_btn_2');
    let btn3 = this.findHtmlViewById('nav_btn_3');

    if(btn1){
        btn1.onclick = function (e) {
            goToView("two.xml");
        };
    }
    if(btn2){
        btn2.onclick = function (e) {
            goToView("three.xml");
        };
    }
    if(btn3){
        btn3.onclick = function (e) {
            goToView("one.xml");
        };
    }





};


