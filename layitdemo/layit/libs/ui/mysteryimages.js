
const MysteryConstants = {
    DRAW_SQUARE: 1,
    DRAW_RECT: 2,
    DRAW_CIRCLE: 3,
    DRAW_OVAL: 4,
    DRAW_LINE: 5,
    DRAW_STAR: 6,
    DRAW_LETTER: 7,
    DRAW_TRIANGLE: 8,
    DRAW_TEXT: 9,
    DRAW_ROTATED_SQUARE: 10,
    DRAW_ROTATED_RECT: 11,
    DRAW_ROTATED_TRIANGLE: 12,
    DRAW_ROTATED_STAR: 13,
    DRAW_ROTATED_TEXT: 14,
    DRAW_ROTATED_OVAL: 15,
    DENSITY_SCALE: 0.00001,
    DEF_ALPHA: 1
};

/**
 *
 * @param options The options used to create this MysteryImage
 *
 *
 let options = {
 width: 200px,
 height:450px,
 fontName: "Arial',
 fontSize: "12px",
 fontStyle: italic bold|regular|...,
 fgColor: ,
 bgColor: ,
 numShapes: 50, // Total number of shapes to generate
 shapesDensity: 10, //Total number of shapes per unit area
 strokeWidth: 1,
 minSize: 30, //The minimum size of the shapes drawn
 opacity: MysteryConstants.DEF_ALPHA,
 bgOpacityEnabled: false,
 textArray: [], //An array of words that can be rendered randomly on the view.
 textOnly: false,//Forces the view to render only text from the textArray attribute
 cacheAfterDraw: true, //Renders the image once for a view and uses it subsequently.If false, this view will always have a new set of patterns whenever it is refreshed.
 }
 
 Remember to call the cleanup instance method to dispose f the resources used after getting your image.
 This is important if you wish to get just one image from this class.
 * @constructor
 */
