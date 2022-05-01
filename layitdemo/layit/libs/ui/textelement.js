/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global FontStyle, CssSizeUnits, Gravity, DRAG_STATE */



/**
 * 
 * The text is always positioned relative to the left side of the label.
 * 
 * @param {Object} options If supplied, no other args should be passed to this constructor.
 {
 id: 'html_id_of_canvas',
 text: 'text to show on label',
 gravity: Gravity.LEFT, //One of Gravity.LEFT or Gravity.RIGHT or Gravity.CENTER... determines the placement of the icon. The text is always positioned relative to the left side of the label.
 fontName: 'Arial', //The font name
 fontSize: 16, //The font size.. no units
 sizeUnits: CssSizeUnits.PX, //The size units to be used for the font and the border radius; e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 fontStyle: FontStyle.REGULAR, //e.g bold or italic or italic bold...
 backgroundColor: 'transparent', //The label's background color - An hexadecimal value, e.g. #00FF22
 backgroundColorHover: 'whitesmoke', //The label's background color when the widget is moused over - An hexadecimal value, e.g. #00FF22
 textColor: 'black', //The label's font color - An hexadecimal value, e.g. #00FF22
 textColorHover: 'red', //The label's font color when the widget is moused over- An hexadecimal value, e.g. #00FF22
 borderRadius: 4, //... the units are same as the units for the font  e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 padding: 4,   // The padding used for the text:
 lineSpacing: 8, // the distance between lines of text(in pixels)
 scrollbar:{
 theme: gray,
 width: 16,
 height: 60
 }
 } 
 * @returns {TextElement}
 */
