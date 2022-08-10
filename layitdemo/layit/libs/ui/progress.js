/**
 *
 * @param options:
 * {
 *     id: "xxxx",
 *     value: 80,
 *     description: 'Loading, Please wait',
 *     textColor: '#F00',
 *     progressColor: '#FFF',
 *     backgroundColor: '#00F',
 *     fontName: '',
 *     fontSize: '',
 *     fontStyle: FontStyle.REGULAR,
 *     sizeUnits: CssSizeUnits.PX,
 *
 * }
 * @constructor
 */
function Progress(options) {

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
        if (typeof options.value === 'number') {
            this.value = options.value;
        } else {
            this.value = 0;
        }
        if (typeof options.description === 'string') {
            this.description = options.description;
        } else {
            this.description = '';
        }
        if (typeof options.textColor === 'string') {
            this.textColor = options.textColor;
        } else {
            this.textColor = '';
        }
        if (typeof options.progressColor === 'string') {
            this.progressColor = options.progressColor;
        } else {
            this.progressColor = '';
        }
        if (typeof options.backgroundColor === 'string') {
            this.backgroundColor = options.backgroundColor;
        } else {
            this.backgroundColor = '';
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
            this.fontSize = 13;//13px
            this.sizeUnits = CssSizeUnits.PX;
        }

        if (typeof options.fontStyle === 'string') {
            this.fontStyle = options.fontStyle;
        } else {
            this.fontStyle = FontStyle.REGULAR;
        }


        this.g = new Graphics(canvas);

        this.font = new Font(this.fontStyle, this.fontSize, this.fontName, this.sizeUnits);
        this.g.setFont(this.font);

        this.setValueDelayed(0, '', 20);

    } else {
        throw new Error('Invalid parameters.Please check widget documentation');
    }



}

/**
 *
 * @param value The number value (0 - 100) to set
 * @param description A short text describing the progress
 */
Progress.prototype.setValue = function (value , description){
    if( value < 0 ){
        value = 0;
    }
    if( value > 100 ){
        value = 100;
    }

    this.g.clear();
    if(typeof description !== 'undefined'){
        this.description = description;
    }
    this.value = value;
    this.render();
};


/**
 *
 * @param value The number value (0 - 100) to set
 * @param description A short text describing the progress
 * @param delayedMS The time in milliseconds after which we should set the value
 */
Progress.prototype.setValueDelayed = function (value , description, delayedMS){
    const p = this;

    setTimeout(function (){
        if( value < 0 ){
            value = 0;
        }
        if( value > 100 ){
            value = 100;
        }

        p.g.clear();
        if(typeof description !== 'undefined'){
            p.description = description;
        }
        p.value = value;
        p.render();

    }, delayedMS);

};




Progress.prototype.render = function () {


    let g = this.g;
    let w = g.width;
    let h = g.height;
    let backgroundColor = this.backgroundColor;
    let textColor = this.textColor;
    let progressColor =  this.progressColor;
    let borderColor =  darkenColor(backgroundColor, 0.85);
    let textFont = this.font;
    let txt = (this.description === null || this.description === '') ? this.value+'%' : this.description+' '+this.value+'%';

    let value = this.value;
    let description = this.description;

    let borderWidth = 2;
    let borderRadius = 4;





    //PAINT THE BG OVER:
    g.setBackground(backgroundColor);
    g.fillRoundRect(borderWidth/2, borderWidth/2, w - borderWidth, h - borderWidth, borderRadius);

    g.setStrokeWidth(borderWidth);
    g.setBackground(borderColor);
    //draw the border
    g.drawRoundRect(borderWidth/2, borderWidth/2, w - borderWidth, h - borderWidth, borderRadius);

    //Now draw the progress:
    let progressFullWidth = (w - 2 * borderWidth);
    let progressWidth = (this.value/(g.normalizeQuantity(100.0))) * progressFullWidth;
    let progressHeight = h/PIXEL_RATIO - borderWidth;//(borderWidth + 28);

    g.setBackground(progressColor);
    g.fillRect(borderWidth , borderWidth/2+1, progressWidth, progressHeight );

    g.setFont(textFont);
    g.setBackground(textColor);



    if(typeof description !== "undefined" && description !== null && description !== '' && description.length > 0){
        let descWidth =  g.stringWidth(description);
        let descHeight = g.textHeight(description);


        let descXPos = (w - descWidth)/2;

        let valPct = value +'%';
        let valWidth =  g.stringWidth(valPct);
        let valHeight = g.textHeight(valPct);


        let valXPos = (w - valWidth)/2;
        //progress color has collided with border color
        if(valXPos < progressWidth + borderWidth){
            //fix color bug on zero and let color change when progress bar catches up with the text position
        }


        let availableHeight = h - (descHeight + valHeight);

        let verSpacing = 8;//vertical space between the description and the progress value

        let verticalPadding = (availableHeight - verSpacing)*0.5;

        let descYPos =  borderWidth + descHeight + verticalPadding;
        let valYPos =   h - borderWidth - verticalPadding;



        g.setBackground(darkenColor(textColor ,0.2));
        g.drawString(description , descXPos, descYPos);
        g.setBackground(textColor);
        g.drawString(valPct , valXPos, valYPos);


    }else{
        let textHeight = g.textHeight(txt);
        let textWidth = g.stringWidth(txt);

        let textXPos = (w - textWidth)/2;
        let textYPos = ((h - textHeight) * 0.5 + textHeight);

        //progress color has collided with border color
        if(textXPos < progressWidth + borderWidth){
            //fix color bug on zero and let color change when progress bar catches up with the text position
        }

        g.drawString(txt , textXPos, textYPos);
    }









};