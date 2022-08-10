/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global PATH_TO_UI_SCRIPTS, xmlKeys, attrKeys, DISABLE_INPUT_SHADOW, PATH_TO_COMPILER_SCRIPTS, ViewController, HTMLCanvasElement, CharacterData, DocumentType, Element, IncludedView, Mustache */
if (!Number.isNaN) {
    Number.isNaN = Number.isNaN || function isNaN(input) {
        return typeof input === 'number' && input !== input;
    };
}

if (!Number.isInteger) {
    Number.isInteger = function (x) {
        // return (x ^ 0) === +x;
        return +x === (+x - (+x % 1));
    };
}

//Polyfill for constructor.name()
(function () {
    if (!Object.constructor.prototype.hasOwnProperty('name')) {
        Object.defineProperty(Object.constructor.prototype, 'name', {
            get: function () {
                return this.toString().trim().replace(/^\S+\s+(\w+)[\S\s]+$/, '$1');
            }
        });
    }
})();
//Polyfill for Node.remove()
(function (arr) {
    arr.forEach(function (item) {
        if (item.hasOwnProperty('remove')) {
            return;
        }
        Object.defineProperty(item, 'remove', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                this.parentNode && this.parentNode.removeChild(this);
            }
        });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype].filter(Boolean));


/**
 * All workspaces loaded for this page.
 * Each workspace has the ability to parse a root xml layout which may have several included layouts.
 * A workspace will be needed to parse the root layout for the main page. Another workspace may be needed to parse a layout file
 * which is used for a popup view. Another might be used to parse a layout file loaded dynamically with ajax and whose parsed content
 * will be shown on a div or other item.
 * So a page may have several workspaces.
 *
 * Workspaces accomplish their work using background loaders(using the fetch API and workers) and Parser objects.
 * The key to the workspaces Map is the workspace id, and its value is the workspace itself
 * @type Map
 */

/**
 * When this is specified as the Workspace's system_root_id field,
 * the library will attach the parsed layout to a root div on document.body
 * @type String
 */
const BODY_ID = 'html_main';
let BASE_ROOT = null;


const APP_TYPE_CONST = {
    SPA: "spa",
    MPA: "mpa"
};

let APP_TYPE = APP_TYPE_CONST.MPA;

let urls = getUrls();

const PROJECT_BASE = urls[0];
const SCRIPTS_BASE = urls[1];
console.log('project-url: ', PROJECT_BASE, 'scripts-url: ', SCRIPTS_BASE);

const styleSheet = document.createElement('style');
styleSheet.setAttribute('type', 'text/css');

const nativeScripts = [
    SCRIPTS_BASE + 'sys/ext/mustache420.js',
    SCRIPTS_BASE + 'sys/ext/resizesensor.js',
    SCRIPTS_BASE + 'sys/ext/autolayout.js',
    SCRIPTS_BASE + 'sys/ext/map-poly.js',
    SCRIPTS_BASE + 'sys/ext/promise-poly.js',
    SCRIPTS_BASE + 'sys/ext/canvas-poly.js',
    SCRIPTS_BASE + 'sys/ext/ulid.js',
    SCRIPTS_BASE + 'sys/main.js',
    SCRIPTS_BASE + 'sys/common-constants.js',
    SCRIPTS_BASE + 'sys/compiler-constants.js',
    SCRIPTS_BASE + 'libs/utils/parserutils.js',
    SCRIPTS_BASE + 'sys/sdk/listadapter.js',
    SCRIPTS_BASE + 'sys/sdk/horizontaladapter.js',
    SCRIPTS_BASE + 'sys/sdk/gridadapter.js',
    SCRIPTS_BASE + 'sys/sdk/viewcontroller.js',
    SCRIPTS_BASE + 'libs/ext/canvas2blob.js',
    SCRIPTS_BASE + 'libs/utils/utils.js',
    SCRIPTS_BASE + 'libs/utils/stringutils.js',
    SCRIPTS_BASE + 'libs/utils/domutils.js',
    SCRIPTS_BASE + 'libs/utils/colorutils.js',
    SCRIPTS_BASE + 'libs/utils/constants.js',
    SCRIPTS_BASE + 'libs/utils/graphicsutils.js',
    SCRIPTS_BASE + 'libs/utils/graphics.js',
    SCRIPTS_BASE + 'libs/ui/clock.js',
    SCRIPTS_BASE + 'libs/ui/iconbtn.js',
    SCRIPTS_BASE + 'libs/ui/iconlabel.js',
    SCRIPTS_BASE + 'libs/ui/textelement.js',
    SCRIPTS_BASE + 'libs/ui/tabbedbar.js',
    SCRIPTS_BASE + 'libs/ui/mysteryimages.js',
    SCRIPTS_BASE + 'libs/ui/imagebox.js',
    SCRIPTS_BASE + 'libs/ui/list.js',
    SCRIPTS_BASE + 'libs/ui/pager.js',
    SCRIPTS_BASE + 'libs/ui/popupview.js',
    SCRIPTS_BASE + 'libs/ui/sidemenu.js',
    SCRIPTS_BASE + 'libs/ui/customsidemenu.js',
    SCRIPTS_BASE + 'libs/ui/progress.js',
    SCRIPTS_BASE + 'libs/ui/style.js',
    SCRIPTS_BASE + 'libs/ui/textwithlines.js',
    SCRIPTS_BASE + 'libs/ui/tables/table.js',
    SCRIPTS_BASE + 'libs/ui/tables/inputtable.js',
    SCRIPTS_BASE + 'libs/ui/tables/growabletable.js',
    SCRIPTS_BASE + 'libs/ui/tables/searchabletable.js'
];

if (!window.fetch) {
    nativeScripts.push(SCRIPTS_BASE + 'sys/ext/fetch-poly.js');
}

if (!HTMLCanvasElement.prototype.toBlob) {
    console.log("Your browser does not support Canvas.toBlob...loading polyfill!");
    nativeScripts.push(SCRIPTS_BASE + 'libs/ext/canvas2blob.js');
}

let workspaces = new Map();
/**
 * Locate all workspaces that are bound to a given element
 * @param bindingElemId The id of the parent element
 * @return {Workspace[]} An array of  all workspaces bound to this element
 */
let boundSpaces = function (bindingElemId) {
    let spaces = [];
    workspaces.forEach(function (wkspc, id) {
        if (startsWith(id, bindingElemId + "_")) {
            spaces.push(wkspc);
        }
    });

    return spaces;
};

/**
 * Deletes the workspace totally.
 * The workspace will need to be re-downloaded and then whitelisted... by calling navRecord.whitelistView(),
 * before it can be used agaiin.
 * @param wid The workspace id
 * @return {boolean}
 */
function hardDeleteWorkspace(wid) {
    let w = workspaces.get(wid);
    if (w && w.isMainPage()) {
        navObj.blacklistView(w.layoutName);
    }
    return workspaces.delete(wid);
}


/**
 * Blacklists the workspace so that navigations cannot load it any longer.
 * To make it available again, simply call navRecord.whitelistView(),
 * before it can be used agaiin.
 * @param wid The workspace id
 * @return {boolean}
 */
function softDeleteWorkspace(wid) {
    let w = workspaces.get(wid);
    if (w && w.isMainPage()) {
        navObj.blacklistView(w.layoutName);
    }
}

let navObj = new NavRecord();

