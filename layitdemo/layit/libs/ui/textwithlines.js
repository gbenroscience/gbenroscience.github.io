/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 

 
/**
 * 
 * @param {object} options If supplied, no other args should be passed to this constructor.
 * @param {string} canvasId The id of the canvas used to render this widget
 * @param {string} text The text.
 * @param {string} textColor The color of the text
 * @param {string} fontName The name of the font used for the text
 * @param {number} fontSize The size of the font used for the text
 * @param {string} sizeUnits The size units to be used for the font and other metrics; e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
 * @param {string} fontStyle e.g bold or italic or italic bold or FontStyle.REGULAR ,FontStyle.BOLD ,FontStyle.BOLD_ITALIC ,FontStyle.ITALIC ,
 * @param {number} linePadding The distance between the line and the text
 * @param {number} lineThickness The thickness of the line
 * @param {string} lineColor The color of the line
 * @param {string} labelBg The background color of the widget
 * @returns {TextWithLines}
 */
function TextWithLine(options, canvasId, text, textColor, fontName, fontSize, sizeUnits, fontStyle, linePadding, lineThickness, lineColor, labelBg) {
    var canvas = null;
    if (options && typeof options === 'object') {
        if (options.canvasId && typeof options.canvasId === 'string') {
            canvas = document.getElementById(options.canvasId);
            
        } else {
            throw new Error("Please supply the id of a valid canvas");
        }
        if (typeof options.text === 'string') {
            this.text = options.text;
        } else {
            this.text = 'BUTTON';
        }

        if (typeof options.textColor === 'string') {
            this.textColor = options.color;
        } else {
            this.textColor = "#AAA";
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
            this.fontSize = 12;//15px
        }

        if (typeof options.fontStyle === 'string') {
            this.fontStyle = options.fontStyle;
        } else {
            this.fontStyle = FontStyle.REGULAR;//15px
        }


        if (typeof options.linePadding === 'number') {
            this.linePadding = options.linePadding;
        } else {
            this.linePadding = 4;
        }
        if (typeof options.lineThickness === 'number') {
            this.lineThickness = options.lineThickness;
        } else {
            this.lineThickness = 1;
        }
      
        if (typeof options.lineColor === 'string') {
            this.lineColor = options.lineColor;
        } else {
            this.lineColor = "#900";
        }
        if (typeof options.textColor === 'string') {
            this.textColor = options.textColor;
        } else {
            this.textColor = "#000000";
        }
  if (typeof options.labelBg === 'string') {
            this.labelBg = options.labelBg;
        } else {
            this.labelBg = "#CCC";
        }



    } else {

        if (canvasId && typeof canvasId === 'string') {
            canvas = document.getElementById(canvasId);
        } else {
            throw new Error("Please supply the id of a valid canvas");
        }
       
         if (typeof text === 'string') {
            this.text = text;
        } else {
            this.text = 'LABEL';
        }

        if (typeof textColor === 'string') {
            this.textColor = color;
        } else {
            this.textColor = "#AAA";
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
            this.fontSize = 15;//15px
        }

        if (typeof fontStyle === 'string') {
            this.fontStyle = fontStyle;
        } else {
            this.fontStyle = FontStyle.REGULAR;//15px
        }


        if (typeof linePadding === 'number') {
            this.linePadding = linePadding;
        } else {
            this.linePadding = 4;
        }
        if (typeof lineThickness === 'number') {
            this.lineThickness = lineThickness;
        } else {
            this.lineThickness = 1;
        }
      
        if (typeof lineColor === 'string') {
            this.lineColor = lineColor;
        } else {
            this.lineColor = "#900";
        }
        if (typeof textColor === 'string') {
            this.textColor = textColor;
        } else {
            this.textColor = "#000000";
        }
        if (typeof labelBg === 'string') {
            this.labelBg = labelBg;
        } else {
            this.labelBg = "#CCC";
        }


    }// end else


 
 

    this.g = new Graphics(canvas);
 

 

    //Fix aspect ratio things!
//   this.fontSize = g.normalizeDimension(this.fontSize);
//    this.linePadding = g.normalizeDimension(this.linePadding);
//    this.lineThickness = g.normalizeDimension(this.lineThickness);



    this.font = new Font(this.fontStyle, this.fontSize, this.fontName, this.sizeUnits);
     

       this.render();
 
    

}

TextWithLine.prototype.changeText = function (text){
    this.text = text;
};

TextWithLine.prototype.render = function () {


var g = this.g;
g.clear();

 
    var w = g.width;
    var h = g.height;
    var backgroundColor = this.labelBg;
    var textColor = this.textColor;
    var linePadding = this.linePadding;
    var lineThickness = this.lineThickness;
    var lineColor = this.lineColor;
    var txt = this.text;
    var font = this.font; 
  
    g.setBackground(backgroundColor);
    g.fillRect(0, 0, w, h);
    
    g.setFont(font);
    
     var textHeight = g.textHeight(txt);
    var textWidth = g.stringWidth(txt);
    var textXLoc = (0.5 * (w - textWidth));
    
    
    
    g.setBackground(textColor);
    g.drawString(txt, textXLoc, ((h - textHeight) * 0.5 + textHeight));
    
    
    var sideLen = (w - textWidth)/2;//[...---..text..---...]
    
    var paddedSideLen = sideLen - linePadding;
    
    var x1 = 0;
    var x2 = paddedSideLen;
    var y = h / 2;
    
    var sw = g.getStrokeWidth();
    g.setStrokeWidth(lineThickness);
    
    g.setColor(lineColor);
    g.drawLine(x1 , y, x2 , y);
    
    x1 = paddedSideLen + linePadding + textWidth + linePadding;
    x2 = w;
    g.drawLine(x1 , y, x2 , y);

g.setStrokeWidth(sw);
 
  




};