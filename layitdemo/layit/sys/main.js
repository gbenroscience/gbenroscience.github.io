let TEMPLATE_INDEX = 0;
/**
 *
 * VFL:
 * [a(b)] view a has same width as b
 * [a(==b/2)] view a has half the width of view b
 * Set the absolute size and position for a DOM element.
 *
 * To connect a view to another use [a]-[b]
 *
 *
 * To give a view same width as height:
 *
 * |-[a]-|
 * V:|-[a(a.width)]
 * Supported attributes are:
 *
 * .width
 * .height
 * .left
 * .top
 * .right
 * .bottom
 * .centerX
 * .centerY
 *
 * The next 2 commands will make the child stretch across the parent with system-standard margins at the edges
 * H:|-[child]-|
 * V:|-[child]-|
 *
 * The next 2 commands will make the child stretch across the parent with the specified margins at the edges
 * H:|-50-[child]-50-|
 * V:|-50-[child]-50-|
 *
 * Pin a child view to left edge of its parent:
 * H:|[child]
 *
 * Pin a child view to right edge of its parent:
 * H:[child]|
 *
 * Make view 100 points wide:
 * H:|[child(==100)]
 *
 * Make view at least 100 points wide:
 * H:|[child(>=100)]
 *
 *
 * Share size with another view:
 * Where childWidth is another view and child is the view that will share the width of `childWidth`
 * H:|[child(childWidth)]
 *
 * Specify width and priority:
 * H:|[child(childWidth@999)]
 *
 *
 * The DOM element must have the following CSS styles applied to it:
 * - position: absolute;
 * - padding: 0;
 * - margin: 0;
 *
 * @param {Element} elm DOM element.
 * @param {Number} left left position.
 * @param {Number} top top position.
 * @param {Number} width width.
 * @param {Number} height height.
 */
let transformAttr = ('transform' in document.documentElement.style) ? 'transform' : undefined;
transformAttr = transformAttr || (('-webkit-transform' in document.documentElement.style) ? '-webkit-transform' : 'undefined');
transformAttr = transformAttr || (('-moz-transform' in document.documentElement.style) ? '-moz-transform' : 'undefined');
transformAttr = transformAttr || (('-ms-transform' in document.documentElement.style) ? '-ms-transform' : 'undefined');
transformAttr = transformAttr || (('-o-transform' in document.documentElement.style) ? '-o-transform' : 'undefined');
function setAbsoluteSizeAndPosition(elm, left, top, width, height) {
    elm.setAttribute('style', 'width: ' + width + 'px; height: ' + height + 'px; ' + transformAttr + ': translate3d(' + left + 'px, ' + top + 'px, 0px);');
}


/* global AutoLayout, attrKeys, xmlKeys, orientations, sizes, dummyDiv, dummyCanvas, PATH_TO_LAYOUTS_FOLDER, PATH_TO_COMPILER_SCRIPTS, rootCount, CssSizeUnits, CssSizeUnitsValues, PATH_TO_IMAGES, FontStyle, Gravity, styleSheet, ListAdapter, Alignments */

/**
 *
 * @param {type} node The node that represents this View in the android style xml document
 * @returns {View}
 */

/**
 *
 * @param {Workspace} wkspc
 * @param {XMLNode} node
 * @returns {View}
 */
function View(wkspc, node) {
    const zaId = node.getAttribute(attrKeys.id);
    if (typeof zaId === 'undefined' || zaId === null || zaId === '') {
        throw 'Please specify the view id properly';
    }

    if (typeof wkspc.findViewById(zaId) !== 'undefined') {
        throw 'A view with this id(`' + zaId + '`) exists already';
    }

    let nodeName = node.nodeName;
    this.nodeName = nodeName;
    this.root = nodeName === xmlKeys.root || nodeName === xmlKeys.include;

    if (this.root) {
        /**
         * Only a root layout must have this field!
         */
        this.constraints = [];
    }
    //The main ConstraintLayout tag in the original layout file
    this.topLevelRoot = this.root === true && wkspc.viewMap.size === 0;
    this.id = zaId;
    this.parentId = (node.parentNode.getAttribute) ? node.parentNode.getAttribute(attrKeys.id).trim() : null;
    this.childrenIds = [];
    this.style = new Style("#" + this.id, []);
    this.refIds = new Map();
    this.htmlElement = null;
    let cssClasses = null;
    if (wkspc.template === true) {
        /**
         * Similar to the IncludedView.directChildConstraints method.
         * For views to be used as template for list | grid | table cells, 
         * their parent is not in the layit view heirarchy...e.g it is an `LI` or a `TD` or a `TH`.
         * We need to store the constraints that relate the template to this absentee(from the layit hierarchy) parent.
         * So we store them here.
         */
        this.templateConstraints = [];
    }
    if (node.attributes && node.attributes.length > 0) {


        let mg = node.getAttribute(attrKeys.layout_margin);
        let mh = node.getAttribute(attrKeys.layout_marginHorizontal);
        let mv = node.getAttribute(attrKeys.layout_marginVertical);


        this.margins = {
            top: node.getAttribute(attrKeys.layout_marginTop),
            bottom: node.getAttribute(attrKeys.layout_marginBottom),
            start: node.getAttribute(attrKeys.layout_marginStart),
            end: node.getAttribute(attrKeys.layout_marginEnd)
        };
        if (mv) {
            if (isNumber(parseInt(mv))) {
                this.margins.top = mv;
                this.margins.bottom = mv;
            } else {
                throw new Error('Invalid value specified for the vertical margin on ' + this.constructor.name + '(' + this.id + ')');
            }
        }
        if (mh) {
            if (isNumber(parseInt(mh))) {
                this.margins.start = mh;
                this.margins.end = mh;
            } else {
                throw new Error('Invalid value specified for the horizontal margin on ' + this.constructor.name + '(' + this.id + ')');
            }
        }
        if (mg) {
            if (isNumber(parseInt(mg))) {
                this.margins.top = mg;
                this.margins.bottom = mg;
                this.margins.start = mg;
                this.margins.end = mg;
            } else {
                throw new Error('Invalid value specified for the margins on ' + this.constructor.name + '(' + this.id + ')');
            }
        }


        if (this.margins.top && startsWith(this.margins.top, "+")) {
            this.margins.top = this.margins.top.substr(1);
        }
        if (this.margins.bottom && startsWith(this.margins.bottom, "+")) {
            this.margins.bottom = this.margins.bottom.substr(1);
        }
        if (this.margins.start && startsWith(this.margins.start, "+")) {
            this.margins.start = this.margins.start.substr(1);
        }
        if (this.margins.end && startsWith(this.margins.end, "+")) {
            this.margins.end = this.margins.end.substr(1);
        }


        if (this.margins.top && startsWith(this.margins.top, "-")) {
            throw new Error('Negative margins (margin-top) on view(' + this.id + ') not supported by layout engine');
        }
        if (this.margins.bottom && startsWith(this.margins.bottom, "-")) {
            throw new Error('Negative margins (margin-bottom) on view(' + this.id + ') not supported by layout engine');
        }
        if (this.margins.start && startsWith(this.margins.start, "-")) {
            throw new Error('Negative margins (margin-start) on view(' + this.id + ') not supported by layout engine');
        }
        if (this.margins.end && startsWith(this.margins.end, "-")) {
            throw new Error('Negative margins (margin-end) on view(' + this.id + ') not supported by layout engine');
        }

        this.width = node.getAttribute(attrKeys.layout_width);
        this.height = node.getAttribute(attrKeys.layout_height);

        changePxToUnitLess:{

            if (endsWith(this.width, 'px')) {
                this.width = parseInt(this.width);
            }
            if (endsWith(this.height, 'px')) {
                this.height = parseInt(this.height);
            }

        }

        /**
         * In your xml, you may have:
         * width="height"
         * height="100px"
         * This code section will make
         * width="100px" here
         *
         * Or if you have:
         *
         * width="90px"
         * height="width/1.25"
         *
         * This code section will make:
         * height="72" (in px) Note: only division operation is supported
         *
         */
        changeDimensionalReferences:{
            let w = parseInt(this.width);
            let h = parseInt(this.height);
            let i = -1;
//change width and height values to id.width and id.height for same view references in xml
            if (typeof this.width === 'string') {
                if (this.width === 'height') {
                    this.width = this.id + ".height";
                } else if (this.width.indexOf("height") !== -1 && (i = this.width.indexOf("/")) !== -1) {
                    let lhs = this.width.substring(0, i);
                    lhs = lhs.trim();
                    let rhs = this.width.substring(i + 1);
                    rhs = rhs.trim();
                    if (lhs === 'height' && isNumber(rhs)) {
                        lhs = this.id + ".height";
                        this.width = lhs + "/" + rhs;
                    }
                }
            }
            if (typeof this.height === 'string') {
                if (this.height === 'width') {
                    this.height = this.id + ".width";
                } else if (this.height.indexOf("width") !== -1 && (i = this.height.indexOf("/")) !== -1) {
                    let lhs = this.height.substring(0, i);
                    lhs = lhs.trim();
                    let rhs = this.height.substring(i + 1);
                    rhs = rhs.trim();
                    if (lhs === 'width' && isNumber(rhs)) {
                        lhs = this.id + ".width";
                        this.height = lhs + "/" + rhs;
                    }
                }
            }
        }


        this.dimRatio = -1; //Not specified... dimRatio is width/height
        this.wrapWidth = "";
        this.wrapHeight = "";
        const err = new Error();
        if (typeof this.width === 'undefined' || this.width === null || this.width === '') {
            err.name = 'UnspecifiedWidthError';
            err.message = 'Please specify the width for \'' + this.id + '\'';
            throw err;
        }

        if (typeof this.height === 'undefined' || this.height === null || this.height === '') {
            err.name = 'UnspecifiedHeightError';
            err.message = 'Please specify the height for \'' + this.id + '\'';
            throw err;
        }

        let fontWeight = 'normal';
        let fontSz = '13px';
        let fontName = 'serif';
        let fnt = '';
//store all references to other view ids here, alongside the property that references the id
//So, the prop will be the key and the id will be the value
        for (let i = 0; i < node.attributes.length; i++) {

            let attrName = node.attributes[i].nodeName;
            let attrValue = node.attributes[i].nodeValue;
            if (attrValue === 'parent') {
                attrValue = this.parentId;
            }

            switch (attrName) {
                case attrKeys.layout:
                    this.refIds.set(attrKeys.layout, attrValue);
                    break;
                case attrKeys.layout_width:
                    if (isNaN(parseInt(attrName))) {
                        this.refIds.set(attrKeys.layout_width, attrValue);
                    }
                    break;
                case attrKeys.layout_height:
                    if (isNaN(parseInt(attrName))) {
                        this.refIds.set(attrKeys.layout_height, attrValue);
                    }
                    break;
                case attrKeys.layout_maxWidth:
                    if (isNaN(parseInt(attrName))) {
                        this.refIds.set(attrKeys.layout_maxWidth, attrValue);
                        //    this.style.addStyleElement("max-width", attrValue);
                    }
                    break;
                case attrKeys.layout_maxHeight:
                    if (isNaN(parseInt(attrName))) {
                        this.refIds.set(attrKeys.layout_maxHeight, attrValue);
                    }
                    break;
                case attrKeys.layout_minWidth:
                    if (isNaN(parseInt(attrName))) {
                        this.refIds.set(attrKeys.layout_minWidth, attrValue);
                    }
                    break;
                case attrKeys.layout_minHeight:
                    if (isNaN(parseInt(attrName))) {
                        this.refIds.set(attrKeys.layout_minHeight, attrValue);
                    }
                    break;
                case attrKeys.layout_constraintTop_toTopOf:
                    this.refIds.set(attrKeys.layout_constraintTop_toTopOf, attrValue);
                    break;
                case attrKeys.layout_constraintTop_toBottomOf:
                    this.refIds.set(attrKeys.layout_constraintTop_toBottomOf, attrValue);
                    break;
                case attrKeys.layout_constraintBottom_toTopOf:
                    this.refIds.set(attrKeys.layout_constraintBottom_toTopOf, attrValue);
                    break;
                case attrKeys.layout_constraintBottom_toBottomOf:
                    this.refIds.set(attrKeys.layout_constraintBottom_toBottomOf, attrValue);
                    break;
                case attrKeys.layout_constraintStart_toStartOf:
                    this.refIds.set(attrKeys.layout_constraintStart_toStartOf, attrValue);
                    break;
                case attrKeys.layout_constraintStart_toEndOf:
                    this.refIds.set(attrKeys.layout_constraintStart_toEndOf, attrValue);
                    break;
                case attrKeys.layout_constraintEnd_toStartOf:
                    this.refIds.set(attrKeys.layout_constraintEnd_toStartOf, attrValue);
                    break;
                case attrKeys.layout_constraintEnd_toEndOf:
                    this.refIds.set(attrKeys.layout_constraintEnd_toEndOf, attrValue);
                    break;
                case attrKeys.layout_constraintCenterXAlign:
                    this.refIds.set(attrKeys.layout_constraintCenterXAlign, attrValue);
                    break;
                case attrKeys.layout_constraintCenterYAlign:
                    this.refIds.set(attrKeys.layout_constraintCenterYAlign, attrValue);
                    break;
                case attrKeys.layout_constraintGuide_percent:
                    this.refIds.set(attrKeys.layout_constraintGuide_percent, attrValue);
                    break;
                case attrKeys.orientation:
                    this.refIds.set(attrKeys.orientation, attrValue);
                    break;
                case attrKeys.dimension_ratio:
                    if (isDimensionRatio(attrValue) === true) {
                        this.refIds.set(attrKeys.dimension_ratio, attrValue);
                        let arr = attrValue.split(':');
                        let num = parseFloat(arr[0]);
                        let den = parseFloat(arr[1]);
                        if (num <= 0) {
                            throw new Error('Bad ratio specified! LHS can neither be 0 nor less than 0');
                        }
                        if (den <= 0) {
                            throw new Error('Bad ratio specified! RHS can neither be 0 nor less than 0');
                        }
                        if (isNumber(attrValue)) {
                            this.dimRatio = parseFloat(attrValue);
                        } else {
                            this.dimRatio = num / den;
                        }
                    } else {
                        throw new Error('Invalid dimension ratio specified on view with id: ' + this.id);
                    }
                    break;
                    //as a bonus save the paddings in this pass
                case attrKeys.layout_padding:
                    this.style.addStyleElement("padding", attrValue);
                    break;
                case attrKeys.layout_paddingTop:
                    this.style.addStyleElement("padding-top", attrValue);
                    break;
                case attrKeys.layout_paddingBottom:
                    this.style.addStyleElement("padding-bottom", attrValue);
                    break;
                case attrKeys.layout_paddingStart:
                    this.style.addStyleElement("padding-left", attrValue);
                    break;
                case attrKeys.layout_paddingEnd:
                    this.style.addStyleElement("padding-right", attrValue);
                    break;
//paddings saved
                case attrKeys.border:
                    this.style.addStyleElement("border", attrValue);
                    break;
                case attrKeys.borderRadius:
                    this.style.addStyleElement("border-radius", attrValue);
                    break;
                case attrKeys.boxShadow:
                    this.style.addStyleElement("box-shadow", attrValue);
                    this.style.addStyleElement("-moz-box-shadow", attrValue);
                    this.style.addStyleElement("-webkit-box-shadow", attrValue);
                    this.style.addStyleElement("-khtml-box-shadow", attrValue);
                    break;
                case attrKeys.background:
                    this.style.addStyleElement("background", attrValue);
                    break;
                case attrKeys.backgroundImage:
                    this.style.addStyleElement("background-image", attrValue);
                    break;
                case attrKeys.backgroundColor:
                    this.style.addStyleElement("background-color", attrValue);
                    break;
                case attrKeys.backgroundAttachment:
                    this.style.addStyleElement("background-attachment", attrValue);
                    break;
                case attrKeys.backgroundPosition:
                    this.style.addStyleElement("background-position", attrValue);
                    break;
                case attrKeys.backgroundPositionX:
                    this.style.addStyleElement("background-position-x", attrValue);
                    break;
                case attrKeys.backgroundPositionY:
                    this.style.addStyleElement("background-position-y", attrValue);
                    break;
                case attrKeys.backgroundOrigin:
                    this.style.addStyleElement("background-origin", attrValue);
                    break;
                case attrKeys.backgroundRepeat:
                    this.style.addStyleElement("background-repeat", attrValue);
                    break;
                case attrKeys.backgroundSize:
                    this.style.addStyleElement("background-size", attrValue);
                    break;
                case attrKeys.backgroundClip:
                    this.style.addStyleElement("background-clip", attrValue);
                    break;
                case attrKeys.backgroundBlendMode:
                    this.style.addStyleElement("background-blend-mode", attrValue);
                    break;
                case attrKeys.font:
                    fnt = attrValue;
                    break;
                case attrKeys.fontSize:
                    fontSz = attrValue;
                    break;
                case attrKeys.fontStretch:
                    this.style.addStyleElement("font-stretch", attrValue);
                    break;
                case attrKeys.fontStyle:
                    this.style.addStyleElement("font-style", attrValue);
                    break;
                case attrKeys.fontFamily:
                    fontName = attrValue;
                    break;
                case attrKeys.fontWeight:
                    fontWeight = attrValue;
                    break;
                case attrKeys.textSize:
                    fontSz = attrValue;
                    break;
                case attrKeys.textStyle:
                    fontWeight = attrValue;
                    break;
                case attrKeys.textColor:
                    this.style.addStyleElement("color", attrValue);
                    break;
                case attrKeys.cssClass:
                    this.refIds.set(attrKeys.cssClass, attrValue);
                    cssClasses = attrValue;
                    break;
                case attrKeys.resize:
                    this.refIds.set(attrKeys.resize, attrValue);
                    this.style.addStyleElement(attrKeys.resize, attrValue);
                    break;
                case attrKeys.borderTop:
                    this.style.addStyleElement("border-top", attrValue);
                    break;
                case attrKeys.borderBottom:
                    this.style.addStyleElement("border-bottom", attrValue);
                    break;
                case attrKeys.borderLeft:
                    this.style.addStyleElement("border-left", attrValue);
                    break;
                case attrKeys.borderRight:
                    this.style.addStyleElement("border-right", attrValue);
                    break;
                case attrKeys.borderTopColor:
                    this.style.addStyleElement("border-top-color", attrValue);
                    break;
                case attrKeys.borderBottomColor:
                    this.style.addStyleElement("border-bottom-color", attrValue);
                    break;
                case attrKeys.borderLeftColor:
                    this.style.addStyleElement("border-left-color", attrValue);
                    break;
                case attrKeys.borderRightColor:
                    this.style.addStyleElement("border-right-color", attrValue);
                    break;
                case attrKeys.borderTopWidth:
                    this.style.addStyleElement("border-top-width", attrValue);
                    break;
                case attrKeys.borderBottomWidth:
                    this.style.addStyleElement("border-bottom-width", attrValue);
                    break;
                case attrKeys.borderLeftWidth:
                    this.style.addStyleElement("border-left-width", attrValue);
                    break;
                case attrKeys.borderRightWidth:
                    this.style.addStyleElement("border-right-width", attrValue);
                    break;
                case attrKeys.borderTopLeftRadius:
                    this.style.addStyleElement("border-top-left-radius", attrValue);
                    break;
                case attrKeys.borderTopRightRadius:
                    this.style.addStyleElement("border-top-right-radius", attrValue);
                    break;
                case attrKeys.borderBottomLeftRadius:
                    this.style.addStyleElement("border-bottom-left-radius", attrValue);
                    break;
                case attrKeys.borderBottomRightRadius:
                    this.style.addStyleElement("border-bottom-right-radius", attrValue);
                    break;
                case attrKeys.overflow:
                    this.style.addStyleElement("overflow", attrValue);
                    break;
                case attrKeys.overflowX:
                    this.style.addStyleElement("overflow-x", attrValue);
                    break;
                case attrKeys.overflowY:
                    this.style.addStyleElement("overflow-y", attrValue);
                    break;


                default:
                    break;
            }
        }
        let font = '';
        if (attributeNotEmpty(fnt)) {
            font = fnt;
        } else {
            font = fontWeight + ' ' + fontSz + ' ' + fontName;
        }
        this.style.addStyleElement("font", font);
    }

    if (!this.id) {
        throw 'Your view must have an id!';
    }
    if (typeof this.id !== 'string') {
        throw 'The view id must be a string!';
    }
    if (this.id.trim().length === 0) {
        throw 'The view id cannot be an empty string!';
    }


    this.createElement(node);
    wkspc.viewMap.set(this.id, this);
    if (cssClasses !== null) {
        addClass(this.htmlElement, cssClasses);
    }


}