/**
 * Applies only to layouts that are the main page layout!
 * @param layoutName The name of the layout...e.g. index.xml
 * @return {string} the id for retrieving the Workspace from the workspaces Map
 */
function spaceIdForMainPages(layoutName) {
    return spaceId(BODY_ID, layoutName);
}


/**
 * Applies to all layouts; whether main page layouts or layouts attached to some other element.
 * @param bindingElemId The id of the element that the layout will bind to.
 * @param layoutName The name of the layout...e.g. index.xml
 * @return {string}
 */
function spaceId(bindingElemId, layoutName) {
    return bindingElemId + '_' + layoutName.replace(".", "_");
}

/**
 * Keeps a record of the previous and current names of the views being opened
 * @constructor
 */
function NavRecord() {
    this.prevViewName = "";
    this.newViewName = "";
    /**
     * Store the name of deleted workspace layout files here.
     * @type {string[]}
     */
    this.deletedViewNames = [];
}

/**
 * Adds a view to the list of deleted views.
 * This view will then be skipped during navigation.
 * @param viewName The name of the view
 */
NavRecord.prototype.blacklistView = function (viewName) {
    this.deletedViewNames.push(viewName);
};
/**
 * Removes the view name from the list of deleted views so the browser will stop skipping it
 * @param viewName The name of the view to stop the browser from skipping.
 */
NavRecord.prototype.whitelistView = function (viewName) {
    let i = this.deletedViewNames.indexOf(viewName);
    if (i !== -1) {
        this.deletedViewNames.splice(i, 1);
    }
};
NavRecord.prototype.hasDeletedView = function (viewName) {
    return this.deletedViewNames.indexOf(viewName) !== -1;
};


/**
 *
 * @param viewName This is the spaceId used to fetch the rootView[of the workspace] from the workspaces map... e.g index.xml
 * @return true if the view was found among the workspaces and loaded and false if the view was not found.
 */
NavRecord.prototype.loadView = function (viewName) {
    if (APP_TYPE === APP_TYPE_CONST.SPA) {

        let vn = spaceIdForMainPages(viewName);
        // change DOM here based on viewName, for example:
        let currentViewName = this.prevViewName;//   window.location.hash ? window.location.hash.substring(1) : null;

        let foundCurrent = false;
        workspaces.forEach(function (wkspc, id) {
            if (id === vn) {
                wkspc.show();
                wkspc.current = true;
                foundCurrent = true;
                wkspc.controllers.forEach(function (controller, id) {
                    controller.onResume(wkspc);
                });
            } else {
                if (wkspc.isMainPage()) {
                    wkspc.hide();
                    wkspc.current = false;
                    wkspc.controllers.forEach(function (controller, id) {
                        controller.onPause(wkspc);
                    });
                }
            }
        });

        let wkspc = workspaces.get(vn);
        if (!foundCurrent) {
            wkspc = getWorkspace({
                layoutName: viewName,
                bindingElemId: BODY_ID,
                currentPage: true,
                onComplete: function (rootView) {
                    wkspc.controllers.forEach(function (controller, id) {
                        controller.onResume(wkspc);
                    });
                }
            });
        }
    }
};

/**
 *
 * @param viewName This is the spaceId used to fetch the rootView[of the workspace] from the workspaces map... e.g index.xml
 */
function goToView(viewName) {
    if (APP_TYPE === APP_TYPE_CONST.SPA) {
        if (!navObj.hasDeletedView(viewName)) {
            let currentViewName = window.location.hash ? window.location.hash.replace('#', '') : '';
            navObj.prevViewName = currentViewName;
            navObj.newViewName = viewName;
            // before you change the view, you have to change window.location.hash
            // This allows you go back to the previous view with the back button.
            // So use this function to change your view instead of directly doing the job.
            window.location.hash = "#" + viewName;
        } else {
            // The view is not available. Its workspace has been deleted.
        }
    }
}


const hashChange = function (e) {
    // hash changed! do navigation.
    const viewName = window.location.hash.replace('#', '');
    // load that view
    navObj.loadView(viewName);
};
/**
 * Resize functions make the  underlying autolayout library to refresh the dom structure and
 * it makes all the generated divs to be displayed which does not reflect the true state of the
 * workspaces again... so remind the DOM of the true state of the workspaces
 */
const restoreDOMVisibilityState = function () {
    workspaces.forEach(function (wkspc, key) {
            if (wkspc.current === false) {
                wkspc.hide();
            } else {
                wkspc.show();
            }
    });
}

/**
 *
 *
 * This method will help fetch this workspace from the cache if it has been previously created, or create a new one if not.
 * The Workspace options:
 {
 layoutName: 'layout.xml',
 bindingElemId: 'id_of_element_layout_will_be_attached_to',
 xmlContent: 'You do not wish to load the xml from the supplied layout name. So supply the xml here directly'.
 onLayoutLoaded: function(layoutName, xmlContent){}... This callback is fired everytime the worker threads successfully
 load a certain layout. Do nothing or as little as possible in it, so as not to slow down the layout loading and parsing
 process, which will affect the rendering speed of your UI. You have been warned:)
 onComplete: 'A function to run when the layout has been parsed and loaded',
 isTemplate: true. If true, the layout being loaded is to be used as a layout cell in a list, grid, or a table(not yet implemented)
 }


 *
 * 1. The layout name...e.g anon.xml, may be a dummy name!
 * 2. The html id of the DOM element that the generated html layout will be attached to
 * 3. The xml content of the specified layout, and lastly. If this field is specified, the function will not load the xml from
 * the path, but will instead use the specified xml.
 * 4. This callback is fired everytime the worker threads successfully
 * load a certain layout. Do nothing or as little as posssible in it, so as not to slow down the layout loading and parsing
 * process, which will affect the rendering speed of your UI. You have been warned:)
 * 5. A callback function to run when the xml document has been parsed into html.
 * 6. This specifies that the xml layout being loaded is to be reused in a sequential layout like a list, a grid or a table.
 *
 * The <code>xmlContent</code> options is important because, a user may have generated some xml dynamically and wish to load it on the interface.
 * This dummy content of course has no file representation in the layouts folder. So we need the user to supply a unique file name that we may use to
 * identify this xml.
 *
 *
 *
 * @param {Object} options An object that defines the properties needed to load the workspace
 * @returns {Workspace}
 */
function getWorkspace(options) {

    let rootLayoutName = null;
    if (options.layoutName && typeof options.layoutName === 'string') {
        rootLayoutName = options.layoutName;
    } else {
        throw new Error('Please supply the root layout name! even if you are supplying your xml content directly, specify a dummy layout name for it! we need it to create a unique id for your layout');
    }

    let bindingElemId = BODY_ID;
    if (options.bindingElemId && typeof options.bindingElemId === 'string' && options.bindingElemId.length !== 0) {
        bindingElemId = options.bindingElemId;
    }

    let spaceID = this.spaceId(bindingElemId, rootLayoutName);//This is the workspace id.
    let space = workspaces.get(spaceID);
    console.log(space ? "found workspace!" : "needs new workspace");


    if (!space) {
        return new Workspace(options);
    }
    space.onComplete(space.rootView());
    return space;
}

/**
 * This function returns true if the supplied param is a number string
 * or a number.
 * For example:
 * isNumber('2') will return true as will isNumber(2).
 * But isNumber('2a') will return false
 * @param {string|Number} number
 * @returns {Boolean}
 */
