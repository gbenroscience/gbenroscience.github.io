/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global FontStyle, CssSizeUnits */

const DEBUG = true;
// The default width and height of an auto-generated canvas to e used for the clock
const DEFAULT_SIZE = 150;

function logger(txt) {
    if (DEBUG === true) {
        console.log(txt);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//clock code here












var win = window,
        doc = document,
        docElem = doc.documentElement,
        body = doc.getElementsByTagName('body')[0],
        screenWidth = win.innerWidth || docElem.clientWidth || body.clientWidth,
        screenHeight = win.innerHeight || docElem.clientHeight || body.clientHeight;

const HandType = {
    HOURHAND: "hour",
    MINUTEHAND: "minute",
    SECONDHAND: "second"
};



const ALARM_DURATION_IN_MINUTES = 1;


const SHOW_MAIN = 1;
const SHOW_FIRST = 2;
const SHOW_SECOND = 3;
const SHOW_ALARM_NOTIF = 4;

const choiceMaker = new Random();

const REFRESH_RATE = 700;
const ALARM_REFRESH_RATE = 150;
const MOVE_NONE = -1;
const MOVE_AWAY = -2;
const MOVE_LEFT = 0;
const MOVE_RIGHT = 1;
const MOVE_UP = 2;
const MOVE_DOWN = 3;
const MOVE_UP_HOR_LEFT = 4;
const MOVE_UP_HOR_RIGHT = 5;
const MOVE_DOWN_HOR_LEFT = 6;
const MOVE_DOWN_HOR_RIGHT = 7;
var DYNAMIC_BASE_TEXT = new DynamicBaseText(SHOW_MAIN);




function AlarmMonitor() {
    this.busy = false;
}


AlarmMonitor.prototype.checkAlarm = function (clock) {

    if (!this.busy) {
        this.busy = true;
        var thisObj = this;
        window.setTimeout(function () {
            clock.fireAlarm();
            thisObj.busy = false;
        }, REFRESH_RATE);

    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * 
 * @param {HandType} handType
 * @param {Number} handLengthAsFractionOfClockWidth
 * @param {Number} angle
 * @param {String} color
 * @returns {ClockHand}
 */
function ClockHand(handType, handLengthAsFractionOfClockWidth, angle, color) {

    /**
     * The type of the hand:Hour, Minute or Second
     */
    this.handType = handType;
    /**
     * Expresses the length of the clock hand as a fraction of the clock's inner
     * circle diameter.
     */
    this.handLengthAsFractionOfClockWidth = (handLengthAsFractionOfClockWidth <= 1) ? handLengthAsFractionOfClockWidth : 0.9;
    /**
     * The angle subtended by the hand at the center.
     */
    this.angle = angle;
    /**
     * The color used to draw the hand.
     */
    this.color = color;

}

ClockHand.prototype.setHandLengthAsFractionOfClockWidth = function (handLengthAsFractionOfClockWidth) {
    this.handLengthAsFractionOfClockWidth = (handLengthAsFractionOfClockWidth <= 1) ? handLengthAsFractionOfClockWidth : 0.9;
};

/**
 * 
 * @param {type} clockFrame The clock
 * @returns {Number}
 */
ClockHand.prototype.handLength = function (clockFrame) {
    return this.handLengthAsFractionOfClockWidth * clockFrame.getInnerCircleDimension() / 2;
};

/**
 * 
 * @param {Clock} clockFrame The ClockFrame object that has this ClockHand object
 * @returns {Number} The angle at the vertex of this ClockHand object (ClockHand
 * objects display as a filled isosceles triangle).
 */
ClockHand.prototype.vertexAngle = function (clockFrame) {
    var tanAng = (2 * this.handLength(clockFrame) / clockFrame.getCenterSpotWidth());
    return 2.0 * ((Math.PI / 2.0) - Math.atan(tanAng));
};




/**
 * 
 * @param {Clock} clockFrame he ClockFrame object that has this ClockHand object
 * @returns {Number}  Any of the base angles of this ClockHand object (ClockHand
 * objects display as a filled isosceles triangle).
 */
ClockHand.prototype.baseAngle = function (clockFrame) {
    var vertexAngle = this.vertexAngle(clockFrame);
    return (Math.PI - vertexAngle) / 2.0;
};


/**
 * 
 * @param {type} clockFrame The ClockFrame object that has this ClockHand object
 * @returns {Number} Any of the base angles of this ClockHand object (ClockHand
 * objects display as a filled isosceles triangle).
 */
ClockHand.prototype.baseAngle = function (clockFrame) {
    var vertexAngle = this.vertexAngle(clockFrame);
    return (Math.PI - vertexAngle) / 2.0;
};

/**
 * 
 * @param {Clock} clockFrame The ClockFrame object that has this ClockHand object
 * @returns {Number}  the length of the 2 equal sides of this ClockHand object.
 */
ClockHand.prototype.equalSideLength = function (clockFrame) {
    return this.handLength(clockFrame) / Math.sin(this.baseAngle(clockFrame));
};


/**
 * 
 * @param {Clock} clockFrame The ClockFrame object that has this ClockHand object
 * @returns {Point} the Point at the upper tip of this ClockHand object
 */
ClockHand.prototype.handTopTipCoords = function (clockFrame) {
    var d = this.handLength(clockFrame);
    var cen = clockFrame.getCenter();
    var cenX = cen.x;
    var cenY = cen.y;
    return new Point((cenX + d * Math.cos(this.angle)), (cenY - d * Math.sin(this.angle)));
};

/**
 * 
 * @param {Clock} clockFrame The ClockFrame object that has this ClockHand object
 * @returns {Point} the Point at the tip of the left base of this ClockHand object
 */
ClockHand.prototype.leftTipCoords = function (clockFrame) {
    var baseAngle = this.baseAngle(clockFrame);
    var ang = baseAngle - ((Math.PI / 2.0) - this.angle);
    var sideLength = this.equalSideLength(clockFrame);
    var xDispFromHandTip = (sideLength * Math.cos(ang));
    var yDispFromHandTip = (sideLength * Math.sin(ang));

    var handTopTipCoords = this.handTopTipCoords(clockFrame);

    return new Point(handTopTipCoords.x - (xDispFromHandTip), handTopTipCoords.y + yDispFromHandTip);
};

/**
 *
 * @param clockFrame The ClockFrame object that has this ClockHand object
 * @return the Point at the tip of the right base of this ClockHand object
 */

ClockHand.prototype.rightTipCoords = function (clockFrame) {
    var baseAngle = this.baseAngle(clockFrame);
    var ang = (Math.PI / 2.0) + this.angle - baseAngle;
    var sideLength = this.equalSideLength(clockFrame);
    var xDispFromHandTip = (sideLength * Math.cos(ang));
    var yDispFromHandTip = (sideLength * Math.sin(ang));

    var handTopTipCoords = this.handTopTipCoords(clockFrame);

    return new Point(handTopTipCoords.x - (xDispFromHandTip), handTopTipCoords.y + yDispFromHandTip);
};



/**
 * 
 * @param {type} clockFrame The ClockFrame object that has this ClockHand object
 * @returns {Point}
 */
ClockHand.prototype.centralCoords = function (clockFrame) {
    return clockFrame.getCenter();
};


ClockHand.prototype.tellTime = function () {

    switch (handType) {

        case HandType.HOURHAND:
            return this.getSystemHour();
        case HandType.MINUTEHAND:
            return this.getSystemMinutes();
        case HandType.SECONDHAND:
            return this.getSystemSeconds();

        default:

            break;

    }
    return -1;
};

/**
 *
 * @return the seconds portion of the system time
 */
ClockHand.prototype.getSystemSeconds = function () {
    var date = new Date();
    let second = date.getSeconds();

    return second < 59 ? second + 1 : 0;
};

/**
 *
 * @return the minutes portion of the system time
 */
ClockHand.prototype.getSystemMinutes = function () {

    var date = new Date();

    return date.getMinutes();
};

/**
 *
 * @return the hour portion of the system time
 */
ClockHand.prototype.getSystemHour = function () {

    var date = new Date();

    return date.getHours();
};

/**
 *
 * @return the equivalent angle in rads that the seconds hand must subtend
 * at the horizontal for a given seconds time.
 */
ClockHand.prototype.getAngleFromSeconds = function () {
    return this.angle = (0.5 * Math.PI) * (1 - (this.getSystemSeconds() / 15.0));
};

/**
 *
 * @return the equivalent angle in rads that the minutes hand must subtend
 * at the horizontal for a given minutes time.
 */
ClockHand.prototype.getAngleFromMinutes = function () {
    return this.angle = (0.5 * Math.PI) * (1 - (this.getSystemMinutes() / 15.0));
};

/**
 *
 * @return the equivalent angle in rads that the minutes hand must subtend
 * at the horizontal for a given minutes time.
 */
ClockHand.prototype.getAngleFromHours = function () {
    return this.angle = ((0.5 * Math.PI) * (1 - (this.getSystemHour() / 3.0))) - this.getSystemMinutes() * (Math.PI / 360.0);
};

/**
 *
 * @return the angle relevant to each ClockHand Type
 */
ClockHand.prototype.getAngleForEachState = function () {
    if (this.handType === HandType.SECONDHAND) {
        return this.getAngleFromSeconds();
    } else if (this.handType === HandType.MINUTEHAND) {
        return this.getAngleFromMinutes();
    } else {
        return this.getAngleFromHours();
    }
};



ClockHand.prototype.draw = function (g, clockFrame) {

    var cen = this.centralCoords(clockFrame);
    var topTip = this.handTopTipCoords(clockFrame);
    var leftTip = this.leftTipCoords(clockFrame);
    var rightTip = this.rightTipCoords(clockFrame);

    g.setColor(this.color);

    g.drawLine(topTip.x, topTip.y, leftTip.x, leftTip.y);
    g.drawLine(topTip.x, topTip.y, cen.x, cen.y);
    g.drawLine(topTip.x, topTip.y, rightTip.x, rightTip.y);
    g.drawLine(leftTip.x, leftTip.y, rightTip.x, rightTip.y);

};


ClockHand.prototype.fill = function (g, clockFrame) {
    var cen = this.centralCoords(clockFrame);
    var topTip = this.handTopTipCoords(clockFrame);
    var leftTip = this.leftTipCoords(clockFrame);
    var rightTip = this.rightTipCoords(clockFrame);

    g.setColor(this.color);

    g.drawLine(topTip.x, topTip.y, leftTip.x, leftTip.y);
    g.drawLine(topTip.x, topTip.y, cen.x, cen.y);
    g.drawLine(topTip.x, topTip.y, rightTip.x, rightTip.y);
    g.drawLine(leftTip.x, leftTip.y, rightTip.x, rightTip.y);

    let p = new Polygon([],[],0);
    p.addPoint(leftTip.x, leftTip.y);
    p.addPoint(topTip.x, topTip.y);
    p.addPoint(rightTip.x, rightTip.y);
    p.addPoint(cen.x, cen.y);
    p.addPoint(leftTip.x, leftTip.y);
    g.setBackground(this.color);
    g.fillPolygon(p);
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




const mainText = "By gbenroscience";
function DynamicBaseText(state) {
    if (typeof state !== 'number') {
        logger("`state` must be a number type");
        return;
    }
    this.state = state;

    this.textGroup = new Array("Clock written", "in Native JS");

    this.alarmTextGroup = new Array();

    this.counter = 0;


}

DynamicBaseText.prototype.setState = function (state) {
    this.counter = 0;
    this.state = state;
};


DynamicBaseText.prototype.control = function () {

    var countDelayForMainText = 12 + new Random().nextInt(5);
    var countDelayForOtherText = 2;

    const countDelayForAlarmText = 2;

    switch (this.state) {

        case SHOW_MAIN:

            if (this.counter < countDelayForMainText) {
                ++this.counter;

                return mainText;
            } else {
                this.counter = 0;
                this.state = SHOW_FIRST;
                return this.textGroup[0];
            }

        case SHOW_FIRST:
            if (this.counter < countDelayForOtherText) {
                ++this.counter;

                return this.textGroup[0];
            } else {
                this.counter = 0;
                this.state = SHOW_SECOND;
                return this.textGroup[1];
            }
        case SHOW_SECOND:
            if (this.counter < countDelayForOtherText) {
                ++this.counter;

                return this.textGroup[1];
            } else {
                this.counter = 0;
                this.state = SHOW_MAIN;
                return mainText;
            }

        case SHOW_ALARM_NOTIF:
            if (this.counter < this.alarmTextGroup.size()) {
                return this.alarmTextGroup.get(counter++);
            } else {
                this.counter = 0;
                return this.alarmTextGroup.get(counter++);
            }

        default:

            return mainText;
    }

};

DynamicBaseText.prototype.scan = function (alarm) {
    this.setState(SHOW_ALARM_NOTIF);
    var message = alarm.description;
    const re = /\s/;
    this.alarmTextGroup = message.split(re);
    this.alarmTextGroup.add(alarm.getFriendlyTime());
};

DynamicBaseText.prototype.shutdownAlarmState = function () {
    this.setState(SHOW_MAIN);
    this.alarmTextGroup = new Array();
};

/**
 * Actually, it is the center of the clock
 * @param {Number} fractionOfLineShowing The fraction of the line that will be displayed
 * @param {Number} angle The angle this line will subtend at the center, measured with respect to the 3.0.clock angle i.e 0 degs.
 * @param {string} color The color of the line
 * @param {Number} thickness The thickness of the Tick.
 * @param {Boolean} majorTick If true this tick is a major or a bold or longer one
 * @returns {Tick}
 */
function Tick(fractionOfLineShowing, angle, color, thickness, majorTick) {
    this.fractionOfLineShowing = fractionOfLineShowing;
    this.angle = angle;
    this.color = color;
    this.thickness = thickness;
    this.majorTick = majorTick;
}

/**
 *
 * @param clock The clock that owns the tick
 * @return {Point} the coordinates of the beginning of the tick
 */
Tick.prototype.getTickStartPoint = function (clock) {

    var radius = clock.getInnerCircleDimension() / 2.0;
    var stop = clock.getCenter();
    var xEnd = (stop.x + radius * Math.cos(this.angle));
    var yEnd = stop.y - (radius * Math.sin(this.angle));

    return new Point(xEnd, yEnd);
};

/**
 *
 * @param clock The clock that owns the tick
 * @return {Point} the coordinates of the end of the tick
 */
Tick.prototype.getTickEndPoint = function (clock) {
    var start = this.getTickStartPoint(clock);
    var radius = clock.getInnerCircleDimension() / 2.0;
    //len is the distance between the starting point and the stop
    //point on the circumference. It is actually the length of the tick
    //modeled by the line.
    var len = this.fractionOfLineShowing * radius;

    return new Point((start.x - len * Math.cos(this.angle)), start.y + (len * Math.sin(this.angle)));
};




/**
 *
 * @return the number associated with each major tick;
 */
Tick.prototype.getTickValue = function () {
    if (this.angle === 0) {
        return "3";
    } else if (equals(angRadToDegs(angle), 30.0)) {
        return "2";
    } else if (equals(angRadToDegs(angle), 60.0)) {
        return "1";
    } else if (equals(angRadToDegs(angle), 90.0)) {
        return "12";
    } else if (equals(angRadToDegs(angle), 120.0)) {
        return "11";
    } else if (equals(angRadToDegs(angle), 150.0)) {
        return "10";
    } else if (equals(angRadToDegs(angle), 180.0)) {
        return "9";
    } else if (equals(angRadToDegs(angle), 210.0)) {
        return "8";
    } else if (equals(angRadToDegs(angle), 240.0)) {
        return "7";
    } else if (equals(angRadToDegs(angle), 270.0)) {
        return "6";
    } else if (equals(angRadToDegs(angle), 300.0)) {
        return "5";
    } else if (equals(angRadToDegs(angle), 330.0)) {
        return "4";
    } else {
        return "";
    }

};



/**
 *
 * @param g The graphics if the clock.
 * @param clock The clock that owns the tick
 */
Tick.prototype.draw = function (g, clock) {

    var fontSz = clock.getTextFontSize();



    if (clock.tickTextFont === null) {//italic bold 10pt Courier
        clock.tickTextFont = new Font(FontStyle.BOLD_ITALIC, fontSz, 'Gothic', CssSizeUnits.EM);
    }
    if (clock.topTextFont === null) {
        clock.topTextFont = new Font(FontStyle.BOLD, fontSz, 'Times New Roman', CssSizeUnits.EM);
    }
    if (clock.bottomTextFont === null) {
        clock.bottomTextFont = new Font(FontStyle.BOLD, fontSz, 'Times New Roman', CssSizeUnits.EM);
    }

    clock.tickTextFont.size = fontSz;
    clock.topTextFont.size = fontSz;
    clock.bottomTextFont.size = fontSz;


    g.setColor(this.color);
    var begin = this.getTickStartPoint(clock);
    var end = this.getTickEndPoint(clock);
    g.setFont(clock.tickTextFont);


    g.setStrokeWidth(this.thickness);

    g.drawLine(begin.x, begin.y, end.x, end.y);

    g.setBackground(this.color);
    var tickVal = this.getTickValue();
    if (tickVal === "12") {
        g.drawString(tickVal, end.x - 7, end.y + 9);
    }
    switch (tickVal) {
        case "1":
        case "2":
            g.drawString(tickVal, end.x - 10, end.y + 6);
            break;
        case "3":
            g.drawString(tickVal, end.x - 10, end.y + 3);
            break;
        case "4":
        case "5":
            g.drawString(tickVal, end.x - 10, end.y);
            break;
        case "6":
            g.drawString(tickVal, end.x - 4, end.y - 2);
            break;
        case "7":
            g.drawString(tickVal, end.x, end.y - 1);
            break;
        case "8":
            g.drawString(tickVal, end.x + 2, end.y);
            break;
        case "9":
            g.drawString(tickVal, end.x + 5, end.y + 3);
            break;
        case "10":
            g.drawString(tickVal, end.x + 2, end.y + 2);
            break;
        case "11":
            g.drawString(tickVal, end.x + 2, end.y + 4);
            break;
        default:
            break;
    }

    if (tickVal === "12") {
        g.setColor("#444");
        var pt = clock.getCenter();
        var dim = clock.getInnerCircleDimension();
        var f = clock.topTextFont;
        var str = "DIGITAL";
        var strWid = g.stringWidth(str);
        g.setFont(f);

        g.drawString(str, (clock.diameter - strWid) / 2, end.y + dim / 6);
    }
    if (tickVal === "6") {
        if (clock.showBaseText === true) {
            var pt = clock.getCenter();
            var dim = clock.getInnerCircleDimension();
            var f = clock.bottomTextFont;
            var str = DYNAMIC_BASE_TEXT.control();
            var strWid = g.stringWidth(str);
            g.setFont(f);
            g.setColor("884");

            g.drawString(str, (clock.diameter - strWid) / 2, pt.y + dim / 4);
        }
    }

};

/**
 *
 * @return the number associated with each major tick;
 */
Tick.prototype.getTickValue = function () {
    if (this.angle === 0) {
        return "3";
    } else if (equals(angRadToDegs(this.angle), 30.0)) {
        return "2";
    } else if (equals(angRadToDegs(this.angle), 60.0)) {
        return "1";
    } else if (equals(angRadToDegs(this.angle), 90.0)) {
        return "12";
    } else if (equals(angRadToDegs(this.angle), 120.0)) {
        return "11";
    } else if (equals(angRadToDegs(this.angle), 150.0)) {
        return "10";
    } else if (equals(angRadToDegs(this.angle), 180.0)) {
        return "9";
    } else if (equals(angRadToDegs(this.angle), 210.0)) {
        return "8";
    } else if (equals(angRadToDegs(this.angle), 240.0)) {
        return "7";
    } else if (equals(angRadToDegs(this.angle), 270.0)) {
        return "6";
    } else if (equals(angRadToDegs(this.angle), 300.0)) {
        return "5";
    } else if (equals(angRadToDegs(this.angle), 330.0)) {
        return "4";
    } else {
        return "";
    }

};





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








function BubbleMetrics() {
    this.lines = new Array();
    /**
     * The box into which the text is inscribed.
     */
    this.textBoxRect = new Rectangle(0, 0, 0, 0);
    this.textHeight = 0;
    this.verticalWordSpacing = 0;
}


/**
 * @param {Clock} clock The clock that this Bubble belongs to. 
 * @param {string} notification The notification text
 * @param {Point} location The location of the Bubble
 * @param {Number} horSpeed The horizontal component of the speed
 * @param {Number} verSpeed The vertical component of the speed
 * @returns {undefined}
 */
function Bubble(clock, notification, location, horSpeed, verSpeed) {


    if (typeof notification !== 'string') {
        logger("`notification` must be a `string` variable");
        return;
    }

    if (location.constructor.name !== 'Point') {
        logger("`location` must be a `Point` object");
        return;
    }

    if (typeof horSpeed !== 'number') {
        logger("`horSpeed` must be a `number`");
        return;
    }

    if (typeof verSpeed !== 'number') {
        logger("`verSpeed` must be a `number`");
        return;
    }


    this.width = 0;
    this.height = 0;
    this.notification = "";
    this.visible = true;

    /**
     * If true, this needs be garbage collected.
     */
    this.garbage = false;

    /**
     * Move within box boundary.
     */
    this.moveInBox = true;
    /**
     * If true, some critical property got changed, so re-setup the dimensions
     * of the object.
     */
    this.propertyChanged = true;
    /**
     * The horizontal speed.
     */
    this.horSpeed = 1;
    /**
     * The vertical speed.
     */
    this.verSpeed = 1;

    this.metrics = new BubbleMetrics();

    this.direction = MOVE_RIGHT;
    this.location = new Point();

    if (typeof notification !== 'string' || location.constructor.name !== 'Point' || typeof horSpeed !== 'number' || typeof verSpeed !== 'number') {
        this.notification = "";
        this.horSpeed = 0;
        this.verSpeed = 0;
        return;
    }
    this.notification = notification;
    this.location = location;
    this.horSpeed = horSpeed;
    this.verSpeed = verSpeed;
    this.setup(clock);
}

Bubble.prototype.getFont = function (clock) {

    if (clock.constructor.name === 'Clock') {
        var fontSz = clock.getTextFontSize();

        var alarmFontSz = (0.85 * fontSz);
        var alarmTextFont = new Font(FontStyle.REGULAR, alarmFontSz, "Times New Roman", CssSizeUnits.EM);
        return alarmTextFont;
    }


    return null;
};

Bubble.prototype.setup = function (clock) {
    var ctx = clock.canvas.getContext('2d');

    ctx.font = this.getFont(clock).string();

    var lines = getLinesByMaxWidthAlgorithm(this.notification, ctx, this.width);

    var maxWidth = 0;
    var indexOfMaxWidth = 0;
    var numOfLines = lines.length;

    for (var l in lines) {
        var newWidth = l.width;
        if (newWidth > maxWidth) {
            maxWidth = newWidth;
        }
    }

    var verticalWordSpacing = 4;
    var textHeight = ctx.measureText("M").width;
    var w = maxWidth + 2 * verticalWordSpacing;
    var h = numOfLines * textHeight + (numOfLines + 1) * verticalWordSpacing;


    /**
     * Now w and h are the widths and heights for the maximum inscribed 
     * rectangles in the bubble's ellipse.
     * 
     * To get the size of the ellipse itself, since w = a.sqrt(2),(where w = length of the rectangle and a is the half length of its major axis)
     * then the full width of the ellipse of the bubble...(i.e twice its major half length) is 2*a = 2.w/sqrt(2) = w.sqrt(2)
     * 
     * Also, since h = b.sqrt(2),(where h = breadth of the rectangle and b is the half length of its minor axis)
     * then the full height of the ellipse of the bubble...(i.e twice its minor half length) is is 2*b = 2.h/sqrt(2) = h.sqrt(2)
     * 
     * We will apply some padding between the text and the bubble though and we will make it equal to the vertical word spacing
     */



    this.width = ((w + 2 * verticalWordSpacing) * Math.sqrt(2));
    this.height = ((h + 2 * verticalWordSpacing) * Math.sqrt(2));


    this.metrics.lines = lines;
    this.metrics.textHeight = textHeight;
    this.metrics.verticalWordSpacing = verticalWordSpacing;

    this.metrics.textBoxRect = this.getBiggestInscribedRect();


};

Bubble.prototype.getBiggestInscribedRect = function () {
    var model = new EllipseModel(this.width / 2, this.height / 2, this.width / 2, this.height / 2);
    return model.getBiggestRectangle();
};

Bubble.prototype.getRight = function () {
    return this.location.x + width;
};

Bubble.prototype.getBottom = function () {
    return this.location.y + height;
};

//Not used in Java version, might be removed
Bubble.prototype.intersects = function (s) {
    var modelEllipse = new EllipseModel(this.location.x + this.width / 2, this.location.y + this.height / 2, this.width / 2, this.height / 2);
    return modelEllipse.intersectsWith(s.getBoundingRect());
};

Bubble.prototype.chooseDirection = function () {
    var dir = 0;
    while ((dir = choiceMaker.nextInt(MOVE_DOWN_HOR_RIGHT + 1)) === this.direction) {
    }
    this.direction = dir;
};

Bubble.prototype.move = function (c) {

    if (visible) {

        var xSpeed = horSpeed + Tick.choiceMaker.nextInt(horSpeed);

        var ySpeed = verSpeed + Tick.choiceMaker.nextInt(verSpeed);

        var dx = c.location.x - this.location.x;
        var dy = c.location.y - this.location.y;

        var dist = Math.sqrt(dx * dx + dy * dy);

        logger("[horSpeed , verSpeed , direction] = [" + horSpeed + " , " + verSpeed + " , " + direction + "]");

        if (this.moveInBox) {

            switch (this.direction) {

                case MOVE_AWAY:

                    if (this.location.x > 0) {
                        this.location.x -= 2 * xSpeed;
                        if (c.location.x > this.location.x && dist > 2 * this.width) {
                            this.garbage = true;
                        }
                    } else {
                        this.location.x = 0;
                        this.chooseDirection();
                    }

                    break;
                case MOVE_LEFT:
                    if (this.location.x > 0) {
                        this.location.x -= xSpeed;
                    } else {
                        this.location.x = 0;
                        this.chooseDirection();
                    }

                    break;
                case MOVE_RIGHT:
                    if (this.getRight() < c.getDiameter()) {
                        this.location.x += xSpeed;
                    } else {
                        this.location.x = c.getDiameter() - this.width;
                        this.chooseDirection();
                    }

                    break;
                case MOVE_UP:
                    if (this.location.y > 0) {
                        this.location.y -= ySpeed;
                    } else {
                        this.location.y = 0;
                        this.chooseDirection();
                    }

                    break;
                case MOVE_DOWN:

                    if (this.getBottom() < c.getDiameter()) {
                        this.location.y += ySpeed;
                    } else {
                        this.location.y = c.getDiameter() - this.height;
                        this.chooseDirection();
                    }

                    break;

                case MOVE_DOWN_HOR_LEFT:

                    if (this.location.x > 0) {
                        this.location.x -= xSpeed;
                    } else {
                        this.location.x = 0;
                        this.direction = MOVE_DOWN_HOR_RIGHT;
                    }

                    if (this.getBottom() < c.getDiameter()) {
                        this.location.y += ySpeed;
                    } else {
                        this.location.y = c.getDiameter() - this.height;
                        this.direction = MOVE_UP_HOR_LEFT;
                    }

                    break;
                case MOVE_DOWN_HOR_RIGHT:

                    if (this.getRight() < c.getDiameter()) {
                        this.location.x += xSpeed;
                    } else {
                        this.location.x = c.getDiameter() - this.width;
                        direction = MOVE_DOWN_HOR_LEFT;
                    }

                    if (this.getBottom() < c.getDiameter()) {
                        this.location.y += ySpeed;
                    } else {
                        this.location.y = c.getDiameter() - this.height;
                        this.direction = MOVE_UP_HOR_RIGHT;
                    }

                    break;
                case MOVE_UP_HOR_RIGHT:

                    if (this.getRight() < c.getDiameter()) {
                        this.location.x += xSpeed;
                    } else {
                        this.location.x = c.getDiameter() - this.width;
                        this.direction = MOVE_UP_HOR_LEFT;
                    }

                    if (this.location.y > 0) {
                        this.location.y -= ySpeed;
                    } else {
                        this.location.y = 0;
                        this.direction = MOVE_DOWN_HOR_RIGHT;
                    }
                    break;
                case MOVE_UP_HOR_LEFT:

                    if (this.location.x > 0) {
                        this.location.x -= xSpeed;
                    } else {
                        this.location.x = 0;
                        this.direction = MOVE_UP_HOR_RIGHT;
                    }

                    if (this.location.y > 0) {
                        this.location.y -= ySpeed;
                    } else {
                        this.location.y = 0;
                        this.direction = MOVE_DOWN_HOR_LEFT;
                    }
                    break;

            }

        }

    }


};
/**
 * 
 * @param {type} c The Clock
 * @param {type} g The Graphics object
 * @returns {undefined}
 */
Bubble.prototype.draw = function (c, g) {
    if (this.visible === true && !this.notification.isEmpty()) {


        this.move(c);

        if (this.propertyChanged) {
            this.setup();
        }




        g.fillOval(0, 0, this.width, this.height);


        g.setColor("#FFF");
        g.setFont(this.getFont(c));



        var r = this.metrics.textBoxRect;

        var left = (this.width - r.width) / 2 + this.metrics.verticalWordSpacing;
        var topY = (this.height - r.height) / 2 + this.metrics.verticalWordSpacing + 3 * this.metrics.textHeight / 4;



        for (var i = 0; i < this.metrics.lines.size(); i++) {
            g.drawString(this.metrics.lines.get(i).getLine(), left, topY + i * (this.metrics.verticalWordSpacing + this.metrics.textHeight));
        }

    }//end if visible

};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    




function Alarm(alarmText, hh, mm, sec) {


    if (typeof alarmText !== 'string') {
        logger("`alarmText` must be a `string` variable");
        return;
    }

    if (typeof hh !== 'number') {
        logger("`hh` must be a `number`");
        return;
    }

    if (typeof mm !== 'number') {
        logger("`mm` must be a `number`");
        return;
    }

    if (typeof sec !== 'number') {
        logger("`sec` must be a `number`");
        return;
    }



    if (hh === 0) {
        logger("The hour must lie between 1 and 23");
    }
    if (mm === 0) {
        logger("The minute must lie between 1 and 59");
    }
    if (sec === 0) {
        logger("The hour must lie between 1 and 59");
    }
    if (alarmText === null || alarmText.isEmpty()) {
        logger("Please enter a valid description for the alarm.");
    }


    this.notificationBubble = new Bubble("", new Point(0, 0), 0, 0);


    this.description = alarmText !== null && !alarmText.isEmpty() ? alarmText : "";
    this.id = new Random().generateUUID();

    this.hh = hh >= 1 && hh <= 23 ? hh : -1;
    this.mm = mm >= 0 && mm <= 59 ? mm : -1;
    this.sec = sec >= 0 && sec <= 59 ? sec : -1;
    /**
     * If true, the code has discovered that this Alarm's time has come. So it places the
     * Alarm in the ringing state. One the code has finished running this ALarm, it sets
     * this flag to false.
     * 
     */
    this.nowRunning = false;
    /**
     * The user might decide to disable this alarm.
     */
    this.userDisabled = false;


}

Alarm.prototype.initBubble = function (c) {
    var pt = c.getCenter();

    var x = pt.x;
    var y = pt.x;

    this.notificationBubble = new Bubble("Alarm at: " + this.getFriendlyTime() + ".\n" + description, new Point(x, y), 5, 5);
};





Alarm.prototype.getFriendlyTime = function () {

    var hour = this.hh + "";
    var min = this.mm + "";
    var secs = this.sec + "";

    hour = hour.length() === 1 ? "0" + hour : hour;
    min = min.length() === 1 ? "0" + min : min;
    secs = secs.length() === 1 ? "0" + secs : secs;


    return hour + ":" + min + ":" + secs;
};


function getErrorNotif(hh, mm, sec, description) {

    if (hh === -1) {
        return "The hour must lie between 1 and 23";
    }
    if (mm === -1) {
        return "The minute must lie between 1 and 59";
    }
    if (sec === -1) {
        return "The hour must lie between 1 and 59";
    }
    if (description === null || description.isEmpty()) {
        return "Please enter a valid description for the alarm.";
    }
    return "Some error occurred.";
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







/**
 * {
 * canvasId: "xxxx",
 * floating: true,
 * outerColor: "css-color",
 * middleColor: "css-color",
 * innerColor: "css-color",
 * tickColor: "css-color",
 * secondsColor: "css-color",
 * minutesColor: "css-color",
 * hourColor: "css-color",
 * centerSpotWidth: number,
 * outerCircleAsFractionOfFrameSize: float_zero_to_1,
 * showBaseText: false,
 * canvas:{
 * x: 100,
 * y: 100,
 * width: 100,
 * height: 100,
 * }
 * 
 * 
 * 
 * }
 * 
 * You define the `floating` option when you dont want to add any code to the HTML DOM yourself.
 * You are saying that the Clock should create its own canvas element, add it to the DOM and use it as its own drawing area.
 * Whether or not you define the `floating` option, you must define the canvasId.
 * If you define the `floating` option, the canvas id would be used as the DOM id of the dynamically created canvas added to the DOM
 * If you do not define the `floating` option, the Clock will look (through the DOM) for a canvas having the specified canvasId and use it for its drawing area.
 * 
 * @param {Object} options
 * @returns {Clock}
 */
function Clock(options) {
    this.outerCircleAsFractionOfFrameSize = 1.0;
    this.centerSpotWidth = 3;
    this.outerColor = "transparent";
    this.middleColor = "#262626";
    this.innerColor = "#000";
    this.tickColor = "#fff";
    this.showBaseText = false;
    
    
    var secondsColor = "#f00";
    var minutesColor = "#bbb";
    var hoursColor = "#bbb";
    


// The canvas id must be specified, it is used as the DOM id of the canvas element
    if (options.canvasId) {
        if (typeof options.canvasId !== 'string') {
            logger("The field: `canvasId` must be a string");
            return;
        }
    } else {
        logger("No field: `canvasId` This field is mandatory!");
        return;
    }

//floating option defined, so pay attention!
    if (typeof options.floating !== 'undefined') {
        if (typeof options.floating !== 'boolean') {
            logger("The field called: `floating` must be a `true` or a `false`. Clock not created");
            return;
        }
        if (options.floating === true) {//creates own canvas and injects in the DOM
            if (typeof options.canvas === 'undefined') {
                logger("Please define the width and height of the canvas to be created for the clock as an options.canvas object. Currently setting the area to `100 X 100`");
                var area = new Object();
                area.width = DEFAULT_SIZE;
                area.height = DEFAULT_SIZE;
                options['canvas'] = area;
            } else {
                if (typeof options.canvas.width === 'undefined') {
                    logger("You need to define the `width` sub-field in the options.canvas field. Creating it for you and defaulting it to `" + DEFAULT_SIZE + "`");
                    options.canvas.width = DEFAULT_SIZE;
                }
                if (typeof options.canvas.height === 'undefined') {
                    logger("You need to define the `height` sub-field in the options.canvas field. Creating it for you and defaulting it to `" + DEFAULT_SIZE + "`");
                    options.canvas.height = DEFAULT_SIZE;
                }
                if (typeof options.canvas.width !== 'number') {
                    logger("The `width` option must be a number type! Fixing it for you and defaulting it to " + DEFAULT_SIZE + "`");
                    options.canvas.width = DEFAULT_SIZE;
                }
                if (typeof options.canvas.height !== 'number') {
                    logger("The `height` option must be a number type! Fixing it for you and defaulting it to " + DEFAULT_SIZE + "`");
                    options.canvas.height = DEFAULT_SIZE;
                }

                var defX = options.canvas.width / 2;
                var defY = options.canvas.width / 2;

                if (typeof options.canvas.x === 'undefined') {
                    logger("You need to define the `x` sub-field in the options.canvas field. Creating it for you and defaulting it to `" + defX + "`");
                    options.canvas.x = defX;
                }
                if (typeof options.canvas.y === 'undefined') {
                    logger("You need to define the `y` sub-field in the options.canvas field. Creating it for you and defaulting it to `" + defY + "`");
                    options.canvas.y = defY;
                }
                if (typeof options.canvas.x !== 'number') {
                    logger("The `x` option must be a number type! Fixing it for you and defaulting it to " + defX + "`");
                    options.canvas.x = defX;
                }
                if (typeof options.canvas.y !== 'number') {
                    logger("The `y` option must be a number type! Fixing it for you and defaulting it to " + defY + "`");
                    options.canvas.y = defY;
                }
            }
            //Create the canvas dynamically and inject it in the DOM.

            this.canvas = createCanvas(options.canvasId, options.canvas.width, options.canvas.x,  options.canvas.y);

            dragElement(this.canvas);
        } else {//get canvas from the DOM
            this.canvas = document.getElementById(options.canvasId);
            if(typeof this.canvas === 'undefined' || this.canvas === null){
                logger("The `floating` field was set to false. You need to define the canvas element in your HTML code or specify `floating: true` in options to have the canvas element dynamically created");
                return;
            }
        }
        this.floating = options.floating;
        
    } else {
        this.floating = false;
        this.canvas = document.getElementById(options.canvasId);
        logger("No `floating` field defined. You need to define the canvas element in your HTML code or specify `floating: true` in options to have the canvas element dynamically created");
        return;
    }






    if (options.outerCircleAsFractionOfFrameSize) {
        if (typeof options.outerCircleAsFractionOfFrameSize === 'number') {
            this.outerCircleAsFractionOfFrameSize = options.outerCircleAsFractionOfFrameSize;
            /**
             * The size of the outermost circle of the clock expressed as a fraction of
             * the clock size
             */
            this.outerCircleAsFractionOfFrameSize = (this.outerCircleAsFractionOfFrameSize <= 1) ? this.outerCircleAsFractionOfFrameSize : 0.9;
        } else {
            logger("The field: `outerCircleAsFractionOfFrameSize` must be a number");
            return;
        }
    } else {
        logger("No field: `outerCircleAsFractionOfFrameSize`");
        this.outerCircleAsFractionOfFrameSize = 1.0;
    }
    if (options.centerSpotWidth) {
        if (typeof options.centerSpotWidth === 'number') {

            /**
             * The size of the circle at the center of the clock to which all clock
             * hands are hinged.
             */

            this.centerSpotWidth = options.centerSpotWidth;
        } else {
            logger("The field: `centerSpotWidth` must be a number");
            this.centerSpotWidth = 3;
        }
    } else {
        logger("No field: `centerSpotWidth`");
    }

    if (options.outerColor) {
        if (typeof options.outerColor === 'string') {
            //The general color of the clock's outer background
            this.outerColor = options.outerColor;
        } else {
            logger("The field: `outerColor` must be a string");
            return;
        }
    } else {
        logger("No field: `outerColor`");
        this.outerColor = "transparent";
    }


    if (options.middleColor) {
        if (typeof options.middleColor === 'string') {
            //The color between the 2 circles on the clock
            this.middleColor = options.middleColor;
        } else {
            logger("The field: `middleColor` must be a string");
            return;
        }
    } else {
        logger("No field: `middleColor`");
        this.middleColor = "#262626";
    }


    if (options.innerColor) {
        if (typeof options.innerColor === 'string') {
            //The color of the clock's inner background
            this.innerColor = options.innerColor;
        } else {
            logger("The field: `innerColor` must be a string");
            return;
        }
    } else {
        logger("No field: `innerColor`");
        this.innerColor = "#000";
    }
    
       if (options.tickColor) {
        if (typeof options.tickColor === 'string') {
            //The color of the clock's ticks and text
            this.tickColor = options.tickColor;
        } else {
            logger("The field: `tickColor` must be a string");
            return;
        }
    } else {
        logger("No field: `tickColor`");
        this.tickColor = "#000";
    }
    
     
       if (options.secondsColor) {
        if (typeof options.secondsColor === 'string') {
            //The color of the clock's seconds hand
            secondsColor = options.secondsColor;
        } else {
            logger("The field: `secondsColor` must be a string");
            return;
        }
    } else {
        logger("No field: `secondsColor`");
             secondsColor = "#f00";
    }
    
     
       if (options.minutesColor) {
        if (typeof options.minutesColor === 'string') {
            //The color of the clock's minute hand
             minutesColor = options.minutesColor;
        } else {
            logger("The field: `minutesColor` must be a string");
            return;
        }
    } else {
        logger("No field: `minutesColor`");
             minutesColor = "#bbb";
    }
    
     
       if (options.hoursColor) {
        if (typeof options.hoursColor === 'string') {
            //The color of the clock's hour hand
             hoursColor = options.hoursColor;
        } else {
            logger("The field: `hoursColor` must be a string");
            return;
        }
    } else {
        logger("No field: `hoursColor`");
           hoursColor = "#bbb";
    }
    

    if (typeof options.showBaseText === 'undefined') {
        logger("No field: `showBaseText`");
        this.showBaseText = true;
    } else if (typeof options.showBaseText === 'boolean') {
        this.showBaseText = options.showBaseText;
    } else {
        logger("The field: `showBaseText` must be a Boolean(true|false)");
        return;
    }


    this.settingsOpened = false;
    this.alarms = [];

    this.canvas.style.backgroundColor = 'transparent';






    /**
     * The color of the center point.
     */
    this.centerSpotColor = this.middleColor;


    /**
     * The size of the inner circle of the clock expressed as a fraction of the
     * clock size
     */
    this.innerCircleAsFractionOfFrameSize = 0.9 * this.outerCircleAsFractionOfFrameSize;

    /**
     * The ticks
     */
    this.ticks = [];//new Tick[60];



    this.tickTextFont = new Font(FontStyle.BOLD_ITALIC, 0.9, 'Gothic', CssSizeUnits.EM);
    this.topTextFont = new Font(FontStyle.BOLD, 0.9, 'Times New Roman', CssSizeUnits.EM);
    this.bottomTextFont = new Font(FontStyle.BOLD, 0.9, 'Papyrus', CssSizeUnits.EM);



    /**
     * The seconds hand;
     */
    this.secondsHand = new ClockHand(HandType.SECONDHAND, 0.82 * this.outerCircleAsFractionOfFrameSize, 0, secondsColor);
    /**
     * The minute hand;
     */
    this.minuteHand = new ClockHand(HandType.MINUTEHAND, 0.8 * this.outerCircleAsFractionOfFrameSize, 1, minutesColor);
    /**
     * The hour hand;
     */
    this.hourHand = new ClockHand(HandType.HOURHAND, 0.6 * this.outerCircleAsFractionOfFrameSize, 2,  hoursColor);
    this.location = new Point();

    var i = 0;
    for (var angle = 0; i < 60; i++) {

        if (i % 5 === 0) {
            this.ticks[i] = new Tick(0.1, angle,  this.tickColor, 2, true);
        } else {
            this.ticks[i] = new Tick(0.04, angle,  this.tickColor, 2, false);
        }
        angle += (6 * Math.PI / 180);
    }//end for

    this.screenSize = new Dimension(screenWidth, screenHeight);

    this.monitor = new AlarmMonitor();

    this.end = false;
    this.g = new Graphics(this.canvas);

    this.diameter = this.canvas.width - 4;
    /**
     * The location of the clock center.
     */
    this.center = new Point(this.canvas.width / 2, this.canvas.width / 2);


//    var clock = this;
//    var canvas = this.canvas;
//    this.canvas.onmouseup = function (e) {
//        var point = clock.getMousePos(canvas, e);
//    };
//    this.canvas.onmousemove = function (e) {
//        var point = clock.getMousePos(canvas, e);
//    };
//    this.canvas.onmousedown = function (e) {
//        var point = clock.getMousePos(canvas, e);
//    };


}

function createCanvas(canvasId, size, x, y) {
    let canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = size;
    canvas.height = size;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.left = x+"px";
    canvas.style.top = y+"px";
    canvas.style.border = "0px solid";


    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);

    return canvas;
}

Clock.prototype.run = function () {
    let clock = this;
    let interval = setInterval(function () {
        if (clock.end === false) {
            clock.draw();
        } else {
            clearInterval(interval);
        }
    }, 700);
};

Clock.prototype.kill = function () {
    this.end = true;
};

Clock.prototype.getCenter = function () {
    return this.center;
};


Clock.prototype.getOuterCircleAsFractionOfFrameSize = function () {
    return this.outerCircleAsFractionOfFrameSize;
};

Clock.prototype.setOuterCircleAsFractionOfFrameSize = function (outerCircleAsFractionOfFrameSize) {
    this.outerCircleAsFractionOfFrameSize = outerCircleAsFractionOfFrameSize;
};

Clock.prototype.getTextFontSize = function () {
    return  ((25 / 9500) * this.diameter);
};

Clock.prototype.getOuterCircleDimension = function () {
    return  (this.outerCircleAsFractionOfFrameSize * this.diameter);
};

Clock.prototype.getInnerCircleDimension = function () {
    return  (this.innerCircleAsFractionOfFrameSize * this.diameter);
};

Clock.prototype.getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
        x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    };
};

Clock.prototype.getDiameter = function () {
    return this.diameter;
};


Clock.prototype.getCenterSpotWidth = function () {
    return this.centerSpotWidth;
};



Clock.prototype.draw = function () {

let g = this.g;
    g.setBackground(this.outerColor);
    g.fillRect((g.width - this.diameter)/2, (g.height - this.diameter)/2, this.diameter, this.diameter);
    g.setStrokeWidth(1);

    var outer = this.getOuterCircleDimension() + 2;
    var inner = this.getInnerCircleDimension();

    g.setBackground(this.middleColor);
    g.fillOval(this.center.x, this.center.y, outer / 2, outer / 2);
    g.setBackground(this.innerColor);
    g.fillOval(this.center.x, this.center.y, inner / 2, inner / 2);
    g.setBackground(this.centerSpotColor);
    g.fillOval(this.center.x, this.center.y, this.centerSpotWidth, this.centerSpotWidth);
    g.setBackground(rgbToHex('rgb(153, 153, 0)'));
    g.fillOval(this.center.x, this.center.y, this.centerSpotWidth / 2, this.centerSpotWidth / 2);


    for (var i = 0; i < this.ticks.length; i++) {
        this.ticks[i].draw(g, this);
    }
    this.secondsHand.fill(g, this);
    this.minuteHand.fill(g, this);
    this.hourHand.fill(g, this);


    this.secondsHand.getAngleForEachState();
    this.minuteHand.getAngleForEachState();
    this.hourHand.getAngleForEachState();



};


Clock.prototype.fireAlarm = function () {

    var now = new Date();

    var millis = ALARM_DURATION_IN_MINUTES * 60 * 1000;

//    for (var alarm in this.alarms) {
//
//    }

    this.alarms.forEach(function(alarm) {

        if (!alarm.isUserDisabled()) {


            var yr = now.getFullYear();
            var mth = now.getMonth();
            var dyOfMth = now.getDate();
            var hr = now.getHours();
            var mm = now.getMinutes();
            var sec = now.getSeconds();


            var alarmTime = new Date();
            alarmTime.setFullYear(yr);
            alarmTime.setMonth(mth);
            alarmTime.setDate(dyOfMth);
            alarmTime.setHours(alarm.hh);
            alarmTime.setMinutes(alarm.mm);
            alarmTime.setSeconds(alarm.sec);


            var millisDiff = now.getTime()() - alarmTime.getTime();

            if (millisDiff >= 0) {
                if (millisDiff <= millis) {
                    play("heal8.ogg");

                    if (DYNAMIC_BASE_TEXT.getState() !== DynamicBaseText.SHOW_ALARM_NOTIF) {
                        alarm.nowRunning = true;
                        alarm.initBubble(this);
                        DYNAMIC_BASE_TEXT.scan(alarm);
                    }

                } else {
                    if (alarm.nowRunning) {
                        alarm.nowRunning = false;
                        if (DYNAMIC_BASE_TEXT.getState() === DynamicBaseText.SHOW_ALARM_NOTIF) {
                            DYNAMIC_BASE_TEXT.shutdownAlarmState();
                        }
                    }

                }
            }

        }
    });

};


Clock.prototype.play = function (fileName) {
    if (typeof fileName === 'string') {
        var audio = new Audio(fileName);
        audio.play();
    }
};