View.prototype.getTextSize = function (txt) {

    let span = document.createElement("span");
    document.body.appendChild(span);
    span.style.font = this.style.getValue('font');
    span.id = "za_span";
    span.style.height = 'auto';
    span.style.width = 'auto';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'no-wrap';
    span.innerHTML = txt;
    let size = {
        width: Math.ceil(span.clientWidth),
        height: Math.ceil(span.clientHeight) * 1.5
    };
    let formattedWidth = size.width + "px";
    document.querySelector('#za_span').textContent
            = formattedWidth;
    document.body.removeChild(span);
    return size;
};

function isDimensionRatio(val) {
    if (!isNaN(val)) {
        val = val + ':1';
        return true;
    }
    let count = 0;
    for (let i = 0; i < val.length; i++) {
        if (val.substring(i, i + 1) === ':') {
            count++;
            if (count > 1) {
                return false;
            }
        }
    }
    if (count === 0 || count > 1) {
        return false;
    }
    let arr = val.split(':');
    return arr.length = 2 && !isNaN(arr[0]) && !isNaN(arr[1]);
}


/**
 * This method makes sense only in the context of the code in this file...do not use it anywhere else.
 * It serves as a refactor for a situation where this lengthy code section would have occurred occurred twice in the 
 * makeVFL method.
 * @param {type} array The array to push the constraints into
 * @param {type} mt margin top
 * @param {type} mb margin bottom
 * @param {type} ms margin start
 * @param {type} me margin end
 * @param {type} maxWid The raw max width in string form
 * @param {type} minWid The raw min width in string form
 * @param {type} maxHei The raw max height in string form
 * @param {type} minHei  The raw min height in strin form
 * @param {type} maxWidth The processed max width in string form
 * @param {type} minWidth The processed min width in string form
 * @param {type} maxHeight The processed max height in string form
 * @param {type} minHeight The processed min height in string form
 * The processing on the dimensions is: If the dimension is a % keep it with its % units, else convert it to a number .
 * @returns {String}
 */
View.prototype.positionIncludedLayouts = function (array, mt, mb, ms, me,
        maxWid, minWid, maxHei, minHei, maxWidth, minWidth, maxHeight, minHeight) {

    let mtt = endsWith(this.margins.top, "%") ? this.margins.top : mt;
    let mbb = endsWith(this.margins.bottom, "%") ? this.margins.bottom : mb;
    let mss = endsWith(this.margins.start, "%") ? this.margins.start : ms;
    let mee = endsWith(this.margins.end, "%") ? this.margins.end : me;

    let ss = this.refIds.get(attrKeys.layout_constraintStart_toStartOf);
    let se = this.refIds.get(attrKeys.layout_constraintStart_toEndOf);
    let es = this.refIds.get(attrKeys.layout_constraintEnd_toStartOf);
    let ee = this.refIds.get(attrKeys.layout_constraintEnd_toEndOf);
    let tt = this.refIds.get(attrKeys.layout_constraintTop_toTopOf);
    let tb = this.refIds.get(attrKeys.layout_constraintTop_toBottomOf);
    let bt = this.refIds.get(attrKeys.layout_constraintBottom_toTopOf);
    let bb = this.refIds.get(attrKeys.layout_constraintBottom_toBottomOf);
    let cx = this.refIds.get(attrKeys.layout_constraintCenterXAlign);
    let cy = this.refIds.get(attrKeys.layout_constraintCenterYAlign);
    if (cx === null) {
        cx = 'parent';
    }
    if (cy === null) {
        cy = 'parent';
    }


    if (maxWid && minWid) {
        if (ms && me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]-' + mee + '-|\n');
        } else if (ms && !me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]\n');
        } else if (!ms && me) {
            array.push('H:[' + this.id + '(==' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]-' + mee + '-|\n');
        } else if (!ms && !me) {
            if (cx === 'parent') {
                array.push('H:|~[' + this.id + '(==' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]~|\n');
            } else {
                array.push('H:|-0-[' + this.id + '(==' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]\n');
            }
        }

    } else if (!maxWid && !minWid) {
        if (ms && me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ')]-' + mee + '-|\n');
        } else if (ms && !me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ')]\n');
        } else if (!ms && me) {
            array.push('H:[' + this.id + '(==' + this.width + ')]-' + mee + '-|\n');
        } else if (!ms && !me) {
            if (cx === 'parent') {
                array.push('H:|~[' + this.id + '(==' + this.width + ')]~|\n');
            } else {
                array.push('H:|-0-[' + this.id + '(==' + this.width + ')]\n');
            }

        }

    } else if (maxWid) {
        if (ms && me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ',<=' + maxWidth + ')]-' + mee + '-|\n');
        } else if (ms && !me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ',<=' + maxWidth + ')]\n');
        } else if (!ms && me) {
            array.push('H:[' + this.id + '(==' + this.width + ',<=' + maxWidth + ')]-' + mee + '-|\n');
        } else if (!ms && !me) {
            if (cx === 'parent') {
                array.push('H:|~[' + this.id + '(==' + this.width + ',<=' + maxWidth + ')]~|\n');
            } else {
                array.push('H:|-0-[' + this.id + '(==' + this.width + ',<=' + maxWidth + ')]\n');
            }

        }

    } else if (minWid) {
        if (ms && me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ',>=' + minWidth + ')]-' + mee + '-|\n');
        } else if (ms && !me) {
            array.push('H:|-' + mss + '-[' + this.id + '(==' + this.width + ',>=' + minWidth + ')]\n');
        } else if (!ms && me) {
            array.push('H:[' + this.id + '(==' + this.width + ',>=' + minWidth + ')]-' + mee + '-|\n');
        } else if (!ms && !me) {
            if (cx === 'parent') {
                array.push('H:|~[' + this.id + '(==' + this.width + ',>=' + minWidth + ')]~|\n');
            } else {
                array.push('H:|-0-[' + this.id + '(==' + this.width + ',>=' + minWidth + ')]\n');
            }
        }
    }

    if (maxHei && minHei) {
        if (mt && mb) {
            array.push('V:|-' + mtt + '-[' + this.id + ',<=' + maxHeight + ',>=' + minHeight + ')]-' + mbb + '-|\n');
        } else if (mt && !mb) {
            array.push('V:|-' + mtt + '-[' + this.id + ',<=' + maxHeight + ',>=' + minHeight + ')]\n');
        } else if (!mt && mb) {
            array.push('V:[' + this.id + ',<=' + maxHeight + ',>=' + minHeight + ')]-' + mbb + '-|\n');
        } else if (!mt && !mb) {
            if (cy === 'parent') {
                array.push('V:|~[' + this.id + ',<=' + maxHeight + ',>=' + minHeight + ')]~|\n');
            } else {
                array.push('V:|-0-[' + this.id + ',<=' + maxHeight + ',>=' + minHeight + ')]\n');
            }
        }

    } else if (!maxHei && !minHei) {
        if (mt && mb) {
            array.push('V:|-' + mtt + '-[' + this.id + '(==' + this.height + ')]-' + mbb + '-|\n');
        } else if (mt && !mb) {
            array.push('V:|-' + mtt + '-[' + this.id + '(==' + this.height + ')]\n');
        } else if (!mt && mb) {
            array.push('V:[' + this.id + '(==' + this.height + ')]-' + mbb + '-|\n');
        } else if (!mt && !mb) {
            if (cy === 'parent') {
                array.push('V:|~[' + this.id + '(==' + this.height + ')]~|\n');
            } else {
                array.push('V:|-0-[' + this.id + '(==' + this.height + ')]\n');
            }
        }

    } else if (maxHei) {
        if (mt && mb) {
            array.push('V:|-' + mtt + '-[' + this.id + '(==' + this.height + ',<=' + maxHeight + ')]-' + mbb + '-|\n');
        } else if (mt && !mb) {
            array.push('V:|-' + mtt + '-[' + this.id + '(==' + this.height + ',<=' + maxHeight + ')]\n');
        } else if (!mt && mb) {
            array.push('V:[' + this.id + '(==' + this.height + ',<=' + maxHeight + ')]-' + mbb + '-|\n');
        } else if (!mt && !mb) {
            if (cy === 'parent') {
                array.push('V:|~[' + this.id + '(==' + this.height + ',<=' + maxHeight + ')]~|\n');
            } else {
                array.push('V:|-0-[' + this.id + '(==' + this.height + ',<=' + maxHeight + ')]\n');
            }
        }

    } else if (minHei) {
        if (mt && mb) {
            array.push('V:|-' + mtt + '-[' + this.id + '(==' + this.height + ',>=' + minHeight + ')]-' + mbb + '-|\n');
        } else if (mt && !mb) {
            array.push('V:|-' + mtt + '-[' + this.id + '(==' + this.height + ',>=' + minHeight + ')]|\n');
        } else if (!mt && mb) {
            array.push('V:[' + this.id + '(==' + this.height + ',>=' + minHeight + ')]-' + mbb + '-|\n');
        } else if (!mt && !mb) {
            if (cy === 'parent') {
                array.push('V:|~[' + this.id + '(==' + this.height + ',>=' + minHeight + ')]~|\n');
            } else {
                array.push('V:|-0-[' + this.id + '(==' + this.height + ',>=' + minHeight + ')]\n');
            }
        }
    }
    return '';
};
/**
 * Layout the content of an xml file relative to its root
 * @param {Workspace} wkspc
 * @return {string} the vfl definition for this View
 */