let isNumber = function (number) {
    return number !== null && number !== '' && isNaN(number) === false;
};


document.currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();


/**
 *
 * Creates a new Workspace.
 * This method will help fetch this workspace from the cache if it has been previously created, or create a new one if not.
 * The Workspace options:
 {
 layoutName: 'layout.xml',
 bindingElemId: 'id_of_element_layout_will_be_attached_to',
 xmlContent: 'You do not wish to load the xml from the supplied layout name. So supply the xml here directly'.
 onLayoutLoaded: function(layoutName, xmlContent){}... This callback is fired everytime the worker threads successfully
 load a certain layout. Do nothing or as little as possible in it, so as not to slow down the layout loading and parsing
 process, which will affect the rendering speed of your UI. You have been warned:)
 onComplete: 'A function to run when the layout has been parsed and loaded',
 isTemplate: true If true, the layout being loaded is to be used as a layout cell in a list, grid, or a table(not yet implemented)
 currentPage: true|false,  this matters if the page is of type SPA. If not it is always true. When it is an SPA page,
 this informs the workspace whether it will be rendered immediately it has been loaded or not.
 }


 *
 * 1. The layout name...e.g test.xml, may be a dummy name!
 * 2. The html id of the DOM element that the generated html layout will be attached to
 * 3. The xml content of the specified layout, and lastly. If this field is specified, the function will not load the xml from
 * the path, but will instead use the specified xml.
 * 4. This callback is fired everytime the worker threads successfully
 * load a certain layout. Do nothing or as little as posssible in it, so as not to slow down the layout loading and parsing
 * process, which will affect the rendering speed of your UI. You have been warned:)
 * 5. A callback function to run when the xml document has been parsed into html.
 * 6. This specifies that the xml laout being loaded is to be reused in a sequential layout like a list, a grid or a table.
 *
 * The <code>xmlContent</code> options is important because, a user may have generated some xml dynamically and wish to load it on the interface.
 * This dummy content of course has no file representation in the layouts folder. So we need the user to supply a unique file name that we may use to
 * identify this xml.
 *
 *
 *
 * @param {Object} options An object that defines the properties needed to load the workspace
 * @returns {Workspace}
 */
function Workspace(options) {

    if (!options) {
        throw new Error("Please supply the options to create this workspace");
    }

    this.layoutName = null;
    if (options.layoutName && typeof options.layoutName === 'string') {
        this.layoutName = options.layoutName;
    } else {
        throw new Error('Please supply the root layout name! even if you are supplying your xmlcontent directly, specify a dummy layout name for it! we need it to create a unique id for your layout');
    }


    this.systemRootId = BODY_ID;
    if (options.bindingElemId && typeof options.bindingElemId === 'string' && options.bindingElemId.length !== 0) {
        this.systemRootId = options.bindingElemId;
    }
    //if bindingElemId is not supplied in options, default to attaching the element to the body.

    this.rootWidth = 0;
    this.rootHeight = 0;

    if (this.systemRootId === BODY_ID) {
        let parentElm = window;
        let horScrollBarShowing = parentElm.scrollWidth > parentElm.clientWidth;
        let vertScrollBarShowing = parentElm.scrollHeight > parentElm.clientHeight;
        this.rootWidth = (vertScrollBarShowing ? window.innerWidth - getScrollBarWidth() : window.innerWidth);
        this.rootHeight = (horScrollBarShowing ? window.innerHeight - getScrollBarWidth() : window.innerHeight);
    } else {
        let v = document.getElementById(this.systemRootId);
        let rect = v.getBoundingClientRect();
        this.rootWidth = rect.width;
        this.rootHeight = rect.height;
    }


    this.templateData = null;
    if (options.templateData && typeof options.templateData === 'object') {
        this.templateData = options.templateData;
    }

    let xmlContent = null;
    if (options.xmlContent && typeof options.xmlContent === 'string') {
        xmlContent = options.xmlContent;
    }


    /**
     * This field is important if the app is of type APP_TYPE_CONST#SPA.
     * It means that the workspace is  the one currently being rendered in the browser.
     * @type {boolean}
     */
    this.current = true;
    if (typeof options.currentPage === "boolean") {
        this.current = options.currentPage;
    }


    let onComplete = function (rootView) {
    };

    if (options.onComplete) {
        if (typeof options.onComplete === 'function') {
            onComplete = options.onComplete;
        } else {
            throw new Error('If you are supplying this callback, then it must be a function!');
        }
        if (options.onComplete.length !== 1) {
            throw new Error('The onComplete callback must take one parameter... the rootView of the expanded document');
        }
    }

    let fileName = this.layoutName;
    this.onComplete = function (rootView) {
        if (APP_TYPE === APP_TYPE_CONST.SPA) {
            window.addEventListener('hashchange', function () {
            });
            window.location.hash = fileName;
            window.addEventListener('hashchange', hashChange);
        }
        onComplete(rootView);
    };

    if (options.onLayoutLoaded) {
        if (typeof options.onLayoutLoaded === 'function') {
            this.onLayoutLoaded = options.onLayoutLoaded;
        } else if (options.onLayoutLoaded.length !== 2) {
            throw new Error('The onLayoutLoaded callback must take two parameters... the name of the layout loaded and its xmlcontent');
        } else {
            throw new Error('If you are supplying this callback, then it must be a function!');
        }
    }

    this.template = false;
    if (options.isTemplate) {
        if (typeof options.isTemplate === "boolean") {
            this.template = options.isTemplate;
        } else {
            throw new Error('Invalid type specified for `template` field');
        }
    }

    this.id = spaceId(this.systemRootId, this.layoutName);//This is the workspace id.

    this.viewMap = new Map();
    this.allStyles = [];
    this.xmlIncludes = new Map();
    this.workersMap = new Map();
    this.rootCount = 0;
    this.parsers = [];
    //this.rootParser = null;
    this.layoutCount = 0;
    this.loadedCount = 0;
    this.deadEnds = 0;
    this.rootXml = null;
    /**
     * Counts the [found] imported scripts in xml for all views in this work space
     * @type {number}
     */
    this.foundScripts = 0;
    /**
     * Counts the successfully loaded scripts in xml for all views in this work space
     * @type {number}
     */
    this.loadedScripts = 0;


    /**
     * All ViewControllers created by the layouts in this workspace
     * @type {Map<any, any>}
     */
    this.controllers = new Map();
    /**
     * Tracks when the buildUI method has been successfully executed
     * @type {boolean}
     */
    this.renderComplete = false;
    /**
     * Tracks when the ViewController#onViewsReady method has been fired already
     * @type {boolean}
     */
    this.viewsReadyFired = false;

    /**
     * This field is important if the app is of type APP_TYPE_CONST#SPA.
     * It means that the workspace Parser's buildUI method has been called
     * before...i.e it has been rendered fully, previously
     * @type {boolean}
     */
    this.hasBeenRenderedBefore = false;

    workspaces.set(this.id, this);

    if (xmlContent) {
        this.setContentView(this.layoutName, xmlContent);
    } else {
        this.setContentView(this.layoutName);
    }

}


/**
 * @param {Workspace} workspace The workspace
 * @param {string} layoutName The name of the layout being parsed
 * @param {string} parentId The id of the view that hosts the resultant parsed xml layout, usually applies to included views
 * @returns {Parser}
 */
