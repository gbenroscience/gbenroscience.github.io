/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global FontStyle, CssSizeUnits, Gravity */



/**
 * 
 * The text is always positioned relative to the left side of the label.
 * 
 * @param {Object} options If supplied, no other args should be passed to this constructor.
 {
 id: 'html_id_of_canvas',
 text: 'text to show on label',
 src: 'path-to-image icon',
 gravity: Gravity.LEFT, //One of Gravity.LEFT or Gravity.RIGHT or Gravity.CENTER... determines the placement of the icon. The text is always positioned relative to the left side of the label.
 fontName: 'Arial', //The font name
 fontSize: 16, //The font size.. no units
 sizeUnits: CssSizeUnits.PX, //The size units to be used for the font and the border radius; e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 fontStyle: FontStyle.REGULAR, //e.g bold or italic or italic bold...
 labelColor: 'transparent', //The label's background color - An hexadecimal value, e.g. #00FF22
 labelColorHover: 'whitesmoke', //The label's background color when the widget is moused over - An hexadecimal value, e.g. #00FF22
 textColor: 'black', //The label's font color - An hexadecimal value, e.g. #00FF22
 textColorHover: 'red', //The label's font color when the widget is moused over- An hexadecimal value, e.g. #00FF22
 borderRadius: 4, //... the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 padding: 4,   // The padding used for the text:
 // When gravity is LEFT, padding is the distance between the icon and the left side of the label. To specify a gap between the icon and the text, use iconTextGap.
 // When gravity is RIGHT, padding is the distance between the icon and the right side of the label. It is also the distance between the text and the left side of the label
 // When gravity is CENTER, padding is the distance between the text and the left side of the label. The units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 iconTextGap: 4, // The distance between the icon and the text... This works only with Gravity.LEFT. It is used to control the distance between the text and the icon.
 // The units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 iconSize: 24,  // The size of the icon: the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 onclick: function(e){} Function called when the button is clicked
 } 
 * @returns {IconButton}
 */