View.prototype.makeVFL = function (wkspc) {

    //make the margins a number or undefined/null if unspecified
    let mt = this.margins.top ? parseInt(this.margins.top) : this.margins.top;
    let mb = this.margins.bottom ? parseInt(this.margins.bottom) : this.margins.bottom;
    let ms = this.margins.start ? parseInt(this.margins.start) : this.margins.start;
    let me = this.margins.end ? parseInt(this.margins.end) : this.margins.end;


    let maxWid = this.refIds.get(attrKeys.layout_maxWidth);
    let maxHei = this.refIds.get(attrKeys.layout_maxHeight);
    let minWid = this.refIds.get(attrKeys.layout_minWidth);
    let minHei = this.refIds.get(attrKeys.layout_minHeight);
    let maxWidth, maxHeight, minWidth, minHeight;
    if (endsWith(maxWid, '%') === false) {
        maxWidth = parseInt(maxWid + '');
    } else {
        maxWidth = maxWid;
    }
    if (endsWith(minWid, '%') === false) {
        minWidth = parseInt(minWid + '');
    } else {
        minWidth = minWid;
    }
    if (endsWith(maxHei, '%') === false) {
        maxHeight = parseInt(maxHei + '');
    } else {
        maxHeight = maxHei;
    }
    if (endsWith(minHei, '%') === false) {
        minHeight = parseInt(minHei + '');
    } else {
        minHeight = minHei;
    }


    if (this.width === sizes.MATCH_PARENT) {
        this.width = '100%';
    }
    if (this.height === sizes.MATCH_PARENT) {
        this.height = '100%';
    }


    let isWidPct = endsWith(this.width, '%');
    let isHeiPct = endsWith(this.height, '%');
    let pw = parseInt(this.width);
    let ph = parseInt(this.height);
    if (this.dimRatio > 0) {
//dimRatio = w/h
        if (pw === 0) {
            if (isNaN(ph)) {
                this.width = this.height + "/" + (1.0 / this.dimRatio);
            } else {
                this.width = pw = ph * this.dimRatio;
            }
        }
        if (ph === 0) {
            if (isNaN(pw)) {
                this.height = this.width + "/" + this.dimRatio;
            } else {
                this.height = ph = pw / this.dimRatio;
            }
        }
    }


    let parent, hasIncludedParent;
    if (attributeNotEmpty(this.parentId)) {
        parent = wkspc.viewMap.get(this.parentId);
        hasIncludedParent = parent && (parent.constructor.name === 'IncludedView' || parent.constructor.name === 'FormView');
        // hasIncludedParent = parent && parent instanceof IncludedView;
    }
    /**
     * Must be the root node in an included file
     * The root view of an included element has no life of its own
     * as regards its vfl(positioning and margins). Its parent determines
     * everything for it. Its vfl returns an empty string.
     */
    if (hasIncludedParent === true) {
        return this.positionIncludedLayouts(parent.directChildConstraints, mt, mb, ms, me,
                maxWid, minWid, maxHei, minHei, maxWidth, minWidth, maxHeight, minHeight);
    }

    //For template views to be used with li, td and th
    if (wkspc.template === true && attributeEmpty(this.parentId)) {
        return this.positionIncludedLayouts(this.templateConstraints, mt, mb, ms, me,
                maxWid, minWid, maxHei, minHei, maxWidth, minWidth, maxHeight, minHeight);
    }

    ms = !ms ? '0' : (endsWith(this.margins.start, '%') ? this.margins.start : ms);
    me = !me ? '0' : (endsWith(this.margins.end, '%') ? this.margins.end : me);
    mt = !mt ? '0' : (endsWith(this.margins.top, '%') ? this.margins.top : mt);
    mb = !mb ? '0' : (endsWith(this.margins.bottom, '%') ? this.margins.bottom : mb);

    /**
     * EVFL seems not to support support percentage margins,
     * so here we try to convert percentage margins to actual margins.
     * This will obviously fail if the parent's width(which is our reference(as per css specs)
     * is a percentage. But let us do what we can for the developers that will use this library.
     */
    if (parent) {
        let parentWidth = parent.width;
        function converter(margin, parWid) {
            let val = ((parseFloat(margin) / 100.0) * parseFloat(parWid)) + '';
            return parseInt(val);
        }
        if (!endsWith(parentWidth, "%")) {
            if (endsWith(ms, '%')) {
                ms = converter(ms, parentWidth);
            }
            if (endsWith(me, '%')) {
                me = converter(me, parentWidth);
            }
            if (endsWith(mt, '%')) {
                mt = converter(mt, parentWidth);
            }
            if (endsWith(mb, '%')) {
                mb = converter(mb, parentWidth);
            }
        }
    }

    let ss = this.refIds.get(attrKeys.layout_constraintStart_toStartOf);
    let se = this.refIds.get(attrKeys.layout_constraintStart_toEndOf);
    let es = this.refIds.get(attrKeys.layout_constraintEnd_toStartOf);
    let ee = this.refIds.get(attrKeys.layout_constraintEnd_toEndOf);
    let tt = this.refIds.get(attrKeys.layout_constraintTop_toTopOf);
    let tb = this.refIds.get(attrKeys.layout_constraintTop_toBottomOf);
    let bt = this.refIds.get(attrKeys.layout_constraintBottom_toTopOf);
    let bb = this.refIds.get(attrKeys.layout_constraintBottom_toBottomOf);
    let cx = this.refIds.get(attrKeys.layout_constraintCenterXAlign);
    let cy = this.refIds.get(attrKeys.layout_constraintCenterYAlign);
    let vfl = new StringBuffer();
    if (isWidPct === true) {


        if (maxWid && minWid) {
            vfl.append('H:[' + this.id + '(==' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]\n');
        } else if (!maxWid && !minWid) {
            vfl.append('H:[' + this.id + '(==' + this.width + ')]\n');
        } else if (maxWid) {
            vfl.append('H:[' + this.id + '(==' + this.width + ',<=' + maxWidth + ')]\n');
        } else if (minWid) {
            vfl.append('H:[' + this.id + '(==' + this.width + ',>=' + minWidth + ')]\n');
        }
    } else {
        if (this.width === sizes.WRAP_CONTENT) {
            let w = parseInt(this.wrapWidth);
            if (!isNaN(w)) {
                if (maxWid && minWid) {
                    vfl.append('H:[' + this.id + '(==' + w + ',<=' + maxWidth + ',>=' + minWidth + ')]\n');
                } else if (!maxWid && !minWid) {
                    vfl.append('H:[' + this.id + '(==' + w + ')]\n');
                } else if (maxWid) {
                    vfl.append('H:[' + this.id + '(==' + w + ',<=' + maxWidth + ')]\n');
                } else if (minWid) {
                    vfl.append('H:[' + this.id + '(==' + w + ',>=' + minWidth + ')]\n');
                }
            } else {
                throw 'Please implement wrap_content functionality for (' + this.constructor.name + ") , width of `" + this.id + "` set to wrap_content";
            }
        } else if (isNaN(pw)) {
            if (maxWid && minWid) {
                vfl.append('H:[' + this.id + '(' + this.width + ',<=' + maxWidth + ',>=' + minWidth + ')]\n');
            } else if (!maxWid && !minWid) {
                vfl.append('H:[' + this.id + '(' + this.width + ')]\n');
            } else if (maxWid) {
                vfl.append('H:[' + this.id + '(' + this.width + ',<=' + maxWidth + ')]\n');
            } else if (minWid) {
                vfl.append('H:[' + this.id + '(' + this.width + ',>=' + minWidth + ')]\n');
            }
        } else {
            if (maxWid && minWid) {
                vfl.append('H:[' + this.id + '(==' + pw + ',<=' + maxWidth + ',>=' + minWidth + ')]\n');
            } else if (!maxWid && !minWid) {
                vfl.append('H:[' + this.id + '(==' + pw + ')]\n');
            } else if (maxWid) {
                vfl.append('H:[' + this.id + '(==' + pw + ',<=' + maxWidth + ')]\n');
            } else if (minWid) {
                vfl.append('H:[' + this.id + '(==' + pw + ',>=' + minWidth + ')]\n');
            }
        }
    }


    if (isHeiPct === true) {
        if (maxHei && minHei) {
            vfl.append('V:[' + this.id + '(==' + this.height + ',<=' + maxHeight + ',>=' + minHeight + ')]\n');
        } else if (!maxHei && !minHei) {
            vfl.append('V:[' + this.id + '(==' + this.height + ')]\n');
        } else if (maxHei) {
            vfl.append('V:[' + this.id + '(==' + this.height + ',<=' + maxHeight + ')]\n');
        } else if (minHei) {
            vfl.append('V:[' + this.id + '(==' + this.height + ',>=' + minHeight + ')]\n');
        }
    } else {
        if (this.height === sizes.WRAP_CONTENT) {
            let h = parseInt(this.wrapHeight);
            if (!isNaN(h)) {
                if (maxHei && minHei) {
                    vfl.append('V:[' + this.id + '(==' + h + ',<=' + maxHeight + ',>=' + minHeight + ')]\n');
                } else if (!maxHei && !minHei) {
                    vfl.append('V:[' + this.id + '(==' + h + ')]\n');
                } else if (maxHei) {
                    vfl.append('V:[' + this.id + '(==' + h + ',<=' + maxHeight + ')]\n');
                } else if (minHei) {
                    vfl.append('V:[' + this.id + '(==' + h + ',>=' + minHeight + ')]\n');
                }
            } else {
                throw 'Please implement wrap_content functionality for (' + this.constructor.name + ") , height of `" + this.id + "` set to wrap_content";
            }
        } else if (isNaN(ph)) {
            if (maxHei && minHei) {
                vfl.append('V:[' + this.id + '(' + this.height + ',<=' + maxHeight + ',>=' + minHeight + ')]\n');
            } else if (!maxHei && !minHei) {
                vfl.append('V:[' + this.id + '(' + this.height + ')]\n');
            } else if (maxHei) {
                vfl.append('V:[' + this.id + '(' + this.height + ',<=' + maxHeight + ')]\n');
            } else if (minHei) {
                vfl.append('V:[' + this.id + '(' + this.height + ',>=' + minHeight + ')]\n');
            }
        } else {
            if (maxHei && minHei) {
                vfl.append('V:[' + this.id + '(==' + ph + ',<=' + maxHeight + ',>=' + minHeight + ')]\n');
            } else if (!maxHei && !minHei) {
                vfl.append('V:[' + this.id + '(==' + ph + ')]\n');
            } else if (maxHei) {
                vfl.append('V:[' + this.id + '(==' + ph + ',<=' + maxHeight + ')]\n');
            } else if (minHei) {
                vfl.append('V:[' + this.id + '(==' + ph + ',>=' + minHeight + ')]\n');
            }
        }
    }


    if (cx) {
        if (this.parentId === cx) {
            vfl.append('H:|~[' + this.id + ']~|\n'); //margins do not work when centering in parent
        } else {

            vfl.append('C:' + this.id + '.centerX(' + cx + '.centerX*1+' + ms + ')\n');
        }
    }

    if (cy) {
        if (this.parentId === cy) {
            vfl.append('V:|~[' + this.id + ']~|\n'); //margins do not work when centering in parent
        } else {
            vfl.append('C:' + this.id + '.centerY(' + cy + '.centerY)\n');
        }
    }

    if (ss) {
        if (this.parentId === ss) {
            if (ss === ee) {
                vfl.append('H:|~[' + this.id + ']~|\n');
            } else {
                vfl.append('H:|-' + ms + '-[' + this.id + ']\n');
            }
        } else {
            if (ss === ee) {
                vfl.append('C:' + this.id + '.centerX(' + ss + '.centerX*1+' + ms + ')\n');
            } else {
                vfl.append('C:' + this.id + '.left(' + ss + '.left*1+' + ms + ')\n');
            }
        }
    }
    if (ee) {
        if (this.parentId === ee) {
            if (ss !== ee) {
                vfl.append('H:[' + this.id + ']-' + me + '-|\n');
            }
        } else {
            if (ss !== ee) {
                vfl.append('C:' + this.id + '.right(' + ee + '.right*1-' + me + ')\n');
            }
        }
    }

    if (tt) {
        if (this.parentId === tt) {
            if (tt === bb) {
                vfl.append('V:|~[' + this.id + ']~|\n');
            } else {
                vfl.append('V:|-' + mt + '-[' + this.id + ']\n');
            }

        } else {
            if (tt === bb) {
                vfl.append('C:' + this.id + '.centerY(' + tt + '.centerY*1+' + mt + ')\n');
            } else {
                vfl.append('C:' + this.id + '.top(' + tt + '.top*1+' + mt + ')\n');
            }

        }
    }

    if (bb) {
        if (this.parentId === bb) {
            if (tt !== bb) {
                vfl.append('V:[' + this.id + ']-' + mb + '-|\n');
            }
        } else {
            if (tt !== bb) {
                vfl.append('C:' + this.id + '.bottom(' + bb + '.bottom*1-' + mb + ')\n');
            }
        }
    }

    if (se) {
        if (this.parentId === se) {
            throw 'Align start to parent end currently not possible..id = `' + this.id + '`';
        } else {
            vfl.append('C:' + this.id + '.left(' + se + '.right+' + ms + ')\n');
        }
    }

    if (es) {
        if (this.parentId === es) {
            throw 'Align end to parent start currently not possible..id = `' + this.id + '`';
        } else {
            vfl.append('C:' + this.id + '.right(' + es + '.left-' + me + ')\n');
        }
    }

    if (tb) {
        if (this.parentId === tb) {
            throw 'Align top to parent bottom currently not possible..id = `' + this.id + '`';
        } else {
            vfl.append('C:' + this.id + '.top(' + tb + '.bottom+' + mt + ')\n');
        }
    }

    if (bt) {
        if (this.parentId === bt) {
            throw 'Align bottom to parent top currently not possible..id = `' + this.id + '`';
        } else {
            vfl.append('C:' + this.id + '.bottom(' + bt + '.top-' + mb + ')\n');
        }
    }


    return vfl.toString().trim();
};
function isHTMLTagName(tagName) {
    if (typeof tagName === 'string') {
        const tags = 'a b u i body head header h1 h2 h3 h4 h5 h6 style title div p span button checkbox radio input label textarea select legend ul ol li link table tbody thead tfoot tr td th option optgroup video meta img hr picture pre script section small strong noscript object canvas caption blockquote article audio time var cite code iframe nav noframes menu br'.split(' ');
        return tags.indexOf(tagName.trim().toLowerCase()) > -1;
    }
    return false;
}

function getSignedValue(val) {
    if (typeof val === 'undefined') {
        return '+0.0';
    }
    if (typeof val === 'string') {
        let p = parseInt(val);
        return isNaN(p) ? "+0.0" : (p >= 0 ? "+" + p : "" + p);
    }
    if (typeof val === 'number') {
        return (val > 0 ? "+" + val : "-" + val);
    }
}

View.prototype.assignId = function () {
    if (this.htmlElement) {
        this.htmlElement.setAttribute(attrKeys.id, this.id);
        const cssClass = this.refIds.get(attrKeys.cssClass);
        if (attributeNotEmpty(cssClass)) {
            addClass(this.htmlElement, cssClass);
        }
    }
};
/**
 *
 * @returns {string}
 */
View.prototype.toHTML = function () {
    let node = this.htmlElement;
    if (node) {
        let outerHtmlHackElem = null;
        const nodeName = node.nodeName.toLowerCase();
        if (isHTMLTagName(nodeName)) {

            if (nodeName === 'li') {
                outerHtmlHackElem = document.createElement('ul');
            } else if (nodeName === 'tbody' || nodeName === 'thead' || nodeName === 'tfoot') {
                outerHtmlHackElem = document.createElement('table');
            } else if (nodeName === 'tr') {
                outerHtmlHackElem = document.createElement('table');
            } else if (nodeName === 'td' || nodeName === 'th') {
                outerHtmlHackElem = document.createElement('tr');
            } else if (nodeName === 'option') {
                outerHtmlHackElem = document.createElement('select');
            } else {//A div should be able to wrap most of the remaining element types
                outerHtmlHackElem = document.createElement('div');
            }
            outerHtmlHackElem.appendChild(node);
            let outerHtmlHack = outerHtmlHackElem.innerHTML;
            return outerHtmlHack;
        } else {
            throw 'Invalid HTML element!';
        }
    }
    throw 'Please specify an HTML element here!';
};
/**
 *
 * @param {type} node The xml node
 * @returns {undefined}
 */
View.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    let id = node.getAttribute(attrKeys.id);
    this.htmlElement.id = id;
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }


    useAutomaticBackgrounds(this, node);

    this.calculateWrapContentSizes(node);
};

let useAutomaticBackgrounds = function (view, node) {
    if(!(view instanceof View)){
        throw 'Invalid View found';
    }
    let useAutoBg = node.getAttribute(attrKeys.useMiBackground);

    if (useAutoBg) {
        view.bgImage = null;
        let fgColor = node.getAttribute(attrKeys.miFgColor);
        let bgColor = node.getAttribute(attrKeys.miBgColor);
        let strokeWidth = node.getAttribute(attrKeys.miStrokeWidth);
        let minSize = node.getAttribute(attrKeys.miMinSize);
        let textArray = node.getAttribute(attrKeys.miTextArray);
        let fontName = node.getAttribute(attrKeys.miFontName);
        let fontWeight = node.getAttribute(attrKeys.miFontWeight);//bold
        let fontStyle = node.getAttribute(attrKeys.miFontStyle);//italic
        let fontSize = node.getAttribute(attrKeys.miFontSize);
        let numShapes = node.getAttribute(attrKeys.miNumShapes);
        let shapesDensity = node.getAttribute(attrKeys.miShapesDensity);
        let opacityValue = node.getAttribute(attrKeys.miOpacity);
        let cacheAfterDraw = node.getAttribute(attrKeys.miCacheAfterDraw);
        let bgOpacityEnabled = node.getAttribute(attrKeys.miBgOpacityEnabled);//allow the opacity to affect the background color also.


        let textOnly = node.getAttribute(attrKeys.miTextOnly);

        let style = null;
        if (fontStyle) {
            style = fontStyle;
            if (fontWeight) {
                style += (" " + fontWeight);
            }
        } else if (fontWeight) {
            style = fontWeight;
        }


        if (textArray) {
            try {
                textArray = JSON.parse(textArray);
            } catch (e) {
                throw e;
            }
        }

        cacheAfterDraw = cacheAfterDraw === true || cacheAfterDraw === 'true';
        textOnly = textOnly === true || textOnly === 'true';
        bgOpacityEnabled = bgOpacityEnabled === true || bgOpacityEnabled === 'true';



        let options = {
            width: view.width,
            height: view.height,
            fontName: fontName,
            fontSize: fontSize,
            fontStyle: style,
            fgColor: fgColor,
            bgColor: bgColor,
            numShapes: numShapes, // Total number of shapes to generate
            shapesDensity: shapesDensity, //Total number of shapes per unit area
            strokeWidth: strokeWidth,
            minSize: minSize, //The minimum size of the shapes drawn
            opacity: opacityValue,
            bgOpacityEnabled: bgOpacityEnabled,
            textArray: textArray, //An array of words that can be rendered randomly on the view.
            textOnly: textOnly, //Forces the view to render only text from the textArray attribute
            cacheAfterDraw: cacheAfterDraw //Renders the image once for a view and uses it subsequently.If false, this view will always have a new set of patterns whenever it is refreshed.
        };

        view.runView = function () {
            let cStyle= getComputedStyle(this.htmlElement);
            options.width = cStyle.width;
            options.height = cStyle.height;
            let background = new MysteryImage(options);
            background.draw();
            let style = new Style('#'+this.htmlElement.id,[]);
            style.addFromOptions({
                "background-image": "url('" + background.getImage() + "')",
                "background-position": "0% 0%"
            });
            updateOrCreateSelectorInStyleSheet(styleSheet, style);
            console.log("image-cache: ", background.imageCache);
            background.cleanup();
        };
    }
};

/*View.prototype.calculateWrapContentSizes = function (node) {
 //bold 12pt arial;
 let w = node.getAttribute(attrKeys.layout_width);
 let h = node.getAttribute(attrKeys.layout_height);
 if (w === sizes.WRAP_CONTENT || h === sizes.WRAP_CONTENT) {
 let elem = this.htmlElement.cloneNode(true);
 //elem.style.visibility = 'hidden';
 this.style.applyInline(elem);
 document.body.appendChild(elem);
 this.wrapWidth = (0.813 * parseFloat(window.getComputedStyle(elem).width)) + 'px';
 this.wrapHeight = (0.825 * parseFloat(window.getComputedStyle(elem).height)) + 'px';
 //console.log('wrapWidth: '+this.wrapWidth, 'wrapHeight: '+this.wrapHeight+"...", this.constructor.name,"[",this.id,"]");
 elem.remove();
 }
 };*/