function Parser(workspace, layoutName, parentId) {

    let xml = workspace.fetchPreloadedXml(layoutName);
    if (workspace.templateData) {//RCN: 2015483397
        xml = Mustache.render(xml, workspace.templateData);
    }

    this.layoutName = layoutName;
    this.constraints = [];
    this.html = '';
    this.parentId = parentId && typeof parentId === "string" && parentId.length > 0 ? parentId : '';//needed for includes.
    this.rootView = null;


    if (!parentId) {
        let generalStyle = new Style("*", []);
        generalStyle.addFromOptions({
            'margin': '0',
            'padding': '0',
            'box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box',
            'overscroll-behavior': 'none'
        });
        updateOrCreateSelectorInStyleSheet(styleSheet, generalStyle);
        workspace.allStyles.push(generalStyle);
    }


    /**
     * Set this flag when the parse is done.
     * @type {boolean}
     */
    this.doneParsing = false;
    this.errorOccured = false;
    workspace.parsers.push(this);

    // disable initial rendering for invisible pages, so we can safely load them in the background
    // without triggering their lifecycle methods.
    if (workspace.current === true) {
        this.nodeProcessor(workspace, new NodeMaker(xml).rootNode);
    }

}

/**
 * Runs this parser again.
 * This will be useful in the case the workspace was created but was not rendered...perhaps because we are in an SPA
 * and the workspace is not yet to be rendered, or for any other similar reason that involves preloading the workspace
 * @param {Workspace} wkspc
 */
Parser.prototype.reRun = function (wkspc) {
    if (!wkspc) {
        throw 'cant run a parser without knowing its invoking workspace';
    }
    if (wkspc.constructor.name !== 'Workspace') {
        throw 'invoking context must be a Workspace!';
    }

    if (wkspc.parsers.indexOf(this) === -1) {
        throw 'this parser was never registered with the given Workspace';
    }

    let xml = wkspc.fetchPreloadedXml(this.layoutName);
    this.nodeProcessor(wkspc, new NodeMaker(xml).rootNode);
};


function NodeMaker(xml) {
    if (xml && typeof xml === "string" && xml.length > 0) {
        let xmlDoc = doXmlParse(xml);
        this.nodes = xmlDoc.getElementsByTagName('*');
        if (this.nodes.length > 0) {
            this.rootNode = this.nodes[0];
        } else {
            this.rootNode = null;
        }
    } else {
        this.rootNode = null;
    }
}


let parseImports = function (scriptsText, isUserScript) {
    scriptsText = scriptsText.trim();

    let scrLen = scriptsText.length;
    if (scrLen === 0) {
        throw new Error('Please remove the empty import tag in xml layout file');
    }
    if (scriptsText.substring(scrLen - 1) !== ";") {
        throw new Error('each js file definition in an import tag must end with a `;`');
    }
    let files = scriptsText.split(';');
    let cleanedFiles = [];


    for (let i = 0; i < files.length; i++) {
        let file = files[i].trim();
        let len = file.length;
        if (file.substring(len - 3) === '.js') {
            cleanedFiles.push((isUserScript ? PATH_TO_USER_SCRIPTS : PATH_TO_LIB_SCRIPTS) + file);
        }
    }
    return cleanedFiles;
};


function getUrls() {
    let scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        let script = scripts[i];
        let src = script.src;
        let ender = 'sys/layit.js';
        let fullLen = src.length;
        let endLen = ender.length;
        //check if script.src ends with layit.js
        if (src.lastIndexOf(ender) === fullLen - endLen) {
            let scriptsURL = src.substring(0, fullLen - endLen);

            //let projectURL = scriptsURL.substring(0, scriptsURL.length - "layit/".length);
            let projectURL = scriptsURL.substring(0, scriptsURL.lastIndexOf("/", scriptsURL.length - 2) + 1);
            return [projectURL, scriptsURL];
        }
    }
    return null;
}

/**
 *
 * @param layitSrc The relative path in the xml...relative to the images folder
 * ...e.g an image file directlt in the folder will vbe specified directly by name.
 * If the image is in a folder in the images folder, then it is specified as  foldername/imagename.png|jpg etc.
 * @param isFromUserImages If true, the image was loaded from the user's images folder, else it the library that
 * loaded it for its internal UI
 * @returns {*}
 */
function getImagePath(layitSrc, isFromUserImages) {
    return (isFromUserImages ? PATH_TO_USER_IMAGES : PATH_TO_LIB_IMAGES) + layitSrc;
}

/**
 * Loads the pre-fetched xml comtent of the given layout name from cache
 * @param layoutName The layout name...e.g. index.xml
 */
Workspace.prototype.fetchPreloadedXml = function (layoutName) {
    let layout = layoutName;
    if (!layout || typeof layout !== 'string') {
        throw 'A layout must be the name of a valid xml file in the `' + PATH_TO_LAYOUTS_FOLDER + '` folder';
    }
    let len = layout.length;
    if (layout.substring(len - 4) !== '.xml') {
        layout += '.xml';
    }
    return this.xmlIncludes.get(layout);
};
Workspace.prototype.rootParser = function () {
    return this.parsers[0];
};
/**
 * The root view is the root of the expanded xml layout, not the view that the layout was attached to!
 * @returns {undefined}
 */
Workspace.prototype.rootView = function () {
    //return this.viewMap.get('root_' + this.id + "_1"); // this is correct
    return this.rootParser().rootView; // but this is far better optimized for speed.
};

Workspace.prototype.resetLoaderIndices = function () {
    this.layoutCount = this.loadedCount = this.deadEnds = 0;
    this.rootXml = null;
};

Workspace.prototype.resetAllIndices = function () {
    this.workersMap.clear();
    this.viewMap.clear();
    this.xmlIncludes.clear();
    this.rootCount = 0;
    this.allStyles.length = 0;
    this.resetLoaderIndices();
};

Workspace.prototype.show = function () {
    if (this.hasBeenRenderedBefore) {
        let root = this.rootView();
        if (!root) {
            throw 'a serious error has occurred';
        }
        root.show();
    } else {
        this.rootParser().reRun(this);//edit here
    }
};
Workspace.prototype.hide = function () {
    if (this.hasBeenRenderedBefore === true) {
        this.rootView().hide();
    } else {
        //is not even showing anyway!
    }
};
/**
 * Only workspaces that render as the main page are bound to html_main
 * @return {boolean}
 */
Workspace.prototype.isMainPage = function () {
    return this.systemRootId === BODY_ID;
}


Workspace.prototype.setContentView = function (layoutFileName, xmlContent) {
    let self = this;

    /**
     * Recursively loads all the scripts natively used by the compiler, so that the user wont be stressed with this.
     * The user only needs load this file(layit.js) on their html page, in order to use this library.
     * @param i
     */
    function loadnative(i) {

        if (typeof i !== 'number') {
            throw new Error('Please supply a number for the load index');
        }
        if (i < nativeScripts.length) {
            if (!isScriptLoaded(nativeScripts[i])) {
                let newScript = document.createElement("script");
                newScript.setAttribute('src', nativeScripts[i]);
                let head = document.getElementsByTagName('head')[0];
                head.appendChild(newScript);

                newScript.onload = function () {
                    loadnative(i + 1);
                };
            } else {
                loadnative(i + 1);
            }

        } else {
            console.log('Compiler Scripts Fully Loaded... xmlContent: ', xmlContent);

            self.prefetchAllLayouts(layoutFileName, xmlContent, function () {
                self.resetAllIndices();
            }, function (xml) {
                if (xml.length > 0) {
                    let parser = new Parser(self, layoutFileName, null);
                    console.log('Parsed loaded file!');
                } else {
                    console.log('Awaiting loaded file!');
                }
            });


        }
    }

    loadnative(0);
};

