/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const SideMenuTypes = {
    PUSH: 'push',
    OVERLAY: 'overlay'
};


function Section(title, items) {
    this.title = null;
    if (title) {
        if (typeof title === 'string') {
            this.title = title;
        } else {
            throw new Error('Invalid section title!');
        }
    } else {
        throw new Error('Please specify a section title!');
    }

    if (items) {
        if (Object.prototype.toString.call(items) === '[object Array]') {
            //Do some petty validation here to force the user to behave responsibly.
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let keys = Object.keys(item);
                if (keys.length === 1 || keys.length === 2) {
                    for (let ind = 0; ind < keys.length; ind++) {
                        if (keys[ind] !== 'text' && keys[ind] !== 'src') {
                            throw new Error('Bad item found!!! @ index: ' + i + ' in section: ' + title);
                        }
                    }
                } else {
                    throw new Error('Invalid item specified... items can only have one or both of `.text` and `.src` properties');
                }
            }
            this.items = items;
        } else {
            throw new Error('An array of items must be specified here!');
        }
    } else {
        throw new Error('Please supply the items for this section@(' + this.title + ')!');
    }

}

function SectionItem(text, src) {
    this.text = text;
    this.src = src;
}

/**
 * 
 * @param {Object} options
 * 
 * {
 * 
 id: 'menu-id',
 width: '30%',//or other css value
 menuType: 'push|overlay',//e.g. one of SideMenuTypes.PUSH or SideMenuTypes.OVERLAY
 background: 'white',
 textColor: 'black',
 listPadding: '0.3em',
 fontName: '',
 fontSize: '',
 fontWeight: '', bold|bolder... accepted css values
 fontStyle: ,//normal|italic...accepted css values
 title: 'Menu Title',
 logo: 'image_src.png',
 
 sections:[
 {
 "title": "t1",
 "items": [{
 "text": "xxxx",
 "src":  "mmm.png"
 },{
 "text": "yyyy",
 "src":  "nnn.png"
 }],
 },
 {
 "title": "t2",
 "items": [{
 "text": "tttt",
 "src":  "ppp.png"
 },{
 "text": "uuuu",
 "src":  "vvv.png"
 }],
 },
 {
 "title": "t3",
 "items": [{
 "text": "qqqq",
 "src":  "rrr.png"
 },{
 "text": "aaaa",
 "src":  "bbb.png"
 }],
 },...
 
 ] ||
 sections: '[{"title": "t1","items": [{"text": "xxxx","src":  "mmm.png"},{"text": "yyyy","src":  "nnn.png"}]},{"title": "t2","items": [{"text": "tttt","src":  "ppp.png"},{"text": "uuuu", "src":  "vvv.png"}]}]'s
 }
 *   onOpen : function(){},
 *   onClose : function(){}  
 * @returns {SideMenu}
 */