View.prototype.calculateWrapContentSizes = function (node) {
    //bold 12pt arial;
    let w = node.getAttribute(attrKeys.layout_width);
    let h = node.getAttribute(attrKeys.layout_height);
    let elem = this.htmlElement.cloneNode(true);
    //elem.style.visibility = 'hidden';
    if (w === sizes.WRAP_CONTENT && h === sizes.WRAP_CONTENT) {
        this.style.applyInline(elem);
        document.body.appendChild(elem);
        this.wrapWidth = (0.813 * parseFloat(window.getComputedStyle(elem).width)) + 'px';
        this.wrapHeight = (0.825 * parseFloat(window.getComputedStyle(elem).height)) + 'px';
        //console.log('wrapWidth: '+this.wrapWidth, 'wrapHeight: '+this.wrapHeight+"...", this.constructor.name,"[",this.id,"]");
        elem.remove();
    } else if (w !== sizes.WRAP_CONTENT && h === sizes.WRAP_CONTENT) {
        let stl = this.style.clone('.quick_clone_' + this.id);
        stl.addFromOptions({
            width: w
        });
        stl.applyInline(elem);
        document.body.appendChild(elem);
        this.wrapHeight = (0.825 * parseFloat(window.getComputedStyle(elem).height)) + 'px';

        elem.remove();

    } else if (w === sizes.WRAP_CONTENT && h !== sizes.WRAP_CONTENT) {
        let stl = this.style.clone('.quick_clone_' + this.id);
        stl.addFromOptions({
            height: h
        });
        stl.applyInline(elem);
        document.body.appendChild(elem);
        this.wrapWidth = (0.813 * parseFloat(window.getComputedStyle(elem).width)) + 'px';
        elem.remove();
    }
};
CheckBox.prototype = Object.create(View.prototype);
CheckBox.prototype.constructor = CheckBox;
Button.prototype = Object.create(View.prototype);
Button.prototype.constructor = Button;
ImageButton.prototype = Object.create(View.prototype);
ImageButton.prototype.constructor = ImageButton;
NativeTable.prototype = Object.create(View.prototype);
NativeTable.prototype.constructor = NativeTable;
CustomTableView.prototype = Object.create(View.prototype);
CustomTableView.prototype.constructor = CustomTableView;
InputTableView.prototype = Object.create(CustomTableView.prototype);
InputTableView.prototype.constructor = InputTableView;
GrowableTableView.prototype = Object.create(InputTableView.prototype);
GrowableTableView.prototype.constructor = GrowableTableView;
SearchableTableView.prototype = Object.create(GrowableTableView.prototype);
SearchableTableView.prototype.constructor = SearchableTableView;
TextField.prototype = Object.create(View.prototype);
TextField.prototype.constructor = TextField;
TextArea.prototype = Object.create(View.prototype);
TextArea.prototype.constructor = TextArea;
DropDown.prototype = Object.create(View.prototype);
DropDown.prototype.constructor = DropDown;
NativeList.prototype = Object.create(View.prototype);
NativeList.prototype.constructor = NativeList;
ListView.prototype = Object.create(View.prototype);
ListView.prototype.constructor = ListView;
HorizontalListView.prototype = Object.create(ListView.prototype);
HorizontalListView.prototype.constructor = HorizontalListView;
GridView.prototype = Object.create(ListView.prototype);
GridView.prototype.constructor = GridView;
Label.prototype = Object.create(View.prototype);
Label.prototype.constructor = Label;
Paragraph.prototype = Object.create(View.prototype);
Paragraph.prototype.constructor = Paragraph;
IconLabelView.prototype = Object.create(View.prototype);
IconLabelView.prototype.constructor = IconLabelView;


MultiLineLabel.prototype = Object.create(View.prototype);
MultiLineLabel.prototype.constructor = MultiLineLabel;

RadioGroup.prototype = Object.create(View.prototype);
RadioGroup.prototype.constructor = RadioGroup;
Radio.prototype = Object.create(View.prototype);
Radio.prototype.constructor = Radio;
ImageView.prototype = Object.create(View.prototype);
ImageView.prototype.constructor = ImageView;
TabView.prototype = Object.create(View.prototype);
TabView.prototype.constructor = TabView;
ProgressBar.prototype = Object.create(View.prototype);
ProgressBar.prototype.constructor = ProgressBar;
Separator.prototype = Object.create(View.prototype);
Separator.prototype.constructor = Separator;
Guideline.prototype = Object.create(View.prototype);
Guideline.prototype.constructor = Guideline;
CanvasView.prototype = Object.create(View.prototype);
CanvasView.prototype.constructor = CanvasView;
ClockView.prototype = Object.create(View.prototype);
ClockView.prototype.constructor = ClockView;
IncludedView.prototype = Object.create(View.prototype);
IncludedView.prototype.constructor = IncludedView;
FormView.prototype = Object.create(IncludedView.prototype);
FormView.prototype.constructor = FormView;
VideoView.prototype = Object.create(View.prototype);
VideoView.prototype.constructor = VideoView;
AudioView.prototype = Object.create(View.prototype);
AudioView.prototype.constructor = AudioView;
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {CheckBox}
 */
function CheckBox(wkspc, node) {
    View.call(this, wkspc, node);
}

CheckBox.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('input');
    this.htmlElement.type = 'checkbox';
    let id = node.getAttribute(attrKeys.id);
    this.htmlElement.id = id;
    let value = node.getAttribute(attrKeys.value);
    if (attributeNotEmpty(value)) {
        this.htmlElement.value = value;
    }
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    this.calculateWrapContentSizes(node);
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Button(wkspc, node) {
    View.call(this, wkspc, node);
}

Button.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('input');
    this.style.addStyleElementCss('text-align: center;');
    let id = node.getAttribute(attrKeys.id);
    this.htmlElement.id = id;
    let type = node.getAttribute(attrKeys.inputType);
    if (type !== 'button' && type !== 'submit') {
        this.htmlElement.setAttribute('type', 'button');
    } else {
        this.htmlElement.setAttribute('type', type);
    }

    let value = node.getAttribute(attrKeys.value);
    let text = node.getAttribute(attrKeys.text);
    if (attributeNotEmpty(value)) {
        this.htmlElement.value = value; // button label
    }
    if (attributeNotEmpty(text)) {
        this.htmlElement.value = text; // button label
    }

    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    this.calculateWrapContentSizes(node);
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function ImageButton(wkspc, node) {
    View.call(this, wkspc, node);
}

ImageButton.prototype.createElement = function (node) {

    this.htmlElement = document.createElement('input');
    this.htmlElement.type = 'button';
    this.style.addStyleElementCss('border: 0;');
    this.style.addStyleElementCss('background-repeat: no-repeat;');
    this.style.addStyleElementCss('background-position: center;');
    this.style.addStyleElementCss('background-size: contain;');
    this.style.addStyleElementCss('background-origin: content-box;');
    this.style.addStyleElementCss('background-image: url(\'' + getImagePath(node.getAttribute(attrKeys.src)) + '\');');
    let id = node.getAttribute(attrKeys.id);
    this.htmlElement.id = id;
    let value = node.getAttribute(attrKeys.value);
    let text = node.getAttribute(attrKeys.text);
    if (attributeNotEmpty(value)) {
        this.htmlElement.value = value; // button label
    }
    if (attributeNotEmpty(text)) {
        this.htmlElement.value = text; // button label
    }

    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    this.calculateWrapContentSizes(node);
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function NativeTable(wkspc, node) {
    View.call(this, wkspc, node);
}

NativeTable.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('table');
    this.assignId();
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let tfoot = document.createElement('tfoot');
    let entries = node.getAttribute(attrKeys.tableItems);
    let hasHeader = node.getAttribute(attrKeys.hasHeader);
    let hasFooter = node.getAttribute(attrKeys.hasFooter);
    if (!attributeNotEmpty(hasHeader)) {
        hasHeader = false;
    }
    if (!attributeNotEmpty(hasFooter)) {
        hasFooter = false;
    }

    if (attributeNotEmpty(entries)) {
        let array;
        try {
            array = JSON.parse(entries);
            validateTableJson(array);
        } catch (e) {
            throw new Error('Invalid table json! JSON should be a 2D array of table rows');
        }

        let tableSize = array.length;
        for (let i = 0; i < tableSize; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < array[i].length; j++) {
                let td = document.createElement('td');
                td.innerHTML = array[i][j];
                tr.appendChild(td);
            }
            if (tableSize === 1) {
                tbody.appendChild(tr);
                break;
            } else if (tableSize === 2) {
                if (i === 0) {
                    if (hasHeader) {
                        thead.appendChild(tr);
                    } else {
                        tbody.appendChild(tr);
                    }
                } else if (i === array.length - 1) {
                    if (hasFooter) {
                        tfoot.appendChild(tr);
                    } else {
                        tbody.appendChild(tr);
                    }
                }
            } else if (tableSize > 2) {
                if (i === 0) {
                    if (hasHeader) {
                        thead.appendChild(tr);
                    } else {
                        tbody.appendChild(tr);
                    }
                } else if (i === array.length - 1) {
                    if (hasFooter) {
                        tfoot.appendChild(tr);
                    } else {
                        tbody.appendChild(tr);
                    }
                } else {
                    tbody.appendChild(tr);
                }
            }


        }

        this.htmlElement.appendChild(tbody);
        if (hasHeader) {
            this.htmlElement.appendChild(thead);
        }
        if (hasFooter) {
            this.htmlElement.appendChild(tfoot);
        }
        this.calculateWrapContentSizes(node);
    }

};

/**
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {CustomTableView}
 */
function CustomTableView(wkspc, node) {
    this.options = {};
    this.exoticView = null;
    View.call(this, wkspc, node);
}


CustomTableView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.assignId();
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let hasCaption = node.getAttribute(attrKeys.hasCaption);
    let caption = node.getAttribute(attrKeys.caption);
    let scrollHeight = node.getAttribute(attrKeys.scrollHeight);
    let withNumbering = node.getAttribute(attrKeys.withNumbering);
    let hasContainer = node.getAttribute(attrKeys.hasContainer);
    let hasFooter = node.getAttribute(attrKeys.hasFooter);
    let headers = node.getAttribute(attrKeys.tableHeaders);
    let entries = node.getAttribute(attrKeys.tableItems);
    let data = [];
    let title = node.getAttribute(attrKeys.title);
    let showBorders = node.getAttribute(attrKeys.showBorders);
    let pagingEnabled = node.getAttribute(attrKeys.pagingEnabled);
    let icon = PATH_TO_IMAGES + node.getAttribute(attrKeys.src);
    let cellPadding = node.getAttribute(attrKeys.cellPadding);
    let headerPadding = node.getAttribute(attrKeys.headerPadding);
    let fontSize = node.getAttribute(attrKeys.fontSize);
    let cssClass = node.getAttribute(attrKeys.cssClass);
    let theme = node.getAttribute(attrKeys.tableTheme);
    let scrollable = node.getAttribute(attrKeys.scrollable);
    let footertext = node.getAttribute(attrKeys.footerText);
    if (attributeNotEmpty(hasCaption)) {
        hasCaption = hasCaption === 'true';
    } else {
        hasCaption = false;
    }
    if (attributeEmpty(caption)) {
        caption = '';
    }

    if (attributeEmpty(scrollHeight)) {
        scrollHeight = '120px';
    }
    if (attributeNotEmpty(withNumbering)) {
        withNumbering = withNumbering === 'true';
    } else {
        withNumbering = false;
    }

    if (attributeNotEmpty(hasContainer)) {
        hasContainer = hasContainer === 'true';
    } else {
        hasContainer = true;
    }

    if (attributeNotEmpty(hasFooter)) {
        hasFooter = hasFooter === 'true';
    } else {
        hasFooter = false;
    }


    if (attributeNotEmpty(showBorders)) {
        showBorders = showBorders === 'true';
    } else {
        showBorders = true;
    }


    if (attributeNotEmpty(pagingEnabled)) {
        pagingEnabled = pagingEnabled === 'true';
    } else {
        pagingEnabled = false; //set to true to enable paging by default
    }

    if (attributeNotEmpty(scrollable)) {
        scrollable = scrollable === 'true';
    } else {
        scrollable = true;
    }

    if (attributeNotEmpty(headers)) {
        headers = JSON.parse(headers);
        if (!headers) {
            throw new Error('Invalid table header array!');
        }
        if (!isOneDimArray(headers)) {
            throw new Error('Table header must be a one dimensional array!');
        }
    } else {
        throw new Error('Table headers not specified for CustomTableView: ' + this.id);
    }
    if (attributeNotEmpty(entries)) {
        try {
            data = JSON.parse(entries);
            validateTableJson(data);
        } catch (e) {
            throw new Error('Invalid table json! JSON should be a 2D array of table rows');
        }
    } else {
        data = [];
    }


    if (attributeEmpty(title)) {
        title = 'Set Title';
    }


    if (attributeEmpty(icon)) {
        icon = "";
    }

    if (attributeEmpty(cellPadding)) {
        cellPadding = "1.3em";
    }

    if (attributeEmpty(headerPadding)) {
        headerPadding = "4px";
    }

    if (attributeEmpty(fontSize)) {
        fontSize = "1.0em";
    }

    if (attributeEmpty(cssClass)) {
        cssClass = "";
    }

    if (attributeEmpty(theme)) {
        theme = "#444444";
    }

    if (attributeEmpty(footertext)) {
        footertext = "FOOTER TEXT GOES HERE";
    }


    this.options = {
        id: this.htmlElement.id + '_core',
        hasCaption: hasCaption,
        hasContainer: hasContainer,
        caption: caption,
        scrollHeight: scrollHeight,
        withNumbering: withNumbering,
        width: "100%",
        hasFooter: hasFooter,
        showBorders: showBorders,
        pagingEnabled: pagingEnabled,
        icon: icon,
        fontSize: fontSize,
        cellpadding: cellPadding,
        headerPadding: headerPadding,
        title: title,
        footerText: footertext,
        scrollable: scrollable,
        theme: theme,
        parent: this.htmlElement,
        headers: headers,
        data: data
    };
    this.options.bodyData = data;
    if (cssClass && cssClass !== "") {
        this.options.classname = cssClass;
    }
    this.exoticView = new Table(this.options);
    //this.exoticView.build(this.htmlElement);

    this.calculateWrapContentSizes(node);
};
CustomTableView.prototype.calculateWrapContentSizes = function (node) {
    let container = this.htmlElement;
    this.style.applyInline(container);
    document.body.appendChild(container);
    this.exoticView.loadTable(this.options.bodyData);
    let sz = this.exoticView.getCurrentSize();
    this.wrapWidth = sz.width;
    this.wrapHeight = sz.height;
    container.remove();
};
CustomTableView.prototype.runView = function () {
    this.exoticView.loadTable(this.options.bodyData);
};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {InputTableView}
 */
function InputTableView(wkspc, node) {
    CustomTableView.call(this, wkspc, node);
}

