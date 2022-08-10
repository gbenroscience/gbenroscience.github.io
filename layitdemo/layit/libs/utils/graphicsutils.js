/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.move = function (x, y) {
    this.x = x;
    this.y = y;
};

Point.prototype.translate = function (dx, dy) {
    this.x += dx;
    this.y += dy;
};


/**
 * *
 *
 * @param {Point} pt the Point object whose distance to this Point object is
 * required
 * @return the distance between the 2 Point objects.
 */
Point.prototype.calcDistanceTo = function (pt) {
    if (pt && pt.constructor.name === 'Point') {
        return Math.sqrt(Math.pow((this.x - pt.x), 2) + Math.pow((this.y - pt.y), 2));
    }
    return Number.NaN;
};


Point.prototype.equals = function (point) {
    if (point && point.constructor.name === 'Point') {
        return point.x === this.x && point.y === this.y;
    }
    return false;
};

function FloatPoint(x, y, z) {
    Point.call(this, x, y);
    this.z = z;
}


FloatPoint.prototype.constructor = FloatPoint;
FloatPoint.prototype = Object.create(Point.prototype);

FloatPoint.prototype.move = function (x, y, z) {
    Object.getPrototypeOf(FloatPoint.prototype).move.call(this, x, y);
    this.z = z;
};

FloatPoint.prototype.translate = function (dx, dy, dz) {
    Object.getPrototypeOf(FloatPoint.prototype).translate.call(this, dx, dy);
    this.z += dz;
};

/**
 * *
 *
 * @param {FloatPoint} fpt the FloatPoint object whose distance to this Point object is
 * required
 * @return the distance between the 2 FloatPoint objects.
 */
FloatPoint.prototype.calcDistanceTo = function (fpt) {
    if (fpt && fpt.constructor.name === 'FloatPoint') {
        return Math.sqrt(pow((this.x - fpt.x), 2) + Math.pow((this.y - fpt.y), 2) + Math.pow((this.z - fpt.z), 2));
    }
    return Number.NaN;
};


FloatPoint.prototype.toPoint = function () {
    return new Point(this.x, this.y);
};

FloatPoint.prototype.equals = function (fpt) {
    if (fpt && fpt.constructor.name === 'FloatPoint') {
        return fpt.x === this.x && fpt.y === this.y && fpt.z === this.z;
    }
    return false;
};




/**
 *
 * @param {FloatPoint} pt the point between which an imaginary line runs
 * @return the gradient of the projection of the line joining these points
 * on the XY plane
 */
FloatPoint.prototype.findXYGrad = function (pt) {
    if (pt && pt.constructor.name === 'FloatPoint') {
        return (this.y - pt.y) / (this.x - pt.x);
    }
    return Number.NaN;
};

/**
 *
 * @param {FloatPoint} pt the point between which an imaginary line runs
 * @return the gradient of the projection of the line joining these points
 * on the XZ plane
 */
FloatPoint.prototype.findXZGrad = function (pt) {
    if (pt && pt.constructor.name === 'FloatPoint') {
        return (this.z - pt.z) / (this.x - pt.x);
    }
    return Number.NaN;
};

/**
 *
 * @param {FloatPoint} pt the point between which an imaginary line runs
 * @return the gradient of the projection of the line joining these points
 * on the YZ plane
 */
FloatPoint.prototype.findYZGrad = function (pt) {
    if (pt && pt.constructor.name === 'FloatPoint') {
        return (this.z - pt.z) / (this.y - pt.y);
    }
    return Number.NaN;
};

/**
 *
 * @param {Point} p1 The first Point object.
 * @param {Point} p2 The second Point object.
 * @return The Point object that contains the coordinates of the midpoint of
 * the line joining p1 and p2
 */
function midPoint(p1, p2) {
    if (p1 && p1.constructor.name === 'Point' && p2 && p2.constructor.name === 'Point') {
        return new Point((0.5 * (p1.x + p2.x)), (0.5 * (p1.y + p2.y)));
    }
    return null;
}
;

/**
 *
 * @param {FloatPoint} p1 The first FloatPoint object.
 * @param {FloatPoint} p2 The second FloatPoint object.
 * @return The FloatPoint object that contains the coordinates of the midpoint of
 * the line joining p1 and p2
 */
function midPointF(p1, p2) {
    if (p1 && p1.constructor.name === 'FloatPoint' && p2 && p2.constructor.name === 'FloatPoint') {
        return new FloatPoint((0.5 * (p1.x + p2.x)), (0.5 * (p1.y + p2.y)), (0.5 * (p1.z + p2.z)));
    }
    return null;
}
;



/**
 *
 * @param {FloatPoint} p1 The first point
 * @param {FloatPoint} p2 The second point
 * @return true if this Point object lies on the same straight line with p1
 * and p2 and it lies in between them.
 */
FloatPoint.prototype.liesBetween = function (p1, p2) {
    if (p1 && p1.constructor.name === 'FloatPoint' && p2 && p2.constructor.name === 'FloatPoint') {
        var truly1 = ((p1.x <= x && p2.x >= this.x) || (p2.x <= x && p1.x >= this.x));
        var truly2 = ((p1.y <= y && p2.y >= this.y) || (p2.y <= y && p1.y >= this.y));
        var truly3 = ((p1.z <= z && p2.z >= this.z) || (p2.z <= z && p1.z >= this.z));

        return truly1 && truly2 && truly3 && isCollinearWith(p1, p2);
    }
    return false;
};