function MysteryImage(options) {
    if (!options) {
        throw 'No initializing options specified!';
    }
    this.rnd = new Random();
    this.state = MysteryConstants.DRAW_ROTATED_TEXT;


    this.id = "mystery_" + this.rnd.generateUUID();
    this.width = 100;
    if (options.width) {
        if (typeof options.width === "number") {
            this.width = options.width;
        } else if (typeof options.width === "string") {
            try {
                this.width = parseInt(options.width);
            } catch (e) {
                throw e;
            }
        } else {
            throw 'Invalid value specified for `width`';
        }
    }
    this.height = 100;
    if (options.height) {
        if (typeof options.height === "number") {
            this.height = options.height;
        } else if (typeof options.height === "string") {
            try {
                this.height = parseInt(options.height);
            } catch (e) {
                throw e;
            }
        } else {
            throw 'Invalid value specified for `height`';
        }
    }


    let canvas = makeCanvas(this.id, this.width, this.height);
    this.numShapes = 20;
    if (options.numShapes) {
        if (typeof options.numShapes === "number") {
            this.numShapes = options.numShapes;
        } else if (typeof options.numShapes === "string") {
            try {
                this.numShapes = parseInt(options.numShapes);
            } catch (e) {
                throw e;
            }
        } else {
            throw 'Invalid value specified for `numShapes`';
        }
    }
    this.fontName = "Segoe UI";
    if (options.fontName) {
        if (typeof options.fontName === 'string') {
            this.fontName = options.fontName;
        } else {
            throw "Bad value specified for `fontName`";
        }
    }
    this.strokeWidth = 1;
    if (options.strokeWidth) {
        if (typeof options.strokeWidth === "number") {
            this.strokeWidth = options.strokeWidth;
        } else if (typeof options.strokeWidth === "string") {
            try {
                this.strokeWidth = parseInt(options.strokeWidth);
            } catch (e) {
                throw e;
            }

        } else {
            throw 'Invalid value specified for `strokeWidth`';
        }
    }
    this.fontSize = 12;
    if (options.fontSize) {
        if (typeof options.fontSize === 'number') {
            this.fontSize = options.fontSize;
        } else if (typeof options.fontSize === 'string') {
            this.fontSize = parseInt(options.fontSize);
        } else {
            throw 'Invalid value specified for `fontSize`';
        }
    }

    this.fontStyle = FontStyle.REGULAR;
    if (options.fontStyle) {
        if (typeof options.fontStyle === 'string') {
            if (FontStyleValues.indexOf(options.fontStyle) === -1) {
                throw "Invalid value specified for font size";
            }
            this.fontStyle = options.fontStyle;
        } else {
            throw 'Invalid value specified for `fontStyle`';
        }
    }

    this.sizeUnits = CssSizeUnits.PX;
    if (options.sizeUnits) {
        if (typeof options.sizeUnits === 'string') {
            if (CssSizeUnitsValues.indexOf(options.sizeUnits) === -1) {
                throw "Invalid size unit specified for font size";
            }
            this.sizeUnits = options.sizeUnits;
        } else {
            this.sizeUnits = CssSizeUnits.PX;
        }
    }
    this.minSize = 12;
    if (options.minSize) {
        if (typeof options.minSize === "number") {
            this.minSize = options.minSize;
        } else if (typeof options.minSize === "string") {
            try {
                this.minSize = parseInt(options.minSize);
            } catch (e) {
                throw e;
            }

        } else {
            throw 'Invalid value specified for `minSize`';
        }
    }
    this.shapesDensity = 0;
    if (options.shapesDensity) {
        if (typeof options.shapesDensity === "number") {
            this.shapesDensity = options.shapesDensity;
        } else if (typeof options.shapesDensity === "string") {
            try {
                this.shapesDensity = parseInt(options.shapesDensity);
            } catch (e) {
                throw e;
            }
        } else {
            throw 'Invalid value specified for `shapesDensity`';
        }
    }
    this.opacity = MysteryConstants.DEF_ALPHA;
    if (options.opacity) {
        if (typeof options.opacity === "number") {
            this.opacity = options.opacity;
        } else if (typeof options.opacity === "string") {
            try {
                this.opacity = parseFloat(options.opacity);
            } catch (e) {
                throw e;
            }
        } else {
            throw 'Invalid value specified for `opacity`';
        }
    }

    this.fgColor = '#000';
    if (options.fgColor) {
        if (typeof options.fgColor === 'string') {
            this.fgColor = options.fgColor;
        } else {
            throw 'Invalid value specified for `fgColor`';
        }
    }

    this.bgColor = '#FFF';
    if (options.bgColor) {
        if (typeof options.bgColor === 'string') {
            this.bgColor = options.bgColor;
        } else {
            throw 'Invalid value specified for `bgColor`';
        }
    }

    this.cacheAfterDraw = true;
    if (typeof options.cacheAfterDraw === "boolean") {
        this.cacheAfterDraw = options.cacheAfterDraw;
    }


    this.bgOpacityEnabled = false;
    if (typeof options.bgOpacityEnabled === "boolean") {
        this.bgOpacityEnabled = options.bgOpacityEnabled;
    }

    this.textOnly = false;
    if (options.textOnly) {
        if (typeof options.textOnly === "boolean") {
            this.textOnly = options.textOnly;
        } else {
            throw 'Invalid value specified for `textOnly`';
        }
    }

    this.textArray = [];
    if (options.textArray) {
        if (isOneDimArray(options.textArray)) {
            this.textArray = options.textArray;
        } else {
            throw 'Invalid value specified for `textArray`';
        }
    }

    this.imageCache = null;
    this.g = new Graphics(canvas);
    this.font = new Font(this.fontStyle, this.fontSize, this.fontName, this.sizeUnits);
    this.g.setFont(this.font);

    this.g.setStrokeWidth(this.strokeWidth);
    this.g.setBackground(this.bgColor);
    this.g.setColor(this.fgColor);
    this.g.setAlpha(this.opacity);

}


function makeCanvas(canvasId, w, h) {
    let canvas = document.createElement('canvas');
    if (canvasId) {
        canvas.id = canvasId;
    }
    canvas.width = w;
    canvas.height = h;
    canvas.style.border = "0px solid";
    document.body.appendChild(canvas);

    return canvas;
}

/**
 * Free the canvas and release resources
 */
MysteryImage.prototype.cleanup = function () {
    this.imageCache = null;
    this.g.clear();
    this.g.getCanvas().remove();
};
/**
 * Call this only fter calling MysteryImage.prototype.draw()
 * @returns {unresolved}
 */
MysteryImage.prototype.getImage = function () {
    return this.g.getCanvas().toDataURL();
};
/**
 *
 * @param x The horizontal location of the top left of the square
 * @param y The vertical location of the top left of the square
 * @param sz The side length of the square
 * @param fill A boolean. If true, the square will be filled with color. Else it will be drawn plain.
 */
MysteryImage.prototype.drawSquare = function (x, y, sz, fill) {

    let g = this.g;
    if (fill) {
        g.fillRect(x, y, sz, sz);
    } else {
        g.drawRect(x, y, sz, sz);
    }

};


