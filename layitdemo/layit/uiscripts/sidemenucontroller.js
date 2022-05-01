/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




/* global ViewController */

SideMenuController.prototype = Object.create(ViewController.prototype);
SideMenuController.prototype.constructor = SideMenuController;

function SideMenuController(workspace) {
    ViewController.call(this, workspace);
}


/**
 * Don't try to access your views here please.
 * The views may or may not be ready yet! 
 * This only signifies that your ViewController has been created.
 * @param {string} wid The workspace id
 * @returns {undefined}
 */
SideMenuController.prototype.onCreate = function (wid) {
    ViewController.prototype.onCreate.call(this, wid);
//Your code goes below here
};

/**
 * You may now begin to use your views.
 * @param {string} wid The workspace id
 * @returns {undefined}
 */
SideMenuController.prototype.onViewsAttached = function (wid) {
    ViewController.prototype.onViewsAttached.call(this, wid);
//Your code goes below here


let controller = this;
    let btn = this.findHtmlViewById('side_login_btn_ux');
    btn.onclick = function(){
        
       let statesDropDown = controller.findHtmlViewById('pop_title_us_states_drop_down'); 
       let emailField = controller.findHtmlViewById('side_field_ux');
       let pwdField = controller.findHtmlViewById('side_passkey_ux');
       //notes_area
       
       
       
        let state = statesDropDown.options[statesDropDown.selectedIndex].innerText;
        
        let json = {
            state: state,
            email: emailField.value,
            key: pwdField.value
        };
        

       statesDropDown.options[statesDropDown.selectedIndex].innerText = 'REMOVED';
       
       let list = controller.findHtmlViewById('side_ul_list');
       let li = document.createElement('li');
       li.textContent = state;
       list.appendChild(li);

       
       
    };









};


