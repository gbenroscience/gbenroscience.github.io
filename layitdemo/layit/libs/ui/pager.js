/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 * @param {type} options The map of options for the Pager.
 * 
 * Here is the map options:
 * 
 * {
 *  id : 'pager_tool' 
 *  background : 'whitesmoke',//the general background of the pager
 *  theme : 'darkgreen', // the color of the arrows and text and borders. Also the released color of the arrows.  
 *  pageNum : 10,
 *  pageSize : 20,
 *  thickness : 4,
 *  onPrevious : function(){},
 *  onNext : function(){},
 *  
 *  
 * 
 * }
 * 
 * 
 * 
 * @returns {undefined}
 */
function Pager(options) {
    this.validObject = true;
    if (typeof options.id === 'undefined') {
        console.log("Please specify the pager id.");
        this.validObject = false;
        return;
    } else {
        this.id = options.id;
    }

    if (typeof options.background === 'undefined') {
        console.log("Pager background not specified. Defaulting to `#cccccc`");
        this.background = "whitesmoke";
    } else {
        this.background = options.background;
    }


    if (typeof options.theme === 'undefined') {
        console.log("Pager theme not specified. Defaulting to `darkgreen`");
        this.theme = "gray";
    } else {
        this.theme = options.theme;
    }



    this.leftPressed = false;
    this.rightPressed = false;

    if (typeof options.pageSize === 'undefined') {
        console.log("Pager page size not specified. Defaulting to 50");
        this.pageSize = 50;
    } else {
        this.pageSize = options.pageSize;
    }



    if (typeof options.pageNum === 'undefined') {
        console.log("Pager page number not specified. Defaulting to 1");
        this.pageNum = 1;
    } else {
        this.pageNum = options.pageNum;
    }
    console.log("Pager page number being used is: "+this.pageNum);

    if (typeof options.thickness === 'undefined') {
        console.log("Pager thickness not specified. Defaulting to 4");
        this.thickness = 4;
    } else {
        this.thickness = options.thickness;
    }

    if (typeof options['canvas-width'] === 'number') {
        this.canvasWidth = options['canvas-width'];
    } else {
        console.log("Pager canvas-width not specified. Defaulting to `300`");
        this.canvasWidth = 300;
    }


    if (options.onPrevious && {}.toString.call(options.onPrevious) === '[object Function]') {
        this.onPrevious = options.onPrevious;
    } else {
        this.onPrevious = function () {};
    }

    if (options.onNext && {}.toString.call(options.onNext) === '[object Function]') {
        this.onNext = options.onNext;
    } else {
        this.onNext = function () {};
    }




    this.canvasHeight = this.canvasWidth / 10;

    this.eventsRegistered = false;
    this.canvas = null;


}

//     <canvas id="canv-1" style="float: right; margin-right: 1em; width: 1.1em; height: 0.8em;"></canvas>

Pager.prototype.draw = function () {

    var pager = this;
    var canvas = this.canvas;

    this.drawBorders(canvas);
    this.drawArrows(canvas);
    this.drawText(canvas);

    if (this.eventsRegistered === false) {

        canvas.onmouseup = function (e) {
            

            pager.leftPressed = false;
            pager.rightPressed = false;

            var point = pager.getMousePos(canvas, e);


            if (point.x >= 0 && point.x <= canvas.height && point.y >= 0 && point.y <= canvas.height) {
                pager.onPrevious();
            }

            if (point.x >= canvas.width - canvas.height && point.x <= canvas.width && point.y >= 0 && point.y <= canvas.height) {
                pager.onNext();
            }


            pager.drawArrows(canvas);

        };



        canvas.onmousemove = function (e) {

            var point = pager.getMousePos(canvas, e);


            if ((point.x < 0 || point.x > canvas.height) || (point.y < 0 || point.y > canvas.height)) {
                pager.leftPressed = false;
            }

            if ((point.x < canvas.width - canvas.height || point.x > canvas.width) || (point.y < 0 || point.y > canvas.height)) {
                pager.rightPressed = false; 
            }

                pager.drawArrows(canvas);


        };
        canvas.onmousedown = function (e) {

            var point = pager.getMousePos(canvas, e);


            if (point.x >= 0 && point.x <= canvas.height && point.y >= 0 && point.y <= canvas.height) {
                pager.leftPressed = true;
                pager.drawArrows(canvas);
            }

            if (point.x >= canvas.width - canvas.height && point.x <= canvas.width && point.y >= 0 && point.y <= canvas.height) {
                pager.rightPressed = true;
                pager.drawArrows(canvas);
            }



        };

        this.eventsRegistered = true;
    }




};