function loadScripts(scripts, onload) {
    if (scripts.length === 0) {
        return;
    }
    if (typeof onload !== 'function') {
        throw new Error('Please supply a function callback for the second argument.');
    }

    function loadAt(i) {
        if (typeof i !== 'number') {
            throw new Error('Please supply a number for the load index');
        }
        if (i < scripts.length) {
            if (!isScriptLoaded(scripts[i])) {
                let newScript = document.createElement("script");
                newScript.setAttribute('src', scripts[i]);
                let head = document.getElementsByTagName('head')[0];
                head.appendChild(newScript);

                newScript.onload = function () {
                    loadAt(i + 1);
                };
            } else {
                loadAt(i + 1);
            }
        } else {
            console.log('User imported scripts fully loaded');
            onload();
        }
    }

    loadAt(0);
}


function loadWorkspaces(pages, onload) {
    if (!pages) {
        throw new Error("Please supply the array of pages to load.")
    }
    if (!isOneDimArray(pages)) {
        throw new Error("A one dimensional array of page names must be supplied...found: " + pages);
    }
    if (pages.length === 0) {
        return;
    }
    if (onload) {
        //if onload is specified, it better be a function!
        if (typeof onload !== 'function') {
            throw new Error('Please if you must supply a callback, it has to be a function!. We will run it when all the workspaces...i.e.' + pages + ' have been loaded');
        }
    }

    function loadSpace(i) {
        if (typeof i !== 'number') {
            throw new Error('Please supply a number for the load index');
        }
        if (i < pages.length) {
            let spaceId = spaceIdForMainPages(pages[i]);
            if (!workspaces.has(spaceId)) {
                new Workspace({
                    layoutName: pages[i],
                    bindingElemId: BODY_ID,
                    templateData: null,
                    currentPage: false,
                    onComplete: function (rootView) {
                        loadSpace(i + 1);
                    }
                });
            } else {
                loadSpace(i + 1);
            }
        } else {
            if (onload) {
                onload();
            }
        }
    }

    loadSpace(0);
}

/**
 *
 * @param {type} rootLayoutName The name of the layout
 * @param {type} xmlContent The xmlcontent(Optional), if the Workspace constructor specified any xml content
 * @param {type} onPreStart A function to call before loading of any xml files start
 * @param {type} onload The function to call when all layouts including the included ones have been loaded
 * @returns {undefined}
 */
Workspace.prototype.prefetchAllLayouts = function (rootLayoutName, xmlContent, onPreStart, onload) {

    let self = this;

    if (onload.length !== 1) {
        throw new Error('onload must have only one argument.');
    }

    if (onPreStart.length !== 0) {
        throw new Error('onPreStart must have no argument.');
    }

    let callback = function (layoutXml) {
        if (self.onLayoutLoaded) {
            self.onLayoutLoaded(rootLayoutName, layoutXml);
        }
        let layouts = findIncludes(layoutXml);
        self.loadedCount++;
        self.xmlIncludes.set(rootLayoutName, layoutXml);
        if (layouts.length === 0) {
            self.deadEnds++;
            if (self.layoutCount === self.loadedCount - 1) {
                //console.log("DONE! , layout: " + rootLayoutName + ", layoutCount: " + self.layoutCount + ", loadedCount: " + self.loadedCount, ", deadEnds: ", self.deadEnds);
                onload(self.rootXml);
                self.resetLoaderIndices();
                /////

                self.workersMap.forEach(function (worker, name) {
                    let workerName = worker.name;
                    self.stopFetchWorker(workerName);
                    // console.log('closed: ' + workerName);
                });

            }
        } else {
            for (let i = 0; i < layouts.length; i++) {
                let rawLayoutName = layouts[i];
                let layout = rawLayoutName + '.xml';
                self.prefetchAllLayouts(layout, xmlContent, onPreStart, onload);
            }
        }
    };


    function findIncludes(xml) {
        let check = attrKeys.layout + '=';

        //change layout[space....]=[space.....] to layout=
        //let regex = /(layout)(^|\s*)((?<!=)=(?!=))(^|\s*)/;
        let regex = /layout\s*=(?!=)\s*/g;
        xml = xml.replace(regex, check);
        let open = 0, close = 0, layouts = [];
        if (self.rootXml === null) {
            onPreStart();
            self.rootXml = xml;
        }

        while ((open = xml.indexOf(check, open)) !== -1) {
            open = open + check.length + 1;
            close = xml.indexOf("\"", open);
            if (close === -1) {
                close = xml.indexOf("'", open);
            }
            if (close !== -1) {
                let layout = xml.substring(open, close);
                layouts.push(layout);
            }
        }
        self.layoutCount += layouts.length;
        return layouts;
    }


    if (xmlContent) {
        callback(xmlContent);
    } else {
        this.startFetchWorker(rootLayoutName, callback);
    }


};

Workspace.prototype.findHtmlViewById = function (viewId) {
    let view = this.viewMap.get(viewId);
    if (view) {
        return view.htmlElement;
    }
    return null;
};
/**
 *
 * @param {string} viewId
 * @returns {View|undefined}
 */
Workspace.prototype.findViewById = function (viewId) {
    return this.viewMap.get(viewId);
};

Workspace.prototype.isLibsLayout = function () {
    return (this.layoutName.indexOf(NATIVE_LAYOUTS_FOLDER_FILE_PREFIX) === 0);
};

/**
 *
 * @param {string} xml The xml ui text to parse
 * @return {ActiveXObject, doXmlParse.xmlDoc}
 */
function doXmlParse(xml) {

    let xmlDoc, parser;

    if (window.DOMParser) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml, "text/xml");
    } else { // Internet Explorer
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(xml);
    }

    return xmlDoc;
}

/**
 *
 * @param {Workspace} wkspc The parent Workspace
 * @param {Node} node The xml node being processed
 */