function IconLabel(options) {
    var canvas = null;
    if (options && typeof options === 'object') {
        if (options.id && typeof options.id === 'string') {
            canvas = document.getElementById(options.id);
            if (canvas && canvas instanceof HTMLCanvasElement) {
                this.canvas = canvas;
            }
        } else {
            throw new Error("Please supply the id of a valid canvas");
        }
        if (typeof options.text === 'string') {
            this.text = options.text;
        } else {
            this.text = 'LABEL';
        }

        if (typeof options.src === 'string') {
            this.src = options.src;
        } else {
            this.src = "";
        }

        if (typeof options.gravity === 'string') {
            this.gravity = options.gravity;
        } else {
            if (this.src === "") {
                this.gravity = Gravity.CENTER;
            }
        }

        if (typeof options.sizeUnits === 'string') {
            this.sizeUnits = options.sizeUnits;
        } else {
            this.sizeUnits = CssSizeUnits.PX;
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



        if (typeof options.borderRadius === 'number') {
            this.borderRadius = options.borderRadius;
        } else {
            this.borderRadius = 2;
        }

        if (typeof options.labelColor === 'string') {
            this.labelColor = options.labelColor;
        } else {
            this.labelColor = "#DDDDDD";
        }
        if (typeof options.labelColorHover === 'string') {
            this.labelColorHover = options.labelColorHover;
        }
        if (typeof options.textColor === 'string') {
            this.textColor = options.textColor;
        } else {
            this.textColor = "#000000";
        }

        if (typeof options.textColorHover === 'string') {
            this.textColorHover = options.textColorHover;
        }
        if (typeof options.padding === 'number') {
            this.padding = options.padding;
        } else {
            this.padding = 4;
        }
        if (typeof options.iconTextGap === 'number') {
            this.iconTextGap = options.iconTextGap;
        } else {
            this.iconTextGap = 4;
        }
        if (typeof options.iconSize === 'number') {
            this.iconSize = options.iconSize;
        } else {
            this.iconSize = 16;
        }
        if (typeof options.onclick === 'function') {
            this.onclick = options.onclick;
        } else {
            if (!options.onclick) {
                this.onclick = function () {};
            } else {
                throw new Error("The `onclick parameter must be a function");
            }
        }



        this.g = new Graphics(canvas);

        this.font = new Font(this.fontStyle, this.fontSize, this.fontName, this.sizeUnits);
        this.g.setFont(this.font);

        this.pressed = false;
        this.hovering = false;

        this.width = canvas.width;
        this.height = canvas.height;


        this.icon = new Image(this.iconSize, this.iconSize);
        var label = this;
        this.icon.onload = function () {
            label.render();
        };

        this.icon.onerror = function () {
            label.render();
        };

        this.icon.src = this.src;


        canvas.addEventListener('mouseover', function (e) {
            canvas.style.cursor = 'pointer';
            label.g.clear();
            label.hovering = true;
            label.render();

        });

        canvas.addEventListener('mouseout', function (e) {
            canvas.style.cursor = 'auto';
            if (label.selected === true) {
                label.g.clear();
                label.hovering = false;
                label.selected = false;
                label.render();
            } else {
                label.g.clear();
                label.hovering = false;
                label.render();
            }

        });

        canvas.addEventListener('mouseup', function (e) {
            label.g.clear();
            label.selected = false;
            label.render();
            label.onclick();
        });

        canvas.addEventListener('mousedown', function (e) {
            label.g.clear();
            label.selected = true;
            label.render();
        });

    } else {
        throw new Error('Invalid parameters for IconLabel');
    }
}

IconLabel.prototype.size = function () {
    return this.g.getTextSize(this.text);
};

IconLabel.prototype.render = function () {

    var g = this.g;
    var w = this.width;
    var h = this.height;
    var backgroundColor = this.labelColor;
    var backgroundColorHover = typeof this.labelColorHover === 'undefined' ? darkenColor(backgroundColor, 0.1) : this.labelColorHover;
    var textColor = this.textColor;
    var textColorHover = typeof this.textColorHover === 'undefined' ? darkenColor(textColor, 0.1) : this.textColorHover;
    var borderRadius = this.borderRadius;
    var font = this.font;
    var gravity = this.gravity;
    var txt = this.text;
    var icon = this.icon;
    var padding = this.padding;
    var iconTextGap = this.iconTextGap;
    var iconSize = this.iconSize;
    var hovering = this.hovering;
    var selected = this.selected;
    let hasImageMaybe = false;
    if (this.src) {
        hasImageMaybe = true;
    }

    //PAINT THE BG OVER:

    g.setBackground(hovering ? backgroundColorHover : backgroundColor);
    g.fillRoundRect(0, 0, w, h, borderRadius);

    g.setFont(font);
    g.setBackground(hovering ? textColorHover : textColor);

    var textHeight = g.textHeight(txt);
    let lineWidth = g.stringWidth(txt);
    switch (gravity) {

        case Gravity.LEFT:
            if (hasImageMaybe) {
                g.drawImageAtLocWithSize(icon, padding, (h - icon.height) / 2, iconSize, iconSize);
                g.drawString(txt, padding + iconSize + iconTextGap, ((h - textHeight) * 0.5 + textHeight));
            } else {
                g.drawString(txt, padding, ((h - textHeight) * 0.5 + textHeight));
            }

            break;
        case Gravity.RIGHT:
            if (hasImageMaybe) {
                g.drawImageAtLocWithSize(icon, w - padding - iconSize, (h - icon.height) / 2, iconSize, iconSize);
                g.drawString(txt, padding, ((h - textHeight) * 0.5 + textHeight));
            } else {
                g.drawString(txt, (w - padding - lineWidth), ((h - textHeight) * 0.5 + textHeight));
            }

            break;
        case Gravity.CENTER:
            if (hasImageMaybe) {
                g.drawImageAtLocWithSize(icon, (w - iconSize) / 2, (h - icon.height) / 2, iconSize, iconSize);
                g.drawString(txt, padding, ((h - textHeight) * 0.5 + textHeight));
            } else {
                g.drawString(txt, (w - lineWidth) / 2, ((h - textHeight) * 0.5 + textHeight));
            }

            break;
        default:
//default is left..
            g.drawImageAtLocWithSize(icon, padding, (h - icon.height) / 2, iconSize, iconSize);
            break;
    }
};