/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global SideMenuTypes */

/**
 * 
 * @param {Object} options
 * 
 * {
 * 
 id: 'menu-id',
 layout: 'layout-xml-file-name'
 width: '30%',//or other css value
 background: 'pink',
 menuType: 'push|overlay',//e.g. one of SideMenuTypes.PUSH or SideMenuTypes.OVERLAY
 },...
 
 ]
 }
 onOpen : function(){},
 onClose : function(){}  
 * @returns {SideMenu}
 */
function SideMenuX(options) {
    if (!options) {
        throw new Error('Please supply the options for creating the menu.');
    }

    this.id = '';

    if (typeof options.id === 'string') {
        this.id = options.id;
    } else {
        throw new Error('Please supply the id of the menu');
    }

    this.width = -1;
    this.parsedWidth = -1;
    if (typeof options.width === 'string' && isNumber(parseInt(options.width))) {
        this.width = options.width;
    } else {
        throw new Error('Please supply the width of the menu.. e.g. `width:"300px"` or `width:"30%"`');
    }

    this.menuType = SideMenuTypes.OVERLAY;
    if (options.type) {
        if (options.menuType === SideMenuTypes.PUSH || options.menuType === SideMenuTypes.OVERLAY) {
            this.menuType = options.menuType;
        } else {
            throw new Error('Invalid menu type specified! Use either of `' + SideMenuTypes.PUSH + '` or `' + SideMenuTypes.OVERLAY + '`');
        }
    }

    this.layout = '';

    if (typeof options.layout === 'string') {
        this.layout = options.layout;
    } else {
        throw new Error('Please supply the name of the xml layout');
    }

    this.background = '#fff';
    if (options.background) {
        this.background = options.background;
    }


    this.registry = {};//register css classes and map them to their styles.

    var body = document.body,
            html = document.documentElement;

    let bgWidth = Math.max(body.scrollWidth, body.offsetWidth,
            html.clientWidth, html.scrollWidth, html.offsetWidth);
    let bgHeight = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);


    this.overlayStyle = new Style('.' + this.overlayClass(), []);
    this.frameStyle = new Style('.' + this.containerClass(), []);
    this.closeBtnStyle = new Style("." + this.closeBtnClass(), []);
    this.noScrollStyle = new Style(".noscroll", []);
    let popupZIndex = 1100;

    this.overlayStyle.addFromOptions({
        display: 'block',
        visibility: 'visible',
        opacity: '0.8',
        position: 'fixed',
        'background-color': "black",
        top: '0',
        left: '0',
        bottom: '0',
        right: '0',
        'z-index': popupZIndex + ''
    });

    this.noScrollStyle.addFromOptions({
        overflow: 'hidden'
    });


    initFrameCss:{

        popupZIndex += 10;
        this.frameStyle.addFromOptions({
            width: this.width,
            height: bgHeight + 'px',
            position: 'fixed',
            top: '0',
            left: '0',
            'z-index': popupZIndex + '',
            'background-color': this.background,
            'overflow-x': 'hidden',
            'overflow-y': 'auto',
            transition: '0.05s',
            'padding': '0'
        });
    }

    initCloseBtnStyle:{
        this.closeBtnStyle.addFromOptions({
            "top": "12px",
            "right": "18px",
            "position": "fixed",
            "font-size": "8em",
            "font-weight": "bold",
            "font-family": "monospace",
            "cursor": "pointer",
            "color": "white",
            "background-color": "transparent",
            "border": "none",
            "padding": "none"
        });
    }

    this.onOpen = function () {};
    if (options.onOpen && {}.toString.call(options.onOpen) === '[object Function]') {
        this.onOpen = options.onOpen;
    } else {
        this.onOpen = function () {};
    }

    this.onClose = function () {};
    if (options.onClose && {}.toString.call(options.onClose) === '[object Function]') {
        this.onClose = options.onClose;
    } else {
        this.onClose = function () {};
    }

    this.registerStyle(this.overlayStyle);
    this.registerStyle(this.noScrollStyle);
    this.registerStyle(this.frameStyle);
    this.registerStyle(this.closeBtnStyle);
    /**
     * The root view of the loaded layout
     */
    this.rootView = null;


}


SideMenuX.prototype.registerStyle = function (style) {
    this.registry[style.name] = style;
};