InputTableView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.assignId();
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let hasCaption = node.getAttribute(attrKeys.hasCaption);
    let caption = node.getAttribute(attrKeys.caption);
    let scrollHeight = node.getAttribute(attrKeys.scrollHeight);
    let withNumbering = node.getAttribute(attrKeys.withNumbering);
    let hasContainer = node.getAttribute(attrKeys.hasContainer);
    let hasFooter = node.getAttribute(attrKeys.hasFooter);
    let headers = node.getAttribute(attrKeys.tableHeaders);
    let entries = node.getAttribute(attrKeys.tableItems);
    let data = [];
    let title = node.getAttribute(attrKeys.title);
    let showBorders = node.getAttribute(attrKeys.showBorders);
    let pagingEnabled = node.getAttribute(attrKeys.pagingEnabled);
    let icon = PATH_TO_IMAGES + node.getAttribute(attrKeys.src);
    let cellPadding = node.getAttribute(attrKeys.cellPadding);
    let headerPadding = node.getAttribute(attrKeys.headerPadding);
    let fontSize = node.getAttribute(attrKeys.fontSize);
    let cssClass = node.getAttribute(attrKeys.cssClass);
    let theme = node.getAttribute(attrKeys.tableTheme);
    let scrollable = node.getAttribute(attrKeys.scrollable);
    let footertext = node.getAttribute(attrKeys.footerText);
    let actionColumns = node.getAttribute(attrKeys.actionColumns);
    let checkableColumns = node.getAttribute(attrKeys.checkableColumns);
    let textColumns = node.getAttribute(attrKeys.textColumns);
    let selectColumns = node.getAttribute(attrKeys.selectColumns);
    if (attributeNotEmpty(hasCaption)) {
        hasCaption = hasCaption === 'true';
    } else {
        hasCaption = false;
    }
    if (attributeEmpty(caption)) {
        caption = '';
    }

    if (attributeEmpty(scrollHeight)) {
        scrollHeight = '120px';
    }
    if (attributeNotEmpty(withNumbering)) {
        withNumbering = withNumbering === 'true';
    } else {
        withNumbering = false;
    }

    if (attributeNotEmpty(hasContainer)) {
        hasContainer = hasContainer === 'true';
    } else {
        hasContainer = true;
    }

    if (attributeNotEmpty(hasFooter)) {
        hasFooter = hasFooter === 'true';
    } else {
        hasFooter = false;
    }


    if (attributeNotEmpty(showBorders)) {
        showBorders = showBorders === 'true';
    } else {
        showBorders = true;
    }


    if (attributeNotEmpty(pagingEnabled)) {
        pagingEnabled = pagingEnabled === 'true';
    } else {
        pagingEnabled = false; //set to true to enable paging by default
    }

    if (attributeNotEmpty(scrollable)) {
        scrollable = scrollable === 'true';
    } else {
        scrollable = true;
    }

    if (attributeNotEmpty(headers)) {
        headers = JSON.parse(headers);
        if (!headers) {
            throw new Error('Invalid table header array!');
        }
        if (!isOneDimArray(headers)) {
            throw new Error('Table header must be a one dimensional array!');
        }
    } else {
        throw new Error('Table headers not specified for CustomTableView: ' + this.id);
    }
    if (attributeNotEmpty(entries)) {
        try {
            data = JSON.parse(entries);
            validateTableJson(data);
        } catch (e) {
            throw new Error('Invalid table json! JSON should be a 2D array of table rows');
        }
    } else {
        data = [];
    }


    if (attributeEmpty(title)) {
        title = 'Set Title';
    }


    if (attributeEmpty(icon)) {
        icon = "";
    }

    if (attributeEmpty(cellPadding)) {
        cellPadding = "1.3em";
    }

    if (attributeEmpty(headerPadding)) {
        headerPadding = "4px";
    }

    if (attributeEmpty(fontSize)) {
        fontSize = "1.0em";
    }

    if (attributeEmpty(cssClass)) {
        cssClass = "";
    }

    if (attributeEmpty(theme)) {
        theme = "#444444";
    }

    if (attributeEmpty(footertext)) {
        footertext = "FOOTER TEXT GOES HERE";
    }
    if (attributeEmpty(actionColumns)) {
        actionColumns = [];
    } else {
        actionColumns = JSON.parse(actionColumns);
    }
    if (attributeEmpty(checkableColumns)) {
        checkableColumns = [];
    } else {
        checkableColumns = JSON.parse(checkableColumns);
    }
    if (attributeEmpty(textColumns)) {
        textColumns = [];
    } else {
        textColumns = JSON.parse(textColumns);
    }
    if (attributeEmpty(selectColumns)) {
        selectColumns = [];
    } else {
        selectColumns = JSON.parse(selectColumns);
    }


    this.options = {
        id: this.htmlElement.id + '_core',
        hasCaption: hasCaption,
        hasContainer: hasContainer,
        caption: caption,
        scrollHeight: scrollHeight,
        withNumbering: withNumbering,
        width: "100%",
        hasFooter: hasFooter,
        showBorders: showBorders,
        pagingEnabled: pagingEnabled,
        onAddBtnClicked: function () {
        },
        'main-style': {
            'margin-top': '1.2em'
        },
        icon: icon,
        fontSize: fontSize,
        cellpadding: cellPadding,
        headerPadding: headerPadding,
        title: title,
        footerText: footertext,
        scrollable: scrollable,
        theme: theme,
        headers: headers,
        data: data,
        parent: this.htmlElement,
        checkablecolumns: checkableColumns,
        actioncolumns: actionColumns,
        textcolumns: textColumns,
        selectcolumns: selectColumns
    };
    this.options.bodyData = data;
    if (cssClass && cssClass !== "") {
        this.options.classname = cssClass;
    }
    this.exoticView = new InputTable(this.options);
    //this.exoticView.build(this.htmlElement);

    this.calculateWrapContentSizes(node);
};
InputTableView.prototype.calculateWrapContentSizes = function (node) {
    let container = this.htmlElement;
    this.style.applyInline(container);
    document.body.appendChild(container);
    this.exoticView.loadTable(this.options.bodyData);
    let sz = this.exoticView.getCurrentSize();
    this.wrapWidth = sz.width;
    this.wrapHeight = sz.height;
    container.remove();
};
/**
 *
 @param {Workspace} wkspc
 * @param {type} node
 * @returns {GrowableTableView}
 */
function GrowableTableView(wkspc, node) {
    InputTableView.call(this, wkspc, node);
}


GrowableTableView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.assignId();
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }
    let hasCaption = node.getAttribute(attrKeys.hasCaption);
    let caption = node.getAttribute(attrKeys.caption);
    let scrollHeight = node.getAttribute(attrKeys.scrollHeight);
    let withNumbering = node.getAttribute(attrKeys.withNumbering);
    let hasContainer = node.getAttribute(attrKeys.hasContainer);
    let hasFooter = node.getAttribute(attrKeys.hasFooter);
    let headers = node.getAttribute(attrKeys.tableHeaders);
    let entries = node.getAttribute(attrKeys.tableItems);
    let data = [];
    let title = node.getAttribute(attrKeys.title);
    let showBorders = node.getAttribute(attrKeys.showBorders);
    let pagingEnabled = node.getAttribute(attrKeys.pagingEnabled);
    let icon = PATH_TO_IMAGES + node.getAttribute(attrKeys.src);
    let cellPadding = node.getAttribute(attrKeys.cellPadding);
    let headerPadding = node.getAttribute(attrKeys.headerPadding);
    let fontSize = node.getAttribute(attrKeys.fontSize);
    let cssClass = node.getAttribute(attrKeys.cssClass);
    let theme = node.getAttribute(attrKeys.tableTheme);
    let scrollable = node.getAttribute(attrKeys.scrollable);
    let buttonText = node.getAttribute(attrKeys.buttonText);
    let footertext = node.getAttribute(attrKeys.footerText);
    let actionColumns = node.getAttribute(attrKeys.actionColumns);
    let checkableColumns = node.getAttribute(attrKeys.checkableColumns);
    let textColumns = node.getAttribute(attrKeys.textColumns);
    let selectColumns = node.getAttribute(attrKeys.selectColumns);
    if (attributeNotEmpty(hasCaption)) {
        hasCaption = hasCaption === 'true';
    } else {
        hasCaption = false;
    }
    if (attributeEmpty(caption)) {
        caption = '';
    }

    if (attributeEmpty(scrollHeight)) {
        scrollHeight = '120px';
    }
    if (attributeNotEmpty(withNumbering)) {
        withNumbering = withNumbering === 'true';
    } else {
        withNumbering = false;
    }

    if (attributeNotEmpty(hasContainer)) {
        hasContainer = hasContainer === 'true';
    } else {
        hasContainer = true;
    }

    if (attributeNotEmpty(hasFooter)) {
        hasFooter = hasFooter === 'true';
    } else {
        hasFooter = false;
    }


    if (attributeNotEmpty(showBorders)) {
        showBorders = showBorders === 'true';
    } else {
        showBorders = true;
    }


    if (attributeNotEmpty(pagingEnabled)) {
        pagingEnabled = pagingEnabled === 'true';
    } else {
        pagingEnabled = false; //set to true to enable paging by default
    }

    if (attributeNotEmpty(scrollable)) {
        scrollable = scrollable === 'true';
    } else {
        scrollable = true;
    }

    if (attributeNotEmpty(headers)) {
        headers = JSON.parse(headers);
        if (!headers) {
            throw new Error('Invalid table header array!');
        }
        if (!isOneDimArray(headers)) {
            throw new Error('Table header must be a one dimensional array!');
        }
    } else {
        throw new Error('Table headers not specified for CustomTableView: ' + this.id);
    }
    if (attributeNotEmpty(entries)) {
        try {
            data = JSON.parse(entries);
            validateTableJson(data);
        } catch (e) {
            throw new Error('Invalid table json! JSON should be a 2D array of table rows');
        }
    } else {
        data = [];
    }


    if (attributeEmpty(title)) {
        title = 'Set Title';
    }


    if (attributeEmpty(icon)) {
        icon = "";
    }

    if (attributeEmpty(cellPadding)) {
        cellPadding = '4px';
    }

    if (attributeEmpty(headerPadding)) {
        headerPadding = "4px";
    }

    if (attributeEmpty(fontSize)) {
        fontSize = "1.0em";
    }

    if (attributeEmpty(cssClass)) {
        cssClass = "";
    }

    if (attributeEmpty(theme)) {
        theme = "#444444";
    }

    if (attributeEmpty(footertext)) {
        footertext = "FOOTER TEXT GOES HERE";
    }

    if (attributeEmpty(buttonText)) {
        buttonText = "Button";
    }
    if (attributeEmpty(actionColumns)) {
        actionColumns = [];
    } else {
        actionColumns = JSON.parse(actionColumns);
    }
    if (attributeEmpty(checkableColumns)) {
        checkableColumns = [];
    } else {
        checkableColumns = JSON.parse(checkableColumns);
    }
    if (attributeEmpty(textColumns)) {
        textColumns = [];
    } else {
        textColumns = JSON.parse(textColumns);
    }
    if (attributeEmpty(selectColumns)) {
        selectColumns = [];
    } else {
        selectColumns = JSON.parse(selectColumns);
    }


    this.options = {
        id: this.htmlElement.id + '_core',
        hasCaption: hasCaption,
        hasContainer: hasContainer,
        caption: caption,
        scrollHeight: scrollHeight,
        withNumbering: withNumbering,
        width: "100%",
        hasFooter: hasFooter,
        showBorders: showBorders,
        pagingEnabled: pagingEnabled,
        onAddBtnClicked: function () {
        },
        'main-style': {
            'margin-top': '1.2em'
        },
        icon: icon,
        fontSize: fontSize,
        cellpadding: cellPadding,
        headerPadding: headerPadding,
        title: title,
        footerText: footertext,
        scrollable: scrollable,
        theme: theme,
        buttonText: buttonText,
        headers: headers,
        data: data,
        parent: this.htmlElement,
        checkablecolumns: checkableColumns,
        actioncolumns: actionColumns,
        textcolumns: textColumns,
        selectcolumns: selectColumns
    };
    this.options.bodyData = data;
    if (cssClass && cssClass !== "") {
        this.options.classname = cssClass;
    }
    this.exoticView = new GrowableTable(this.options);
    // this.exoticView.build(this.htmlElement);

    this.calculateWrapContentSizes(node);
};
GrowableTableView.prototype.calculateWrapContentSizes = function (node) {
    let container = this.htmlElement;
    this.style.applyInline(container);
    document.body.appendChild(container);
    this.exoticView.loadTable(this.options.bodyData);
    let sz = this.exoticView.getCurrentSize();
    this.wrapWidth = sz.width;
    this.wrapHeight = sz.height;
    container.remove();
};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {SearchableTableView}
 */
function SearchableTableView(wkspc, node) {
    GrowableTableView.call(this, wkspc, node);
}

SearchableTableView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.assignId();
    this.style.addStyleElementCss('overflow: auto;');
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }
    let hasCaption = node.getAttribute(attrKeys.hasCaption);
    let caption = node.getAttribute(attrKeys.caption);
    let scrollHeight = node.getAttribute(attrKeys.scrollHeight);
    let withNumbering = node.getAttribute(attrKeys.withNumbering);
    let hasContainer = node.getAttribute(attrKeys.hasContainer);
    let headers = node.getAttribute(attrKeys.tableHeaders);
    let entries = node.getAttribute(attrKeys.tableItems);
    let hasFooter = node.getAttribute(attrKeys.hasFooter);
    let data = [];
    let title = node.getAttribute(attrKeys.title);
    let showBorders = node.getAttribute(attrKeys.showBorders);
    let pagingEnabled = node.getAttribute(attrKeys.pagingEnabled);
    let icon = PATH_TO_IMAGES + node.getAttribute(attrKeys.src);
    let cellPadding = node.getAttribute(attrKeys.cellPadding);
    let headerPadding = node.getAttribute(attrKeys.headerPadding);
    let fontSize = node.getAttribute(attrKeys.fontSize);
    let cssClass = node.getAttribute(attrKeys.cssClass);
    let theme = node.getAttribute(attrKeys.tableTheme);
    let scrollable = node.getAttribute(attrKeys.scrollable);
    let footertext = node.getAttribute(attrKeys.footerText);
    let buttonText = node.getAttribute(attrKeys.buttonText);
    let showLeftBtn = node.getAttribute(attrKeys.showLeftBtn);
    let actionColumns = node.getAttribute(attrKeys.actionColumns);
    let checkableColumns = node.getAttribute(attrKeys.checkableColumns);
    let textColumns = node.getAttribute(attrKeys.textColumns);
    let selectColumns = node.getAttribute(attrKeys.selectColumns);
    if (attributeNotEmpty(hasFooter)) {
        hasFooter = hasFooter === 'true';
    } else {
        hasFooter = false;
    }


    if (attributeNotEmpty(showBorders)) {
        showBorders = showBorders === 'true';
    } else {
        showBorders = true;
    }

    if (attributeNotEmpty(showLeftBtn)) {
        showLeftBtn = showLeftBtn === 'true';
    } else {
        showLeftBtn = true;
    }
    if (attributeNotEmpty(hasCaption)) {
        hasCaption = hasCaption === 'true';
    } else {
        hasCaption = attributeNotEmpty(caption);
    }

    if (attributeNotEmpty(hasContainer)) {
        hasContainer = hasContainer === 'true';
    } else {
        hasContainer = true;
    }

    if (attributeNotEmpty(withNumbering)) {
        withNumbering = withNumbering === 'true';
    } else {
        withNumbering = false;
    }

    if (attributeEmpty(scrollHeight)) {
        scrollHeight = '120px';
    }
    if (attributeNotEmpty(pagingEnabled)) {
        pagingEnabled = pagingEnabled === 'true';
    } else {
        pagingEnabled = false; //set to true to enable paging by default
    }

    if (attributeNotEmpty(scrollable)) {
        scrollable = scrollable === 'true';
    } else {
        scrollable = true;
    }

    if (attributeNotEmpty(headers)) {
        headers = JSON.parse(headers);
        if (!headers) {
            throw new Error('Invalid table header array!');
        }
        if (!isOneDimArray(headers)) {
            throw new Error('Table header must be a one dimensional array!');
        }
    } else {
        throw new Error('Table headers not specified for CustomTableView: ' + this.id);
    }
    if (attributeNotEmpty(entries)) {
        try {
            data = JSON.parse(entries);
            validateTableJson(data);
        } catch (e) {
            throw new Error('Invalid table json! JSON should be a 2D array of table rows...' + e);
        }
    } else {
        data = [];
    }


    if (attributeEmpty(title)) {
        title = 'Set Title';
    }


    if (attributeEmpty(icon)) {
        icon = "";
    }

    if (attributeEmpty(cellPadding)) {
        cellPadding = "4px";
    }

    if (attributeEmpty(headerPadding)) {
        headerPadding = "4px";
    }

    if (attributeEmpty(fontSize)) {
        fontSize = "1.0em";
    }

    if (attributeEmpty(cssClass)) {
        cssClass = "";
    }

    if (attributeEmpty(theme)) {
        theme = "#444444";
    }

    if (attributeEmpty(footertext)) {
        footertext = "FOOTER TEXT GOES HERE";
    }

    if (attributeEmpty(buttonText)) {
        buttonText = "Button";
    }

    if (attributeEmpty(caption)) {
        caption = "";
    }

    if (attributeEmpty(actionColumns)) {
        actionColumns = [];
    } else {
        actionColumns = JSON.parse(actionColumns);
    }
    if (attributeEmpty(checkableColumns)) {
        checkableColumns = [];
    } else {
        checkableColumns = JSON.parse(checkableColumns);
    }
    if (attributeEmpty(textColumns)) {
        textColumns = [];
    } else {
        textColumns = JSON.parse(textColumns);
    }
    if (attributeEmpty(selectColumns)) {
        selectColumns = [];
    } else {
        selectColumns = JSON.parse(selectColumns);
    }


    this.options = {
        id: this.htmlElement.id + '_core',
        hasCaption: hasCaption,
        hasContainer: hasContainer,
        caption: caption,
        scrollHeight: scrollHeight,
        withNumbering: withNumbering,
        width: "100%",
        hasFooter: hasFooter,
        showBorders: showBorders,
        pagingEnabled: pagingEnabled,
        onAddBtnClicked: function () {
        },
        'main-style': {
            'margin-top': '0em'
        },
        icon: icon,
        fontSize: fontSize,
        showLeftBtn: showLeftBtn,
        cellPadding: cellPadding,
        headerPadding: headerPadding,
        title: title,
        footerText: footertext,
        scrollable: scrollable,
        theme: theme,
        buttonText: buttonText,
        headers: headers,
        data: data,
        parent: this.htmlElement,
        checkablecolumns: checkableColumns,
        actioncolumns: actionColumns,
        textcolumns: textColumns,
        selectcolumns: selectColumns
    };
    this.options.bodyData = data; //save the data after removing the headers

    if (cssClass && cssClass !== "") {
        this.options.classname = cssClass;
    }



    this.exoticView = new SearchableTable(this.options);
    // this.exoticView.build(this.htmlElement);


    this.calculateWrapContentSizes(node);
};
SearchableTableView.prototype.calculateWrapContentSizes = function (node) {
    let container = this.htmlElement;
    this.style.applyInline(container);
    document.body.appendChild(container);
    this.exoticView.loadTable(this.options.bodyData);
    let sz = this.exoticView.getCurrentSize();
    this.wrapWidth = sz.width;
    this.wrapHeight = sz.height;
    container.remove();
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {TextField}
 */
function TextField(wkspc, node) {
    View.call(this, wkspc, node);
}

TextField.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('input');
    let id = node.getAttribute(attrKeys.id);
    this.htmlElement.id = id;
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let value = node.getAttribute(attrKeys.value);
    let text = node.getAttribute(attrKeys.text);
    let type = node.getAttribute(attrKeys.inputType);
    if (!type) {
        type = 'text'; //default
    }
    if (type && type !== 'text' && type !== 'password' && type !== 'file' && type !== 'date' && type !== 'search' && type !== 'datetime'
            && type !== 'tel' && type !== 'phone' && type !== 'time' && type !== 'color' && type !== 'url' && type !== 'email') {
        throw 'Unsupported input type---(' + type + ')';
    }

    if (attributeNotEmpty(value)) {
        this.htmlElement.value = value;
    }
    if (attributeNotEmpty(text)) {
        this.htmlElement.value = text; // button label
    }

    if (attributeNotEmpty(type)) {
        this.htmlElement.setAttribute('type', type);
    }


    let placeholder = node.getAttribute(attrKeys.placeholder);
    if (attributeNotEmpty(placeholder)) {
        this.htmlElement.placeholder = placeholder;
    }


    this.calculateWrapContentSizes(node);
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function ProgressBar(wkspc, node) {
    this.options = {};
    this.exoticView = null;
    View.call(this, wkspc, node);
}

ProgressBar.prototype.createElement = function (node) {

    let id = node.getAttribute(attrKeys.id);
    let val = node.getAttribute(attrKeys.value);
    let description = node.getAttribute(attrKeys.description);
    let textColor = node.getAttribute(attrKeys.textColor);
    let progressColor = node.getAttribute(attrKeys.progressColor);
    let backgroundColor = node.getAttribute(attrKeys.backgroundColor);
    let fontSize = node.getAttribute(attrKeys.fontSize);
    let fontName = node.getAttribute(attrKeys.fontName);
    let fontStyle = node.getAttribute(attrKeys.fontStyle);
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    this.htmlElement = document.createElement('canvas');
    this.htmlElement.setAttribute(attrKeys.id, id);
    this.options = {
        id: id,
        value: parseInt(val),
        description: description,
        textColor: textColor,
        progressColor: progressColor,
        backgroundColor: backgroundColor,
        fontName: fontName,
        fontSize: fontSize,
        sizeUnits: CssSizeUnits.PX,
        fontStyle: fontStyle
    };
    this.assignId();
    this.calculateWrapContentSizes(node);
};
ProgressBar.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 150;
    this.wrapHeight = 40;
};
ProgressBar.prototype.runView = function () {
    this.exoticView = new Progress(this.options);
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function TextArea(wkspc, node) {
    View.call(this, wkspc, node);
}

/**
 *
 * @param {Node} node
 */
TextArea.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('textarea');
    let id = node.getAttribute(attrKeys.id);
    let maxLength = node.getAttribute(attrKeys.maxLength);
    let rows = node.getAttribute(attrKeys.rows);
    let cols = node.getAttribute(attrKeys.cols);
    let value = node.getAttribute(attrKeys.value);
    let text = node.getAttribute(attrKeys.text);
    if (attributeNotEmpty(value)) {
        this.htmlElement.value = value;
    }
    if (attributeNotEmpty(text)) {
        this.htmlElement.value = text; // button label
    }

    this.htmlElement.id = id;
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    if (attributeNotEmpty(rows)) {
        this.htmlElement.rows = parseInt(rows);
    }
    if (attributeNotEmpty(cols)) {
        this.htmlElement.cols = parseInt(cols);
    }
    if (attributeNotEmpty(maxLength)) {
        this.htmlElement.maxLength = parseInt(maxLength);
    }


    let width = this.htmlElement.clientWidth, height = this.htmlElement.clientHeight;
    let ta = this.htmlElement;
    ta.addEventListener("mouseup", function () {
        if (ta.clientWidth !== width || ta.clientHeight !== height) {
            //do Something


        }
        width = ta.clientWidth;
        height = ta.clientHeight;
    });
    this.calculateWrapContentSizes(node);
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function DropDown(wkspc, node) {
    View.call(this, wkspc, node);
}


DropDown.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('SELECT');
    let items = node.getAttribute(attrKeys.items);
    items = items.replace(/\n|\r/g, ''); //remove new lines
    let regex1 = /(')(\s*)(,)(\s*)(')/g;
    let regex2 = /(")(\s*)(,)(\s*)(")/g;
    items = items.replace(regex1, "','");
    items = items.replace(regex2, '","');
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    if (attributeNotEmpty(items)) {
        let data = JSON.parse(items);
        for (let i = 0; i < data.length; i++) {
            this.htmlElement.options[this.htmlElement.options.length] = new Option(data[i], i + "");
        }
    }

    this.assignId();
};

