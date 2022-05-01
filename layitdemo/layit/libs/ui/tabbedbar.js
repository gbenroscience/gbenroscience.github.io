

/* global CssSizeUnits, FontStyle */

/**
 * 
 * @param {Object} options An object containing options used to build the TabbedBar.
 * {
 * tabId: 'zaId',
 * selectedBg: 'green',// the bg color when a tab is selected
 * deselectedBg: 'red', // the bg color when a tab is not selected
 * selectedFg: 'white', // the color of the tab's text when the tab is selected
 * deselectedFg: 'pink', // the color of the tab's text when the tab is deselected
 * tabEdgeColor: 'white',// the color of the lines between the tabs
 * borderRadius: '12px', 
 * tabEdgeWidth: '1px', // or without the units... this is the borderwidth of the line that separates the tabs
 * fontName: 'Arial', // The font name
 * fontSize: '14px', //The font size
 * iconSize: '16px', // The height of the tab icons, where used
 * sizeUnits: CssSizeUnits.PX, //The size units to be used for the font and the border radius; e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * fontStyle: FontStyle.BOLD // e.g bold or italic or italic bold or 
 * tabItems: [{value: 'Settings', 'type': 'text'}, {value: 'Issues', 'type': 'text'}, {value: 'wallet.jpg', 'type': 'image'}],
 * onTabChanged: function(newIndex , oldIndex){}
 * }
 * @returns {TabbedBar}
 */