/**
 * A line passing between 2 points
 * @param {FloatPoint} fpt1
 * @param {FloatPoint} fpt2
 * @returns {Line}
 */
function Line(fpt1, fpt2) {
    if (fpt1 && fpt1.constructor.name === 'FloatPoint' && fpt2 && fpt2.constructor.name === 'FloatPoint') {
        this.m = fpt1.findXYGrad(fpt2);
        this.c = fpt1.y - this.m * fpt1.x;
    }
    return null;
}


/**
 *
 * @param {Number} y the y coordinate of
 * a given point on a Line object.
 * @return the x coordinate of that point.
 */
Line.prototype.getX = function (y) {
    if (typeof y === "number") {
        return (y - this.c) / this.m;
    }
    return Number.NaN;
};

Line.prototype.getY = function (x) {
    if (typeof x === "number") {
        return (this.m * x) + this.c;
    }
    return Number.NaN;
};



/**
 *
 * Finds the distance between 2 Point objects lying on this Line object
 * They must lie on this Line object, else the method will return 0;
 * @param {Point} p1 the first Point object to consider
 * @param {Point} p2 the second Point object to consider
 * @return the distance along this Line
 * object between the 2 given Point objects lying on it
 */

Line.prototype.distance = function (p1, p2) {
    if (p1 && p1.constructor.name === 'Point' && p2 && p2.constructor.name === 'Point') {
        if (this.passesThroughPoint(p1) && this.passesThroughPoint(p2)) {
            return p2.calcDistanceTo(p1);
        }
    }
    return Number.NaN;
};

/**
 *
 * Finds the distance between 2 Point objects lying on this Line object
 * They must lie on this Line object, else the method will return 0;
 * @param {FloatPoint} p1 the first FloatPoint object to consider
 * @param {FloatPoint} p2 the second FloatPoint object to consider
 * @return the distance along this Line
 * object between the 2 given Point objects lying on it
 */
Line.prototype.distanceF = function (p1, p2) {
    if (p1 && p1.constructor.name === 'FloatPoint' && p2 && p2.constructor.name === 'FloatPoint') {
        if (this.passesThroughPoint(p1) && this.passesThroughPoint(p2)) {
            return p2.calcDistanceTo(p1);
        }
    }
    return Number.NaN;
};

/**
 *
 * Finds the square of the distance between 2 Point objects lying on this Line object
 * They must lie on this Line object, else the method will return 0;
 * @param {FloatPoint} p1 the first Point object to consider
 * @param {FloatPoint} p2 the second Point object to consider
 * @return the distance along this Line
 * object between the 2 given Point objects lying on it
 */
Line.prototype.distanceSquared = function (p1, p2) {
    if (p1 && p1.constructor.name === 'FloatPoint' && p2 && p2.constructor.name === 'FloatPoint') {
        if (this.passesThroughPoint(p1) && this.passesThroughPoint(p2)) {
            var dist = p2.calcDistanceTo(p1);
            return dist * dist;
        }
    }
    return Number.NaN;
};




/**
 *
 * @param {Line} line the Line object to be checked if or not it intersects with this one.
 * @return true if the 2 Line objects intersect.
 */
Line.prototype.intersectsLine = function (line) {
    return !this.isParallelTo(line);
};

/**
 * Checks if this Line object is parallel to another.
 * @param {Line} line the Line object to be checked against this one for parallelism
 * @return true if it is parallel to the other Line object
 */
Line.prototype.isParallelTo = function (line) {
    return this.approxEquals(this.m, line.m);
};

/**
 * 
 * @param {Point} p1 the Point object that we
 * wish to check if or not it lies on this Line
 * object.
 * @return true if it lies on this Line object
 */
Line.prototype.passesThroughPoint = function (p1) {
    if (p1 && p1.constructor.name === 'Point') {
        return this.approxEquals(p1.y, (this.m * p1.x + this.c));
    }
    return false;
};
/**
 * 
 * @param {FloatPoint} p1 the Point object that we
 * wish to check if or not it lies on this Line
 * object.
 * @return true if it lies on this Line object
 */
Line.prototype.passesThroughPointF = function (p1) {
    if (p1 && p1.constructor.name === 'FloatPoint') {
        return this.approxEquals(p1.y, (this.m * p1.x + this.c));
    }
};

/**
 *
 * @param {Line} line the Line object whose point of
 * intersection with this Line object is required
 * @return the point of intersection of both Line objects
 */
Line.prototype.intersectionWithLine = function (line) {
    if (line && line.constructor.name === 'Line') {
        var x = (-1 * (this.c - line.c) / (this.m - line.m));
        var y = this.m * x + this.c;
        return new FloatPoint(x, y);
    }
    return null;
};


/**
 * Compares two numbers to see if they are close enough to be almost the same
 * It checks if the values deviate by 1.0E-14 or lesser.
 * @param {Number} val1 the first value to compare
 * @param {Number} val2 the second value to compare
 * @return true if the values deviate by 1.0E-14 or lesser.
 */

function approxEquals(val1, val2) {
    if (typeof val1 === "number" && typeof val2 === "number") {
        return Math.abs(Math.abs(val1) - Math.abs(val2)) <= 1.0E-14;
    }
    return false;
}
;

/**
 * Compares two numbers to see if they are close enough to be almost the same
 * It checks if the values deviate by 1.0E-14 or lesser.
 * @param {Number} val1 the first value to compare
 * @param {Number} val2 the second value to compare
 * @param minDeviation the minimum difference they
 * must have to be acceptably equal.
 * @return true if the values deviate by 1.0E-14 or lesser.
 */