DropDown.prototype.editCurrentElement = function (value) {
    this.htmlElement.options[this.htmlElement.selectedIndex].innerText = value;
};
DropDown.prototype.editElement = function (index, value) {
    if (index < this.htmlElement.options.length) {
        this.htmlElement.options[index].innerText = value;
    }
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function NativeList(wkspc, node) {
    View.call(this, wkspc, node);
}

NativeList.prototype.createElement = function (node) {

    let listType = node.getAttribute(attrKeys.listType);
    if (attributeEmpty(listType)) {
        listType = 'ul';
    }

    this.htmlElement = document.createElement(listType);
    this.style.addStyleElementCss('list-style-position: inside;');
    this.style.addStyleElementCss('overflow: auto;');
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }


    let showBullets = node.getAttribute(attrKeys.showBullets);
    let items = node.getAttribute(attrKeys.items);
    items = items.replace(/\n|\r/g, ''); //remove new lines
    let regex1 = /(')(\s*)(,)(\s*)(')/g;
    let regex2 = /(")(\s*)(,)(\s*)(")/g;
    items = items.replace(regex1, "','");
    items = items.replace(regex2, '","');
    if (attributeNotEmpty(items)) {

        let data = JSON.parse(items);
        for (let i = 0; i < data.length; i++) {
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(data[i]));
            this.htmlElement.appendChild(li);
        }
    }


    if (attributeNotEmpty(showBullets)) {
        showBullets = showBullets === 'true';
    }
    if (showBullets === false) {
        this.style.addStyleElementCss('list-style-type: none;');
    }


    this.assignId();
    this.calculateWrapContentSizes(node);
};


/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function ListView(wkspc, node) {
    this.data = []; // the data to render.
    /**
     * An array of xml layout filenames that will be used for the list cells
     */
    this.itemViews = [];
    this.listAdapter = null;
    View.call(this, wkspc, node);
}

ListView.prototype.setAdapter = function (adapter, callback) {
    if (adapter instanceof ListAdapter) {
        this.listAdapter = adapter;
        adapter.bind(this, callback);
    } else {
        throw new Error("Invalid adapter specified for " + this.constructor.name + "[id=" + this.id + "]");
    }
};

ListView.prototype.setData = function (items) {
    if (items) {
        if (isOneDimArray(items)) {
            this.data = items;
        } else {
            throw new Error('One dimensional array of items required here');
        }
    } else {
        throw new Error('Please set an array of items to display in the list');
    }
};
ListView.prototype.createElement = function (node) {

    let cellSpacing = node.getAttribute(attrKeys.cellSpacing);
    if (attributeEmpty(cellSpacing)) {
        cellSpacing = '0px';
    }
    let parseCsp = parseNumberAndUnits(cellSpacing, true);


    let minCellHeight = node.getAttribute(attrKeys.minCellHeight);


    let cellPadding = node.getAttribute(attrKeys.cellPadding);
    if (attributeEmpty(cellPadding)) {
        cellPadding = '0px';
    }

    let cellBg = node.getAttribute(attrKeys.cellBackground);
    if (!cellBg) {
        cellBg = 'transparent';
    }
    let cellBorder = node.getAttribute(attrKeys.cellBorder);
    if (!cellBorder) {
        cellBorder = 'none';
    }



    this.htmlElement = document.createElement("ul");
    this.style.addStyleElementCss('list-style-position: inside;');
    this.style.addStyleElementCss('overflow: auto;');
    this.style.addStyleElementCss('list-style-type: none;');

    let liNotLastChildStyle = new Style('ul#' + this.id + " > li:not(:last-child)", []);
    let liLastChildStyle = new Style('ul#' + this.id + " > li:last-child", []);

    liNotLastChildStyle.addStyleElement("margin-bottom", cellSpacing);

    liLastChildStyle.addStyleElement('border', cellBorder);
    liLastChildStyle.addStyleElement('background', cellBg);
    liNotLastChildStyle.addStyleElement('border', cellBorder);
    ;
    liNotLastChildStyle.addStyleElement('background', cellBg);

    if (!attributeEmpty(minCellHeight)) {
        parseNumberAndUnits(minCellHeight, true);
        liNotLastChildStyle.addStyleElement("min-height", minCellHeight);
        liLastChildStyle.addStyleElement("min-height", minCellHeight);
        liNotLastChildStyle.addStyleElement("padding", cellPadding);
        liLastChildStyle.addStyleElement("padding", cellPadding);
    }

    if (!attributeEmpty(cellPadding)) {
        parseNumberAndUnits(cellPadding, true);
        liNotLastChildStyle.addStyleElement("padding", cellPadding);
        liLastChildStyle.addStyleElement("padding", cellPadding);
    }

    updateOrCreateSelectorsInStyleSheet(styleSheet, [liNotLastChildStyle, liLastChildStyle]);
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let items = node.getAttribute(attrKeys.items);
    if (attributeNotEmpty(items)) {
        items = items.replace(/\n|\r/g, ''); //remove new lines
        let regex1 = /(')(\s*)(,)(\s*)(')/g;
        let regex2 = /(")(\s*)(,)(\s*)(")/g;
        items = items.replace(regex1, "','");
        items = items.replace(regex2, '","');
        try {
            this.data = JSON.parse(items);
        } catch (e) {
            console.log('JSON error: ' + items);
            throw new Error('error: ' + e + ', Error in `items` array while expanding view: ' + this.id);
        }


        if (!isOneDimArray(this.data)) {
            throw new Error('Invalid items array specified for the list\'s cells');
        }

    }


    let itemViews = node.getAttribute(attrKeys.itemViews);
    if (attributeEmpty(itemViews)) {
        throw new Error('No custom view specified for the list cell');
    } else {
        this.itemViews = JSON.parse(itemViews);
        if (!isOneDimArray(this.itemViews)) {
            throw new Error('Invalid views array specified for the list\'s cells');
        }
    }

    this.assignId();
    this.calculateWrapContentSizes(node);
};


/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function HorizontalListView(wkspc, node) {
    ListView.call(this, wkspc, node);
}

HorizontalListView.prototype.createElement = function (node) {


    let minCellWidth = node.getAttribute(attrKeys.minCellWidth);
    let minCellHeight = node.getAttribute(attrKeys.minCellHeight);
    let parseMinCellWidth = null;
    let parseMinCellHeight = null;
    if (attributeEmpty(minCellWidth)) {
        minCellWidth = '32px';
    } else {
        parseMinCellWidth = parseNumberAndUnits(minCellWidth, true);
    }
    if (attributeEmpty(minCellHeight)) {
        minCellHeight = '21px';
    } else {
        parseMinCellHeight = parseNumberAndUnits(minCellHeight, true);
    }


    this.htmlElement = document.createElement('ul');
    this.style.addStyleElementCss('list-style-position: inside;');
    this.style.addStyleElementCss('overflow: auto;');
    this.style.addStyleElementCss('list-style-type: none;');

    let cellBg = node.getAttribute(attrKeys.cellBackground);
    if (!cellBg) {
        cellBg = 'transparent';
    }
    let cellBorder = node.getAttribute(attrKeys.cellBorder);
    if (!cellBorder) {
        cellBorder = 'none';
    }

    let liStyle = new Style('ul#' + this.id + " > li", []);
    let liLastChildStyle = new Style('ul#' + this.id + " > li:last-child", []);


    this.style.addStyleElementCss('display: -webkit-inline-box;');
    this.style.addStyleElementCss('display: -ms-inline-flexbox;');
    this.style.addStyleElementCss('display: inline-flex;');
    this.style.addStyleElementCss('align-items: center;');
    this.style.addStyleElementCss('white-space: nowrap;');

    let cellSpacing = node.getAttribute(attrKeys.cellSpacing);
    if (attributeEmpty(cellSpacing)) {
        cellSpacing = "0px";
    }
    let parsedCellSpacing = parseNumberAndUnits(cellSpacing);

    let cellPadding = node.getAttribute(attrKeys.cellPadding);
    if (attributeEmpty(cellPadding)) {
        cellPadding = "0px";
    }
    let parsedCellPadding = parseNumberAndUnits(cellPadding);

    liStyle.addFromOptions({
        'min-width': minCellWidth,
        'min-height': minCellHeight,
        'display': 'inline-block',
        'margin-left': cellSpacing,
        'padding': cellPadding,
        border: cellBorder,
        background: cellBg
    });
    liLastChildStyle.addFromOptions({
        'margin-right': cellSpacing
    });


    updateOrCreateSelectorsInStyleSheet(styleSheet, [liStyle, liLastChildStyle]);


    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let items = node.getAttribute(attrKeys.items);
    if (attributeNotEmpty(items)) {
        items = items.replace(/\n|\r/g, ''); //remove new lines
        let regex1 = /(')(\s*)(,)(\s*)(')/g;
        let regex2 = /(")(\s*)(,)(\s*)(")/g;
        items = items.replace(regex1, "','");
        items = items.replace(regex2, '","');
        try {
            this.data = JSON.parse(items);
        } catch (e) {
            throw new Error('error: ' + e + ', Error in `items` array while expanding view: ' + this.id);
        }


        if (!isOneDimArray(this.data)) {
            throw new Error('Invalid items array specified for the list\'s cells');
        }

    }


    let itemViews = node.getAttribute(attrKeys.itemViews);
    if (attributeEmpty(itemViews)) {
        throw new Error('No custom view specified for the list cell');
    } else {
        this.itemViews = JSON.parse(itemViews);
        if (!isOneDimArray(this.itemViews)) {
            throw new Error('Invalid views array specified for the list\'s cells');
        }
    }

    this.assignId();
    this.calculateWrapContentSizes(node);
};

function GridView(wkspc, node) {
    ListView.call(this, wkspc, node);
}

GridView.prototype.createElement = function (node) {

    this.htmlElement = document.createElement("ul");
    this.style.addStyleElementCss('list-style-position: inside;');
    this.style.addStyleElementCss('overflow: auto;');
    this.style.addStyleElementCss('list-style-type: none;');

    let liStyle = new Style('ul#' + this.id + " > li", []);

    let cellSpacing = node.getAttribute(attrKeys.cellSpacing);
    let cellBg = node.getAttribute(attrKeys.cellBackground);
    if (!cellBg) {
        cellBg = 'transparent';
    }
    let cellBorder = node.getAttribute(attrKeys.cellBorder);
    if (!cellBorder) {
        cellBorder = 'none';
    }


    let cols = node.getAttribute(attrKeys.cols);
    if (attributeEmpty(cols)) {
        throw new Error('The `cols` attribute must be specified when viewing the GridView in grid mode');
    }
    cols = parseInt(cols);
    if (!isNumber(cols)) {
        throw new Error('Invalid `cols` specified for the ListView');
    }
    if (cols <= 0) {
        throw new Error('The `cols` attribute must be greater than 0!');
    }


    let minGridHeight = node.getAttribute(attrKeys.minGridHeight);
    let parsedCellSpacing = parseNumberAndUnits(cellSpacing, true);
    // W = cols * gW + (cols + 1) * gs + scrollbarWidth; gW * cols = W - scrollbarWidth - gs(cols+1)
    //gridWidth = (netWidth - scrollbarWidth - (cols+1)*cellSpacing)/cols

    let netWidth = node.getAttribute(attrKeys.layout_width);
    let parseListWidth = parseNumberAndUnits(netWidth, true);

    let scrollBarWidth = ((getScrollBarWidth() + 4) / parseFloat(cols)) + 'px';

    let coeff1 = parseFloat(parseListWidth.number) / parseFloat(cols);
    let coeff2 = parseFloat((cols + 1) * parsedCellSpacing.number) / parseFloat(cols);

    let gridWidth = "calc(" + coeff1 + parseListWidth.units + ' - ' + scrollBarWidth + " - " + coeff2 + parsedCellSpacing.units + ")";


    if (attributeEmpty(minGridHeight)) {
        throw new Error('The `minGridHeight` attribute must be specified when viewing the GridView');
    }
    let parsedGridHeight = parseNumberAndUnits(minGridHeight, true);
    minGridHeight = parseInt(minGridHeight);
    if (!isNumber(minGridHeight)) {
        throw new Error('Invalid `minGridHeight` specified for the GridView');
    }
    if (minGridHeight <= 0) {
        throw new Error('The `minGridHeight` attribute must be greater than 0!');
    }

    if (attributeEmpty(parsedGridHeight.units)) {
        throw new Error('No units specified for the minimum grid height.');
    }
    minGridHeight += parsedGridHeight.units;
    liStyle.addFromOptions({
        'width': gridWidth,
        'min-height': minGridHeight,
        'vertical-align': 'top',
        'margin-left': parsedCellSpacing.number + parsedCellSpacing.units,
        'margin-top': parsedCellSpacing.number + parsedCellSpacing.units,
        'zoom': '1',
        border: cellBorder,
        background: cellBg,
        '*display': 'inline',
        overflow: 'hidden',
        '_height': minGridHeight
    });

    liStyle.addStyleElement('display', '-moz-inline-stack', true);//allow duplicate entry for style element
    liStyle.addStyleElement('display', 'inline-block', true);//allow duplicate entry for style element

//Needed to achieve the specified cell-spacing at the right and the bottom edges of the grid
    this.style.addFromOptions({
        'padding-top': '0',
        'padding-left': '0',
        'padding-bottom': parsedCellSpacing.number + parsedCellSpacing.units,
        'padding-right': parsedCellSpacing.number + parsedCellSpacing.units
    });

    updateOrCreateSelectorInStyleSheet(styleSheet, liStyle);
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let items = node.getAttribute(attrKeys.items);
    if (attributeNotEmpty(items)) {
        items = items.replace(/\n|\r/g, ''); //remove new lines
        let regex1 = /(')(\s*)(,)(\s*)(')/g;
        let regex2 = /(")(\s*)(,)(\s*)(")/g;
        items = items.replace(regex1, "','");
        items = items.replace(regex2, '","');
        try {
            this.data = JSON.parse(items);
        } catch (e) {
            console.log('JSON error: ' + items);
            throw new Error('error: ' + e + ', Error in `items` array while expanding view: ' + this.id);
        }


        if (!isOneDimArray(this.data)) {
            throw new Error('Invalid items array specified for the list\'s cells');
        }

    }


    let itemViews = node.getAttribute(attrKeys.itemViews);
    if (attributeEmpty(itemViews)) {
        throw new Error('No custom view specified for the grid cell');
    } else {
        this.itemViews = JSON.parse(itemViews);
        if (!isOneDimArray(this.itemViews)) {
            throw new Error('Invalid views array specified for the grid\'s cells');
        }
    }

    this.assignId();
    this.calculateWrapContentSizes(node);
};




