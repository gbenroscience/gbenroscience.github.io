/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global FontStyle, CssSizeUnits */



/**
 * 
 * There is a problem with the corner rounding algorithm, so set values for the border radius that will not cause visual distortion.
 * 
 * @param {Object} options If supplied, no other args should be passed to this constructor.
 * @param {string} canvasId
 * @param {string} text
 * @param {string} src
 * @param {Gravity} gravity One of Gravity.LEFT or Gravity.RIGHT or Gravity.CENTER 
 * @param {string} fontName The font name
 * @param {Number} fontSize The font size
 * @param {Number} sizeUnits The size units to be used for the font and the border radius; e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {string} fontStyle e.g bold or italic or italic bold or 
 * @param {string} buttonColor The button's background color - An hexadecimal value, e.g. #00FF22
 * @param {string} buttonColorHover The button's background color when hovered - An hexadecimal value, e.g. #00FF22
 * @param {string} textColor The button's font color - An hexadecimal value, e.g. #00FF22
 * @param {string} textColorHover The button's font color when hovered - An hexadecimal value, e.g. #00FF22
 * @param {string} borderColor An hexadecimal value, e.g. #00FF22
 * @param {Number} borderRadius The border radius... the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {Number} borderThickness The border thickness... the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {Number} iconPadding The padding used for the icon... the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {Number} iconTextGap The distance between the icon and the text... This works only with Gravity.CENTER. It is used to control the distance between the text and the icon. 
 * The units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {Number} iconSize The size of the icon: the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {Function} onclick Function called when the button is clicked
 * @returns {IconButton}
 */