function approxEquals(val1, val2, minDeviation) {
    if (typeof val1 === "number" && typeof val2 === "number" && typeof minDeviation === "number") {
        return abs(abs(val1) - abs(val2)) <= abs(minDeviation);
    }
    return false;
}
;

/**
 * 
 * @param {string} id
 * @param {Number} x1 The starting x on the line
 * @param {Number} x2 The ending x on the line
 * @param {string} color The color of the line in color hex format: e.g. #000FFF
 * @param {Number} thickness The stroke thickness for the line.
 * @returns {undefined}
 */
Line.prototype.draw = function (id, x1, x2, color, thickness) {
    if (typeof id === "string" && typeof x1 === "number" && typeof x2 === "number" && typeof color === "string" && typeof thickness === "number") {
        var canvas = document.getElementById(id);

        var ctx = canvas.getContext("2d");

        var wid = canvas.width;
        var hei = canvas.height;

        let y1 = this.getY(x1);
        let y2 = this.getY(x2);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    } else {
        logger("Invalid Line draw args");
    }


};

function Dimension(width, height) {
    if (typeof width === "number" && typeof height === "number") {
        this.width = width;
        this.height = height;
    } else {
        this.width = 0;
        this.height = 0;
    }

}

/**
 * Scales a given Dimension along both the width and the height.
 * @param {Number} scaleFactor
 * @returns {undefined}
 */
Dimension.prototype.scale = function (scaleFactor) {
    if (typeof scaleFactor === "number") {
        this.width *= scaleFactor;
        this.height *= scaleFactor;
    }
};

/**
 * Scales a given Dimension along both the width and the height and returns the nw dimension
 * @param {Number} scaleFactor
 * @returns a new Dimension
 */
Dimension.prototype.getScaledInstance = function (scaleFactor) {
    if (typeof scaleFactor === "number") {
        var w = this.width * scaleFactor;
        var h = this.height * scaleFactor;
        return new Dimension(w, h);
    }
    return null;
};
/**
 * 
 * @param {Number} a the coefficient in x squared
 * @param {Number} b the coefficient in x
 * @param {Number} c the constant factor
 * @returns {Quadratic}
 */