/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function MultiLineLabel(wkspc, node) {
    this.options = {};
    this.exoticView = null;
    this.text = null;
    View.call(this, wkspc, node);
}


MultiLineLabel.prototype.createElement = function (node) {

    let id = node.getAttribute(attrKeys.id);
    let text = node.getAttribute(attrKeys.text);
    let value = node.getAttribute(attrKeys.value);
    let textColor = node.getAttribute(attrKeys.textColor);
    let textColorHover = node.getAttribute(attrKeys.textColorHover);
    let backgroundColor = node.getAttribute(attrKeys.backgroundColor);
    let backgroundColorHover = node.getAttribute(attrKeys.backgroundColorHover);
    let fontSize = node.getAttribute(attrKeys.fontSize) || node.getAttribute(attrKeys.textSize);
    let fontName = node.getAttribute(attrKeys.fontName);
    let fontStyle = node.getAttribute(attrKeys.fontStyle);
    let borderRadius = node.getAttribute(attrKeys.borderRadius);
    let name = node.getAttribute(attrKeys.name);
    let gravity = node.getAttribute(attrKeys.gravity);
    let padding = node.getAttribute(attrKeys.padding);
    let lineSpacing = node.getAttribute(attrKeys.lineSpacing);
    let scrollBarWidth = node.getAttribute(attrKeys.scrollBarWidth);
    let scrollBarHeight = node.getAttribute(attrKeys.scrollBarHeight);
    let scrollBarTheme = node.getAttribute(attrKeys.scrollBarTheme);

    if (gravity === 'start') {
        gravity = 'left';
    } else if (gravity === 'end') {
        gravity = 'right';
    }




    if (attributeEmpty(lineSpacing)) {
        lineSpacing = 8;
    }

    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    if (attributeEmpty(text)) {
        text = value; // label
    }
    this.text = text;

    if (attributeEmpty(borderRadius)) {
        borderRadius = '2px';
    }

    if (attributeEmpty(fontName)) {
        fontName = 'Arial';
    }

    if (attributeEmpty(fontSize)) {
        fontSize = '16px';
    }

    if (attributeEmpty(fontStyle)) {
        fontStyle = FontStyle.REGULAR;
    }

    if (attributeEmpty(gravity)) {
        gravity = Gravity.LEFT;
    }
    if (attributeEmpty(padding)) {
        padding = '4px';
    }


    let parseFontSize = parseNumberAndUnits(fontSize, true);
    let parseBorderRadius = parseNumberAndUnits(borderRadius, true);



    this.htmlElement = document.createElement('canvas');


    this.options = {
        id: id,
        text: text,
        textColor: textColor,
        textColorHover: textColorHover,
        labelColor: backgroundColor,
        labelColorHover: backgroundColorHover,
        fontName: fontName,
        fontSize: parseFontSize.number,
        sizeUnits: parseFontSize.units,
        borderRadius: parseBorderRadius.number,
        fontStyle: fontStyle,
        gravity: gravity,
        padding: padding,
        lineSpacing: lineSpacing,
        scrollbar: {
            width: scrollBarWidth,
            height: scrollBarHeight,
            theme: scrollBarTheme
        }
    };
    this.assignId();
    let font = new Font(fontStyle, parseFontSize.number, fontName, parseFontSize.units);

    this.calculateWrapContentSizes(node);



};

MultiLineLabel.prototype.calculateWrapContentSizes = function (node) {
    let elem = document.createElement('canvas');
    elem.setAttribute(attrKeys.id, this.htmlElement.id);
    this.style.applyInline(elem);
    document.body.appendChild(elem);

    this.exoticView = new TextElement(this.options);

    this.wrapWidth = node.getAttribute(attrKeys.layout_width);
    if (this.wrapWidth === sizes.WRAP_CONTENT) {
        throw new Error("This widget cannot have its width set to wrap_content, only its height can be set to wrap_content. View[" + this.id + "]");
    }
    this.wrapHeight = this.exoticView.getWrapHeight() + 'px';
    elem.remove();

};

MultiLineLabel.prototype.runView = function () {
    this.exoticView = new TextElement(this.options);
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function IconLabelView(wkspc, node) {
    this.options = {};
    this.exoticView = null;
    this.text = null;
    View.call(this, wkspc, node);
}


IconLabelView.prototype.createElement = function (node) {

    let id = node.getAttribute(attrKeys.id);
    let text = node.getAttribute(attrKeys.text);
    let value = node.getAttribute(attrKeys.value);
    let src = node.getAttribute(attrKeys.src);
    let textColor = node.getAttribute(attrKeys.textColor);
    let textColorHover = node.getAttribute(attrKeys.textColorHover);
    let backgroundColor = node.getAttribute(attrKeys.backgroundColor);
    let backgroundColorHover = node.getAttribute(attrKeys.backgroundColorHover);
    let fontSize = node.getAttribute(attrKeys.fontSize);
    let fontName = node.getAttribute(attrKeys.fontName);
    let fontStyle = node.getAttribute(attrKeys.fontStyle);
    let borderRadius = node.getAttribute(attrKeys.borderRadius);
    let name = node.getAttribute(attrKeys.name);
    let gravity = node.getAttribute(attrKeys.gravity);
    let padding = node.getAttribute(attrKeys.padding);


    if (gravity === 'start') {
        gravity = 'left';
    } else if (gravity === 'end') {
        gravity = 'right';
    }

    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    if (attributeEmpty(text)) {
        text = value; // label
    }
    this.text = text;

    if (attributeEmpty(borderRadius)) {
        borderRadius = '2px';
    }

    if (attributeEmpty(fontName)) {
        fontName = 'Arial';
    }

    if (attributeEmpty(fontSize)) {
        fontSize = '16px';
    }

    if (attributeEmpty(fontStyle)) {
        fontStyle = FontStyle.REGULAR;
    }

    if (attributeEmpty(gravity)) {
        gravity = Gravity.LEFT;
    }
    if (attributeEmpty(padding)) {
        padding = '0';
    }


    let parseFontSize = parseNumberAndUnits(fontSize, true);
    let parseBorderRadius = parseNumberAndUnits(borderRadius, true);



    this.htmlElement = document.createElement('canvas');


    this.options = {
        id: id,
        text: text,
        textColor: textColor,
        textColorHover: textColorHover,
        labelColor: backgroundColor,
        labelColorHover: backgroundColorHover,
        fontName: fontName,
        fontSize: parseFontSize.number,
        sizeUnits: parseFontSize.units,
        borderRadius: parseBorderRadius.number,
        fontStyle: fontStyle,
        gravity: gravity,
        padding: padding
    };
    if (attributeNotEmpty(src)) {
        this.options[attrKeys.src] = getImagePath(node.getAttribute(attrKeys.src));
    }
    this.assignId();
    let font = new Font(fontStyle, parseFontSize.number, fontName, parseFontSize.units);
    let size = getTextSize(text, font.string());

    setWrapSize:{
        this.wrapWidth = size.width;
        this.wrapHeight = size.height;
    }



};



IconLabelView.prototype.runView = function () {
    this.exoticView = new IconLabel(this.options);
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Label(wkspc, node) {
    View.call(this, wkspc, node);
}


Label.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('span');
    let text = node.getAttribute(attrKeys.text);
    let value = node.getAttribute(attrKeys.value);
    let fontSz = node.getAttribute(attrKeys.fontSize);
    let name = node.getAttribute(attrKeys.name);
    let horAlign = node.getAttribute(attrKeys.horAlign);
    let verAlign = node.getAttribute(attrKeys.verAlign);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    if (!horAlign) {
        horAlign = 'center';
    }
    if (!verAlign) {
        verAlign = 'center';
    }

    this.style.addStyleElementCss('display: -webkit-inline-box;', true);
    this.style.addStyleElementCss('display: -ms-inline-flexbox;', true);
    this.style.addStyleElementCss('display: inline-flex;', true);
    this.style.addFromOptions({
        overflow: 'hidden !important',
        'text-overflow': 'ellipsis'
    });

    if (horAlign === Alignments.LEFT) {
        this.style.addStyleElementCss('justify-content: flex-start;');
    } else if (horAlign === Alignments.CENTER) {
        this.style.addStyleElementCss('justify-content: center;');
    } else if (horAlign === Alignments.RIGHT) {
        this.style.addStyleElementCss('justify-content: flex-end;');
    }

    if (verAlign === Alignments.TOP) {
        this.style.addStyleElementCss('align-items: flex-start;');
        this.style.addStyleElementCss('white-space: nowrap;');
    } else if (verAlign === Alignments.CENTER) {
        this.style.addStyleElementCss('align-items: center;');
        this.style.addStyleElementCss('white-space: nowrap;');
    } else if (verAlign === Alignments.BOTTOM) {
        this.style.addStyleElementCss('align-items: flex-end;');
        this.style.addStyleElementCss('white-space: nowrap;');
    }
    if (attributeNotEmpty(text)) {
        this.htmlElement.textContent = text; // label
    }
    if (attributeNotEmpty(value)) {
        this.htmlElement.textContent = value; // label
    }
    this.assignId();
    this.calculateWrapContentSizes(node);
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Paragraph(wkspc, node) {
    View.call(this, wkspc, node);
}


Paragraph.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('p');
    this.style.addStyleElementCss('overflow: hidden;');
    this.style.addStyleElementCss('text-overflow: ellipsis;');
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let text = node.getAttribute(attrKeys.text);
    let value = node.getAttribute(attrKeys.value);
    if (attributeNotEmpty(text)) {
        let textNode = document.createTextNode(text);
        this.htmlElement.appendChild(textNode);
    }
    if (attributeNotEmpty(value)) {
        let textNode = document.createTextNode(value);
        this.htmlElement.appendChild(textNode);
    }

    this.assignId();
    this.calculateWrapContentSizes(node);
};

/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {CanvasView}
 */
function CanvasView(wkspc, node) {
    View.call(this, wkspc, node);
}

CanvasView.prototype.createElement = function (node) {
    let width = node.getAttribute(attrKeys.width);
    let height = node.getAttribute(attrKeys.height);
    if (attributeEmpty(width)) {
        throw new Error("Canvas width attribute not supplied on View[" + this.id + "]");
    }
    if (attributeEmpty(height)) {
        throw new Error("Canvas width attribute not supplied on View[" + this.id + "]");
    }


    let id = this.id;
    this.htmlElement = document.createElement('canvas');
    this.htmlElement.id = id;
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    this.htmlElement.setAttribute('width', parseInt(width));
    this.htmlElement.setAttribute('height', parseInt(height));
    this.calculateWrapContentSizes(node);
};
CanvasView.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 120;
    this.wrapHeight = 120;
};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {ClockView}
 */
function ClockView(wkspc, node) {
    this.clockOptions = {};
    this.exoticView = null;
    View.call(this, wkspc, node);
}


ClockView.prototype.createElement = function (node) {

    let outerColor = node.getAttribute(attrKeys.clockOuterColor);
    let middleColor = node.getAttribute(attrKeys.clockMiddleColor);
    let innerColor = node.getAttribute(attrKeys.clockInnerColor);
    let tickColor = node.getAttribute(attrKeys.clockTickColor);
    let secondsColor = node.getAttribute(attrKeys.clockSecondsColor);
    let minutesColor = node.getAttribute(attrKeys.clockMinutesColor);
    let hoursColor = node.getAttribute(attrKeys.clockHoursColor);
    let centerSpotWidth = node.getAttribute(attrKeys.clockCenterSpotWidth);
    let outerCircleAsFractionOfFrameSize = node.getAttribute(attrKeys.clockOuterCircleAsFractionOfFrameSize);
    let showBaseText = node.getAttribute(attrKeys.clockShowBaseText) === true;
    if (!attributeNotEmpty(outerColor)) {
        outerColor = 'transparent';
    }
    if (!attributeNotEmpty(middleColor)) {
        middleColor = 'white';
    }
    if (!attributeNotEmpty(innerColor)) {
        innerColor = 'lightgray';
    }
    if (!attributeNotEmpty(tickColor)) {
        tickColor = 'black';
    }
    if (!attributeNotEmpty(secondsColor)) {
        secondsColor = 'red';
    }
    if (!attributeNotEmpty(minutesColor)) {
        minutesColor = 'black';
    }
    if (!attributeNotEmpty(hoursColor)) {
        hoursColor = 'black';
    }
    if (!attributeNotEmpty(centerSpotWidth)) {
        centerSpotWidth = 2;
    }
    if (!attributeNotEmpty(outerCircleAsFractionOfFrameSize)) {
        outerCircleAsFractionOfFrameSize = 1.0;
    }

    if (!attributeNotEmpty(showBaseText)) {
        showBaseText = false;
    }


    let id = this.id;
    this.htmlElement = document.createElement('canvas');
    this.htmlElement.id = id;
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    this.clockOptions = {
        canvasId: id,
        floating: false,
        outerColor: outerColor,
        middleColor: middleColor,
        innerColor: innerColor,
        tickColor: tickColor,
        secondsColor: secondsColor,
        minutesColor: minutesColor,
        hoursColor: hoursColor,
        centerSpotWidth: parseInt(centerSpotWidth), // a number
        outerCircleAsFractionOfFrameSize: parseInt(outerCircleAsFractionOfFrameSize), //a floating point value between 0.0 and 1.0
        showBaseText: showBaseText
    };
    this.assignId();
    this.calculateWrapContentSizes(node);
};
ClockView.prototype.runView = function () {
    this.exoticView = new Clock(this.clockOptions);
    this.exoticView.run();
};
ClockView.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 120;
    this.wrapHeight = 120;
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function RadioGroup(wkspc, node) {
    View.call(this, wkspc, node);
}

RadioGroup.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.assignId();
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }
};
RadioGroup.prototype.calculateWrapContentSizes = function (node) {

};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Radio(wkspc, node) {
    View.call(this, wkspc, node);
}

Radio.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('input');
    this.htmlElement.setAttribute("type", "radio");
    let name = node.getAttribute(attrKeys.name);
    let checked = node.getAttribute(attrKeys.checked);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute('name', name);
    }

    if (attributeNotEmpty(checked)) {
        this.htmlElement.checked = checked === 'true';
    }
    this.assignId();
};

/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {ImageView}
 */
function TabView(wkspc, node) {
    this.options = {};
    this.exoticView = null;
    View.call(this, wkspc, node);
}