function TextElement(options) {
    let canvas = null;
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
            this.text = 'BUTTON';
        }

        if (typeof options.gravity === 'string') {
            this.gravity = options.gravity;
        } else {
            this.gravity = Gravity.LEFT;
        }

        if (typeof options.sizeUnits === 'string') {
            this.sizeUnits = options.sizeUnits;
        } else {
            this.sizeUnits = CssSizeUnits.PX;
        }

        if (typeof options.lineSpacing === 'number') {
            this.lineSpacing = options.lineSpacing;
        } else if (typeof options.lineSpacing === 'string') {
            this.lineSpacing = parseInt(options.lineSpacing);
        } else {
            this.lineSpacing = 8;
        }

        if (typeof options.fontName === 'string') {
            this.fontName = options.fontName;
        } else {
            this.fontName = "Segoe UI";
        }

        if (typeof options.fontSize === 'number') {
            this.fontSize = options.fontSize;
        } else if (typeof options.fontSize === 'string') {
            this.fontSize = parseInt(options.fontSize);
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
        } else if (typeof options.borderRadius === 'string') {
            this.borderRadius = parseInt(options.borderRadius);
        } else {
            this.borderRadius = 2;
        }

        if (typeof options.backgroundColor === 'string') {
            this.backgroundColor = options.backgroundColor;
        } else {
            this.backgroundColor = "#DDDDDD";
        }
        if (typeof options.backgroundColorHover === 'string') {
            this.backgroundColorHover = options.backgroundColorHover;
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
        this.wrapHeight = 0;



        let label = this;


        let trackWidth, barHeight, scrollTheme;
        if (options.scrollbar && typeof options.scrollbar === 'object') {
            if (options.scrollbar.width) {
                if (typeof options.scrollbar.width === 'number') {
                    trackWidth = options.scrollbar.width;
                } else if (typeof options.scrollbar.width === 'string') {
                    trackWidth = parseInt(options.scrollbar.width);
                }
            } else {
                trackWidth = 12;
            }
            if (options.scrollbar.height) {
                if (typeof options.scrollbar.height === 'number') {
                    barHeight = options.scrollbar.height;
                } else if (typeof options.scrollbar.height === 'string') {
                    barHeight = parseInt(options.scrollbar.height);
                }
            } else {
                barHeight = this.g.height < 60 ? this.g.height / 2 : 60;
            }
            if (typeof options.scrollbar.theme === 'string') {
                scrollTheme = options.scrollbar.theme;
            } else {
                scrollTheme = "#999";
            }
        } else {
            trackWidth = 12;
            barHeight = this.g.height < 60 ? this.g.height / 2 : 60;
            scrollTheme = "#999";
        }

        this.scrollBar = {
            x: function () {
                return label.g.width - this.trackWidth +
                        (this.trackWidth - this.barWidth) / 2;
            }, //center scrollbar in track
            trackWidth: trackWidth,
            scrollY: 0,
            barWidth: trackWidth - 2,
            barHeight: barHeight,
            scrollTheme: scrollTheme,
            drawScrollBar: function (g) {
                let w = label.g.width;
                let h = label.g.height;
                let trackWidth = this.trackWidth;
                let scrollBarWidth = this.barWidth;
                let scrollBarHeight = this.barHeight;
                drawTrack:{
                    g.setBackground(this.scrollTheme);
                    g.fillRoundRect(w - trackWidth, 0, trackWidth, h, 7);
                }
                g.setBackground(darkenColor(this.scrollTheme, 0.4));
                let x = this.x();
                let y = this.scrollY;//variable...denotes scrollbar position
                g.fillRoundRect(x, y, scrollBarWidth, scrollBarHeight, 6);
            },
            contains: function (e) {
                let pos = label.getMousePos(e);
                let x = pos.x + 4;
                let y = pos.y;
                return (x >= this.x() && x <= this.x() + this.barWidth && y >= this.scrollY && y <= this.scrollY + this.barHeight);
            },
            rect: function () {
                return {left: this.x(), top: this.scrollY, right: this.x() + this.barWidth, bottom: this.scrollY + this.barHeight};
            }
        };







        canvas.addEventListener('mouseover', function (e) {
            label.g.clear();
            label.hovering = true;
            label.render();

        });

        canvas.addEventListener('mouseout', function (e) {
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

        let oldPos = null;
        canvas.addEventListener('mouseup', function (e) {
            if (dragged === DRAG_STATE.DRAGGING) {
                dragged = DRAG_STATE.NO_DRAG;
            }
            label.g.clear();
            label.selected = false;
            label.render();
            label.onclick();
        });


        let dragged = DRAG_STATE.NO_DRAG;
        canvas.addEventListener('mousedown', function (e) {
            if (label.scrollBar.contains(e)) {
                dragged = DRAG_STATE.READY;
                oldPos = label.getMousePos(e);
            }
            label.g.clear();
            label.selected = true;
            label.render();
        });
        canvas.addEventListener('mousemove', function (e) {
            if (dragged === DRAG_STATE.READY) {
                dragged = DRAG_STATE.DRAGGING;
            }

            if (dragged === DRAG_STATE.DRAGGING) {
                let pos = label.getMousePos(e);
                let dy = pos.y - oldPos.y;
                label.scrollBar.scrollY += dy;
                if (label.scrollBar.scrollY <= 0) {
                    label.scrollBar.scrollY = 0;
                }
                if (label.scrollBar.rect().bottom > label.g.height) {
                    label.scrollBar.scrollY = label.g.height - label.scrollBar.barHeight;
                }
                oldPos = pos;
                label.g.clear();
                label.render();
            }


        });
        this.render();
    } else {
        throw new Error('Invalid parameters for ' + this.constructor.name);
    }
}

TextElement.prototype.getWrapHeight = function () {
    return this.wrapHeight;
};

TextElement.prototype.getMousePos = function (e) {
    let canvas = this.g.getCanvas();
    let rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
};

TextElement.prototype.render = function () {

    let g = this.g;
    let w = g.width;
    let h = g.height;
    let backgroundColor = this.backgroundColor;
    let backgroundColorHover = this.backgroundColorHover;
    let textColor = this.textColor;
    let textColorHover = this.textColorHover;
    let borderRadius = this.borderRadius;
    let font = this.font;
    let gravity = this.gravity;
    let txt = this.text;
    let padding = this.padding;
    let hovering = this.hovering;
    let lineSpacing = this.lineSpacing;




    //PAINT THE BG OVER:

    g.setBackground(hovering && backgroundColorHover ? backgroundColorHover : backgroundColor);
    g.fillRoundRect(0, 0, w, h, borderRadius);

    g.setFont(font);
    g.setBackground(hovering && textColorHover ? textColorHover : textColor);


    let availableWidth = w - 2 * padding - this.scrollBar.trackWidth;

    let lines = g.getLinesByMaxWidthAlgorithm(txt, availableWidth);

let lineCount = lines.length;
    if (lineCount > 0) {
        let textHeight = g.textHeight(txt);
        let maxDistMovableByScrollBar = h - this.scrollBar.barHeight;
        let maxDistMovedByText = ((textHeight + lineSpacing) * lineCount + lineSpacing) - h - 2 * padding;
        let scale = (maxDistMovedByText / maxDistMovableByScrollBar);
        let y = padding + textHeight - scale * this.scrollBar.scrollY;

        for (let i = 0; i < lineCount; i++) {
            let l = lines[i];
            switch (gravity) {
                case Gravity.LEFT:
                    g.drawString(l.text, padding, y);
                    break;
                case Gravity.RIGHT:
                    g.drawString(l.text, w - padding - l.width, y);
                    break;
                case Gravity.CENTER:
                    g.drawString(l.text, (w - padding - l.width) / 2, y);
                    break;
                default:
//default is left..
                    break;
            }
            y += (textHeight + lineSpacing);
            if (y > h - padding) {
                break;
            }
        }

        if (maxDistMovedByText > 0) {
            this.scrollBar.drawScrollBar(g);
        }
        
        this.wrapHeight = (2 * padding) + (textHeight * lineCount) + (lineSpacing * lineCount);
    }






};