function Quadratic(a, b, c) {
    if (typeof a === "number" && typeof b === "number" && typeof c === "number") {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

Quadratic.prototype.solve = function () {
    var result = "";

    var a = this.a;
    var b = this.b;
    var c = this.c;


    if ((Math.pow(b, 2) - 4 * a * c) >= 0) {
        var x1 = ((-b / (2 * a)) + (Math.sqrt(Math.pow(b, 2) - 4 * a * c) / (2 * a)));
        var x2 = ((-b / (2 * a)) - (Math.sqrt(Math.pow(b, 2) - 4 * a * c) / (2 * a)));

        return x1 + " , " + x2;
    } else if ((pow(b, 2) - 4 * a * c) < 0) {
        var a1 = (-b / (2 * a));
        var b1 = ((Math.sqrt(4 * a * c - Math.pow(b, 2)) / (2 * a)));

        var a2 = (-b / (2 * a));
        var b2 = ((Math.sqrt(4 * a * c - Math.pow(b, 2)) / (2 * a)));

        return a1 + " + " + b1 + " i , " + a2 + " - " + b2 + " i";
    }
//2p^2-3p-4.09=0
};

Quadratic.prototype.solutionArray = function () {

    var a = this.a;
    var b = this.b;
    var c = this.c;

    var arr = new Array();


    if ((Math.pow(b, 2) - 4 * a * c) >= 0) {
        var x1 = ((-b / (2 * a)) + (Math.sqrt(Math.pow(b, 2) - 4 * a * c) / (2 * a)));
        var x2 = ((-b / (2 * a)) - (Math.sqrt(Math.pow(b, 2) - 4 * a * c) / (2 * a)));
        arr.push(x1);
        arr.push(x2);
    } else if ((pow(b, 2) - 4 * a * c) < 0) {
        var a1 = (-b / (2 * a));
        var b1 = ((Math.sqrt(4 * a * c - Math.pow(b, 2)) / (2 * a)));

        var a2 = (-b / (2 * a));
        var b2 = ((Math.sqrt(4 * a * c - Math.pow(b, 2)) / (2 * a)));

        arr.push(a1 + " + " + b1 + " i");
        arr.push(a2 + " - " + b2 + " i");


    }

    return arr;
};

/**
 * 
 * @param {type} left The x coordinate of the left side of the rectangle
 * @param {type} top The y coordinate of the upper side of the rectangle
 * @param {type} right The x coordinate of the right side of the rectangle
 * @param {type} bottom The y coordinate of the lower side of the rectangle
 * @returns {Rectangle}
 */
function Rectangle(left, top, right, bottom) {
    this.width = this.height = this.left = this.top = 0;
    if (typeof left === 'number' && typeof top === 'number' && typeof right === 'number' && typeof bottom === 'number') {
        this.left = left;
        this.top = top;
        this.width = right - left;
        this.height = bottom - top;
    }

}

Rectangle.prototype.right = function () {
    return this.left + this.width;
};

Rectangle.prototype.bottom = function () {
    return this.top + this.height;
};

Rectangle.prototype.centerX = function () {
    return this.left + this.width/2;
};

Rectangle.prototype.centerY = function () {
    return this.top + this.height/2;
};

Rectangle.prototype.setLocation = function (x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
        this.left = x;
        this.top = y;
    }
};

Rectangle.prototype.getLocation = function () {
    return new Point(this.left, this.top);
};

/**
 * The algorithm here is a translation of what is in the Java API.
 * @param {Number} dx
 * @param {Number} dy
 * @returns {undefined}]
 */
Rectangle.prototype.translate = function (dx, dy) {
    var oldv = this.left;
    var newv = oldv + dx;
    if (dx < 0) {
        // moving leftward
        if (newv > oldv) {
            // negative overflow
            // Only adjust width if it was valid (>= 0).
            if (this.width >= 0) {
                // The right edge is now conceptually at
                // newv+width, but we may move newv to prevent
                // overflow.  But we want the right edge to
                // remain at its new location in spite of the
                // clipping.  Think of the following adjustment
                // conceptually the same as:
                // width += newv; newv = MIN_VALUE; width -= newv;
                this.width += newv - Number.MIN_VALUE;
                // width may go negative if the right edge went past
                // MIN_VALUE, but it cannot overflow since it cannot
                // have moved more than MIN_VALUE and any non-negative
                // number + MIN_VALUE does not overflow.
            }
            newv = Number.MIN_VALUE;
        }
    } else {
        // moving rightward (or staying still)
        if (newv < oldv) {
            // positive overflow
            if (this.width >= 0) {
                // Conceptually the same as:
                // width += newv; newv = MAX_VALUE; width -= newv;
                this.width += newv - Number.MAX_VALUE;
                // With large widths and large displacements
                // we may overflow so we need to check it.
                if (this.width < 0)
                    this.width = Number.MAX_VALUE;
            }
            newv = Number.MAX_VALUE;
        }
    }
    this.left = newv;

    oldv = this.top;
    newv = oldv + dy;
    if (dy < 0) {
        // moving upward
        if (newv > oldv) {
            // negative overflow
            if (this.height >= 0) {
                this.height += newv - Number.MIN_VALUE;
                // See above comment about no overflow in this case
            }
            newv = Number.MIN_VALUE;
        }
    } else {
        // moving downward (or staying still)
        if (newv < oldv) {
            // positive overflow
            if (this.height >= 0) {
                this.height += newv - Number.MAX_VALUE;
                if (this.height < 0)
                    this.height = Number.MAX_VALUE;
            }
            newv = Number.MAX_VALUE;
        }
    }
    this.top = newv;

};
/**
 * 
 * @returns {Dimension}
 */
Rectangle.prototype.getSize = function () {
    return new Dimension(this.width, this.height);
};

/**
 * 
 * @param {type} d
 * @returns {undefined}
 */
Rectangle.prototype.setSize = function (d) {
    if (d.constructor.name === 'Dimension') {
        this.width = d.width;
        this.height = d.height;
    }
};
/**
 * 
 * @param {Number} X The x coordinate of the Point
 * @param {Number} Y The y coordinate of the Point
 * @returns {Boolean} true if the point specified lies inside this rectangle
 */
Rectangle.prototype.containsPoint = function (X, Y) {
    if (typeof X === 'number' && typeof Y === 'number') {
        var w = this.width;
        var h = this.height;
        if ((w | h) < 0) {
            // At least one of the dimensions is negative...
            return false;
        }
        // Note: if either dimension is zero, tests below must return false...
        var x = this.left;
        var y = this.top;
        if (X < x || Y < y) {
            return false;
        }
        w += x;
        h += y;
        //    overflow || intersect
        return ((w < x || w > X) &&
                (h < y || h > Y));
    }
    return false;
};

/**
 * 
 * @param {Rectangle} rect
 * @returns {Boolean} true if the specified Rectangle lies within this Rectangle.
 */
Rectangle.prototype.contains = function (rect) {
    if (rect.constructor.name === 'Rectangle') {
        var X = rect.left;
        var Y = rect.top;
        var W = rect.width;
        var H = rect.height;

        var w = this.width;
        var h = this.height;
        if ((w | h | W | H) < 0) {
            // At least one of the dimensions is negative...
            return false;
        }
        // Note: if any dimension is zero, tests below must return false...
        var x = this.left;
        var y = this.top;
        if (X < x || Y < y) {
            return false;
        }
        w += x;
        W += X;
        if (W <= X) {
            // X+W overflowed or W was zero, return false if...
            // either original w or W was zero or
            // x+w did not overflow or
            // the overflowed x+w is smaller than the overflowed X+W
            if (w >= x || W > w)
                return false;
        } else {
            // X+W did not overflow and W was not zero, return false if...
            // original w was zero or
            // x+w did not overflow and x+w is smaller than X+W
            if (w >= x && W > w)
                return false;
        }
        h += y;
        H += Y;
        if (H <= Y) {
            if (h >= y || H > h)
                return false;
        } else {
            if (h >= y && H > h)
                return false;
        }
        return true;
    }
    return false;
};


/**
 * Determines whether or not this Rectangle and the specified
 * Rectangle intersect. Two rectangles intersect if
 * their intersection is nonempty.
 *
 * @param {Rectangle} r the specified  Rectangle
 * @return    true if the specified  Rectangle
 *            and this Rectangle intersect;
 *             false otherwise.
 */
Rectangle.prototype.intersects = function (r) {
    if (r.constructor.name === 'Rectangle') {
        let left = r.left; let right = r.right(); let top = r.top; let bottom = r.bottom();
        if (this.left < right && left < this.right && this.top < bottom && top < this.bottom) {
            if (this.left < left) this.left = left;
            if (this.top < top) this.top = top;
            if (this.right > right) this.right = right;
            if (this.bottom > bottom) this.bottom = bottom;
            return true;
        }
        return false;
    }
    return false;
};

/**
 * Computes the intersection of this Rectangle with the
 * specified Rectangle. Returns a new  Rectangle
 * that represents the intersection of the two rectangles.
 * If the two rectangles do not intersect, the result will be
 * an empty rectangle.
 *
 * @param {Rectangle}    r   the specified Rectangle
 * @return    the largest Rectangle contained in both the
 *            specified Rectangle and in
 *            this Rectangle; or if the rectangles
 *            do not intersect, an empty rectangle.
 */
Rectangle.prototype.intersection = function (r) {
    if (r.constructor.name === 'Rectangle') {
        var tx1 = this.left;
        var ty1 = this.top;
        var rx1 = r.left;
        var ry1 = r.top;
        var tx2 = tx1;
        tx2 += this.width;
        var ty2 = ty1;
        ty2 += this.height;
        var rx2 = rx1;
        rx2 += r.width;
        var ry2 = ry1;
        ry2 += r.height;
        if (tx1 < rx1)
            tx1 = rx1;
        if (ty1 < ry1)
            ty1 = ry1;
        if (tx2 > rx2)
            tx2 = rx2;
        if (ty2 > ry2)
            ty2 = ry2;
        tx2 -= tx1;
        ty2 -= ty1;
        // tx2,ty2 will never overflow (they will never be
        // larger than the smallest of the two source w,h)
        // they might underflow, though...
        if (tx2 < Number.MIN_VALUE)
            tx2 = Number.MIN_VALUE;
        if (ty2 < Number.MIN_VALUE)
            ty2 = Number.MIN_VALUE;
        return new Rectangle(tx1, ty1, tx2, ty2);
    }
    return null;
};

/**
 * Computes the union of this Rectangle with the
 * specified Rectangle. Returns a new
 * Rectangle that
 * represents the union of the two rectangles.
 * <p>
 * If either Rectangle has any dimension less than zero
 * the rules for non-existent rectangles
 * apply.
 * If only one has a dimension less than zero, then the result
 * will be a copy of the other {@code Rectangle}.
 * If both have dimension less than zero, then the result will
 * have at least one dimension less than zero.
 * <p>
 * If the resulting Rectangle would have a dimension
 * too large to be expressed as an int, the result
 * will have a dimension of Number.MAX_VALUE along
 * that dimension.
 * @param r the specified Rectangle
 * @return    the smallest Rectangle containing both
 *            the specified Rectangle and this
 *             Rectangle.
 */
Rectangle.prototype.union = function (r) {
    if (r.constructor.name === 'Rectangle') {
        var tx2 = this.width;
        var ty2 = this.height;
        if ((tx2 | ty2) < 0) {
            // This rectangle has negative dimensions...
            // If r has non-negative dimensions then it is the answer.
            // If r is non-existent (has a negative dimension), then both
            // are non-existent and we can return any non-existent rectangle
            // as an answer.  Thus, returning r meets that criterion.
            // Either way, r is our answer.
            return new Rectangle(r);
        }
        var rx2 = r.width;
        var ry2 = r.height;
        if ((rx2 | ry2) < 0) {
            return new Rectangle(this);
        }
        var tx1 = this.left;
        var ty1 = this.top;
        tx2 += tx1;
        ty2 += ty1;
        var rx1 = r.left;
        var ry1 = r.top;
        rx2 += rx1;
        ry2 += ry1;
        if (tx1 > rx1)
            tx1 = rx1;
        if (ty1 > ry1)
            ty1 = ry1;
        if (tx2 < rx2)
            tx2 = rx2;
        if (ty2 < ry2)
            ty2 = ry2;
        tx2 -= tx1;
        ty2 -= ty1;
        // tx2,ty2 will never underflow since both original rectangles
        // were already proven to be non-empty
        // they might overflow, though...
        if (tx2 > Number.MAX_VALUE)
            tx2 = Number.MAX_VALUE;
        if (ty2 > Number.MAX_VALUE)
            ty2 = Number.MAX_VALUE;
        return new Rectangle(tx1, ty1, tx2, ty2);
    }
    return null;
};

Rectangle.prototype.draw = function (canvasId, color, thickness) {

    if (typeof canvasId === "string" && typeof color === "string" && typeof thickness === "number") {
        var canvas = document.getElementById(canvasId);

        var ctx = canvas.getContext("2d");


        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.rect(this.left, this.top, this.width, this.height);
        ctx.stroke();
    } else {
        logger("Invalid Rectangle draw args");
    }


};


Rectangle.prototype.fill = function (canvasId, color, thickness) {

    if (typeof canvasId === "string" && typeof color === "string" && typeof thickness === "number") {
        var canvas = document.getElementById(canvasId);

        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.fillRect(this.left, this.top, this.width, this.height);
        ctx.stroke();
    } else {
        logger("Invalid Rectangle draw args");
    }


};

/**
 * 
 * @param {FloatPoint} center 
 * @param {Number} width
 * @param {Number} height
 * @returns {EllipseModel}
 */
function EllipseModel(center, width, height) {
    if (center && center.constructor.name === 'FloatPoint' && typeof width === 'number' && typeof height === 'number') {
        this.center = center;
        this.size = new Dimension(width, height);
    } else {
        this.center = new FloatPoint(0, 0, 0);
        this.size = new Dimension(0, 0);
    }

    var r = new Rect();
}


/**
 * The largest rectangle that can be inscribed in an ellipse
 * is a rectangle of area 2.a.b where 'a' is the half-length of the major axis and
 * 'b' is the half-length of the minor axis.
 * @return the biggest rectangle that can be inscribed in the ellipse
 */
EllipseModel.prototype.getBiggestRectangle = function () {
    var r = new Rectangle();
    r.x = (this.center.x - 0.5 * this.size.width * Math.sqrt(2));
    r.y = (this.center.y - 0.5 * this.size.height * Math.sqrt(2));
    r.width = (this.size.width * Math.sqrt(2));
    r.height = (this.size.height * Math.sqrt(2));
    return r;
};

EllipseModel.prototype.area = function () {
    return Math.PI * this.size.width * this.size.height;
};



/**
 *
 * @param {Number} y the y coordinate of
 * a given point on an ellipse.
 * @return the 2 possible x coordinates of that point in a number array.
 */
EllipseModel.prototype.getX = function (y) {
    var x = new Array();
    var evalYPart = Math.pow((y - this.center.y) / this.size.height, 2);
    x.push(this.center.x + this.size.width * sqrt(1 - evalYPart));
    x.push(this.center.x - this.size.width * sqrt(1 - evalYPart));
    return x;
};

/**
 *
 * @param {Number} x the x coordinate of
 * a given point on an ellipse.
 * @return the 2 possible y coordinates of that point.
 */
EllipseModel.prototype.getY = function (x) {
    var y = new Array();

    var evalXPart = pow((x - this.center.x) / this.size.width, 2);

    y.push(this.center.y + this.size.height * sqrt(1 - evalXPart));
    y.push(this.center.y - this.size.height * sqrt(1 - evalXPart));

    return y;
};

/**
 *
 * @param {FloatPoint} p the Point to check if or not it lies on the EllipseModel
 * @return true if it lies on the EllipseModel object or deviates from its
 * equation by 1.0E-14 or lesser.
 */
EllipseModel.prototype.isOnEllipse = function (p) {
    var eval = Math.pow(((p.x - this.center.x) / this.size.width), 2) + Math.pow(((p.y - this.center.y) / this.size.height), 2);
    return approxEquals(eval, 1);
};


/**
 * The theory behind this is that for a point to be inside an ellipse, a
 * line that passes through the center of the ellipse and this point will
 * cut the ellipse at 2 points such that the point will lie in between both
 * points.
 *
 * @param {FloatPoint} p the Point object
 * @return true if the Point object is located inside this EllipseModel
 * object.
 */
EllipseModel.prototype.contains = function (p) {
    if (p.constructor.name === 'FloatPoint') {
        var line = new Line(p, this.center);
        var x1 = 0;
        var y1 = 0;
        var x2 = 0;
        var y2 = 0;
        var soln = lineIntersection(line);

        x1 = parseFloat(soln[0]);
        y1 = parseFloat(soln[1]);
        x2 = parseFloat(soln[2]);
        y2 = parseFloat(soln[3]);

        var truly1 = ((x1 <= p.x && x2 >= p.x) || (x2 <= p.x && x1 >= p.x));
        var truly2 = ((y1 <= p.y && y2 >= p.y) || (y2 <= p.y && y1 >= p.y));

        return truly1 && truly2;
    } else {
        return false;
    }
};




/**
 *
 * @param {Line} line the Line object that cuts this EllipseModel
 * @return the possible coordinates of the points where the Line object cuts this EllipseModel object
 * The result is returned in the format:
 * Let the solution array be array[], then:
 *
 * array[0] = x coordinate of the first point;
 * array[1] = y coordinate of the first point;
 * array[2] = x coordinate of the second point;
 * array[3] = y coordinate of the second point;
 *
 * The coordinates are returned as strings
 * to account for complex solutions too.
 *
 * THIS METHOD WILL RETURN A NULL ARRAY AND THROW
 * IF NO INTERSECTION
 * OCCURS.
 */
EllipseModel.prototype.lineIntersection = function (line) {
    if (line.constructor.name === 'Line') {
        var str = new Array();
        var m = line.m;
        var c = line.c;


        var A = pow(this.size.height, 2) + pow(this.size.width * m, 2);
        var B = 2 * (pow(this.size.width, 2) * m * (c - this.center.y) - pow(this.size.height, 2) * this.center.x);
        var C = pow(this.center.x * this.size.height, 2) + pow(this.size.width, 2) * (pow(c - this.center.y, 2) - pow(this.size.height, 2));
        var quad = new Quadratic(A, B, C);
        var str1 = quad.soln();

        try {
            str[0] = str1[0];
            str[1] = str1[1];
            str[2] = String.valueOf(m * parseFloat(str1[0]) + c);
            str[3] = String.valueOf(m * parseFloat(str1[1]) + c);

            var str1 = new Array();

            str1[0].push(str[0]);
            str1[1].push(str[2]);
            str1[2].push(str[1]);
            str1[3].push(str[3]);

        }//end try
        catch (e) {
            str1 = null;
            str = null;
        }//end catch


        return str1;
    }
    return null;
};//end method


/**
 *
 * @param {Line} line The Line object
 * @return true if the EllipseModel object
 * intersects with th Line object.
 */
EllipseModel.prototype.intersectsWithLine = function (line) {
    if (line.constructor.name === 'Line') {
        var intersects = false;
        try {
            var c = lineIntersection(line);
            for (var i = 0; i < c.length; i++) {
                var val = c[i];
                intersects = true;//if a null value is detected, then no intersection occurs.
            }
        } catch (e) {
            intersects = false;
        }
        return intersects;
    }
    return false;
};


/**
 * 
 * @param {EllipseModel} ellipse The EllipseModel object whose size is to
 * be compared with this one.
 * @return true if the parameter EllipseModel object is bigger than this EllipseModel object
 */
EllipseModel.prototype.isBiggerThan = function (ellipse) {
    return this.area() > ellipse.area();
};
/**
 *
 * @param {EllipseModel} ellipse The EllipseModel object whose size is to
 * be compared with this one.
 * @return true if the parameter EllipseModel object is smaller than this EllipseModel object
 */
EllipseModel.prototype.isSmallerThan = function (ellipse) {
    return this.area() < ellipse.area();
};
/**
 * Returns true if their areas deviate by 1.0E-14 or lesser.
 * @param {EllipseModel} ellipse the EllipseModel object whose size is to be compared with this EllipseModel object.
 * @return true if their sizes are the same or deviate by 1.0E-14 or lesser
 */
EllipseModel.prototype.hasAlmostSameSizeAs = function (ellipse) {
    return approxEquals(this.area(), ellipse.area());
};
/**
 * Returns true if their areas are exactly equal.
 * This method can be tricky at times and may produce slight errors if
 * truncation errors have occured or rounding errors.
 * YOU CAN USE METHOD hasAlmostSameSizeAs to reduce this likelihood.
 * That method will still return true for deviations of 1.0E-14 and lesser.
 * @param {EllipseModel} ellipse the EllipseModel object whose size is to be compared with this EllipseModel object.
 * @return true if their areas are exactly equal.
 */
EllipseModel.prototype.hasSameSizeAs = function (ellipse) {
    return this.area() === ellipse.area();
};




/**
 *
 * @param {Rectangle} rect The rectangle
 * @return an array of FloatPoint objects
 * constituting the points of intersection between this
 * EllipseModel object and the rectangle.
 */
EllipseModel.prototype.intersection = function (rect) {
    var pt = new FloatPoint(rect.x, rect.y);
    var rectSize = rect.getSize();
    var A = pt.x;
    var B = pt.y;
    var h = this.center.x;
    var k = this.center.y;
    var W = rectSize.width;
    var H = rectSize.height;
    var a = getWidth();
    var b = getHeight();


    var pts = new Array();
    var p1 = new Array(new FloatPoint(), new FloatPoint());//intersection of the top line of the rectangle with the ellipse
    var p2 = new Array(new FloatPoint(), new FloatPoint());//intersection of the bottom line  of the rectangle with the ellipse
    var p3 = new Array(new FloatPoint(), new FloatPoint());//intersection of the left line  of the rectangle with the ellipse
    var p4 = new Array(new FloatPoint(), new FloatPoint()); //intersection of the right line  of the rectangle with the ellipse
    var val = 0;

    try {
        val = a * sqrt(1 - pow((B - k) / b, 2));
        p1[0].x = (h + val);
        p1[0].y = (B);
        p1[1].x = (h - val);
        p1[1].y = (B);
        if (p1[0] !== null && !Number.isNaN(p1[0].x) && !Number.isNaN(p1[0].y)) {
            pts.add(p1[0]);
        }
        if (p1[1] !== null && !Number.isNaN(p1[1].x) && !Number.isNaN(p1[1].y)) {
            pts.add(p1[1]);
        }
    } catch (e) {

    }

    try {
        val = a * Math.sqrt(1 - pow((B + H - k) / b, 2));
        p2[0].x = (h + val);
        p2[0].y = (B + H);
        p2[1].x = (h - val);
        p2[1].y = (B + H);
        if (p2[0] !== null && !Number.isNaN(p2[0].x) && !Number.isNaN(p2[0].y)) {
            pts.add(p2[0]);
        }
        if (p2[1] !== null && !Number.isNaN(p2[1].x) && !Number.isNaN(p2[1].y)) {
            pts.add(p2[1]);
        }
    } catch (ex) {

    }

    try {
        val = b * Math.sqrt(1 - pow((A - h) / a, 2));
        p3[0].x = A;
        p3[0].y = k + val;
        p3[1].x = A;
        p3[1].y = k - val;
        if (p3[0] !== null && !Number.isNaN(p3[0].x) && !Number.isNaN(p3[0].y)) {
            pts.add(p3[0]);
        }
        if (p3[1] !== null && !Number.isNaN(p3[1].x) && !Number.isNaN(p3[1].y)) {
            pts.add(p3[1]);
        }
    } catch (arit) {

    }

    try {
        val = b * sqrt(1 - pow((A + W - h) / a, 2));
        p4[0].x = (A + W);
        p4[0].y = (k + val);
        p4[1].x = (A + W);
        p4[1].y = (k - val);
        if (p4[0] !== null && !Number.isNaN(p4[0].x) && !Number.isNaN(p4[0].y)) {
            pts.add(p4[0]);
        }
        if (p4[1] !== null && !Number.isNaN(p4[1].x) && !Number.isNaN(p4[1].y)) {
            pts.add(p4[1]);
        }
    } catch (arit1) {

    }



    return pts;
};

/**
 *
 * @param {Rectangle} rect The intersecting rectangle
 * @return true if the rectangle intersects with this Ellipse object.
 */
EllipseModel.prototype.intersectsWith = function (rect) {
    var pt = new FloatPoint(rect.x, rect.y);
    var rectSize = rect.getSize();
    var A = pt.x;
    var B = pt.y;
    var h = getXCenter();
    var k = getYCenter();
    var W = rectSize.getWidth();
    var H = rectSize.height;
    var a = getWidth();
    var b = getHeight();


    var p1 = new Array(new FloatPoint(), new FloatPoint());//intersection of the top line of the rectangle with the ellipse
    var p2 = new Array(new FloatPoint(), new FloatPoint());//intersection of the bottom line  of the rectangle with the ellipse
    var p3 = new Array(new FloatPoint(), new FloatPoint());//intersection of the left line  of the rectangle with the ellipse
    var p4 = new Array(new FloatPoint(), new FloatPoint()); //intersection of the right line  of the rectangle with the ellipse
    var val = 0;
    var intersects1 = false;
    var intersects2 = false;
    var intersects3 = false;
    var intersects4 = false;

    try {
        val = a * Math.sqrt(1 - pow((B - k) / b, 2));
        p1[0].x = (h + val);
        p1[0].y = (B);
        p1[1].x = (h - val);
        p1[1].y = (B);
        if ((rect.containsPoint(p1[0].x, p1[0].y) && this.contains(p1[0])) ||
                (rect.containsPoint(p1[1].x, p1[1].y) && this.contains(p1[1]))) {
            intersects1 = true;
        }
    } catch (arit) {

    }

    try {
        val = a * Math.sqrt(1 - pow((B + H - k) / b, 2));
        p2[0].x = (h + val);
        p2[0].y = (B + H);
        p2[1].x = (h - val);
        p2[1].y = (B + H);
        if ((rect.containsPoint(p2[0].x, p2[0].y) && this.contains(p2[0])) ||
                (rect.containsPoint(p2[1].x, p2[1].y) && this.contains(p2[1]))) {
            intersects2 = true;
        }
    } catch (arit) {

    }

    try {
        val = b * Math.sqrt(1 - pow((A - h) / a, 2));
        p3[0].x = (A);
        p3[0].y = (k + val);
        p3[1].x = (A);
        p3[1].y = (k - val);
        if ((rect.containsPoint(p3[0].x, p3[0].y) && this.contains(p3[0])) ||
                (rect.containsPoint(p3[1].x, p3[1].y) && this.contains(p3[1]))) {
            intersects3 = true;
        }
    } catch (arit) {

    }

    try {
        val = b * Math.sqrt(1 - pow((A + W - h) / a, 2));
        p4[0].x = (A + W);
        p4[0].y = (k + val);
        p4[1].x = (A + W);
        p4[1].y = (k - val);
        if ((rect.containsPoint(p4[0].x, p4[0].y) && this.contains(p4[0])) ||
                (rect.containsPoint(p4[1].x, p4[1].y) && this.contains(p4[1]))) {
            intersects4 = true;
        }
    } catch (arit) {

    }



    return intersects1 || intersects2 || intersects3 || intersects4;
};



/**
 *
 * @param {EllipseModel} ellipse The EllipseModel object.
 * @return true if this object intersects with or is contained within the
 * given EllipseModel object and vice versa.
 */
EllipseModel.prototype.intersectsWith = function (ellipse) {

    var line = new Line(this.center, ellipse.center);

//The 2 centers coincide
    if (this.center.equals(ellipse.center)) {
        return true;
    }

//String soln[] = this.lineIntersection(line);

    var otherSoln = ellipse.lineIntersection(line);
    try {
//Point p1 = new Point( Double.valueOf(soln[0]) , Double.valueOf(soln[1]) );
//Point p2 = new Point( Double.valueOf(soln[2]) , Double.valueOf(soln[3]) );

        var p3 = new FloatPoint(parseFloat(otherSoln[0]), parseFloat(otherSoln[1]));
        var p4 = new FloatPoint(parseFloat(otherSoln[2]), parseFloat(otherSoln[3]));

        if ((this.contains(p3) || this.contains(p4))) {
            return true;
        }//end if
        else {
            return false;
        }
    }//end try
    catch (num) {
        return false;
    }//end catch

};//end method




function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHEX(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRGB(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


// Using Math.round() will give you a non-uniform distribution!
function randomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function Random() {

}

Random.prototype.nextInt = function (max) {
    return randomInt(0, max - 1);
};

Random.prototype.nextBool = function () {
    return randomInt(0, 1) === 1;
};

Random.prototype.generateUUID = function () { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};



/**
 * 
 * @returns {Number}
 */
function oneDegInRads() {
    return (Math.PI / 180.0);
}
/**
 * 
 * @param {type} angdeg
 * @returns {Number}
 */
function angDegToRads(angdeg) {
    return (angdeg * Math.PI / 180.0);
}
/**
 * 
 * @param {type} angrad
 * @returns {Number}
 */
function angRadToDegs(angrad) {
    return (180 * angrad / Math.PI);
}



/**
 * 
 * @param num1 The first number
 * @param num2 The second number
 * @return true if the two numbers are equal.
 */
function equals(num1, num2) {
    return Math.abs(Math.abs(num1) - Math.abs(num2)) <= 1.0E-10;
}



function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

let getTextSize = function (text, font) {
    if (typeof text === 'string') {
        if (text.length === 0) {
            return new Rectangle(0, 0, 0, 0);
        }
        let cv = document.createElement('canvas');

        cv.width = 1024;
        cv.height = 190;
        cv.style.width = cv.width + 'px';
        cv.style.height = cv.height + 'px';
        document.body.appendChild(cv);

        let gg = new Graphics(cv);
        gg.ctx.font = font;

        gg.setBackground('#000');
        gg.drawString(text, 10, cv.height / 2);

        let rect = gg.getBoundingBox();
        cv.remove();
        gg.clear();
        gg.destroy();
        gg = null;
        return rect;
    }

    return null;
};