function SideMenu(options) {
    if (!options) {
        throw new Error('Please supply the options for creating the menu.');
    }

    this.id = '';

    this.background = (options.background && options.background.length > 0) ? options.background : 'white';

    if (typeof options.id === 'string') {
        this.id = options.id;
    } else {
        throw new Error('Please supply the id of the menu');
    }

    this.width = -1;
    if (typeof options.width === 'string' && isNumber(parseInt(options.width))) {
        this.width = options.width;
    } else {
        throw new Error('Please supply the width of the menu.. e.g. `width:"300px"` or `width:"30%"`');
    }


    this.hPadding = '0';
    if (typeof options.hPadding === 'string' && isNumber(parseInt(options.hPadding))) {
        this.hPadding = options.hPadding;
    }

    this.vPadding = '0';
    if (typeof options.vPadding === 'string' && isNumber(parseInt(options.vPadding))) {
        this.vPadding = options.vPadding;
    }


    this.fontName = 'cursive';
    if (typeof options.fontName === 'string' && options.fontName.length > 0) {
        this.fontName = options.fontName;
    } else {
        //throw new Error('Please supply the font family');
    }

    this.iconSpacing = '13px';
    if (typeof options.iconSpacing === 'string' && isNumber(parseInt(options.iconSpacing))) {
        this.iconSpacing = options.iconSpacing;
    } else {
        // throw new Error('Please supply the font size for the menu items');
    }

    this.fontSize = '13px';
    if (typeof options.fontSize === 'string' && isNumber(parseInt(options.fontSize))) {
        this.fontSize = options.fontSize;
    } else {
        // throw new Error('Please supply the font size for the menu items');
    }

    this.fontWeight = 'bold';
    if (typeof options.fontWeight === 'string' && options.fontWeight.length > 0) {
        this.fontWeight = options.fontWeight;
    } else {
        //throw new Error('Please supply the font weight(bold|normal|other-css-value) for the menu items');
    }


    this.fontStyle = 'normal';
    if (typeof options.fontStyle === 'string' && options.fontStyle.length > 0) {
        this.fontStyle = options.fontStyle;
    } else {
        //throw new Error('Please supply the font style(italic|normal|other-css-value) for the menu items');
    }


    this.classLabel = this.id + '-menu-class';

    this.menuType = SideMenuTypes.OVERLAY;
    if (options.type) {
        if (options.menuType === SideMenuTypes.PUSH || options.menuType === SideMenuTypes.OVERLAY) {
            this.menuType = options.menuType;
        } else {
            throw new Error('Invalid menu type specified! Use either of `' + SideMenuTypes.PUSH + '` or `' + SideMenuTypes.OVERLAY + '`');
        }
    }

    this.background = '#fff';
    if (options.background) {
        this.background = options.background;
    }

    this.textColor = '#000';
    if (options.textColor) {
        this.textColor = options.textColor;
    }

    this.sections = [];
    if (options.sections) {
        if (typeof options.sections === 'string') {
            options.sections = JSON.parse(options.sections);
        }

        if (Object.prototype.toString.call(options.sections) === '[object Array]') {
            for (let i = 0; i < options.sections.length; i++) {
                let s = options.sections[i];
                if (s.constructor.name !== 'Section') {//validate the object if its not a section object
                    let keys = Object.keys(s);
                    for (let k = 0; k < keys.length; k++) {
                        if (keys[k] !== 'title' && keys[k] !== 'items') {
                            throw new Error('Bad section property found!!! ' + keys[k]);
                        }
                    }
                    let sectionProto = new Section(s[keys[0]], s[keys[1]]);// more validation occurs here, so...
                    this.sections.push(sectionProto);
                }
            }
        } else {
            throw new Error('The sections property of your options must be an array of seections or a JSON representation of the same');
        }

    } else {
        throw new Error('Menu sections not specified!');
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
    this.noScrollStyle = new Style(".noscroll", []);


    this.listContainerStyle = new Style('.' + this.listContainerClass(), []);
    this.sectionTitleStyle = new Style('.' + this.listTitleClass(), []);
    this.listStyle = new Style('.' + this.listClass(), []);
    this.listItemStyle = new Style('.' + this.listItemClass(), []);
    this.listItemHoverStyle = new Style('.' + this.listItemClass() + ':hover', []);
    this.listItemImageStyle = new Style('.' + this.listItemImageClass(), []);
    this.listItemTitleWithImageStyle = new Style('.' + this.listItemTitleClass(true), []);
    this.listItemTitleNoImageStyle = new Style('.' + this.listItemTitleClass(false), []);
    this.closeBtnStyle = new Style('.' + this.closeBtnClass(), []);

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
        'z-index': popupZIndex + '',
        width: bgWidth + 'px',
        height: bgHeight + 'px'
    });


    this.noScrollStyle.addFromOptions({
        overflow: 'hidden'
    });


    popupZIndex += 10;
    initFrameCss:{

        this.frameStyle.addFromOptions({
            width: '0',
            height: bgHeight + 'px',
            position: 'fixed',
            'z-index': popupZIndex + '',
            top: '0',
            left: '0',
            '-moz-user-select': '-moz-none',
            '-khtml-user-select': 'none',
            '-webkit-user-select': 'none',
            '-ms-user-select': 'none',
            'user-select': 'none',
            'background-color': this.background,
            'overflow-x': 'hidden',
            'overflow-y': 'auto',
            'transition': '0.5s',
            'padding-top': '0px'
        });
    }

    initListContainerCss:{
        this.listContainerStyle.addFromOptions({
            display: 'block',
            "font-size": this.fontSize,
            "font-family": this.fontName,
            "font-weight": 'bold',
            'z-index': (popupZIndex += 1) + '',
            width: '100%',
            height: 'auto',
            float: 'left',
            'background-color': 'transparent'
        });

    }
    initListTitleCss:{
        this.sectionTitleStyle.addFromOptions({
            display: 'block',
            float: 'left',
            "font-size": '1.2em',
            'z-index': (popupZIndex += 1) + '',
            color: this.textColor,
            "padding-top": this.vPadding,
            "padding-bottom": this.vPadding,
            "padding-left": this.hPadding,
            "padding-right": this.hPadding,
            margin: '10px 5px',
            'background-color': 'transparent'
        });
    }
    initListCss:{
        this.listStyle.addFromOptions({
            display: 'block',
            width: '100%',
            float: 'left',
            'z-index': (popupZIndex += 1) + '',
            "font-weight": 'normal',
            color: this.textColor,
            margin: '10px 0px',
            'padding-bottom': '5px',
            'border-bottom': '1px solid #999',
            'background-color': 'transparent'
        });
    }

    initListItemCss:{
        this.listItemStyle.addFromOptions({
            display: 'flex',
            'align-items': 'center',
            color: this.textColor,
            "background-color": this.background,
            "padding-top": this.vPadding,
            "padding-bottom": this.vPadding,
            "padding-left": this.hPadding,
            "padding-right": this.hPadding,
            '-moz-user-select': '-moz-none',
            '-khtml-user-select': 'none',
            '-webkit-user-select': 'none',
            '-ms-user-select': 'none',
            "border-bottom": "5px solid transparent",
            'user-select': 'none'
        });
        this.listItemHoverStyle.addFromOptions({
            cursor: 'pointer',
            "background-color": darkenColor(this.background, 0.2),
            "color": brightenColor(this.background, 0.5)
        });
    }

    initListItemImageCss:{
        this.listItemImageStyle.addFromOptions({
            float: 'left',
            width: '32px',
            height: 'auto',
            background: 'transparent'
        });
    }
    initListItemTitleCss:{
        this.listItemTitleWithImageStyle.addFromOptions({
            float: 'left',
            color: 'black',
            'font-weight': 'normal',
            'margin-left': this.iconSpacing,
            background: 'transparent'
        });

        this.listItemTitleNoImageStyle.addFromOptions({
            float: 'left',
            color: 'black',
            'font-weight': 'normal',
            background: 'transparent'
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


    this.parsedWidth = -1;

    this.registerStyle(this.overlayStyle);
    this.registerStyle(this.frameStyle);
    this.registerStyle(this.noScrollStyle);
    this.registerStyle(this.listContainerStyle);
    this.registerStyle(this.sectionTitleStyle);
    this.registerStyle(this.listStyle);
    this.registerStyle(this.listItemStyle);
    this.registerStyle(this.listItemHoverStyle);
    this.registerStyle(this.listItemImageStyle);
    this.registerStyle(this.listItemTitleWithImageStyle);
    this.registerStyle(this.listItemTitleNoImageStyle);
    this.registerStyle(this.closeBtnStyle);

    this.sectionsDrawn = false;

}

SideMenu.prototype.registerStyle = function (style) {
    this.registry[style.name] = style;
};

SideMenu.prototype.buildSections = function (frame) {

    let self = this;
    let button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Close ☰');
    button.style.fontWeight = 'bold';
    button.style.fontSize = this.fontSize;
    button.style.fontFamily = 'cursive';
    button.style.float = 'left';
    button.style.marginLeft = this.hPadding;
    button.style.marginTop = this.vPadding;
    button.style.padding = '8px';
    button.style.border = '1px solid gray';
    button.style.borderRadius = '4px';


    button.onclick = function (e) {
        self.hide();
    };

    frame.appendChild(button);

    for (let i = 0; i < this.sections.length; i++) {

        let section = this.sections[i];
        let title = section.title;
        let items = section.items;

        let listContainerId = this.listContainerId(i);
        let listContainerClass = this.listContainerClass();

        let listId = this.listId(i);
        let listClass = this.listClass();

        let listItemImageClass = this.listItemImageClass();
        let listItemTitleWithImgClass = this.listItemTitleClass(true);
        let listItemTitleNoImgClass = this.listItemTitleClass(false);


        let container = document.createElement('div');
        container.setAttribute("id", listContainerId);
        addClass(container, listContainerClass);
        frame.appendChild(container);
        if (title && title.trim().length > 0) {

            let listTitleId = this.listTitleId(i);
            let listTitleClass = this.listTitleClass();

            let titleLabel = document.createElement('div');
            titleLabel.setAttribute('id', listTitleId);
            addClass(titleLabel, listTitleClass);
            titleLabel.innerText = title;
            container.appendChild(titleLabel);
        }
        let list = document.createElement('ul');

        list.setAttribute("id", listId);
        addClass(list, listClass);

        let listItemClass = this.listItemClass();

        for (let j = 0; j < items.length; j++) {
            let li = document.createElement('li');
            let span = document.createElement('div');
            addClass(li, listItemClass);
            let item = items[j];
            let hasImg = item.src && item.src.length > 0;
            if (hasImg === true) {
                let img = document.createElement('img');
                addClass(img, listItemImageClass);
                img.setAttribute('src', PATH_TO_IMAGES + item.src);
                img.setAttribute('alt', '');
                li.appendChild(img);
            }

            span.textContent = item.text;
            addClass(span, hasImg === true ? listItemTitleWithImgClass : listItemTitleNoImgClass);
            li.appendChild(span);
            list.appendChild(li);
        }
        container.appendChild(list);
    }

    this.sectionsDrawn = true;
};


SideMenu.prototype.hide = function () {
    var overlay = document.getElementById(this.overlayId());
    var frame = document.getElementById(this.containerId());

    if (overlay) {
        overlay.style.display = 'none';
    }
    if (frame) {
        this.closeMenu();
    }
    removeClass(document.body, this.noScrollStyle.name.substring(1));
    this.onClose();

};

SideMenu.prototype.open = function () {
    this.build();
};


SideMenu.prototype.build = function () {

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
        closeBtn.type = "button";
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
        this.buildSections(frame);
        popup.openMenu();

        popup.parsedWidth = parseInt(window.getComputedStyle(frame).width);
    }



    this.addDragEvents(overlay, frame);
    this.openMenu();


};



SideMenu.prototype.addDragEvents = function (overlay, frame) {

    let self = this;
    let pressed = true;
    frame.onmousemove = function (e) {};
    frame.onmousedown = function (e) {
        e = window.event || e;
        if (e.target !== this) {
            return;
        }
        pressed = true;

        frame.onmousemove = function (ev) {
            ev = window.event || ev;
            if (ev.target !== this) {
                return;
            }
            if (pressed === true) {
                if (ev.pageX < self.parsedWidth) {
                    console.log('1....ev.pageX: ', ev.pageX, "frame.style.width: ", frame.style.width);
                    frame.style.width = (ev.pageX + 2) + 'px';
                    frame.style.transition = '0.05s';
                } else {
                    console.log('2....ev.pageX: ', ev.pageX, "frame.style.width: ", frame.style.width);
                }
            }

        };
        frame.onmouseup = function (ev) {
            ev = window.event || ev;
            if (ev.target !== this) {
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
            if (ev.target !== this) {
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

SideMenu.prototype.containerClass = function () {
    return this.id + "_side_menu_frame_class";
};


SideMenu.prototype.overlayClass = function () {
    return this.id + "_side_menu_overlay_class";
};

SideMenu.prototype.overlayId = function () {
    return this.id + "_side_menu_overlay_id";
};


SideMenu.prototype.closeBtnClass = function () {
    return this.id + "_side_menu_close_btn_class";
};

SideMenu.prototype.closeBtnId = function () {
    return this.id + "_side_menu_close_btn_class";
};

SideMenu.prototype.containerId = function () {
    return this.id + "_side_menu_frame";
};


SideMenu.prototype.openMenu = function () {
    document.getElementById(this.containerId()).style.width = this.width;
    addClass(document.body, this.noScrollStyle.name.substring(1));
    this.onOpen();
};

SideMenu.prototype.closeMenu = function () {
    document.getElementById(this.containerId()).style.width = "0";
};

SideMenu.prototype.listTitleId = function (sectionIndex) {
    return this.containerId() + '_list_title_id_' + (sectionIndex + 1);
};
SideMenu.prototype.listTitleClass = function () {
    return this.containerId() + '_list_title_class';
};

SideMenu.prototype.listContainerId = function (sectionIndex) {
    return this.containerId() + '_list_container_id_' + (sectionIndex + 1);
};
SideMenu.prototype.listContainerClass = function () {
    return this.containerId() + '_list_container_class';
};

SideMenu.prototype.listId = function (sectionIndex) {
    return this.containerId() + '_list_id_' + (sectionIndex + 1);
};
SideMenu.prototype.listClass = function () {
    return this.containerId() + '_list_class';
};

SideMenu.prototype.listItemClass = function () {
    return this.containerId() + '_list_item_class';
};


SideMenu.prototype.listItemImageClass = function () {
    return this.containerId() + '_list_item_image_class';
};

SideMenu.prototype.listItemTitleClass = function (withImg) {
    if (withImg) {
        return this.containerId() + '_list_item_title_with_img_class';
    } else {
        return this.containerId() + '_list_item_title_no_img_class';
    }

};