Parser.prototype.nodeProcessor = function (wkspc, node) {
    //use node.parentNode to access the parent of this node

    //process it
    let view = null;
    const nodeName = node.nodeName;
    let self = this;
    switch (nodeName) {
        case xmlKeys.root:
            let nodeId = node.getAttribute(attrKeys.id);
            if (!nodeId || nodeId === '') {
                wkspc.rootCount += 1;
                node.setAttribute('id', 'root_' + wkspc.id.replace('.', '_') + '_' + wkspc.rootCount);
            }

            view = new View(wkspc, node, this.parentId);//view adds to viewMap automatically in constructor

            if (wkspc.viewMap.size === 1) {//first ConstraintLayout tag in the Parser
                view.topLevel = true;
                this.rootView = view;
            } else {//child ConstraintLayout tags
                if (this.parentId) {//another Parser handling an include in recursion, this Parser will have collected the id of the include tag
                    view.parentId = this.parentId;
                    this.rootView = view;
                }
                let parent = wkspc.viewMap.get(view.parentId);
                parent.childrenIds.push(view.id);
            }

            break;
        case xmlKeys.include:
            view = new IncludedView(wkspc, node);
            break;
        case xmlKeys.imports:
            //if (this === wkspc.rootParser) {
            let files = node.getAttribute(attrKeys.files);
            let scripts = parseImports(files, !wkspc.isLibsLayout());
            wkspc.foundScripts++;
            loadScripts(scripts, function () {
                wkspc.loadedScripts++;
                let controllerName = node.getAttribute(attrKeys.controller);
                if (typeof controllerName === 'string' && controllerName.length > 0) {
                    let viewController = new window[controllerName](wkspc.id);

                    if (viewController && viewController instanceof ViewController) {
                        wkspc.controllers.set(self.layoutName, viewController);
                        viewController.onCreate(wkspc);

                        //UI building has not necessarily finished, but all ui files have been parsed,
                        // this process has kicked off the loading of all imported scripts.
                        // So wkspc.foundScripts already stores the number of scripts imported...
                        // Hence, if wkspc.foundScripts === wkspc.loadedScripts then all scripts have been loaded
                        let rootParser = wkspc.rootParser();
                        if (rootParser.doneParsing === true && rootParser.errorOccured === false) {
                            if (wkspc.foundScripts === wkspc.loadedScripts) {
                                wkspc.controllers.forEach(function (controller, id) {
                                    controller.onScriptsReady(wkspc);
                                });
                            }
                        }

                        //UI building has finished... this process has kicked off the loading of all imported scripts,
                        // So wkspc.foundScripts already stores the number of scripts imported...
                        // Hence, if wkspc.foundScripts === wkspc.loadedScripts then all scripts have been loaded
                        if (wkspc.renderComplete === true) {
                            // now, check if all the imported scripts have successfully loaded
                            if (wkspc.foundScripts === wkspc.loadedScripts) {
                                if (wkspc.viewsReadyFired === false) {
                                    wkspc.viewsReadyFired = true;
                                    wkspc.controllers.forEach(function (controller, id) {
                                        controller.onViewsReady(wkspc);
                                    });
                                }
                            }
                        }

                    } else {
                        throw new Error("Couldn't initialize ViewController...");
                    }
                }
            });
            /*} else {
                throw new Error('Please insert your imports in the root xml layout(' + wkspc.id + ') alone. ');
            }*/


            break;
        case xmlKeys.view:
            view = new View(wkspc, node);
            break;
        case xmlKeys.button:
            view = new Button(wkspc, node);
            break;
        case xmlKeys.imageButton:
            view = new ImageButton(wkspc, node);
            break;
        case xmlKeys.imageView:
            view = new ImageView(wkspc, node);
            break;
        case xmlKeys.progress:
            view = new ProgressBar(wkspc, node);
            break;
        case xmlKeys.tabview:
            view = new TabView(wkspc, node);
            break;

        case xmlKeys.field:
            view = new TextField(wkspc, node);

            break;
        case xmlKeys.area:
            view = new TextArea(wkspc, node);
            break;

        case xmlKeys.check:
            view = new CheckBox(wkspc, node);

            break;

        case xmlKeys.radiogroup:
            view = new RadioGroup(wkspc, node);
            break;

        case xmlKeys.radio:
            view = new Radio(wkspc, node);
            break;

        case xmlKeys.separator:
            view = new Separator(wkspc, node);
            break;

        case xmlKeys.guide:
            view = new Guideline(wkspc, node);
            break;

        case xmlKeys.table:
            view = new NativeTable(wkspc, node);
            break;

        case xmlKeys.customTable:
            view = new CustomTableView(wkspc, node);
            break;
        case xmlKeys.inputTable:
            view = new InputTableView(wkspc, node);
            break;
        case xmlKeys.growableTable:
            view = new GrowableTableView(wkspc, node);
            break;
        case xmlKeys.searchableTable:
            view = new SearchableTableView(wkspc, node);
            break;

        case xmlKeys.list:
            view = new NativeList(wkspc, node);

            break;

        case xmlKeys.listView:
            view = new ListView(wkspc, node);
            break;
        case xmlKeys.iconLabel:
            view = new IconLabelView(wkspc, node);
            break;
        case xmlKeys.multiLineLabel:
            view = new MultiLineLabel(wkspc, node);
            break;

        case xmlKeys.gridView:
            view = new GridView(wkspc, node);

            break;

        case xmlKeys.horizontalListView:
            view = new HorizontalListView(wkspc, node);

            break;

        case xmlKeys.label:
            view = new Label(wkspc, node);
            break;

        case xmlKeys.paragraph:
            view = new Paragraph(wkspc, node);
            break;

        case xmlKeys.link:
            view = new HyperLink(wkspc, node);
            break;

        case xmlKeys.dropDown:
            view = new DropDown(wkspc, node);
            break;

        case xmlKeys.clock:
            view = new ClockView(wkspc, node);
            break;
        case xmlKeys.canvas:
            view = new CanvasView(wkspc, node);
            break;

        case xmlKeys.video:
            view = new VideoView(wkspc, node);
            break;
        case xmlKeys.audio:
            view = new AudioView(wkspc, node);
            break;
        case xmlKeys.form:
            view = new FormView(wkspc, node);
            break;

        default:
            break;
    }

    if (view !== null) {
        //Array.prototype.push.apply(this.constraints, view.layoutChildren(wkspc));
        //this.constraints.push(view.makeVFL(wkspc));
        wkspc.allStyles.push(view.style);
    } else {
        if (nodeName !== xmlKeys.imports) {
            this.doneParsing = true;
            this.errorOccured = true;
            throw new Error('This node: `' + nodeName + '` does not map to a valid view!!');
        } else {

        }
    }

    if (node.hasChildNodes()) {
        let childNodes = node.childNodes;
        for (let j = 0; j < childNodes.length; j++) {
            let childNode = childNodes[j];
            if (childNode.nodeName !== '#text' && childNode.nodeName !== '#comment') {
                let childId = childNode.getAttribute(attrKeys.id);
                if (view !== null) {
                    if (childNode.nodeName !== xmlKeys.imports) {
                        view.childrenIds.push(childId);//register the child with the parent
                    }
                }
                this.nodeProcessor(wkspc, childNode);
            }
        }//end for loop

    } else {

    }

    this.doneParsing = true;
    this.errorOccured = false;

    if (view) {
        if (view.topLevel === true) {
            this.buildUI(wkspc);
        }
    }
};

/**
 *
 * @param {Workspace} wkspc
 */