/**
 *
 * @param x The horizontal location of the top left of the square
 * @param y The vertical location of the top left of the square
 * @param sz The side length of the square
 * @param angDeg
 * @param fill A boolean. If true, the square will be filled with color. Else it will be drawn plain.
 */
MysteryImage.prototype.drawRotatedSquare = function (x, y, sz, angDeg, fill) {
    let g = this.g;
    g.rotateDegsAt(angDeg, x + sz / 2, y + sz / 2, function () {
        if (fill) {
            g.fillRect(-sz / 2, -sz / 2, sz, sz);
        } else {
            g.drawRect(-sz / 2, -sz / 2, sz, sz);
        }
    });
};

MysteryImage.prototype.drawRect = function (x, y, sz, fill) {
    let g = this.g;
    let w = sz;
    let halfSz = sz / 2;
    let h = (halfSz) + this.rnd.nextInt(halfSz + 1);

    w = this.rnd.nextBool() ? h : w;

    let dim = [w, h];

    let ind = this.rnd.nextInt(2);
    w = dim[ind];
    h = ind === 0 ? dim[1] : dim[0];

    if (fill) {
        g.fillRect(x, y, w, h);
    } else {
        g.drawRect(x, y, w, h);
    }

};

MysteryImage.prototype.drawRotatedRect = function (x, y, sz, angDeg, fill) {
    let g = this.g;
    let w = sz;
    let halfSz = sz / 2;
    let h = (halfSz) + this.rnd.nextInt(halfSz + 1);

    w = this.rnd.nextBool() ? h : w;

    let dim = [w, h];

    let ind = this.rnd.nextInt(2);
    w = dim[ind];
    h = ind === 0 ? dim[1] : dim[0];

    g.rotateDegsAt(angDeg, x + w / 2, y + h / 2, function () {
        if (fill) {
            g.fillRect(-w / 2, -h / 2, w, h);
        } else {
            g.drawRect(-w / 2, -h / 2, w, h);
        }
    });
};


MysteryImage.prototype.drawCircle = function (x, y, sz, fill) {
    let g = this.g;
    let halfSz = sz / 2;

    if (fill) {
        g.fillCircle(x, y, halfSz);
    } else {
        g.drawCircle(x, y, halfSz);
    }

};


MysteryImage.prototype.drawOval = function (x, y, sz, fill) {
    let g = this.g;
    let w = sz;
    let halfSz = sz / 2;
    let h = (halfSz) + this.rnd.nextInt(halfSz + 1);

    w = this.rnd.nextBool() ? h : w;

    let dim = [w, h];

    let ind = this.rnd.nextInt(2);
    w = dim[ind];
    h = ind === 0 ? dim[1] : dim[0];

    if (fill) {
        g.fillOval(x, y, w, h);
    } else {
        g.drawOval(x, y, w, h);
    }
};


MysteryImage.prototype.drawRotatedOval = function (x, y, sz, angDeg, fill) {
    let g = this.g;
    let w = sz;
    let halfSz = sz / 2;
    let h = (halfSz) + this.rnd.nextInt(halfSz + 1);

    w = this.rnd.nextBool() ? h : w;

    let dim = [w, h];

    let ind = this.rnd.nextInt(2);
    w = dim[ind];
    h = ind === 0 ? dim[1] : dim[0];
    g.rotateDegsAt(angDeg, x, y, function () {
        if (fill) {
            g.fillOval(0, 0, w, h);
        } else {
            g.drawOval(0, 0, w, h);
        }
    });
};

/**
 *
 * @param x The x loc of the start of the line
 * @param y The y loc of the start of the line
 * @param len The length of the line
 * @param angDeg The angle to rotate the line through
 */
MysteryImage.prototype.drawLine = function (x, y, len, angDeg) {
    let g = this.g;
    let halfSz = len / 2;

    g.rotateDegsAt(angDeg, x + halfSz, y + halfSz, function () {
        g.drawLine(-halfSz, -halfSz, -halfSz + len, -halfSz);
    });
};

/**
 * @param {number} x The x location of the square that contains the star
 * @param {number} y         The y location of the square that contains the star
 * @param {number} size      The size of the square that contains the star
 * @param {number} thickness The thickness of the prong-base of the star
 * @param {boolean} fill      If true, fills the star with color
 */