function TabbedBar(options) {

    if (!options) {
        throw new Error("Can't build TabbedBar without options!");
    }

    if (typeof options === 'object') {
        if (options.tabId) {
            if (typeof options.tabId === "string") {
                this.tabId = options.tabId;
            } else {
                throw new Error("Can't build TabbedBar without specifying the `tabId` as a string value!");
            }
        } else {
            throw new Error("Can't build TabbedBar without specifying the `tabId`!");
        }

        if (options.selectedBg) {
            if (typeof options.selectedBg === "string") {
                this.selectedBg = options.selectedBg;
            } else {
                this.selectedBg = "midnightblue";
            }
        } else {
            this.selectedBg = "midnightblue";
        }

        if (options.deselectedBg) {
            if (typeof options.deselectedBg === "string") {
                this.deselectedBg = options.deselectedBg;
            } else {
                this.deselectedBg = "darkgray";
            }
        } else {
            this.deselectedBg = "darkgray";
        }

        if (options.selectedFg) {
            if (typeof options.selectedFg === "string") {
                this.selectedFg = options.selectedFg;
            } else {
                this.selectedFg = "white";
            }
        } else {
            this.selectedFg = "white";
        }

        if (options.deselectedFg) {
            if (typeof options.deselectedFg === "string") {
                this.deselectedFg = options.deselectedFg;
            } else {
                this.deselectedFg = "pink";
            }
        } else {
            this.deselectedFg = "pink";
        }

        if (options.tabEdgeColor) {
            if (typeof options.tabEdgeColor === "string") {
                this.tabEdgeColor = options.tabEdgeColor;
            } else {
                this.tabEdgeColor = "lightgray";
            }
        } else {
            this.tabEdgeColor = "lightgray";
        }

        if (options.tabEdgeWidth) {
            if (typeof options.tabEdgeWidth === "string") {
                let value = parseInt(options.tabEdgeWidth);
                if (isNumber(value)) {
                    this.tabEdgeWidth = value;
                } else {
                    throw new Error("Invalid value specified for the tabEdgeWidth");
                }
            } else if (typeof options.tabEdgeWidth === 'number') {
                if (options.tabEdgeWidth < 0) {
                    throw new Error("tabEdgeWidth cannot be negative");
                } else {
                    this.tabEdgeWidth = tabEdgeWidth;
                }
            } else {
                this.tabEdgeWidth = 1;
            }
        } else {
            this.tabEdgeWidth = 1;
        }

        if (options.borderRadius) {
            if (typeof options.borderRadius === "string") {
                let value = parseInt(options.borderRadius);
                if (isNumber(value)) {
                    this.borderRadius = value;
                } else {
                    throw new Error("Invalid value specified for the borderRadius");
                }
            } else if (typeof options.borderRadius === 'number') {
                if (options.borderRadius < 0) {
                    throw new Error("borderRadius cannot be negative");
                } else {
                    this.borderRadius = borderRadius;
                }
            } else {
                this.borderRadius = 8;
            }
        } else {
            this.borderRadius = 8;
        }

        if (options.tabItems) {
            if (isOneDimArray(options.tabItems)) {
                for (let i = 0; i < options.tabItems.length; i++) {
                    let item = options.tabItems[i];
                    let keys = Object.keys(item);
                    if (keys.length !== 2) {
                        throw new Error("Invalid item found in index " + i);
                    }
                    for (let ind = 0; ind < keys.length; ind++) {
                        if (keys[ind] !== 'value' && keys[ind] !== 'type') {
                            throw new Error('Bad item found!!! @ index: ' + i);
                        }
                    }
                }
                this.tabItems = options.tabItems;

            } else {
                throw new Error("Invalid tab items");
            }
        } else {
            throw new Error("You must specify the data for the tab items");
        }

        if (typeof options.sizeUnits === 'string') {
            this.sizeUnits = options.sizeUnits;
        } else {
            this.sizeUnits = CssSizeUnits.PX;
        }

        if (typeof options.iconSize === 'number') {
            this.iconSize = options.iconSize;
        } else {
            this.iconSize = 16;
        }


        if (options.iconSize) {
            if (typeof options.iconSize === "string") {
                let value = parseInt(options.iconSize);
                if (isNumber(value)) {
                    this.iconSize = value;
                } else {
                    throw new Error("Invalid value specified for the iconSize");
                }
            } else if (typeof options.iconSize === 'number') {
                if (options.iconSize < 0) {
                    throw new Error("iconSize cannot be negative");
                } else {
                    this.iconSize = iconSize;
                }
            } else {
                this.iconSize = 16;
            }
        } else {
            this.iconSize = 16;
        }
        if (typeof options.fontName === 'string') {
            this.fontName = options.fontName;
        } else {
            this.fontName = "Segoe UI";
        }

        if (typeof options.fontSize === 'number') {
            this.fontSize = options.fontSize;
        } else {
            this.fontSize = 15;//15px
        }

        if (typeof options.fontStyle === 'string') {
            this.fontStyle = options.fontStyle;
        } else {
            this.fontStyle = FontStyle.REGULAR;//15px
        }

        if (options.onTabChanged) {
            if (typeof options.onTabChanged === 'function') {
                if (options.onTabChanged.length === 2) {
                    this.onTabChanged = options.onTabChanged;
                } else {
                    throw new Error('The onTabChanged must have 2 arguments... the oldtab index and the new tab index');
                }
            } else {
                throw new Error('The onTabChanged must be defined as a function');
            }
        } else {

        }


        let canvas = document.getElementById(this.tabId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Please supply the id of a valid canvas");
        }

        this.g = new Graphics(canvas);

        this.font = new Font(this.fontStyle, this.fontSize, this.fontName, this.sizeUnits);
        this.g.setFont(this.font);
        this.selectedIndex = 0;
        this.hoverIndex = -1;




        let tabView = this;


        canvas.addEventListener('mouseover', function (e) {
            canvas.style.cursor = 'pointer';
            let pos = tabView.getMousePos(e);
            let x = pos.x;
            let tabCount = tabView.tabItems.length;
            let tabWidth = parseInt((1.0 * tabView.g.width) / (1.0 * tabCount));
            let rawIdx = (x * 1.0) / (tabWidth * 1.0);
            tabView.hoverIndex = parseInt(rawIdx);
          //  console.log('mouseover: x: ', x,', index: ', tabView.hoverIndex);
            tabView.g.clear();
            tabView.render();

        });

        canvas.addEventListener('mouseout', function (e) {
            canvas.style.cursor = 'auto';
            tabView.g.clear();
            tabView.render();
            tabView.hoverIndex = -1;

        });
        
       canvas.addEventListener('mousemove', function (e) {
           let hoverIdx = tabView.hoverIndex;
            canvas.style.cursor = 'pointer';
            
            let pos = tabView.getMousePos(e);
            let x = pos.x;
            let tabCount = tabView.tabItems.length;
            let tabWidth = parseInt((1.0 * tabView.g.width) / (1.0 * tabCount));
            let rawIdx = (x * 1.0) / (tabWidth * 1.0);
            
            tabView.hoverIndex = parseInt(rawIdx);
            if(tabView.hoverIndex !== hoverIdx){
              tabView.g.clear();
              tabView.render(); 
              // console.log('mousemove: hoverIndex changed... x: ', x,', index: ', tabView.hoverIndex,", old hover index: ", hoverIdx);
            }
         
            
            
        });

        canvas.addEventListener('click', function (e) {
            let pos = tabView.getMousePos(e);
            let x = pos.x;
            let tabCount = tabView.tabItems.length;
            let tabWidth = parseInt((1.0 * tabView.g.width) / (1.0 * tabCount));
            let rawIdx = (x * 1.0) / (tabWidth * 1.0);
            let index = parseInt(rawIdx);
            let oldIdx = tabView.selectedIndex;
            tabView.selectedIndex = index;
            //console.log('mouseclick: x: ', x,', selectedindex: ', tabView.selectedIndex,', oldindex: ', oldIdx);
            tabView.g.clear();
            tabView.render();
            if(index !== oldIdx){
               tabView.onTabChanged(index, oldIdx);
            }
        });

        this.images = {};
        this.loadImages();


    } else {
        throw new Error("Invalid options specified. Can't create TabbedBar");
    }

}