Parser.prototype.buildUI = function (wkspc) {
    wkspc.hasBeenRenderedBefore = true;
    injectButtonDefaults: {
        let defBtnStyle = new Style("input[type='button']:hover", []);
        defBtnStyle.addStyleElement('cursor', 'pointer');
        wkspc.allStyles.push(defBtnStyle);
    }

    injectAbsCss: {
        let styleObj = new Style('.abs', []);
        styleObj.addStyleElement('position', 'absolute');
        styleObj.addStyleElement('padding', '0');
        styleObj.addStyleElement('margin', '0');
        wkspc.allStyles.push(styleObj);
    }

    injectInputShadowRemover: {
        if (DISABLE_INPUT_SHADOW === true) {
            let inputShadowRemoveStyle = new Style('input', []);
            inputShadowRemoveStyle.addStyleElement(' background-image', 'none');
            inputShadowRemoveStyle.addStyleElement('outline', '0');
            //inputShadowRemoveStyle.addStyleElement('box-shadow', 'none');

            wkspc.allStyles.push(inputShadowRemoveStyle);
        }
    }


    let compounds = [];
    let includes = [];
    wkspc.viewMap.forEach(function (view, id) {
        if (view instanceof IncludedView) {
            includes.push(view);
        }
        for (let i = 0; i < view.childrenIds.length; i++) {
            let childId = view.childrenIds[i];
            let child = wkspc.viewMap.get(childId);
            if (child.constructor.name === 'PopupView') {
                //popup views will not be shown by default. They are launched by the user with some action
                continue;
            }
            view.htmlElement.appendChild(child.htmlElement);
            if (child.runView) {
                compounds.push(child);
            }
        }
    });

    this.html = this.rootView.toHTML();
    updateOrCreateSelectorsInStyleSheet(styleSheet, wkspc.allStyles);

    makeDefaultPositioningDivs: {

        let baseRoot = null;
        if (wkspc.systemRootId === BODY_ID) {
            if (BASE_ROOT) {
                baseRoot = BASE_ROOT;
            } else {
                //baseRoot is to be rendered as the page, create a div and attach it to document.body.
                BASE_ROOT = document.createElement('div');
                BASE_ROOT.setAttribute(attrKeys.id, BODY_ID);
                document.body.appendChild(BASE_ROOT);
                baseRoot = BASE_ROOT;
            }
        } else {
            // baseRoot must be an existing view in the DOM, then... so render into it
            baseRoot = document.getElementById(wkspc.systemRootId);
        }

        baseRoot.appendChild(this.rootView.htmlElement);

        //If the baseRoot is dynamically created and attached to document.body, then specify its own constraints on the page
        if (wkspc.systemRootId === BODY_ID) {
            // main layout
            autoLayout(undefined, layoutRootOnBindingElement(null, wkspc.systemRootId));
        }

        // layout the root layout on the baseRoot(the element we are attaching the xml layout to)
        autoLayout(baseRoot, this.rootView.layoutSelf(wkspc));

        // layout the xml layout with respect to its rootview
        autoLayout(this.rootView.htmlElement, this.rootView.layoutChildren(wkspc));


        //layout the includes
        includes.forEach(function (include) {//Each view is an include
            let rootChild = wkspc.viewMap.get(include.childrenIds[0]);
            /**
             * Lay out an included layout on its parent include using constraints found in the
             * include.directChildConstraints array
             */
            autoLayout(include.htmlElement, rootChild.layoutSelf(wkspc));
            //layout the xml of an included layout with respect to its root
            /**
             * A include holds the child constraints of its included layout
             * in trust for it; lol! Use the constraints to layout the
             * included layout's children on the included layout's root.
             */
            autoLayout(rootChild.htmlElement, rootChild.layoutChildren(wkspc));
        });

        //layout generated views on their lis


        compounds.forEach(function (child) {
            child.runView();
        });
    }

    wkspc.renderComplete = true;
    //imported scripts finished loading before UI was fully built!
    wkspc.controllers.forEach(function (controller, id) {
        controller.onViewsAttached(wkspc);
    });
    // all scripts imported in xml have been fully loaded, so...
    if (wkspc.foundScripts === wkspc.loadedScripts) {
        //imported scripts finished loading before UI was fully built!
        if (wkspc.viewsReadyFired === false) {
            wkspc.viewsReadyFired = true;
            wkspc.controllers.forEach(function (controller, id) {
                //The UI has been fully built... the imported scripts defined in xml have also fully loaded
                controller.onViewsReady(wkspc);
            });
        }
    }//imported scripts have not yet finished loading but UI building is done!
    else {
        // scripts still being loaded
    }

    if (wkspc.onComplete) {
        wkspc.onComplete(this.rootView);
    }
};

/**
 * Generates constraints needed to layout the root element of any layout on the physical DOM
 * element on which it is to be bound.
 * @param {string} bindingElemId The id of the physical DOM element to which the xml layout will be attached
 * @param {string} rootChildID The id of the root element of the xml layout
 * @returns an array of raw constraints to use in the layout
 */
function layoutRootOnBindingElement(bindingElemId, rootChildID) {
    if (typeof bindingElemId !== 'string' && bindingElemId) {
        throw 'Invalid bindingElemId...bindingElemId: ' + bindingElemId;
    }
    if (typeof rootChildID !== "string" || rootChildID.length === 0) {
        throw 'Invalid rootChildId';
    }
    return [{
        view1: rootChildID,
        attr1: 'centerX',    // see AutoLayout.Attribute
        relation: 'equ',   // see AutoLayout.Relation
        view2: bindingElemId,
        attr2: 'centerX',    // see AutoLayout.Attribute
        constant: 0,
        multiplier: 1,
        priority: AutoLayout.Priority.REQUIRED
    }, {
        view1: rootChildID,
        attr1: 'centerY',    // see AutoLayout.Attribute
        relation: 'equ',   // see AutoLayout.Relation
        view2: bindingElemId,
        attr2: 'centerY',    // see AutoLayout.Attribute
        constant: 0,
        multiplier: 1,
        priority: AutoLayout.Priority.REQUIRED
    }, {
        view1: rootChildID,
        attr1: 'width',    // see AutoLayout.Attribute
        relation: 'equ',   // see AutoLayout.Relation
        view2: bindingElemId,
        attr2: "width",
        constant: 0,
        multiplier: 1,
        priority: AutoLayout.Priority.REQUIRED
    }, {
        view1: rootChildID,
        attr1: 'height',    // see AutoLayout.Attribute
        relation: 'equ',   // see AutoLayout.Relation
        view2: bindingElemId,
        attr2: "height",
        constant: 0,
        multiplier: 1,
        priority: AutoLayout.Priority.REQUIRED
    }
    ];
}

/**
 * Lays out the child elements of a parent element absolutely
 * using the visual format language.
 *
 * When the window is resized, the AutoLayout view is re-evaluated
 * and the child elements are resized and repositioned.
 *
 * @param {Element} parentElm Parent DOM element
 * @param {String|Array} constraints Either an array of raw constraints or  an array of one or more visual format strings
 */
function autoLayout(parentElm, constraints) {

    let isVisualFormat = constraints && isOneDimArray(constraints) && constraints.length > 0 && typeof constraints[0] === "string";
    let isOptionsFormat = constraints && isOneDimArray(constraints) && ((constraints.length > 0 && typeof constraints[0] === "object") || constraints.length === 0);

    let AutoLayout = window.AutoLayout;
    let view = new AutoLayout.View();
    if (isVisualFormat === true) {
        view.addConstraints(AutoLayout.VisualFormat.parse(constraints, {extended: true}));
    } else if (isOptionsFormat) {
        view.addConstraints(constraints);
    } else {
        throw 'Invalid parameters passed to autoLayout! no layout constraints specified';
    }

    let elements = {};

    for (let key in view.subViews) {
        let elm = document.getElementById(key);
        if (elm) {
            //elm.className += elm.className ? ' abs' : 'abs';
            addClass(elm, 'abs');
            elements[key] = elm;
        }
    }
    var updateLayout = function () {
        if (parentElm) {
            let horScrollBarShowing = parentElm.scrollWidth > parentElm.clientWidth;
            let vertScrollBarShowing = parentElm.scrollHeight > parentElm.clientHeight;
            let windowWidth = (vertScrollBarShowing ? window.innerWidth - getScrollBarWidth() : window.innerWidth);
            let windowHeight = (horScrollBarShowing ? window.innerHeight - getScrollBarWidth() : window.innerHeight);
            view.setSize(parentElm ? parentElm.clientWidth : windowWidth, parentElm ? parentElm.clientHeight : windowHeight - 1);
        } else {
            view.setSize(parentElm ? parentElm.clientWidth : window.innerWidth, parentElm ? parentElm.clientHeight : window.innerHeight - 1);
        }

        for (let key in view.subViews) {
            var subView = view.subViews[key];
            let elm = elements[key];
            if (elm) {
                setAbsoluteSizeAndPosition(elm, subView.left, subView.top, subView.width, subView.height);
            }
        }
    };

    window.addEventListener('resize', updateLayout);
    window.removeEventListener('resize', restoreDOMVisibilityState);
    window.addEventListener('resize', restoreDOMVisibilityState);

    if (parentElm && parentElm.getAttribute(attrKeys.id) === BODY_ID) {
        let rs = new ResizeSensor(parentElm, function () {
            //is scroll visible
            if (parentElm) {
                if (parentElm.scrollHeight > parentElm.clientHeight || parentElm.scrollWidth > parentElm.clientWidth) {
                    updateLayout();
                }
            }
        });
    }


    updateLayout();
    return updateLayout;
}