function IconButton(options, canvasId, text, src, gravity, fontName, fontSize, sizeUnits, fontStyle, buttonColor, buttonColorHover, textColor, textColorHover, borderColor, borderRadius, borderThickness, iconPadding, iconTextGap, iconSize, onclick) {
    var canvas = null;
    if (options && typeof options === 'object') {
        if (options.canvasId && typeof options.canvasId === 'string') {
            canvas = document.getElementById(options.canvasId);
            if (canvas && canvas instanceof HTMLCanvasElement) {
                this.canvas = canvas;
            }
        } else {
            throw new Error("Please supply the id of a valid canvas");
        }
        if (typeof options.text === 'string') {
            this.text = options.text;
        } else {
            this.text = 'BUTTON';
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


        if (typeof options.borderColor === 'string') {
            this.borderColor = options.borderColor;
        } else {
            this.borderColor = "#AAA";
        }
        if (typeof options.borderRadius === 'number') {
            this.borderRadius = options.borderRadius;
        } else {
            this.borderRadius = 2;
        }
        if (typeof options.borderThickness === 'number') {
            this.borderThickness = options.borderThickness;
        } else {
            this.borderThickness = 0;
        }
        if (typeof options.buttonColor === 'string') {
            this.buttonColor = options.buttonColor;
        } else {
            this.buttonColor = "#DDDDDD";
        }
        if (typeof options.buttonColorHover === 'string') {
            this.buttonColorHover = options.buttonColorHover;
        } else {
            this.buttonColorHover = "#FFFFFF";
        }
        if (typeof options.textColor === 'string') {
            this.textColor = options.textColor;
        } else {
            this.textColor = "#000000";
        }
        if (typeof options.textColorHover === 'string') {
            this.textColorHover = options.textColorHover;
        } else {
            this.textColorHover = "#ff0000";
        }
        if (typeof options.iconPadding === 'number') {
            this.iconPadding = options.iconPadding;
        } else {
            this.iconPadding = 4;
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



    } else {

        if (canvasId && typeof canvasId === 'string') {
            canvas = document.getElementById(canvasId);
            if (canvas && canvas instanceof HTMLCanvasElement) {
                this.canvas = canvas;
            }
        } else {
            throw new Error("Please supply the id of a valid canvas");
        }
        if (typeof text === 'string') {
            this.text = text;
        } else {
            this.text = 'BUTTON';
            throw new Error("The button text should be a string");
        }

        if (typeof src === 'string') {
            this.src = src;
        } else {
            this.src = "";
        }

        if (typeof gravity === 'string') {
            this.gravity = gravity;
        } else {
            if (this.src === "") {
                this.gravity = Gravity.CENTER;
            }
        }

        if (typeof sizeUnits === 'string') {
            this.sizeUnits = sizeUnits;
        } else {
            this.sizeUnits = CssSizeUnits.PX;
        }

        if (typeof fontName === 'string') {
            this.fontName = fontName;
        } else {
            this.fontName = "Segoe UI";
        }

        if (typeof fontSize === 'number') {
            this.fontSize = fontSize;
        } else {
            this.fontSize = 13;//13px
        }

        if (typeof fontStyle === 'string') {
            this.fontStyle = fontStyle;
        } else {
            this.fontStyle = FontStyle.REGULAR;
        }


        if (typeof borderColor === 'string') {
            this.borderColor = borderColor;
        } else {
            this.borderColor = "#AAA";
        }
        if (typeof borderRadius === 'number') {
            this.borderRadius = borderRadius;
        } else {
            this.borderRadius = 2;
        }
        if (typeof borderThickness === 'number') {
            this.borderThickness = borderThickness;
        } else {
            this.borderThickness = 0;
        }
        if (typeof buttonColor === 'string') {
            this.buttonColor = buttonColor;
        } else {
            this.buttonColor = "#DDDDDD";
        }
        if (typeof buttonColorHover === 'string') {
            this.buttonColorHover = buttonColorHover;
        } else {
            this.buttonColorHover = "#FFFFFF";
        }
        if (typeof textColor === 'string') {
            this.textColor = textColor;
        } else {
            this.textColor = "#000000";
        }
        if (typeof textColorHover === 'string') {
            this.textColorHover = textColorHover;
        } else {
            this.textColorHover = "#ff0000";
        }
        if (typeof iconPadding === 'number') {
            this.iconPadding = iconPadding;
        } else {
            this.iconPadding = 4;
        }
        if (typeof iconTextGap === 'number') {
            this.iconTextGap = iconTextGap;
        } else {
            this.iconTextGap = 4;
        }
        if (typeof iconSize === 'number') {
            this.iconSize = iconSize;
        } else {
            this.iconSize = 16;
        }
        if (typeof onclick === 'function') {
            this.onclick = onclick;
        } else {
            if (!onclick) {
                this.onclick = function () {};
            } else {
                throw new Error("The `onclick parameter must be a function");
            }

        }

    }// end else





    this.g = new Graphics(canvas);

    this.font = new Font(this.fontStyle, this.fontSize, this.fontName, this.sizeUnits);
    this.g.setFont(this.font);
    this.pressed = false;
    this.hovering = false;

    this.width = canvas.width;
    this.height = canvas.height;


    this.icon = new Image(this.iconSize, this.iconSize);
    var btn = this;
    this.icon.onload = function () {
        btn.render();
    };

    this.icon.onerror = function () {
        btn.render();
    };

    this.icon.src = this.src;

    canvas.addEventListener('mouseover', function (e) {
        canvas.style.cursor = 'pointer';
        btn.g.clear();
        btn.hovering = true;
        btn.render();

    });

    canvas.addEventListener('mouseout', function (e) {
        canvas.style.cursor = 'auto';
        if (btn.pressed === true) {
            btn.g.clear();
            btn.hovering = false;
            btn.pressed = false;
            btn.render();
        } else {
            btn.g.clear();
            btn.hovering = false;
            btn.render();
        }

    });

    canvas.addEventListener('mouseup', function (e) {
        btn.g.clear();
        btn.pressed = false;
        btn.render();
        btn.onclick();
    });

    canvas.addEventListener('mousedown', function (e) {
        btn.g.clear();
        btn.pressed = true;
        btn.render();
    });

}

/**
 *
 * @param duration The click duration in milliseconds
 */
IconButton.prototype.performClick = function (duration) {


    if(typeof duration !== 'number'){
        throw new Error("Please supply a number for the duration in milliseconds");
    }

    if(typeof duration === 'undefined'){
        duration = 200;
    }

    var btn = this;
    var press = function () {
        btn.g.clear();
        btn.pressed = true;
        btn.render();
    };

    var release = function () {
        btn.g.clear();
        btn.pressed = false;
        btn.render();
        btn.onclick();
    };
    press();

    setTimeout(release , duration);


};


IconButton.prototype.render = function () {


    var g = this.g;
    var w = this.width;
    var h = this.height;
    var backgroundColor = this.buttonColor;
    var backgroundColorHover = this.buttonColorHover;
    var textColor = this.textColor;
    var textColorHover = this.textColorHover;
    var borderColor = this.borderColor;
    var borderThickness = this.borderThickness;
    var borderRadius = this.borderRadius;
    var font = this.font;
    var hovering = this.hovering;
    var pressed = this.pressed;
    var gravity = this.gravity;
    var txt = this.text;
    var icon = this.icon;
    var iconPadding = this.iconPadding;
    var iconTextGap = this.iconTextGap;
    var iconSize = this.iconSize;

 


    const fontShrinker = 1;
    //PAINT THE BG OVER:

    g.setBackground(pressed || hovering ? backgroundColorHover : backgroundColor);
    g.fillRoundRect(0, 0, w, h, borderRadius);

    if (pressed === true) {
        g.setBackground(backgroundColorHover);
        g.fillRoundRect(0, 0, w, h, borderRadius - 2);
        font.size -= fontShrinker;
        g.setFont(font);
    } else {
        if (borderThickness > 0) {
            var strokeWidth = g.getStrokeWidth();
            g.setColor(borderColor);
            g.setStrokeWidth(borderThickness);
            g.drawRoundRect(borderThickness / 2, borderThickness / 2, w - borderThickness, h - borderThickness, borderRadius);
            g.setStrokeWidth(strokeWidth);
        }
        if (hovering) {
            font.size += fontShrinker;
            g.setBackground(backgroundColorHover);
            g.fillRoundRect(borderThickness, borderThickness, w - 2 * borderThickness, h - 2 * borderThickness, borderRadius);
        } else {
            font.size -= fontShrinker;
            g.setBackground(backgroundColor);
            g.fillRoundRect(borderThickness, borderThickness, w - 2 * borderThickness, h - 2 * borderThickness, borderRadius);
        }
        g.setFont(font);
    }

    g.setBackground(hovering === true ? textColorHover : textColor);

    var textHeight = g.textHeight(txt);
    var textWidth = g.stringWidth(txt);
    var textXLoc = (0.5 * (w - textWidth));
    g.drawString(txt, textXLoc, ((h - textHeight) * 0.5 + textHeight));
    switch (gravity) {

        case Gravity.LEFT:
            g.drawImageAtLocWithSize(icon, iconPadding, (h - icon.height) / 2, iconSize, iconSize);
            break;
        case Gravity.RIGHT:
            g.drawImageAtLocWithSize(icon, w - iconPadding - iconSize, (h - icon.height) / 2, iconSize, iconSize);
            break;
        case Gravity.CENTER:
            g.drawImageAtLocWithSize(icon, textXLoc - iconTextGap - iconSize, (h - icon.height) / 2, iconSize, iconSize);
            break;
        default:
//default is left..
            g.drawImageAtLocWithSize(icon, iconPadding, (h - icon.height) / 2, iconSize, iconSize);
            break;
    }




};