TabbedBar.prototype.getMousePos = function (e) {
    let canvas = this.g.getCanvas();
    let rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
};
/**
 * 
 * @returns {undefined}If there are any images among the tabItems, this method loads it.
 */
TabbedBar.prototype.loadImages = function () {

    let self = this;

    let fun = function (index) {
        let item = self.tabItems[index];
        if (item.type === 'image') {
            let image = new Image();
            image.src = getImagePath(item.value);
            image.onload = function (e) {
                image.aspect = image.width / image.height;
                self.images[item.value] = image;
                if (index + 1 < self.tabItems.length) {
                    fun(index + 1);
                } else {
                    self.render();
                }
            };
            image.onerror = function (e) {
                throw new Error("Couldn't load the image!");
            };
        } else {
            if (index + 1 < self.tabItems.length) {
                fun(index + 1);
            } else {
                self.render();
            }
        }
    };
    fun(0);

};


TabbedBar.prototype.render = function () {

    let g = this.g;

    let w = g.width;
    let h = g.height;
    let rad = this.borderRadius;
    g.setBackground(darkenColor(this.deselectedBg , 0.2));
    g.fillRoundRect(0, 0, w, h, rad);
    let tabCount = this.tabItems.length;
    let tabWidth = parseInt((w * 1.0) / (tabCount * 1.0));

    g.setFont(this.font);
    let minPadding = 8;

    if (this.iconSize >= h) {
        this.iconSize = h - 2 * minPadding;
    }

    let hoverBg = brightenColor(this.deselectedBg, 0.2);
    let hoverColor = darkenColor(this.deselectedFg, 0.6);

    let iconSize = this.iconSize; // use as the icon height, since there is less space for the tab height than for the tab width.

    let strokeWidth = g.getStrokeWidth();
    let horAdvance = 0;
    for (let i = 0; i < tabCount; i++) {
        let item = this.tabItems[i];
        let isImage = item.type === 'image';
        horAdvance = (i+1) * tabWidth;
        g.setBackground(this.selectedIndex === i ? this.selectedBg : (this.hoverIndex === i ? hoverBg : this.deselectedBg));
        if (i === 0) {
            g.fillRoundRectLeftSide(0, 0, tabWidth, h, rad);
            g.setColor(this.tabEdgeColor);
            g.setStrokeWidth(this.tabEdgeWidth);
            g.drawLine(horAdvance, 0, horAdvance, h);
        } else if (i === tabCount - 1) {
            g.fillRoundRectRightSide(horAdvance - tabWidth, 0, tabWidth, h, rad);
        } else {
            g.fillRect(horAdvance - tabWidth, 0, tabWidth, h);
            g.setColor(this.tabEdgeColor);
            g.setStrokeWidth(this.tabEdgeWidth);
            g.drawLine(horAdvance, 0, horAdvance, h);
        }

        if (!isImage) {
            let lines = g.getLinesByMaxWidthAlgorithm(item.value, tabWidth - 2 * minPadding);
            let text = lines.length > 1 ? lines[0].text + ".." : lines[0].text;
            let width = lines[0].width;

            let textHeight = g.getTextHeight(text);
            let tabLeft = (horAdvance - tabWidth);
            let x = tabLeft + (tabWidth - width) / 2;
            g.setBackground(this.selectedIndex === i ? this.selectedFg : (this.hoverIndex === i ? hoverColor : this.deselectedFg));
            g.drawString(text, x, ((h - textHeight) * 0.5 + textHeight));
        } else {
            let icon = this.images[item.value];
            let asp = icon.aspect;
            let iconWid = asp === 1 ? iconSize : asp * iconSize;
            let tabLeft = (horAdvance - tabWidth);
            let x = tabLeft + (tabWidth - iconWid) / 2;
            g.drawImageAtLocWithSize(icon, x, (h - iconSize) / 2, iconWid, iconSize);
        }
    }

    g.setStrokeWidth(strokeWidth);








};