Workspace.prototype.startFetchWorker = function (layoutFileName, onSucc) {

    let worker = new WorkerBot("worker-" + layoutFileName, PATH_TO_ENGINE_SCRIPTS + 'layout-worker.js',
        function (e) {
            let layoutXML = e.data.content;
            if (onSucc.length === 1) {
                onSucc(layoutXML);
            } else {
                console.log(onSucc);
            }
        }, function (e) {
            throw e;
        });

    let args = {};
    args.layout = layoutFileName;

    worker.postMessage(args);

    this.workersMap.set(worker.name, worker);
};

Workspace.prototype.stopFetchWorkerByLayoutName = function (layoutFileName) {
    let worker = this.workersMap.get("worker-" + layoutFileName);
    worker.stop();
    worker = null;
};


Workspace.prototype.stopFetchWorker = function (workerName) {
    let worker = this.workersMap.get(workerName);
    worker.stop();
    worker = null;
};


/**
 *
 * @param name A label given to this Worker
 * @param src THe path to the worker script
 * @param onmessage A function to listen for incoming messages from the Worker's process
 * @param onerror A function to listen for incoming errors from the Worker's process
 * @constructor
 */
function WorkerBot(name, src, onmessage, onerror) {
    this.name = name;
    this.worker = null;
    this.src = src;
    this.onmessage = onmessage;
    this.onerror = onerror;

    if (typeof (Worker) !== "undefined") {
        this.worker = new Worker(src);
        this.worker.name = name;
        this.worker.onmessage = onmessage;
        this.worker.onerror = onerror;
    } else {
        throw new Error("Sorry your browser does not support web-workers");
    }
}


WorkerBot.prototype.postMessage = function (message, transferable) {
    this.worker.postMessage.apply(this.worker, this.postMessage.arguments);
    this.dead = false;
};


WorkerBot.prototype.stop = function () {
    this.worker.terminate();
    this.dead = true;
    this.worker = undefined;
};


WorkerBot.prototype.recreate = function () {
    this.worker = new Worker(this.src);
    this.dead = false;
    this.worker.onmessage = this.onmessage;
    this.worker.onerror = this.onerror;
};

function isScriptLoaded(scriptURL) {

    let scripts = document.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
        let script = scripts[i];

        if (script.src === scriptURL) {
            return true;
        }

    }

    return null;
}


/**
 * Runs a default workspace based on the file name supplied by the user on the layit.js script tag in the html file.
 * @returns {undefined}
 */
function baseLauncher() {
    let templateJson = document.currentScript.getAttribute('data-template');
    let fileName = document.currentScript.getAttribute('data-launcher');
    /**
     * Check if the user has specified a hash i.e. the request is coming from a url, so override the default fileName
     * specified in the data-launcher.
     */
    if (window.location.hash && window.location.hash.length > 0) {
        fileName = window.location.hash.substring(1);
    }
    let pages = document.currentScript.getAttribute('data-pages');
    let arr = [];
    //spa or mpa
    let pageType = document.currentScript.getAttribute('data-pageType');
    APP_TYPE = pageType ? ((pageType === APP_TYPE_CONST.MPA || pageType === APP_TYPE_CONST.SPA) ? pageType : APP_TYPE_CONST.MPA) : APP_TYPE_CONST.MPA;

    //A comma separated list of page names.."a.xml, b.xml"
    if (APP_TYPE === APP_TYPE_CONST.SPA) {
        if (pages) {
            pages = pages.replace(" ", "");
            arr = pages.split(",");
            if (arr.indexOf(fileName) === -1) {
                arr.unshift(fileName);
            }
        }
    }

    let dataType = document.currentScript.getAttribute('data-type');//json-raw | json-b64

    if (dataType) {
        if (dataType === 'json-b64') {
            templateJson = window.atob(templateJson);
        } else {
            throw new Error("Unsupported format: `" + dataType + "`");
        }
    }

    if (fileName && typeof fileName === 'string' && fileName.length > 0) {
        launcher(fileName, BODY_ID, templateJson, arr);
    }

}

/**
 * Runs a workspace based on the file name supplied by the user and the id of the element that the layout should be attached to.
 * @param {string} fileName
 * @param {string} elemId
 * @param {string} templateData A json string containing information to pass into the xml layout
 * @param {string[]} pages An array of layout names to preload as workspaces
 * @returns {undefined}
 */
function launcher(fileName, elemId, templateData, pages) {

    if (elemId && typeof elemId === 'string' && elemId.length > 0) {
        if (fileName && typeof fileName === 'string' && fileName.length > 0) {
            let len = fileName.length;
            let endItem = '.xml';
            let endLen = endItem.length;

            const isXML = fileName.lastIndexOf(endItem) === len - endLen;

            if (isXML === true) {
                let workspace;
                if (templateData) {
                    if (typeof templateData === 'string') {
                        if (templateData.length > 0) {
                            try {
                                let data = JSON.parse(templateData);
                                new Workspace({
                                    layoutName: fileName,
                                    bindingElemId: elemId,
                                    templateData: data,
                                    onComplete: function (rootView) {
                                        loadWorkspaces(pages, function () {
                                            console.log('preload all workspaces...success');
                                        });
                                    }
                                });
                            } catch (err) {
                                throw new Error('Template data specified but is not valid JSON!...' + templateData);
                            }
                        } else {
                            throw new Error('Template data specified but has no content');
                        }
                    } else if (typeof templateData === 'object') {
                        new Workspace({
                            layoutName: fileName,
                            bindingElemId: elemId,
                            templateData: templateData,
                            onComplete: function (rootView) {
                                loadWorkspaces(pages, function () {
                                    console.log('preload all workspaces...success');
                                });
                            }
                        });
                    } else {
                        throw new Error('Template data specified but its type is invalid');
                    }
                } else {
                    new Workspace({
                        layoutName: fileName,
                        bindingElemId: elemId,
                        onComplete: function (rootView) {
                            loadWorkspaces(pages, function () {
                                console.log('preload all workspaces...success');
                            });
                        }
                    });
                }
            } else {
                throw new Error('Invalid xml file specified in data-launcher attribute of `layit.js` script tag.');
            }
        } else {
            throw new Error('Invalid filename specified');
        }
    } else {
        throw new Error('Invalid parent element specified');
    }

}

baseLauncher();