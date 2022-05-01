/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global workspaces */

function ViewController(wid) {
    if(typeof wid === 'string'){
      this.workspaceId = wid;
    }else{
        throw new Error('Invalid type for workspace id');
    }
}

/**
 * Don't try to access your views here please.
 * The views may not be ready yet! 
 * This only signifies that your ViewController has been created.
 * @param {WorkSpace} wkspc The workspace
 * @returns {undefined}
 */
ViewController.prototype.onCreate = function(wkspc){

};

/**
 * You may now begin to use your views.
 * @param {WorkSpace} wkspc The workspace
 * @returns {undefined}
 */
ViewController.prototype.onViewsAttached = function(wkspc){
    
};

/**
 * Not yet implemented
 * @param {WorkSpace} wkspc The workspace
 * @returns {undefined}
 */
ViewController.prototype.onDestroy = function(wkspc){
    
};
/**
 * Locates the logical view used to place the html view.
 * @param {string} viewId The id of the view
 * @returns {unresolved}
 */
ViewController.prototype.findViewById = function(viewId){
    if(typeof viewId !== 'string'){
        throw new Error('Invalid type for view id');
    }
    let wkspc = workspaces.get(this.workspaceId);
    if(wkspc){
        return wkspc.findViewById(viewId);
    }
    return null;
};

/**
 * Locates the actual html view which is what most users will need
 * @param {string} viewId The id of the view
 * @returns {unresolved}
 */
ViewController.prototype.findHtmlViewById = function(viewId){
    if(typeof viewId !== 'string'){
        throw new Error('Invalid type for view id');
    }
    let wkspc = workspaces.get(this.workspaceId);
    if(wkspc){
        return wkspc.findHtmlViewById(viewId);
    }
    return null;
};

/**
 * Locates the root view
 * @returns {unresolved}
 */
ViewController.prototype.rootView = function(){
     let wkspc = workspaces.get(this.workspaceId);
    if(wkspc){
        return wkspc.rootView();
    }
    return null;
};

/**
 * Locates the root view
 * @returns {unresolved}
 */
ViewController.prototype.rootHtmlView = function(){
     let wkspc = workspaces.get(this.workspaceId);
    if(wkspc){
        let rv = wkspc.rootView();
        if(rv){
            return rv.htmlElement;
        }
    }
    return null;
};