Pager.prototype.drawBorders = function (canvas) {

    var ctx = canvas.getContext('2d');

    var width = canvas.width;
    var height = canvas.height;

    ctx.globalAlpha = 1.0;


    //draw background 

    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, width, height);



    //draw main borders

    ctx.globalAlpha = this.pressed === true ? 0.6 : 1;

    ctx.lineWidth = this.thickness;

    ctx.strokeStyle = this.theme;


    ctx.strokeRect(this.thickness, this.thickness, width - 2 * this.thickness, height - 2 * this.thickness);


    //draw button borders

    ctx.beginPath();

    ctx.strokeStyle = this.theme;
    ctx.lineWidth = this.thickness;

    ctx.moveTo(height, 0);
    ctx.lineTo(height, height);

    ctx.closePath();

    ctx.stroke();


    ctx.beginPath();

    ctx.strokeStyle = this.theme;

    ctx.moveTo(width - height, 0);


    ctx.lineTo(width - height, height);



    ctx.closePath();
    ctx.stroke();



};

Pager.prototype.drawText = function (canvas) {

    var ctx = canvas.getContext('2d');

    var width = canvas.width;
    var height = canvas.height;
    ctx.font = "bold 0.9em Arial";
    var txt = "Page " + this.pageNum;


    var textHeight = ctx.measureText("M").width;



//The width of the controls is canvas.height.
    var availableWidthForText = width - 2 * height;

    var lines = scanLines(txt, ctx, availableWidthForText);


    var lineSpacing = 6;

    var len = lines.length;

    var totalTextHeight = len * (textHeight + lineSpacing) - lineSpacing;



    var yStart = (height - totalTextHeight) / 2;




    //   var line = lines[0];
    //  var xDisp = height + (availableWidthForText - line.width) / 2;
    //  var yDisp = yStart;
    // ctx.fillText(line.text, xDisp, yDisp/2 + height/2);



    for (var i = 0; i < len; i++) {
        var line = lines[i];
        var xDisp = height + (availableWidthForText - line.width) / 2;
        var yDisp = yStart + i * (lineSpacing + textHeight);
        ctx.fillText(line.text, xDisp, yDisp / 2 + height / 2);
    }

};

/**
 * 
 * @param {string} txt
 * @param {Canvas} ctx
 * @param {Number} availableWidth The width available for drawing text.
 * @returns {Array|scanLines.lines}
 */
function scanLines(txt, ctx, availableWidth) {
//txt ='Page 1 is about our country. What do we do about the countenance of people towards this great nation called Nigeria? God bless Nigeria.';
    var lines = [];

    var token = new StringBuffer();
    for (var i = 0; i < txt.length; i++) {

        if (ctx.measureText(token.toString()).width < availableWidth) {
            token.append(txt.substring(i, i + 1));
        } else {
            var tx = token.toString();
            var line = {
                width: ctx.measureText(tx).width,
                text: tx
            };

            lines.push(line);
            token = new StringBuffer();
            token.append(txt.substring(i, i + 1));
        }

    }

    if (token.toString().length > 0) {
        var tx = token.toString();
        var line = {
            width: ctx.measureText(tx).width,
            text: tx
        };
        lines.push(line);

    }

    return lines;
}


Pager.prototype.drawArrows = function (canvas) {



    var ctx = canvas.getContext('2d');

    var width = canvas.width;
    var height = canvas.height;

    var boxWidth = height;
    var boxHeight = height;

//draw  left arrow
    var paddingHor = 8;
    var paddingVer = 8;

    var xStart = boxWidth - paddingHor;
    var yStart = paddingVer;






    ctx.clearRect(paddingHor, paddingVer, boxWidth - 2 * paddingHor, boxHeight - 2 * paddingVer);
    ctx.clearRect(width - boxWidth + paddingHor, paddingVer, boxWidth - 2 * paddingHor, boxHeight - 2 * paddingVer);



    ctx.globalAlpha = this.leftPressed === true ? 0.2 : 1.0;
    ctx.beginPath();
    ctx.fillStyle = this.theme;
    ctx.lineWidth = 2 * this.thickness;
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(paddingHor, boxHeight / 2);
    ctx.lineTo(xStart, height - paddingVer);
    ctx.lineTo(xStart, yStart);


    ctx.closePath();
    ctx.fill();




    ctx.globalAlpha = this.rightPressed === true ? 0.2 : 1.0;
//draw right arrow
    var paddingHor = 8;
    var paddingVer = 8;

    var xStart = width - boxWidth + paddingHor;
    var yStart = paddingVer;


    ctx.beginPath();
    ctx.fillStyle = this.theme;
    ctx.lineWidth = 2 * this.thickness;
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(width - paddingHor, height / 2);
    ctx.lineTo(xStart, height - paddingVer);


    ctx.lineTo(xStart, yStart);


    ctx.closePath();
    ctx.fill();





};


Pager.prototype.getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
        x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    };
};




