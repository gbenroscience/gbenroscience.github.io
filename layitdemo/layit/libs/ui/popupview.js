

/**
 * Stores a reference to all popups here.
 * @type type
 */
var popupZIndex = 1000;


/**
 * A Popup object basically creates an overlay layout to
 * which predesigned html forms or other layout can be appended 
 * quickly.
 * @param {type} options The options required to render the popup:
 * Format is:
 * 
 * {
 *   id: "id",
 *   width : '10em',
 *   height : '6em',
 *   layout: 'popup_xml_layout_name'
 *   bg: '#ffffff',
 *   
 *   containerStyle{
 *     width: 23%,
 *     border-radius : 1em, blah-blah-blah
 *   },
 *   onOpen : function(){},
 *   onClose : function(){}   
 * }
 * 
 * 
 * 
 * @returns {undefined}
 */
function Popup(options) {

    if (!options) {
        console.log("No options specified for creating this popup");
        return;
    }
    if (!options.id || typeof options.id !== 'string') {
        throw new Error("Hi! You have not specified a value for options.layitId! Popup cannot be created");
    }
    this.id = options.id + '_popup';

    if (typeof options.width !== 'string') {
        console.log("Hi! options.width must be a valid css dimension! Defaulting to 90%");
        options.width = "90%";
    }
    if (!options.width) {
        options.width = "90%";
    }

    if (typeof options.height !== 'string') {
        console.log("Hi! options.height must be a valid css dimension!  Defaulting to 90%");
        options.height = "90%";
    }
    if (!options.height) {
        options.height = "90%";
    }

    if (!options.bg || typeof options.bg !== 'string') {
        console.log("Hi! options.bg must be a valid html color!  defaulting to white");
        this.background = "#ffffff";
    } else {
        this.background = options.bg;
    }

    this.layout = '';

    if (typeof options.layout === 'string') {
        this.layout = options.layout;
    } else {
        throw new Error('Please supply the name of the xml layout');
    }



    if (options.onOpen && {}.toString.call(options.onOpen) === '[object Function]') {
        this.onOpen = options.onOpen;
    } else {
        this.onOpen = function () {};
    }


    if (options.onClose && {}.toString.call(options.onClose) === '[object Function]') {
        this.onClose = options.onClose;
    } else {
        this.onClose = function () {};
    }

    //this.injectableHTML = '<p style="padding: 1em;font-size: 1em; color : red;font-weight:bold">Home made OOP Popup!</p>';

    this.registry = {};//register css classes and map them to their styles.

    var body = document.body,
            html = document.documentElement;

    let bgWidth = Math.max(body.scrollWidth, body.offsetWidth,
            html.clientWidth, html.scrollWidth, html.offsetWidth);
    let bgHeight = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);


    this.opaqueBgStyle = new Style('#' + this.id, []);
    this.containerStyle = new Style('#' + this.id, []);

    this.noScrollStyle = new Style(".noscroll", []);
    this.closeBtnStyle = new Style("#" + this.id, []);

    popupZIndex += 10;
    this.opaqueBgStyle.addFromOptions({
        display: 'block',
        visibility: 'visible',
        opacity: '0.8',
        position: 'fixed',
        'background-color': "black",
        top: '0',
        left: '0',
        bottom: '0',
        right: '0',
        'z-index': popupZIndex + '',
        width: bgWidth + 'px',
        height: bgHeight + 'px'
    });
   this.noScrollStyle.addFromOptions({
        overflow: 'hidden'
    });

    this.width = options.width;
    this.height = options.height;

    var w = this.width;
    var h = this.height;
    var bg = this.background;





    initContainerCss:{

        this.containerStyle.addFromOptions({
            position: 'absolute',
            'left': "calc(50% - " + w + " / 2 )",
            'top': "calc(50% - " + h + " / 2 )",
            visibility: 'visible',
            display: 'block',
            padding: '0px',
            margin: '0px',
            overflow: 'auto',
            width: w,
            height: h,
            'background-color': bg,
            'z-index': (popupZIndex + 1) + '',
            'border-radius': '0.3em'
        });

        if (typeof options["containerStyle"] === "object") {
            var containerCss = options.containerStyle;
            for (var key in containerCss) {
                this.containerStyle.addStyleElement(key, containerCss[key]);
            }
        }
    }

    initCloseBtnStyle:{
        this.closeBtnStyle.addFromOptions({
            "top": "0.1em",
            "right": "0.1em",
            "position": "fixed",
            "font-size": "4rem",
            "font-weight": "bold",
            "font-family": "monospace",
            "cursor": "pointer",
            "color": "white",
            "background-color": "transparent",
            "border": "none",
            "padding": "none"
        });
    }


    
    
    this.registerStyle(this.opaqueBgStyle);
    this.registerStyle(this.containerStyle);
    this.registerStyle(this.closeBtnStyle);
    this.registerStyle(this.noScrollStyle);



}


Popup.prototype.registerStyle = function (style) {
    this.registry[style.name] = style;
};

Popup.prototype.hide = function () {
    var overlay = document.getElementById(this.overlayId());
    var dialog = document.getElementById(this.containerId());

    if (overlay) {
        overlay.style.display = 'none';
    }
    if (dialog) {
        dialog.style.display = 'none';
    }
    
        removeClass(document.body , this.noScrollStyle.name.substring(1));
    this.onClose();

};

Popup.prototype.open = function () {
    this.build();
};
Popup.prototype.build = function () {

    var popup = this;

    let freshCall = false;

    var overlay = document.getElementById(this.overlayId());
    var dialog = document.getElementById(this.containerId());

    if (!overlay) {
        freshCall = true;
        overlay = document.createElement('div');
        overlay.setAttribute("id", this.overlayId());
        addClass(overlay, this.overlayClass());
        document.body.appendChild(overlay);
    }

    overlay.style.display = 'block';
    overlay.onclick = function () {
        popup.hide();
    };




    if (!dialog) {
        dialog = document.createElement('div');
        dialog.setAttribute("id", this.containerId());
        addClass(dialog, this.containerClass());
        document.body.appendChild(dialog);
    }







    let closeBtn = document.createElement("input");
    if (!closeBtn) {
        closeBtn = document.createElement("input");
        closeBtn.setAttribute("id", this.closeBtnId());
        addClass(closeBtn, this.closeBtnClass());
        closeBtn.type = "button";
        closeBtn.value = "\u02DF";
        overlay.appendChild(closeBtn);
    }

    closeBtn.onclick = function () {
        popup.hide();
    };




    if (freshCall) {
        var style = document.createElement('style');
        style.type = 'text/css';
        var css = new StringBuffer();
        for (var key in this.registry) {
            css.append(this.registry[key].styleSheetEntry("." + key));
        }
        style.innerHTML = css.toString();
        document.getElementsByTagName('head')[0].appendChild(style);

        let workspace = getWorkspace({
            layoutName: this.layout,
            bindingElemId: dialog.id,
            onComplete: function (rootView) {}});
    }
    
    addClass(document.body , this.noScrollStyle.name.substring(1));
    popup.onOpen();
};



Popup.prototype.overlayId = function () {
    return this.id + "-main-overlay";
};


Popup.prototype.overlayClass = function () {
    return this.id + "-main-overlay-class";
};





Popup.prototype.containerId = function () {
    return this.id + "_container";
};


Popup.prototype.containerClass = function () {
    return this.id + "-container-class";
};


Popup.prototype.closeBtnClass = function () {
    return this.id + "-close-btn-class";
};

Popup.prototype.closeBtnId = function () {
    return this.id + "-close-btn-class";
};