SideMenuX.prototype.hide = function () {
    var overlay = document.getElementById(this.overlayId());
    var frame = document.getElementById(this.containerId());

    if (overlay) {
        overlay.style.display = 'none';
    }
    if (frame) {
        this.closeMenu();
    }
        removeClass(document.body , this.noScrollStyle.name.substring(1));
    this.onClose();

};

SideMenuX.prototype.open = function () {
    this.build();
};

SideMenuX.prototype.build = function () {

    var popup = this;


    let freshCall = false;

    var overlay = document.getElementById(this.overlayId());
    var frame = document.getElementById(this.containerId());

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

    if (!frame) {
        frame = document.createElement('div');
        frame.setAttribute("id", this.containerId());
        addClass(frame, this.containerClass());
        document.body.appendChild(frame);
    }






    let closeBtn = document.getElementById(this.closeBtnId());

    if (!closeBtn) {
        closeBtn = document.createElement("input");
        closeBtn.setAttribute("id", this.closeBtnId());
        addClass(closeBtn, this.closeBtnClass());
        closeBtn.setAttribute('type' , 'button');
        closeBtn.value = "\u02DF";
        overlay.appendChild(closeBtn);
    }


    closeBtn.onclick = function () {
        popup.hide();
    };


    if (freshCall) {
        let style = document.createElement('style');
        style.type = 'text/css';
        let css = new StringBuffer();

        for (var key in this.registry) {
            css.append(this.registry[key].styleSheetEntry(key));
        }
        style.innerHTML = css.toString();
        document.getElementsByTagName('head')[0].appendChild(style);

        let workspace = getWorkspace({
            layoutName: this.layout,
            bindingElemId: frame.id,
            onComplete: function (rootView) {
                popup.openMenu();
                popup.rootView = workspace.rootView().htmlElement;
                popup.parsedWidth = parseInt(window.getComputedStyle(frame).width);
            }});
    }

    this.addDragEvents(overlay, frame);
    this.openMenu();


};

SideMenuX.prototype.addDragEvents = function (overlay, frame) {

    let self = this;
    let pressed = true;

    frame.onmousemove = function (e) {};
    frame.onmousedown = function (e) {
        e = window.event || e;
        if (e.target !== this && e.target !== self.rootView) {
            return;
        }
        pressed = true;

        frame.onmousemove = function (ev) {
            ev = window.event || ev;
            if (ev.target !== this && ev.target !== self.rootView) {
                return;
            }
            if (pressed === true) {
                if (ev.pageX < self.parsedWidth) {
                    frame.style.width = (ev.pageX + 2) + 'px';
                    frame.style.transition = '0.05s';
                } else {

                }
            }


        };
        frame.onmouseup = function (ev) {
            ev = window.event || ev;
            if (ev.target !== this && ev.target !== self.rootView) {
                return;
            }
            pressed = false;
            frame.style.transition = '0.5s';
            frame.onmousemove = function (e) {};
            if (ev.pageX < self.parsedWidth / 3) {
                self.hide();
            } else {
                self.openMenu();
            }
        };


    };

    overlay.onmouseup = function (e) {
        e.preventDefault();
        pressed = false;
    };


    overlay.onmousemove = function (e) {
          ev = window.event || ev;
            if (ev.target !== this && ev.target !== self.rootView) {
                return;
            }
            if (pressed === true) {
                if (ev.pageX < self.parsedWidth) {
                    frame.style.width = (ev.pageX + 2) + 'px';
                    frame.style.transition = '0.05s';
                } else  if(ev.pageX >= self.parsedWidth + 80){
                    frame.style.width = self.parsedWidth + 'px';
                }else {
                   
                }
            }

    };



};

SideMenuX.prototype.containerClass = function () {
    return this.id + "_side_menux_frame_class";
};


SideMenuX.prototype.overlayClass = function () {
    return this.id + "_side_menux_overlay_class";
};


SideMenuX.prototype.overlayId = function () {
    return this.id + "_side_menux_overlay_id";
};

SideMenuX.prototype.closeBtnClass = function () {
    return this.id + "_side_menux_close_btn_class";
};

SideMenuX.prototype.closeBtnId = function () {
    return this.id + "_side_menux_close_btn_class";
};



SideMenuX.prototype.containerId = function () {
    return this.id + "_side_menux_frame";
};


SideMenuX.prototype.openMenu = function () {
    document.getElementById(this.containerId()).style.width = this.width;
    addClass(document.body , this.noScrollStyle.name.substring(1));
    this.onOpen();
};

SideMenuX.prototype.closeMenu = function () {
    document.getElementById(this.containerId()).style.width = "0";
};