MysteryImage.prototype.drawStar = function (x, y, size, thickness, fill) {
    let g = this.g;

    let halfThickness = (0.5 * thickness);
    let halfSz = (0.5 * size);

    let cen = new Point(x + halfSz, y + halfSz);

    // A square of side length equal to the supplied thickness. It lives at the center of the square that contains the star.
    // The bases of the stars prongs rest on this rectangle

    let lf = cen.x - halfThickness;
    let tp = cen.y - halfThickness;
    let rt = lf + thickness;
    let btm = tp + thickness;
    let cenBox = new Rectangle(lf, tp, rt, btm);

    let xPts = [x, cenBox.left, x + halfSz, cenBox.right(), x + size, cenBox.right(), x + halfSz, cenBox.left, x],
            yPts = [y + halfSz, cenBox.top, y, cenBox.top, y + halfSz, cenBox.bottom(), y + size, cenBox.bottom(), y + halfSz],
            nPts = 9;
    if (fill) {
        g.fillPolygonFromVertices(xPts, yPts, nPts);
    } else {
        g.drawPolygonFromVertices(xPts, yPts, nPts);
    }


};
/**
 * Draws a star that has been rotated
 * @param {number} x The x location of the square that contains the star
 * @param {number} y         The y location of the square that contains the star
 * @param {number} size      The size of the square that contains the star
 * @param {number} thickness The thickness of the prong-base of the star
 * @param {number} angDeg The angle of rotation of the star
 * @param {boolean} fill      If true, fills the star with color
 */
MysteryImage.prototype.drawRotatedStar = function (x, y, size, thickness, angDeg, fill) {
    let g = this.g;
    let self = this;
    let halfSz = size / 2;
    g.rotateDegsAt(angDeg, x + halfSz, y + halfSz, function () {
        self.drawStar(-halfSz, -halfSz, size, thickness, fill);
    });
};

MysteryImage.prototype.drawTriangle = function (x, y, size, fill) {
    let g = this.g;
    let halfSz = (0.5 * size);
    let xPts = [x + halfSz, x, x + size, x + halfSz];
    let yPts = [y, y + size, y + size, y];
    if (fill) {
        g.fillPolygonFromVertices(xPts, yPts, xPts.length);
    } else {
        g.drawPolygonFromVertices(xPts, yPts, xPts.length);
    }
};

MysteryImage.prototype.drawRotatedTriangle = function (x, y, size, angDeg, fill) {
    let g = this.g;
    let self = this;
    let halfSz = size / 2;
    g.rotateDegsAt(angDeg, x + halfSz, y + halfSz, function () {
        self.drawTriangle(-halfSz, -halfSz, size, fill);
    });
};

MysteryImage.prototype.drawText = function (x, y) {
    let g = this.g;
    let len = this.textArray.length;
    let index = this.rnd.nextInt(len);
    let txt = this.textArray[index];
    let w = g.stringWidth(txt);
    let h = g.textHeight(txt);
    g.drawString(txt, x, y + h);
    return {width: w, height: h};
};

MysteryImage.prototype.drawRotatedText = function (x, y, size, angDeg) {
    let g = this.g;
    let self = this;
    let index = this.rnd.nextInt(this.textArray.length);
    let txt = this.textArray[index];
    let halfSz = size / 2;

    let h = g.textHeight(txt);
    g.rotateDegsAt(angDeg, x + halfSz, y + halfSz, function () {
        self.drawText(-halfSz, h - halfSz);
    });
};

MysteryImage.prototype.generateRect = function (w, h) {

console.log('[w, h]: [',w,', ',h,']');

let ww = w/PIXEL_RATIO;
let hh = h/PIXEL_RATIO;
    let sz = this.minSize + this.rnd.nextInt(this.minSize + 1);
    //sz = this.g.normalizeQuantity(sz);

    let x = sz + this.rnd.nextInt(ww);
    let y = sz + this.rnd.nextInt(hh);

    if (x + sz >= ww) {
      x = ww - 2 * sz;
    }
    if (y + sz >= hh) {
      y = hh - 2 * sz;
    }

    return new Rectangle(x, y, x + sz, y + sz);
};
MysteryImage.prototype.maxIterations = function () {
    return 12 * this.numShapes;
};


function calibrate(g) {

    let fg = g.getStrokeColor();
    let bg = g.getFillColor();
    let alpha = g.getAlpha();

    g.setAlpha(1);

    g.setColor('yellow');
    g.setBackground('white');

    g.drawLine(20, 80, 500, 80);
    g.drawString("(500,80)", 501, 80);
    g.drawLine(20, 215, 500, 215);
    g.drawString("(500,215)", 501, 215);


    g.drawLine(1500, 12, 1500, 155);
    g.drawString("(1500,155)", 1470, 155);


    g.setColor(fg);
    g.setBackground(bg);
    g.setAlpha(alpha);
}