TabView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('canvas');
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    let fontSize = node.getAttribute(attrKeys.fontSize);
    let textSize = node.getAttribute(attrKeys.textSize);
    let fontName = node.getAttribute(attrKeys.fontName);
    let fontStyle = node.getAttribute(attrKeys.fontStyle);
    let selectedBg = node.getAttribute(attrKeys.selectedBg);
    let selectedFg = node.getAttribute(attrKeys.selectedFg);
    let deselectedBg = node.getAttribute(attrKeys.deselectedBg);
    let deselectedFg = node.getAttribute(attrKeys.deselectedFg);
    let tabEdgeColor = node.getAttribute(attrKeys.tabEdgeColor);
    let tabEdgeWidth = node.getAttribute(attrKeys.tabEdgeWidth);
    let iconSize = node.getAttribute(attrKeys.iconSize);
    let borderRadius = node.getAttribute(attrKeys.borderRadius);
    let tabItems = node.getAttribute(attrKeys.tabItems);
    fontSize = attributeEmpty(fontSize) ? textSize : fontSize;
    if (attributeEmpty(fontSize)) {
        fontSize = '14px';
    }
    if (attributeEmpty(fontName)) {
        fontName = 'serif';
    }
    if (attributeEmpty(fontStyle)) {
        fontStyle = FontStyle.REGULAR;
    }
    let ctx = document.createElement("canvas").getContext("2d");
    if (attributeEmpty(selectedBg)) {
        selectedBg = "midnightblue";
    } else {
        selectedBg = standardColor(ctx, selectedBg);
    }
    if (attributeEmpty(selectedFg)) {
        selectedFg = "white";
    } else {
        selectedFg = standardColor(ctx, selectedFg);
    }
    if (attributeEmpty(deselectedBg)) {
        deselectedBg = "darkgray";
    } else {
        deselectedBg = standardColor(ctx, deselectedBg);
    }
    if (attributeEmpty(deselectedFg)) {
        deselectedFg = "pink";
    } else {
        deselectedFg = standardColor(ctx, deselectedFg);
    }
    if (attributeEmpty(tabEdgeColor)) {
        tabEdgeColor = "#fff";
    } else {
        tabEdgeColor = standardColor(ctx, tabEdgeColor);
    }
    if (attributeEmpty(iconSize)) {
        iconSize = "16px";
    }
    if (attributeEmpty(tabEdgeWidth)) {
        tabEdgeWidth = "1px";
    }
    if (attributeEmpty(borderRadius)) {
        borderRadius = "8px";
    }
    if (attributeNotEmpty(tabItems)) {
        tabItems = JSON.parse(tabItems);
        if (!tabItems) {
            throw new Error('Invalid `tabItems` array!');
        }
        if (!isOneDimArray(tabItems)) {
            throw new Error('`tabItems` must be a one dimensional array!');
        }
    } else {
        throw new Error('`tabItems` not specified for TabView: ' + this.id);
    }

    let sizeUnits = "";
    if (!endsWithAnyOf(fontSize, ['px', 'pt', 'em'])) {
        throw new Error("Invalid font size units specified");
    }
    if (endsWith(fontSize, 'px')) {
        sizeUnits = CssSizeUnits.PX;
    }
    if (endsWith(fontSize, 'pt')) {
        sizeUnits = CssSizeUnits.PT;
    }
    if (endsWith(fontSize, 'em')) {
        sizeUnits = CssSizeUnits.EM;
    }
    let styles = getObjectValues(FontStyle);//Object.values(FontStyle);
    if (styles.indexOf(fontStyle) === -1) {
        throw new Error("Invalid font style specified on view: " + this.id);
    }

    this.options = {
        tabId: this.id,
        selectedBg: selectedBg, // the bg color when a tab is selected
        deselectedBg: deselectedBg, // the bg color when a tab is not selected
        selectedFg: selectedFg, // the color of the tab's text when the tab is selected
        deselectedFg: deselectedFg, // the color of the tab's text when the tab is deselected
        tabEdgeColor: tabEdgeColor, // the color of the lines between the tabs
        borderRadius: borderRadius,
        tabEdgeWidth: tabEdgeWidth, // or without the units... this is the borderwidth of the line that separates the tabs
        fontName: fontName, // The font name
        fontSize: fontSize, //The font size
        iconSize: iconSize, // The height of the tab icons, where used
        sizeUnits: sizeUnits, //The size units to be used for the font and the border radius; e.g CssSizeUnits.EM or CssSizeUnits.PX or CssSizeUnits.PT
        fontStyle: fontStyle, // e.g bold or italic or italic bold or 
        tabItems: tabItems,
        onTabChanged: function (newIndex, oldIndex) {
            console.log('onTabChanged: newIndex: ', newIndex, ", oldIndex: ", oldIndex);
        }
    };
    this.assignId();
    this.calculateWrapContentSizes(node);
};
TabView.prototype.runView = function () {
    this.exoticView = new TabbedBar(this.options);
};
TabView.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 360;
    this.wrapHeight = 60;
};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {ImageView}
 */
function ImageView(wkspc, node) {
    View.call(this, wkspc, node);
}

ImageView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('img');
    this.htmlElement.src = getImagePath(node.getAttribute(attrKeys.src));
    this.htmlElement.alt = node.getAttribute(attrKeys.alt);
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }
    this.assignId();
};
ImageView.prototype.calculateWrapContentSizes = function (node) {

};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Separator(wkspc, node) {
    View.call(this, wkspc, node);
}

Separator.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.assignId();
    this.calculateWrapContentSizes(node);
};
Separator.prototype.calculateWrapContentSizes = function (node) {
    const orientation = this.refIds.get(attrKeys.orientation);
    if (typeof orientation === 'undefined' || orientation === null || orientation === '') {
        throw 'Please specify the orientation of the Guideline whose id is `' + this.id + '`';
    }

    if (orientation === orientations.VERTICAL) {
        this.wrapWidth = 1;
        this.wrapHeight = 32;
    } else {
        this.wrapWidth = 32;
        this.wrapHeight = 1;
    }
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Guideline(wkspc, node) {
    View.call(this, wkspc, node);
}

Guideline.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('div');
    this.htmlElement.style.backgroundColor = 'red';
    this.assignId();
    this.calculateWrapContentSizes();
};
Guideline.prototype.calculateWrapContentSizes = function (node) {
    const orientation = this.refIds.get(attrKeys.orientation);
    if (typeof orientation === 'undefined' || orientation === null || orientation === '') {
        throw 'Please specify the orientation of the Guideline whose id is `' + this.id + '`';
    }

    if (orientation === orientations.VERTICAL) {
        this.wrapWidth = '1';
        this.wrapHeight = sizes.MATCH_PARENT;
    } else {
        this.wrapWidth = sizes.MATCH_PARENT;
        this.wrapHeight = '1';
    }
};
Guideline.prototype.makeVFL = function () {
    const orientation = this.refIds.get(attrKeys.orientation);
    if (!orientation || orientation === '') {
        throw 'Please specify the orientation of the Guideline whose id is `' + this.id + '`';
    }

    let guidePct = this.refIds.get(attrKeys.layout_constraintGuide_percent);
    if (!guidePct || guidePct === '') {
        throw 'Please specify the constraint-guide-percentage of the Guideline whose id is `' + this.id + '`';
    }

    let val = 0;
    if (endsWith(guidePct, '%')) {
        if (isNaN(val = parseInt(guidePct))) {
            throw 'Please specify a floating point number between 0 and 1 to signify 0 - 100% of width';
        }
        val += '%';
    } else if (isNaN(val = parseFloat(guidePct))) {
        throw 'Please specify a floating point number between 0 and 1 to signify 0 - 100% of width';
    } else {
        if (val >= 1) {
            val = '100%';
        } else {
            val *= 100;
            val += '%';
        }
    }


    let vfl = new StringBuffer();
    if (orientation === orientations.VERTICAL) {
        vfl.append('H:|-' + val + '-[' + this.id + '(1)]\nV:|[' + this.id + ']-|');
    } else if (orientation === orientations.HORIZONTAL) {
        vfl.append('H:|[' + this.id + ']|\nV:|-' + val + '-[' + this.id + '(1)]');
    }
    return vfl.toString();
};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {IncludedView}
 */
function IncludedView(wkspc, node) {
    View.call(this, wkspc, node);
    let rawLayoutName = node.getAttribute(attrKeys.layout);
    let layout = rawLayoutName;
    if (!layout || typeof layout !== 'string') {
        throw 'An included layout must be the name of a valid xml file in the `' + PATH_TO_LAYOUTS_FOLDER + '` folder';
    }
    let len = layout.length;
    if (layout.substring(len - 4) !== '.xml') {
        layout += '.xml';
    }
    /**
     * Notifies an include of the constraints that it needs to apply to the root element of the linked document
     * @type {string[]}
     */
    this.directChildConstraints = [];
    let xmlLayout = wkspc.xmlIncludes.get(layout);
    let mp = new Parser(wkspc, xmlLayout, this.id);
    this.constraints = mp.constraints;
}


IncludedView.prototype.createElement = function (node) {

    this.htmlElement = document.createElement('div');
    let id = node.getAttribute(attrKeys.id);
    this.htmlElement.id = id;
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }
     useAutomaticBackgrounds(this, node);
    this.calculateWrapContentSizes(node);
};
IncludedView.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 300;
    this.wrapHeight = 320;
};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {FormView}
 */
function FormView(wkspc, node) {
    IncludedView.call(this, wkspc, node);
}

/*
 action: "action",
 method: "method",
 target: "target",
 autocomplete: "autocomplete",
 novalidate: "novalidate",
 enctype: "enctype",
 rel: "rel",
 acceptCharset: "accept-charset",
 */
FormView.prototype.createElement = function (node) {
    let form = document.createElement('form');
    let id = node.getAttribute(attrKeys.id);
    let action = node.getAttribute(attrKeys.action);
    let method = node.getAttribute(attrKeys.method);
    let target = node.getAttribute(attrKeys.target);
    let autocomplete = node.getAttribute(attrKeys.autocomplete);
    let novalidate = node.getAttribute(attrKeys.novalidate);
    let enctype = node.getAttribute(attrKeys.enctype);
    let rel = node.getAttribute(attrKeys.rel);
    let acceptCharset = node.getAttribute(attrKeys.acceptCharset);
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(action)) {
        form.setAttribute(attrKeys.action, action);
    }
    if (attributeNotEmpty(method)) {
        form.setAttribute(attrKeys.method, method);
    }
    if (attributeNotEmpty(target)) {
        form.setAttribute(attrKeys.target, target);
    }
    if (attributeNotEmpty(autocomplete)) {
        form.setAttribute(attrKeys.autocomplete, autocomplete);
    }
    if (attributeNotEmpty(novalidate)) {
        form.setAttribute(attrKeys.novalidate, novalidate);
    }
    if (attributeNotEmpty(enctype)) {
        form.setAttribute(attrKeys.enctype, enctype);
    }
    if (attributeNotEmpty(rel)) {
        form.setAttribute(attrKeys.rel, rel);
    }
    if (attributeNotEmpty(acceptCharset)) {
        form.setAttribute(attrKeys.acceptCharset, "accept-charset");
    }
    if (attributeNotEmpty(name)) {
        form.setAttribute(attrKeys.name, name);
    }


    this.htmlElement = form;
    this.htmlElement.id = id;
    this.calculateWrapContentSizes(node);
};
FormView.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 300;
    this.wrapHeight = 320;
};
/**
 *
 * @param {type} wkspc
 * @param {type} node
 * @returns {VideoView}
 */
function VideoView(wkspc, node) {
    View.call(this, wkspc, node);
}

VideoView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('video');
    let id = node.getAttribute(attrKeys.id);
    if (attributeEmpty(id)) {
        throw new Error('`id` must be specified for view!');
    }

    let sources = node.getAttribute(attrKeys.sources);
    let autoplay = node.getAttribute(attrKeys.autoplay);
    let muted = node.getAttribute(attrKeys.muted);
    let controls = node.getAttribute(attrKeys.controls);
    let preload = node.getAttribute(attrKeys.preload);
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }

    if (attributeEmpty(sources)) {
        throw new Error('`sources` must be specified for view!');
    }

    try {
        sources = JSON.parse(sources);
    } catch (e) {
        throw new Error('`sources` must be a valid JSON string');
    }


    if (attributeNotEmpty(autoplay)) {
        autoplay = autoplay === 'true';
    } else {
        autoplay = false;
    }
    if (attributeNotEmpty(muted)) {
        muted = muted === 'true';
    } else {
        muted = false;
    }
    if (attributeNotEmpty(controls)) {
        controls = controls === 'true';
    } else {
        controls = false;
    }
    if (attributeNotEmpty(preload)) {
        preload = preload === 'true';
    } else {
        preload = false;
    }

    if (this.validateSources(sources) === true) {
        for (let i = 0; i < sources.length; i++) {
            let srcData = sources[i];
            let source = document.createElement("source");
            if (srcData.src) {
                source.src = srcData.src;
            }
            if (srcData.type) {
                source.type = srcData.type;
            } else {
                throw new Error('Please specify a media type(e.g. video/mp4 or video/ogg or video/webm) for the given source');
            }
            if (srcData.codecs) {
                source.codecs = srcData.codecs;
            }
            if (this.htmlElement.canPlayType(source.type)) {
                this.htmlElement.appendChild(source);
            }
        }

        if (autoplay) {
            this.htmlElement.autoplay = true;
        }
        if (muted) {
            this.htmlElement.muted = true;
        }
        if (controls) {
            this.htmlElement.controls = true;
        }
        if (preload) {
            this.htmlElement.preload = true;
        }


    } else {
        throw new Error("Video source(s) are invalid!");
    }

    this.htmlElement.id = id;
    this.calculateWrapContentSizes(node);
};
VideoView.prototype.calculateWrapContentSizes = function (node) {
    this.wrapWidth = 300;
    this.wrapHeight = 320;
};
VideoView.prototype.validateSources = function (jsonObj) {
    if (Object.prototype.toString.call(jsonObj) === '[object Array]') {
        for (let i = 0; i < jsonObj.length; i++) {
            let item = jsonObj[i];
            let keys = Object.keys(item);
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] !== 'src' && keys[j] !== 'type' && keys[j] !== 'codecs') {
                    throw new Error("Invalid key found: `" + keys[j] + "`");
                }
            }
        }
        return true;
    }
    return false;
};
/**
 *
 * @param {type} wkspc
 * @param {type} node
 * @returns {VideoView}
 */
function AudioView(wkspc, node) {
    View.call(this, wkspc, node);
}

AudioView.prototype.createElement = function (node) {
    this.htmlElement = document.createElement('audio');
    let id = node.getAttribute(attrKeys.id);
    if (attributeEmpty(id)) {
        throw new Error('`id` must be specified for view!');
    }
    let name = node.getAttribute(attrKeys.name);
    if (attributeNotEmpty(name)) {
        this.htmlElement.setAttribute(attrKeys.name, name);
    }
    let sources = node.getAttribute(attrKeys.sources);
    let autoplay = node.getAttribute(attrKeys.autoplay);
    let muted = node.getAttribute(attrKeys.muted);
    let controls = node.getAttribute(attrKeys.controls);
    let preload = node.getAttribute(attrKeys.preload);
    if (attributeEmpty(sources)) {
        throw new Error('`sources` must be specified for view!');
    }

    try {
        sources = JSON.parse(sources);
    } catch (e) {
        throw new Error('`sources` must be a valid JSON string');
    }


    if (attributeNotEmpty(autoplay)) {
        autoplay = autoplay === 'true';
    } else {
        autoplay = false;
    }
    if (attributeNotEmpty(muted)) {
        muted = muted === 'true';
    } else {
        muted = false;
    }
    if (attributeNotEmpty(controls)) {
        controls = controls === 'true';
    } else {
        controls = false;
    }
    if (attributeNotEmpty(preload)) {
        preload = preload === 'true';
    } else {
        preload = false;
    }

    if (this.validateSources(sources) === true) {
        for (let i = 0; i < sources.length; i++) {
            let srcData = sources[i];
            let source = document.createElement("source");
            if (srcData.src) {
                source.src = srcData.src;
            }
            if (srcData.type) {
                source.type = srcData.type;
            }
            if (srcData.codecs) {
                source.codecs = srcData.codecs;
            }

            this.htmlElement.appendChild(source);
        }

        if (autoplay) {
            this.htmlElement.autoplay = true;
        }
        if (muted) {
            this.htmlElement.muted = true;
        }
        if (controls) {
            this.htmlElement.controls = true;
        }
        if (preload) {
            this.htmlElement.preload = true;
        }


    } else {
        throw new Error("Audio source(s) are invalid!");
    }


    this.htmlElement.id = id;
    this.calculateWrapContentSizes(node);
};
AudioView.prototype.validateSources = function (jsonObj) {
    if (Object.prototype.toString.call(jsonObj) === '[object Array]') {
        for (let i = 0; i < jsonObj.length; i++) {
            let item = jsonObj[i];
            let keys = Object.keys(item);
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] !== 'src' && keys[j] !== 'type' && keys[j] !== 'codecs') {
                    throw new Error("Invalid key found: `" + keys[j] + "`");
                }
            }
        }
        return true;
    }
    return false;
};
function is2DArray(arr) {

    if (Object.prototype.toString.call(arr) === '[object Array]') {

        for (let i = 0; i < arr.length; i++) {
            if (Object.prototype.toString.call(arr[i]) !== '[object Array]') {
                return false;
            }
        }
        return true;
    }

    return false;
}
;
function validateTableJson(jsonObj) {
    if (is2DArray(jsonObj)) {

        let colSize = -1;
        //validate row size.
        for (let i = 0; i < jsonObj.length; i++) {
            let obj = jsonObj[i];
            if (colSize === -1) {
                colSize = obj.length;
                continue;
            }

            if (colSize !== obj.length) {
                throw new Error("Table must have same number of columns on all rows!");
            }

        }
        return true;
    } else {
        throw new Error("The table json must be a 2d array!");
    }


}


function isFontWeight(val) {
    if (val && typeof val === 'string') {
        if (val === 'bold' || val === 'bolder' || val === 'lighter' || val === 'normal' ||
                val === '100' || val === '200' || val === '300' || val === '400' ||
                val === '500' || val === '600' || val === '700' || val === '800' || val === '900') {
            return true;
        }
    }
    return false;
}

function attributeNotEmpty(attrVal) {
    if (attrVal && attrVal.trim().length > 0) {
        return true;
    }
    return false;
}

function attributeEmpty(attrVal) {
    if (!attrVal || attrVal.trim().length === 0) {
        return true;
    }
    return false;
}