MysteryImage.prototype.baseDraw = function (w, h) {
    let g = this.g;
    //   g.fillRect(this.g.normalizeQuantity(1536-30) ,this.g.normalizeQuantity(128 - 30), 30,30);
    let area = w * h;
    let rnd = this.rnd;
    g.setAlpha(this.bgOpacityEnabled === true ? this.opacity : 1);
    g.setBackground(this.bgColor);
    g.fillRect(0, 0, w, h);

    calibrate(g);
    if (!this.bgOpacityEnabled) {
        g.setAlpha(this.opacity);
    }
    g.setAlpha(1);
    if (this.shapesDensity > 0) {
        this.numShapes = this.shapesDensity * area * MysteryConstants.DENSITY_SCALE;
    }
    let attempts = 0;
    let rects = [];
    let maxIters = this.maxIterations();

    while (rects.length < this.numShapes && attempts < maxIters) {

        if (this.textOnly) {
            this.state = rnd.nextBool() ? MysteryConstants.DRAW_TEXT : MysteryConstants.DRAW_ROTATED_TEXT;
        } else {
            this.state = 1 + rnd.nextInt(this.textArray.length === 0 ? MysteryConstants.DRAW_ROTATED_STAR : MysteryConstants.DRAW_ROTATED_OVAL);
        }

        let fill = rnd.nextBool();
        let angDeg = 1 + rnd.nextInt(360);

        let r = this.generateRect(w, h);
        r.angle = angDeg;


        let clashOccurred = false;

        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (r.intersects(rect)) {
                clashOccurred = true;
                break;
            }
        }

        g.setBackground(this.fgColor);

        if (clashOccurred) {
            attempts++;
            continue;
        } else {
            rects.push(r);
            g.setBackground('yellow');
            g.fillEllipse(r.left + 8, r.top + 4, 8, 4, 30, 360, false);
            g.setBackground(this.bgColor);
            switch (this.state) {

                case MysteryConstants.DRAW_SQUARE:
                    this.drawSquare(r.left, r.top, r.width, fill);
                    break;
                case MysteryConstants.DRAW_RECT:
                    this.drawRect(r.left, r.top, r.width, fill);
                    break;
                case MysteryConstants.DRAW_CIRCLE:
                    this.drawCircle(r.left, r.top, r.width, fill);
                    break;
                case MysteryConstants.DRAW_OVAL:
                    this.drawOval(r.left, r.top, r.width, fill);
                    break;
                case MysteryConstants.DRAW_LINE:
                    this.drawLine(r.left, r.top, r.width, angDeg);
                    break;
                case MysteryConstants.DRAW_STAR:
                    this.drawStar(r.left, r.top, r.width, r.width / 4, fill);
                    break;
                case MysteryConstants.DRAW_ROTATED_STAR:
                    this.drawRotatedStar(r.left, r.top, r.width, r.width / 4, angDeg, fill);
                    break;
                case MysteryConstants.DRAW_TRIANGLE:

                    this.drawTriangle(r.left, r.top, r.width, fill);
                    break;
                case MysteryConstants.DRAW_ROTATED_SQUARE:
                    this.drawRotatedSquare(r.left, r.top, r.width, angDeg, fill);
                    break;
                case MysteryConstants.DRAW_ROTATED_RECT:
                    this.drawRotatedRect(r.left, r.top, r.width, angDeg, fill);
                    break;
                case MysteryConstants.DRAW_ROTATED_TRIANGLE:
                    this.drawRotatedTriangle(r.left, r.top, r.width, angDeg, fill);
                    break;
                case MysteryConstants.DRAW_TEXT:
                    this.drawText(r.left, r.top, r.width);
                    break;
                case MysteryConstants.DRAW_ROTATED_TEXT:
                    this.drawRotatedText(r.left, r.top, r.width, angDeg);
                    break;
                case MysteryConstants.DRAW_ROTATED_OVAL:
                    this.drawRotatedOval(r.centerX(), r.centerY(), r.width, angDeg);
                    break;
                default:
                    break;
            }
            r.state = this.state;
        }

    }
console.log('all rects:',rects);

};


MysteryImage.prototype.draw = function () {
    let g = this.g;
    let w = g.width;
    let h = g.height;

    if (this.cacheAfterDraw) {
        if (this.imageCache !== null) {
            g.drawImageAtLocWithSize(this.imageCache, 0, 0, w, h);
        } else {
            this.baseDraw(w, h);
            this.imageCache = g.getImageData(0, 0, w, h);
        }
    } else {
        this.baseDraw(w, h);
        this.imageCache = g.getImageData(0, 0, w, h);
    }
    return this.imageCache;
};//end draw method