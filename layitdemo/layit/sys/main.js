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


/* global AutoLayout, attrKeys, xmlKeys, orientations, sizes, dummyDiv, dummyCanvas, PATH_TO_LAYOUTS_FOLDER, PATH_TO_COMPILER_SCRIPTS, rootCount, CssSizeUnits, CssSizeUnitsValues, PATH_TO_USER_IMAGES, FontStyle, Gravity, styleSheet, ListAdapter, Alignments */

/**
 *
 * @param {type} node The node that represents this View in the android style xml document
 * @returns {View}
 */

/**
 *
 * @param {Workspace} wkspc
 * @param {XMLNode} node
 * @param {string} parentId This is an optional parameter, and its only supplied when this View is the root layout of an xml include.
 * We use it to pass the id of the include element in the original layout to this View.
 * @returns {View}
 */
function View(wkspc, node, parentId) {
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
    this.parentId = (node.parentNode.getAttribute) ? node.parentNode.getAttribute(attrKeys.id).trim() :
        (parentId && typeof parentId === 'string' ? parentId : null);

    this.childrenIds = [];
    this.style = new Style("#" + this.id, []);
    this.refIds = new Map();
    this.htmlElement = null;
    let cssClasses = null;
    if (wkspc.template === true) {
        /**
         * Similar to the IncludedView.directChildConstraints method.
         * For views to be used as template for list | grid | table cells,
         * their parent is not in the layit view hierarchy...e.g it is an `LI` or a `TD` or a `TH`.
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


        if (!this.margins.start) {
            this.margins.start = 0;
        }
        if (!this.margins.end) {
            this.margins.end = 0;
        }
        if (!this.margins.top) {
            this.margins.top = 0;
        }
        if (!this.margins.bottom) {
            this.margins.bottom = 0;
        }


        /**
         * Values supported for width and height in xml.
         * Unitless values are supported, these are assumed to mean pixels
         * So you may say:<br>
         * width="2" or height="32"<br>
         * The following units are supported:
         * px, em and %.
         * So you may say:
         * width="322px" or height="308em" or width="5%"
         * Relational values are supported in the following format alone:
         * width="height"//makes the width and height same on the view
         * width="elemId" // makes the width of this view same as the width of the view with id=elemId
         * width="elemId*2" and width="2*elemId" are equivalent //makes the width of this view twice as large as the width of the view with id=elemId
         * width="elemId.width" // makes the width of this view same as the width of the view with id=elemId
         * width="elemId.height" // makes the width of this view same as the height of the view with id=elemId
         * width="4.2*elemId.width"// makes the width of this view 4.2 times the width of the view with id=elemId
         * width="0.25*elemId.height"// makes the width of this view 0.25 times the height of the view with id=elemId
         * width="elemId.width*3.8"// makes the width of this view 3.8 times the width of the view with id=elemId
         * width="elemId.height*3.142"// makes the width of this view 3.142 the height of the view with id=elemId
         *
         */
        this.width = node.getAttribute(attrKeys.layout_width);
        this.height = node.getAttribute(attrKeys.layout_height);


        if (this.width === sizes.MATCH_PARENT) {
            this.width = '100%';
        }
        if (this.height === sizes.MATCH_PARENT) {
            this.height = '100%';
        }

        changePxToUnitLess: {

            if (endsWith(this.width, 'px')) {
                this.width = parseFloat(this.width);
            }
            if (endsWith(this.height, 'px')) {
                this.height = parseFloat(this.height);
            }

        }




        this.dimRatio = -1; //Not specified... dimRatio is width/height
        this.wrapWidth = -1;
        this.wrapHeight = -1;
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
            // if (attrValue === 'parent') {
            //     attrValue = this.parentId;
            // }

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
                case attrKeys.layout_constraintGuide_begin:
                    this.refIds.set(attrKeys.layout_constraintGuide_begin, attrValue);
                    break;
                case attrKeys.layout_constraintGuide_end:
                    this.refIds.set(attrKeys.layout_constraintGuide_end, attrValue);
                    break;
                case attrKeys.layout_horizontalBias:
                    this.refIds.set(attrKeys.layout_horizontalBias, attrValue);
                    break;
                case attrKeys.layout_verticalBias:
                    this.refIds.set(attrKeys.layout_verticalBias, attrValue);
                    break;

                case attrKeys.orientation:
                    this.refIds.set(attrKeys.orientation, attrValue);
                    break;
                case attrKeys.dimension_ratio:
                    if (isNumber(attrValue)) {
                        this.dimRatio = parseFloat(attrValue);
                        this.refIds.set(attrKeys.dimension_ratio, this.dimRatio);
                    } else if (isDimensionRatio(attrValue) === true) {
                        let arr = attrValue.split(':');
                        let num = parseFloat(arr[0]);
                        let den = parseFloat(arr[1]);
                        if (num <= 0) {
                            throw new Error('Bad ratio specified! LHS can neither be 0 nor less than 0');
                        }
                        if (den <= 0) {
                            throw new Error('Bad ratio specified! RHS can neither be 0 nor less than 0');
                        }
                        this.dimRatio = num / den;
                        this.refIds.set(attrKeys.dimension_ratio, this.dimRatio);
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
                case attrKeys.layout_paddingHorizontal:
                    this.style.addStyleElement("padding-left", attrValue);
                    this.style.addStyleElement("padding-right", attrValue);
                    break;
                case attrKeys.layout_paddingVertical:
                    this.style.addStyleElement("padding-top", attrValue);
                    this.style.addStyleElement("padding-bottom", attrValue);
                    break;
                case attrKeys.translationZ:
                    this.style.addStyleElement("z-index", attrValue);
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

    this.createElement(wkspc, node);

    if (this.width === sizes.WRAP_CONTENT) {
        this.width = this.wrapWidth;
    } if (this.height === sizes.WRAP_CONTENT) {
        this.height = this.wrapHeight;
    }

    if (cssClasses !== null) {
        addClass(this.htmlElement, cssClasses);
    }


    this.rawWidth = 0;
    this.rawHeight = 0;

    let parent = wkspc.viewMap.get(this.parentId);
    if (endsWith(this.width, "%")) {
        if (this.topLevelRoot) {
            this.rawWidth = (parseFloat(this.width) / 100.0) * wkspc.rootWidth;
        } else {
            this.rawWidth = (parseFloat(this.width) / 100.0) * parent.width;
        }
    }
    else if (endsWith(this.width, "em")) {
        if (this.topLevelRoot) {
            this.rawWidth = parseFloat(this.width) * wkspc.rootWidth;
        } else {
            this.rawWidth = parseFloat(this.width) * parent.width;
        }
    } else {
        this.rawWidth = parseInt(this.width);
    }

    if (endsWith(this.height, "%")) {
        if (this.topLevelRoot) {
            this.rawHeight = (parseFloat(this.height) / 100.0) * wkspc.rootHeight;
        } else {
            this.rawHeight = (parseFloat(this.height) / 100.0) * parent.height;
        }
    }
    else if (endsWith(this.height, "em")) {
        if (this.topLevelRoot) {
            this.rawHeight = parseFloat(this.height) * wkspc.rootHeight;
        } else {
            this.rawHeight = parseFloat(this.height) * parent.height;
        }
    } else {
        this.rawHeight = parseInt(this.height);
    }

    //By this point, the rawWidth and the rawHeight properties of the View are in pixels(no units) or NaN.
    // The original values of width and height are preserved


    if (this.rawWidth === 0) {
        if (this.dimRatio !== -1) {
            this.rawWidth = this.dimRatio * this.rawHeight;
        }
    } if (this.rawHeight === 0) {
        if (this.dimRatio !== -1) {
            this.rawHeight = this.rawWidth * this.dimRatio;
        }
    }



    function convertSizeToPx(size, viewWidth) {
        let res = 0;
        if (endsWith(size, "px")) {
            res = parseFloat(size);
        } else if (endsWith(size, "%")) {
            res = (parseFloat(size) / 100.0) * viewWidth;
        } else if (endsWith(size, "em")) {
            res = parseFloat(size) * viewWidth;
        } else if (isNumber(size)) {
            res = parseFloat(size);
        }
        return res;
    }

    let maxWidth = this.refIds.get(attrKeys.layout_maxWidth);
    let maxHeight = this.refIds.get(attrKeys.layout_maxHeight);
    let minWidth = this.refIds.get(attrKeys.layout_minWidth);
    let minHeight = this.refIds.get(attrKeys.layout_minHeight);

    if (maxWidth) {
        let a = convertSizeToPx(maxWidth, parent.rawWidth);
        this.refIds.set(attrKeys.layout_maxWidth, isNumber(a) ? a : maxWidth);
    } if (maxHeight) {
        let a = convertSizeToPx(maxHeight, parent.rawHeight);
        this.refIds.set(attrKeys.layout_maxHeight, isNumber(a) ? a : maxHeight);
    } if (minWidth) {
        let a = convertSizeToPx(minWidth, parent.rawWidth);
        this.refIds.set(attrKeys.layout_minWidth, isNumber(a) ? a : minWidth);
    } if (minHeight) {
        let a = convertSizeToPx(minHeight, parent.rawHeight);
        this.refIds.set(attrKeys.layout_minHeight, isNumber(a) ? a : minHeight);
    }
    //maxWidth, maxHeight, minWidth, minHeight are now unitless and in pixels, too

    wkspc.viewMap.set(this.id, this);
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
    return arr.length === 2 && !isNaN(arr[0]) && !isNaN(arr[1]);
}

View.prototype.getValueAndPriority = function (value) {

    if (typeof value === 'undefined') {
        return value;
    }
    if (isNumber(value)) {
        return {
            id: value + "",
            defaultUsed: true,
            priority: AutoLayout.Priority.REQUIRED
        };
    }
    let index = value.indexOf('@');

    if (index === -1) {
        return {
            id: value,
            defaultUsed: true,
            priority: AutoLayout.Priority.REQUIRED
        };
    }
    if (index === 0) {
        throw 'Bad value for id';
    }

    return {
        id: value.substring(0, index),
        defaultUsed: false,
        priority: parseInt(value.substring(index + 1))
    };
};


/**
 * Applies necessary constraints to itself, where necessary
 *  Included layouts, templated layouts, and root layouts will need this a lot.
 */
View.prototype.layoutSelf = function (wkspc) {

    let w = this.width;
    let h = this.height;
    let id = this.id;

    let maxWid = this.refIds.get(attrKeys.layout_maxWidth);
    let maxHei = this.refIds.get(attrKeys.layout_maxHeight);
    let minWid = this.refIds.get(attrKeys.layout_minWidth);
    let minHei = this.refIds.get(attrKeys.layout_minHeight);

    let ss = this.refIds.get(attrKeys.layout_constraintStart_toStartOf);
    let ee = this.refIds.get(attrKeys.layout_constraintEnd_toEndOf);
    let tt = this.refIds.get(attrKeys.layout_constraintTop_toTopOf);
    let bb = this.refIds.get(attrKeys.layout_constraintBottom_toBottomOf);
    let cx = this.refIds.get(attrKeys.layout_constraintCenterXAlign);
    let cy = this.refIds.get(attrKeys.layout_constraintCenterYAlign);



    let constraints = [];


    let idnpWid = this.getValueAndPriority(w);
    w = idnpWid.id;
    let priorityWidth = idnpWid.priority;

    this.setWidthConstraints(constraints, this.id, w, priorityWidth);

    let idnpHei = this.getValueAndPriority(h);
    h = idnpHei.id;
    let priorityHeight = idnpHei.priority;

    this.setHeightConstraints(constraints, this.id, h, priorityHeight);

    if (maxWid) {

        let idnpMaxWid = this.getValueAndPriority(maxWid);
        maxWid = idnpMaxWid.id;
        let priorityMaxWid = idnpMaxWid.priority;

        //set maxWidth
        constraints.push({
            view1: id,
            attr1: 'width',    // see AutoLayout.Attribute
            relation: 'leq',   // see AutoLayout.Relation
            constant: parseFloat(maxWid),
            multiplier: 1,
            priority: priorityMaxWid
        });
    }
    if (minWid) {
        let idnpMinWid = this.getValueAndPriority(minWid);
        minWid = idnpMinWid.id;
        let priorityMinWid = idnpMinWid.priority;

        //set minWidth
        constraints.push({
            view1: id,
            attr1: 'width',    // see AutoLayout.Attribute
            relation: 'geq',   // see AutoLayout.Relation
            constant: parseFloat(minWid),
            multiplier: 1,
            priority: priorityMinWid
        });
    }
    if (maxHei) {
        let idnpMaxHei = this.getValueAndPriority(maxHei);
        maxHei = idnpMaxHei.id;
        let priorityMaxHei = idnpMaxHei.priority;


        //set maxHeight
        constraints.push({
            view1: id,
            attr1: 'height',    // see AutoLayout.Attribute
            relation: 'leq',   // see AutoLayout.Relation
            constant: parseFloat(maxHei),
            multiplier: 1,
            priority: priorityMaxHei
        });
    }

    if (minHei) {

        let idnpMinHei = this.getValueAndPriority(minHei);
        minHei = idnpMinHei.id;
        let priorityMinHei = idnpMinHei.priority;

        //set minHeight
        constraints.push({
            view1: id,
            attr1: 'height',    // see AutoLayout.Attribute
            relation: 'geq',   // see AutoLayout.Relation
            constant: parseFloat(minHei),
            multiplier: 1,
            priority: priorityMinHei
        });
    }

    let view = this;

    if (ss) {
        let idnp = this.getValueAndPriority(ss);
        ss = idnp.id;
        let priority = idnp.priority;
        this.setLeftAlignSS(id, view.margins.start, 'parent', priority, constraints);
    }
    if (tt) {
        let idnp = this.getValueAndPriority(tt);
        tt = idnp.id;
        let priority = idnp.priority;
        this.setTopAlignTT(id, view.margins.top, 'parent', priority, constraints);
    }
    if (ee) {
        let idnp = this.getValueAndPriority(ee);
        ee = idnp.id;
        let priority = idnp.priority;
        this.setRightAlignEE(id, view.margins.end, 'parent', priority, constraints);
    }
    if (bb) {
        let idnp = this.getValueAndPriority(bb);
        bb = idnp.id;
        let priority = idnp.priority;
        this.setBottomAlignBB(id, view.margins.bottom, 'parent', priority, constraints);
    }

    if (cx) {
        let idnp = this.getValueAndPriority(cx);
        cx = idnp.id;
        let priority = idnp.priority;
        constraints.push({
            view1: id,
            attr1: 'centerX',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: null,
            attr2: 'centerX',    // see AutoLayout.Attribute
            constant: view.margins.start - view.margins.end,
            multiplier: 1,
            priority: priority
        });
    }
    if (cy) {
        let idnp = this.getValueAndPriority(cy);
        cy = idnp.id;
        let priority = idnp.priority;
        constraints.push({
            view1: id,
            attr1: 'centerY',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: null,
            attr2: 'centerY',    // see AutoLayout.Attribute
            constant: view.margins.top - view.margins.bottom,
            multiplier: 1,
            priority: priority
        });
    }

    return constraints;


};

//Manually layout the child views
View.prototype.layoutChildren = function (wkspc) {
    var w = this.width;
    var h = this.height;

    let constraints = [];
    /*
     A constraint definition has the following format:
        constraint: {
            view1: {String},
            attr1: {AutoLayout.Attribute},
            relation: {AutoLayout.Relation},
            view2: {String},
            attr2: {AutoLayout.Attribute},
            multiplier: {Number},
            constant: {Number},
            priority: {Number}(0..1000)
          }

    */
    for (let i = 0; i < this.childrenIds.length; i++) {

        let cid = this.childrenIds[i];
        let child = wkspc.viewMap.get(cid);

        let ss = child.refIds.get(attrKeys.layout_constraintStart_toStartOf);
        let se = child.refIds.get(attrKeys.layout_constraintStart_toEndOf);
        let es = child.refIds.get(attrKeys.layout_constraintEnd_toStartOf);
        let ee = child.refIds.get(attrKeys.layout_constraintEnd_toEndOf);
        let tt = child.refIds.get(attrKeys.layout_constraintTop_toTopOf);
        let tb = child.refIds.get(attrKeys.layout_constraintTop_toBottomOf);
        let bt = child.refIds.get(attrKeys.layout_constraintBottom_toTopOf);
        let bb = child.refIds.get(attrKeys.layout_constraintBottom_toBottomOf);
        let cx = child.refIds.get(attrKeys.layout_constraintCenterXAlign);
        let cy = child.refIds.get(attrKeys.layout_constraintCenterYAlign);


        let horBias = child.refIds.get(attrKeys.layout_horizontalBias);
        let verBias = child.refIds.get(attrKeys.layout_verticalBias);
        if (child.constructor.name === 'Guideline') {
            child.layoutGuide(constraints);
            continue;
        }


        if (horBias) {
            if (isNumber(horBias)) {
                horBias = parseFloat(horBias);
                if (horBias >= 0 && horBias <= 1) {
                    horBias = horBias * 1000;
                } else {
                    throw "Invalid value set for horBias...should be between 0 and 1 view.id=" + cid
                }
            } else {
                throw "Invalid type set for horBias...should be between 0 and 1 view.id=" + cid
            }
        } else {
            horBias = AutoLayout.Priority.REQUIRED;
        }
        if (verBias) {
            if (isNumber(verBias)) {
                verBias = parseFloat(verBias);
                if (verBias >= 0 && verBias <= 1) {
                    verBias = verBias * 1000;
                } else {
                    throw "Invalid value set for verBias...should be between 0 and 1 view.id=" + cid
                }
            } else {
                throw "Invalid type set for verBias...should be between 0 and 1 view.id=" + cid
            }
        } else {
            verBias = AutoLayout.Priority.REQUIRED
        }


        let maxWid = child.refIds.get(attrKeys.layout_maxWidth);
        let maxHei = child.refIds.get(attrKeys.layout_maxHeight);
        let minWid = child.refIds.get(attrKeys.layout_minWidth);
        let minHei = child.refIds.get(attrKeys.layout_minHeight);


        let w = child.width;
        let h = child.height;

        if(w === sizes.WRAP_CONTENT){
            w =  child.wrapWidth;
        }
        if(h === sizes.WRAP_CONTENT){
            h =  child.wrapHeight;
        }

        let idnpWid = this.getValueAndPriority(w);
        w = idnpWid.id;
        let priorityWid = idnpWid.priority;

        let hiddenViewForWidthId = undefined;
        let hiddenViewForHeightId = undefined;


        if(idnpWid.defaultUsed){//user specified no priority
            if((ss && ee) || (se && ee) || (ss && es) || (se && es)){
                if( parseInt(w) === 0 ){
                    priorityWid = AutoLayout.Priority.DEFAULTLOW;
                }else{
                    hiddenViewForWidthId = cid + "_dummywid_" + ULID.ulid();
                    if(ss){
                        this.setLeftAlignSS(hiddenViewForWidthId, child.margins.start, ss, AutoLayout.Priority.REQUIRED, constraints);
                    }else if(se){
                        this.setLeftAlignSE(hiddenViewForWidthId, child.margins.start, se, AutoLayout.Priority.REQUIRED, constraints);
                    }

                    if(ee){
                        this.setRightAlignEE(hiddenViewForWidthId, child.margins.end, ee, AutoLayout.Priority.REQUIRED, constraints);
                    }else if(es){
                        this.setRightAlignES(hiddenViewForWidthId, child.margins.end, es, AutoLayout.Priority.REQUIRED, constraints);
                    }

                    constraints.push({
                        view1: hiddenViewForWidthId,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'equ',   // see AutoLayout.Relation
                        view2: null,
                        attr2: AutoLayout.Attribute.NOTANATTRIBUTE,    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: 1,
                        priority: 249
                    });
                    constraints.push({
                        view1: cid,
                        attr1: 'centerX',    // see AutoLayout.Attribute
                        relation: 'equ',   // see AutoLayout.Relation
                        view2: hiddenViewForWidthId,
                        attr2: 'centerX',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: 1,
                        priority: AutoLayout.Priority.REQUIRED
                    });

                }

            }
        }

        this.setWidthConstraints(constraints, cid, w, priorityWid);

        let idnpHei = this.getValueAndPriority(h);
        h = idnpHei.id;
        let priorityHei = idnpHei.priority;

        if(idnpHei.defaultUsed){//user specified no priority
            if((tt && bb) || (tb && bb) || (tt && bt) || (tb && bt)){
                if( parseInt(h) === 0 ){
                    priorityHei = AutoLayout.Priority.DEFAULTLOW;
                }else{
                    priorityHei = AutoLayout.Priority.REQUIRED;
                    hiddenViewForHeightId = cid + "_dummyhei_" + ULID.ulid();


                    if(tt){
                        this.setTopAlignTT(hiddenViewForHeightId, child.margins.top, tt, AutoLayout.Priority.REQUIRED, constraints);
                    }else if(tb){
                        this.setTopAlignTB(hiddenViewForHeightId, child.margins.top, tb, AutoLayout.Priority.REQUIRED, constraints);
                    }

                    if(bb){
                        this.setBottomAlignBB(hiddenViewForHeightId, child.margins.bottom, bb, AutoLayout.Priority.REQUIRED, constraints);
                    }else if(bt){
                        this.setBottomAlignBT(hiddenViewForHeightId, child.margins.bottom, bt, AutoLayout.Priority.REQUIRED, constraints);
                    }

                    constraints.push({
                        view1: hiddenViewForHeightId,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'equ',   // see AutoLayout.Relation
                        view2: null,
                        attr2: AutoLayout.Attribute.NOTANATTRIBUTE,    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: 1,
                        priority: 249
                    });
                    constraints.push({
                        view1: cid,
                        attr1: 'centerY',    // see AutoLayout.Attribute
                        relation: 'equ',   // see AutoLayout.Relation
                        view2: hiddenViewForHeightId,
                        attr2: 'centerY',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: 1,
                        priority: AutoLayout.Priority.REQUIRED
                    });

                }

            }
        }
        this.setHeightConstraints(constraints, cid, h, priorityHei);

        this.setSizeBoundariesConstraints(constraints, cid, maxWid, minWid, maxHei, minHei);




        if (ss) {
            if(!hiddenViewForWidthId){
                let idnp = this.getValueAndPriority(ss);
                ss = idnp.id;
                let priority = idnp.priority;
                this.setLeftAlignSS(cid, child.margins.start, ss, priority, constraints);
            }
        }
        if (tt) {
            if(!hiddenViewForHeightId){
                let idnp = this.getValueAndPriority(tt);
                tt = idnp.id;
                let priority = idnp.priority;
                this.setTopAlignTT(cid, child.margins.top, tt, priority, constraints);
            }
        }
        if (ee) {
            if(!hiddenViewForWidthId){
                let idnp = this.getValueAndPriority(ee);
                ee = idnp.id;
                let priority = idnp.priority;
                this.setRightAlignEE(cid, child.margins.end, ee, priority, constraints);
            }
        }
        if (bb) {
            if(!hiddenViewForHeightId){
                let idnp = this.getValueAndPriority(bb);
                bb = idnp.id;
                let priority = idnp.priority;
                this.setBottomAlignBB(cid, child.margins.bottom, bb, priority, constraints);
            }
        }
        if (se) {
            if(!hiddenViewForWidthId){
                let idnp = this.getValueAndPriority(se);
                se = idnp.id;
                let priority = idnp.priority;
                this.setLeftAlignSE(cid, child.margins.start, se, priority, constraints);
            }
        }
        if (es) {
            if(!hiddenViewForWidthId){
                let idnp = this.getValueAndPriority(es);
                es = idnp.id;
                let priority = idnp.priority;
                this.setRightAlignES(cid, child.margins.end, es, priority, constraints);
            }
        }
        if (tb) {
            if(!hiddenViewForHeightId){
                let idnp = this.getValueAndPriority(tb);
                tb = idnp.id;
                let priority = idnp.priority;
                this.setTopAlignTB(cid, child.margins.top, tb, priority, constraints);
            }
        }
        if (bt) {
            if(!hiddenViewForHeightId){
                let idnp = this.getValueAndPriority(bt);
                bt = idnp.id;
                let priority = idnp.priority;
                this.setBottomAlignBT(cid, child.margins.bottom, bt, priority, constraints);
            }
        }
        if (cx) {
            let idnp = this.getValueAndPriority(cx);
            cx = idnp.id;
            let priority = idnp.priority;
            constraints.push({
                view1: cid,
                attr1: 'centerX',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: cx === 'parent' ? null : cx,
                attr2: 'centerX',    // see AutoLayout.Attribute
                constant: child.margins.start - child.margins.end,
                multiplier: 1,
                priority: priority
            });
        }
        if (cy) {
            let idnp = this.getValueAndPriority(cy);
            cy = idnp.id;
            let priority = idnp.priority;
            constraints.push({
                view1: cid,
                attr1: 'centerY',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: cy === 'parent' ? null : cy,
                attr2: 'centerY',    // see AutoLayout.Attribute
                constant: child.margins.top - child.margins.bottom,
                multiplier: 1,
                priority: priority
            });
        }
    }
    return constraints;
};

/**
 * Sets the left align constraint for a left-left(start-start) align situation...works with pixels, percents
 * @param {string} view1 The view whose left is being constrained
 * @param {string|number} marginLeft The left margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the left-left anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setLeftAlignSS = function (view1, marginLeft, view2, priority, constraints) {
    if (typeof marginLeft === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'left',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'left',    // see AutoLayout.Attribute
            constant: marginLeft,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginLeft)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'left',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'left',    // see AutoLayout.Attribute
            constant: parseFloat(marginLeft),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginLeft, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'left',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'left',    // see AutoLayout.Attribute
            constant: parseFloat(marginLeft),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginLeft, "%");

        if (!isPct) {
            throw 'margin-left can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginLeft) / 100.0;


        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }

};



/**
 * Sets the left align constraint for a left-right(start-end) align situation...works with pixels, percents
 * @param {string} view1 The view whose left is being constrained
 * @param {*} marginLeft The left margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the left-right anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setLeftAlignSE = function (view1, marginLeft, view2, priority, constraints) {
    if (typeof marginLeft === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'left',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'right',    // see AutoLayout.Attribute
            constant: marginLeft,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginLeft)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'left',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'right',    // see AutoLayout.Attribute
            constant: parseFloat(marginLeft),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginLeft, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'left',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'right',    // see AutoLayout.Attribute
            constant: parseFloat(marginLeft),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginLeft, "%");

        if (!isPct) {
            throw 'margin-left can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginLeft) / 100.0;

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }
};



/**
 * Sets the right align constraint for a right-right(end-end) align situation...works with pixels, percents
 * @param {string} view1 The view whose right is being constrained
 * @param {*} marginRight The right margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the right-right anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setRightAlignEE = function (view1, marginRight, view2, priority, constraints) {
    if (typeof marginRight === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'right',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'right',    // see AutoLayout.Attribute
            constant: -1 * marginRight,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginRight)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'right',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'right',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginRight),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginRight, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'right',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'right',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginRight),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginRight, "%");

        if (!isPct) {
            throw 'margin-right can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginRight) / 100.0;

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }

};


/**
 * Sets the right align constraint for a right-left(end-start) align situation...works with pixels, percents
 * @param {string} view1 The view whose right is being constrained
 * @param {*} marginRight The right margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the right-left anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setRightAlignES = function (view1, marginRight, view2, priority, constraints) {
    if (typeof marginRight === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'right',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'left',    // see AutoLayout.Attribute
            constant: -1 * marginRight,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginRight)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'right',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'left',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginRight),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginRight, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'right',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'left',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginRight),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginRight, "%");

        if (!isPct) {
            throw 'margin-right can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginRight) / 100.0;

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }
};



/**
 * Sets the top align constraint for a top-top align situation...works with pixels, percents
 * @param {string} view1 The view whose top is being constrained
 * @param {*} marginTop The top margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the top-top anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setTopAlignTT = function (view1, marginTop, view2, priority, constraints) {
    if (typeof marginTop === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'top',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'top',    // see AutoLayout.Attribute
            constant: marginTop,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginTop)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'top',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'top',    // see AutoLayout.Attribute
            constant: parseFloat(marginTop),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginTop, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'top',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'top',    // see AutoLayout.Attribute
            constant: parseFloat(marginTop),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginTop, "%");

        if (!isPct) {
            throw 'margin-top can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginTop) / 100.0;

        if (!val) {
            throw 'Invalid expression found for margin-top on id: ' + view1;
        }

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }

};



/**
 * Sets the top align constraint for a top-bottom align situation...works with pixels, percents
 * @param {string} view1 The view whose top is being constrained
 * @param {*} marginTop The top margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the top-bottom anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setTopAlignTB = function (view1, marginTop, view2, priority, constraints) {
    if (typeof marginTop === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'top',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'bottom',    // see AutoLayout.Attribute
            constant: marginTop,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginTop)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'top',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'bottom',    // see AutoLayout.Attribute
            constant: parseFloat(marginTop),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginTop, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'top',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'bottom',    // see AutoLayout.Attribute
            constant: parseFloat(marginTop),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginTop, "%");

        if (!isPct) {
            throw 'margin-top can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginTop) / 100.0;

        if (!val) {
            throw 'Invalid expression found for margin-top on id: ' + view1;
        }

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }

};



/**
 * Sets the bottom align constraint for a bottom-bottom align situation...works with pixels, percents
 * @param {string} view1 The view whose bottom is being constrained
 * @param {*} marginBottom The bottom margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the bottom-bottom anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setBottomAlignBB = function (view1, marginBottom, view2, priority, constraints) {
    if (typeof marginBottom === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'bottom',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'bottom',    // see AutoLayout.Attribute
            constant: -1 * marginBottom,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginBottom)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'bottom',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'bottom',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginBottom),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginBottom, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'bottom',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'bottom',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginBottom),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginBottom, "%");

        if (!isPct) {
            throw 'margin-bottom can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginBottom) / 100.0;

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }

};


/**
 * Sets the bottom align constraint for a bottom-top align situation...works with pixels, percents
 * @param {string} view1 The view whose bottom is being constrained
 * @param {*} marginBottom The bottom margin... supported units are px, % and no units(we assume px)
 * @param {string} view2 The id of the view being constrained to, or parent to refer to the parent element
 * @param {number} priority The priority of the bottom-bottom anchor constraint
 * @param {Array} constraints The array that holds the constraints generated here
 */
View.prototype.setBottomAlignBT = function (view1, marginBottom, view2, priority, constraints) {
    if (typeof marginBottom === 'number') {
        constraints.push({
            view1: view1,
            attr1: 'bottom',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'top',    // see AutoLayout.Attribute
            constant: -1 * marginBottom,
            multiplier: 1,
            priority: priority
        });
    } else if (isNumber(marginBottom)) {//may be a number string
        constraints.push({
            view1: view1,
            attr1: 'bottom',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'top',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginBottom),
            multiplier: 1,
            priority: priority
        });
    } else if (endsWith(marginBottom, "px")) {
        constraints.push({
            view1: view1,
            attr1: 'bottom',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: view2 === 'parent' ? null : view2,
            attr2: 'top',    // see AutoLayout.Attribute
            constant: -1 * parseFloat(marginBottom),
            multiplier: 1,
            priority: priority
        });
    } else {
        let isPct = endsWith(marginBottom, "%");

        if (!isPct) {
            throw 'margin-bottom can only be expressed in pixels, in percentage(%) or without units, on id: ' + view1;
        }

        let val = parseFloat(marginBottom) / 100.0;

        let hiddenViewId = view1 + "_dummy_" + ULID.ulid();
        if (view2 === 'parent') {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        } else {
            constraints.push({
                view1: hiddenViewId,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: view2,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: view1,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }
    }

};

View.prototype.setSizeBoundariesConstraints = function (constraints, cid, maxWid, minWid, maxHei, minHei) {

    if (maxWid) {

        let idnpMaxWid = this.getValueAndPriority(maxWid);
        maxWid = idnpMaxWid.id;
        let priorityMaxWid = idnpMaxWid.priority;

        let i = -1;
        let vid = '';
        if (isNumber(maxWid)) {
            constraints.push({
                view1: cid,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'leq',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: parseFloat(maxWid),
                multiplier: 1,
                priority: priorityMaxWid
            });
        } else if (maxWid === 'parent' || this.childrenIds.indexOf(maxWid) !== -1) {//maxWid is an id of another element... so use that element's width for maxWid
            constraints.push({
                view1: cid,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'leq',   // see AutoLayout.Relation
                view2: maxWid === 'parent' ? null : maxWid,
                attr2: "width",
                constant: 0,
                multiplier: 1,
                priority: priorityMaxWid
            });
        } else if ((i = maxWid.indexOf(".")) !== -1 &&
            this.childrenIds.indexOf((vid = maxWid.substring(0, i))) !== -1) {//maxWid is elementId.width or elementId.height... so use that element's width for maxWid

            if (maxWid.substring(i + 1) === 'width') {
                constraints.push({
                    view1: cid,
                    attr1: 'width',    // see AutoLayout.Attribute
                    relation: 'leq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "width",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMaxWid
                });
            } else if (maxWid.substring(i + 1) === 'height') {
                constraints.push({
                    view1: cid,
                    attr1: 'width',    // see AutoLayout.Attribute
                    relation: 'leq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "height",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMaxWid
                });
            }

        } else {
            let parsedMaxWidth = parseNumberAndUnitsNoValidation(maxWid, true);

            if (parsedMaxWidth.number) {
                if (parsedMaxWidth.units === 'px') {
                    constraints.push({
                        view1: cid,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'leq',   // see AutoLayout.Relation
                        constant: parseFloat(parsedMaxWidth.number),
                        view2: null,
                        attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                        multiplier: 1,
                        priority: priorityMaxWid
                    });
                } else if (parsedMaxWidth.units === '%') {
                    constraints.push({
                        view1: cid,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'leq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'width',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMaxWidth.number) / 100.0,
                        priority: priorityMaxWid
                    });
                } else if (parsedMaxWidth.units === 'em') {
                    constraints.push({
                        view1: cid,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'leq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'width',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMaxWidth.number), //em is already a multiplier
                        priority: priorityMaxWid
                    });
                } else {
                    throw "Invalid values specified for the max-width units on view.id=" + cid
                }
            } else {
                throw "Bad value specified for the max-width units on view.id=" + cid + ", value=" + maxWid
            }
        }
    }






    if (minWid) {
        let idnpMinWid = this.getValueAndPriority(minWid);
        minWid = idnpMinWid.id;
        let priorityMinWid = idnpMinWid.priority;

        let i = -1;
        let vid = '';
        if (isNumber(minWid)) {
            constraints.push({
                view1: cid,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'geq',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: parseFloat(minWid),
                multiplier: 1,
                priority: priorityMinWid
            });
        } else if (minWid === 'parent' || this.childrenIds.indexOf(minWid) !== -1) {//minWid is an id of another element... so use that element's width for minWid
            constraints.push({
                view1: cid,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'geq',   // see AutoLayout.Relation
                view2: minWid === 'parent' ? null : minWid,
                attr2: "width",
                constant: 0,
                multiplier: 1,
                priority: priorityMinWid
            });
        } else if ((i = minWid.indexOf(".")) !== -1 &&
            this.childrenIds.indexOf((vid = minWid.substring(0, i))) !== -1) {//minWid is elementId.width or elementId.height... so use that element's width for minWid

            if (minWid.substring(i + 1) === 'width') {
                constraints.push({
                    view1: cid,
                    attr1: 'width',    // see AutoLayout.Attribute
                    relation: 'geq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "width",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMinWid
                });
            } else if (minWid.substring(i + 1) === 'height') {
                constraints.push({
                    view1: cid,
                    attr1: 'width',    // see AutoLayout.Attribute
                    relation: 'geq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "height",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMinWid
                });
            }

        } else {
            let parsedMinWidth = parseNumberAndUnitsNoValidation(minWid, true);
            if (parsedMinWidth.number) {
                if (parsedMinWidth.units === 'px') {
                    constraints.push({
                        view1: cid,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'geq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                        constant: parseFloat(parsedMinWidth.number),
                        multiplier: 1,
                        priority: priorityMinWid
                    });
                } else if (parsedMinWidth.units === '%') {
                    constraints.push({
                        view1: cid,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'geq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'width',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMinWidth.number) / 100.0,
                        priority: priorityMinWid
                    });
                } else if (parsedMinWidth.units === 'em') {
                    constraints.push({
                        view1: cid,
                        attr1: 'width',    // see AutoLayout.Attribute
                        relation: 'geq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'width',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMinWidth.number), //em is already a multiplier
                        priority: priorityMinWid
                    });
                } else {
                    throw "Invalid values specified for the min-width units on view.id=" + cid
                }
            } else {
                throw "Bad value specified for the min-width units on view.id=" + cid + ", value=" + minWid
            }
        }


    }

    if (maxHei) {
        let idnpMaxHei = this.getValueAndPriority(maxHei);
        maxHei = idnpMaxHei.id;
        let priorityMaxHei = idnpMaxHei.priority;

        let i = -1;
        let vid = '';
        if (isNumber(maxHei)) {
            constraints.push({
                view1: cid,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'leq',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: parseFloat(maxHei),
                multiplier: 1,
                priority: priorityMaxHei
            });
        } else if (maxHei === 'parent' || this.childrenIds.indexOf(maxHei) !== -1) {//maxHei is an id of another element... so use that element's height for maxHei
            constraints.push({
                view1: cid,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'leq',   // see AutoLayout.Relation
                view2: maxHei === 'parent' ? null : maxHei,
                attr2: "height",
                constant: 0,
                multiplier: 1,
                priority: priorityMaxHei
            });
        } else if ((i = maxHei.indexOf(".")) !== -1 &&
            this.childrenIds.indexOf((vid = maxHei.substring(0, i))) !== -1) {//maxHei is elementId.width or elementId.height... so use that element's width for maxWid

            if (maxHei.substring(i + 1) === 'width') {
                constraints.push({
                    view1: cid,
                    attr1: 'height',    // see AutoLayout.Attribute
                    relation: 'leq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "width",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMaxHei
                });
            } else if (maxHei.substring(i + 1) === 'height') {
                constraints.push({
                    view1: cid,
                    attr1: 'height',    // see AutoLayout.Attribute
                    relation: 'leq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "height",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMaxHei
                });
            }

        } else {
            let parsedMaxHeight = parseNumberAndUnitsNoValidation(maxHei, true);

            if (parsedMaxHeight.number) {
                if (parsedMaxHeight.units === 'px') {
                    constraints.push({
                        view1: cid,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'leq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                        constant: parseFloat(parsedMaxHeight.number),
                        multiplier: 1,
                        priority: priorityMaxHei
                    });
                } else if (parsedMaxHeight.units === '%') {
                    constraints.push({
                        view1: cid,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'leq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'height',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMaxHeight.number) / 100.0,
                        priority: priorityMaxHei
                    });
                } else if (parsedMaxHeight.units === 'em') {
                    constraints.push({
                        view1: cid,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'leq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'height',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMaxHeight.number), //em is already a multiplier
                        priority: priorityMaxHei
                    });
                } else {
                    throw "Invalid values specified for the max-height units on view.id=" + cid
                }
            } else {
                throw "Bad value specified for the max-height units on view.id=" + cid + ", value=" + maxHei
            }
        }

    }
    if (minHei) {

        let idnpMinHei = this.getValueAndPriority(minHei);
        minHei = idnpMinHei.id;
        let priorityMinHei = idnpMinHei.priority;

        let i = -1;
        let vid = '';
        if (isNumber(minHei)) {
            constraints.push({
                view1: cid,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'geq',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: parseFloat(minHei),
                multiplier: 1,
                priority: priorityMinHei
            });
        } else if (minHei === 'parent' || this.childrenIds.indexOf(maxHei) !== -1) {//minHei is an id of another element... so use that element's height for minHei
            constraints.push({
                view1: cid,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'geq',   // see AutoLayout.Relation
                view2: minHei === 'parent' ? null : minHei,
                attr2: "height",
                constant: 0,
                multiplier: 1,
                priority: priorityMinHei
            });
        } else if ((i = minHei.indexOf(".")) !== -1 &&
            this.childrenIds.indexOf((vid = minHei.substring(0, i))) !== -1) {//maxHei is elementId.width or elementId.height... so use that element's width for maxWid

            if (minHei.substring(i + 1) === 'width') {
                constraints.push({
                    view1: cid,
                    attr1: 'height',    // see AutoLayout.Attribute
                    relation: 'geq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "width",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMinHei
                });
            } else if (minHei.substring(i + 1) === 'height') {
                constraints.push({
                    view1: cid,
                    attr1: 'height',    // see AutoLayout.Attribute
                    relation: 'geq',   // see AutoLayout.Relation
                    view2: vid === 'parent' ? null : vid,
                    attr2: "height",
                    constant: 0,
                    multiplier: 1,
                    priority: priorityMinHei
                });
            }

        } else {
            let parsedMinHeight = parseNumberAndUnitsNoValidation(minHei, true);

            if (parsedMinHeight.number) {
                if (parsedMinHeight.units === 'px') {
                    constraints.push({
                        view1: cid,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'geq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                        constant: parseFloat(parsedMinHeight.number),
                        multiplier: 1,
                        priority: priorityMinHei
                    });
                } else if (parsedMinHeight.units === '%') {
                    constraints.push({
                        view1: cid,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'geq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'height',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMinHeight.number) / 100.0,
                        priority: priorityMinHei
                    });
                } else if (parsedMinHeight.units === 'em') {
                    constraints.push({
                        view1: cid,
                        attr1: 'height',    // see AutoLayout.Attribute
                        relation: 'geq',   // see AutoLayout.Relation
                        view2: null,
                        attr2: 'height',    // see AutoLayout.Attribute
                        constant: 0,
                        multiplier: parseFloat(parsedMinHeight.number), //em is already a multiplier
                        priority: priorityMinHei
                    });
                } else {
                    throw "Invalid values specified for the min-height units on view.id=" + cid
                }
            } else {
                throw "Bad value specified for the min-height units on view.id=" + cid + ", value=" + minHei
            }
        }


    }

};
/**
 * Sometimes the width or height may come as a relational quantity instead of being given as a number or a number with units.
 * Some examples are,
 * width=some_id*4
 * width=some_id.width*2
 * height=some_id.height*0.35
 * height=0.81*some_id.width.
 *
 * We need to split this statements into tokens and extract information about the individual tokens.
 *
 * To avoid the scanner splitting floating point numbers, we will change the floating point on
 * some_id.width and some_id.height to % instead
 * and then we can safely split on the % and replace to floating point after the scan.
 * To optimize further, we could leave the % in place instead of replacing it back when done and deal with it as such in
 * code that uses this. To do this, we introduce an optional `optimize` parameter, which if true, leaves the '%' in place,
 * but if false will change it back to the original '.'
 * Thinking premature optimization? dont sue me :)
 * @param {string} dim
 * @param {boolean} optimize
 * @returns {Array} an array containing the input split into relevant tokens
 */
function quickScan(dim, optimize) {
    let hh = dim + "";
    //to avoid the scanner splitting floating point numbers, we will change the floating point on id.width and id.height to % instead
    // and then we can safely split on the % and replace to floating point after the scan
    hh = hh.replace(".width", "%width");
    hh = hh.replace(".height", "%height");

    let tokens = new Scanner(hh, true, ["*", "+", "%","-"]).scan();
    if (optimize && optimize === true) {
        return tokens;
    }
    let i = tokens.indexOf("%");
    if (i !== -1) {
        tokens[i] = '.';//change % back to .
    }

    return tokens;
}

View.prototype.setWidthConstraints = function (constraints, id, w, priority) {

    let mulInd = w.indexOf("*");
    let addInd = w.indexOf("+");
    let subInd = w.indexOf("-");
    let dotInd = w.indexOf(".");
    let parseObj;
    let selectedDimensionForAttr2IsWidth;


    if (isNumber(w)) {
        w = typeof w === 'string' ? parseFloat(w) : w;
        constraints.push({
            view1: id,
            attr1: 'width',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: null,
            attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
            constant: w,
            multiplier: 1,
            priority: priority
        });
    } else if ((parseObj = parseNumberAndUnitsNoValidation(w, true)).number) {
        let val = parseFloat(parseObj.number);
        switch (parseObj.units) {
            case CssSizeUnits.PX:
                constraints.push({
                    view1: id,
                    attr1: 'width',    // see AutoLayout.Attribute
                    relation: 'equ',   // see AutoLayout.Relation
                    view2: null,
                    attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                    constant: val,
                    multiplier: 1,
                    priority: priority
                });
                break;
            case CssSizeUnits.PCT:
                constraints.push({
                    view1: id,
                    attr1: 'width',    // see AutoLayout.Attribute
                    relation: 'equ',   // see AutoLayout.Relation
                    view2: null,
                    attr2: 'width',    // see AutoLayout.Attribute
                    constant: 0,
                    multiplier: val / 100.0,
                    priority: priority
                });
                break;
            default:
                throw 'width value is bad on id: ' + id + ", bad value is: " + w
        }

    } else if (w === 'height') {//width = height refers to the height of same element... so use this element's height for its width
        constraints.push({
            view1: id,
            attr1: 'width',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: id,
            attr2: "height",
            constant: 0,
            multiplier: 1,
            priority: priority
        });
    } else if (w === 'parent' || this.childrenIds.indexOf(w) !== -1) {//width is an id of another element... so use that element's width for width
        constraints.push({
            view1: id,
            attr1: 'width',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: w === 'parent' ? null : w,
            attr2: "width",
            constant: 0,
            multiplier: 1,
            priority: priority
        });
    }
    // width cannot be a combination of 2 operators * and - or + and - or + and *
    else if ((mulInd !== -1 && addInd !== -1) || (addInd !== -1 && subInd !== -1) || (mulInd !== -1 && subInd !== -1)) {
        throw 'width can only compare using one of `*` or `+` or `-`';
    }
    else if (mulInd !== -1 || addInd !== -1 || subInd !== -1) {
        let tokens = quickScan(w, true);
        if (tokens.length !== 3 && tokens.length !== 5) {
            throw 'invalid expression for width found on view.id=' + id + ", expression: " + w;
        }
        let mulIndex = tokens.indexOf("*");
        let sumIndex = tokens.indexOf("+");
        let subIndex = tokens.indexOf("-");


        if (mulIndex !== -1) {
            let vid;
            let number;
            if (isNumber(number = tokens[0])) {//format is number*elemid or number*elemid.width or number*elemid.height
                vid = tokens[2] === 'height' ? id : tokens[2];
                if (vid === 'width') {
                    throw 'the width is not yet initialized';
                }
                if (tokens.length === 3) {
                    selectedDimensionForAttr2IsWidth = tokens[2] !== 'height';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsWidth = tokens[4] === 'width';
                } else {
                    throw 'error in value specified for width on view.id=' + id + '... expression ' + w
                }
            }
            else if (isNumber(number = tokens[tokens.length - 1])) {//format is elemid*number or height*number or elemid.width*number or elemid.height*number
                vid = tokens[0] === 'height' ? id : tokens[0];
                if (vid === 'width') {
                    throw 'the width is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the height of the same element
                    selectedDimensionForAttr2IsWidth = tokens[0] !== 'height';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsWidth = tokens[2] === 'width';
                } else {
                    throw 'error in value specified for width on view.id=' + id + '... expression ' + w
                }
            }

            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: vid === 'parent' ? null : vid,
                attr2: selectedDimensionForAttr2IsWidth ? "width" : "height",
                constant: 0,
                multiplier: parseFloat(number),
                priority: priority
            });

        } else if (sumIndex !== -1) {
            let vid;
            let number;
            if (isNumber(number = tokens[0])) {//format is number+elemid or number+elemid.width or number+elemid.height
                vid = tokens[2] === 'height' ? id : tokens[2];
                if (vid === 'width') {
                    throw 'the width is not yet initialized';
                }
                if (tokens.length === 3) {
                    selectedDimensionForAttr2IsWidth = tokens[2] !== 'height';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsWidth = tokens[4] === 'width';
                } else {
                    throw 'error in value specified for width on view.id=' + cid + '... expression ' + w
                }
            }
            else if (isNumber(number = tokens[tokens.length - 1])) {//format is elemid+number or number+elemid or width+number or elemid.width+number or elemid.height+number
                vid = tokens[0] === 'height' ? id : tokens[0];
                if (vid === 'width') {
                    throw 'the width is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the height of the same element
                    selectedDimensionForAttr2IsWidth = tokens[0] !== 'height';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsWidth = tokens[2] === 'width';
                } else {
                    throw 'error in value specified for width on view.id=' + id + '... expression ' + w
                }
            }

            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: vid === 'parent' ? null : vid,
                attr2: selectedDimensionForAttr2IsWidth ? "width" : "height",
                constant: parseFloat(number),
                multiplier: 1,
                priority: priority
            });

        } else if (subIndex !== -1) {
            let vid;
            let number;
            if (isNumber(number = tokens[0])) {//format is number-elemid or number-elemid.width or number-elemid.height
                throw '`value-elem[.width|height]` is not allowed, but `elem[.width|height]-value is allowed on ` view.id=' + cid + '... expression ' + w
            }
            else if (isNumber(number = tokens[tokens.length - 1])) {//format is elemid-number or width-number or elemid.width-number or elemid.height-number
                vid = tokens[0] === 'height' ? id : tokens[0];
                if (vid === 'width') {
                    throw 'the width is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the height of the same element
                    selectedDimensionForAttr2IsWidth = tokens[0] !== 'height';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsWidth = tokens[2] === 'width';
                } else {
                    throw 'error in value specified for width on view.id=' + id + '... expression ' + w
                }
            }

            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: vid === 'parent' ? null : vid,
                attr2: selectedDimensionForAttr2IsWidth ? "width" : "height",
                constant: -1 * parseFloat(number),
                multiplier: 1,
                priority: priority
            });

        }
    } else if (mulInd === -1 && addInd === -1 && subInd === -1 && dotInd !== -1) {//test for width="some_id.width" or width="some_id.height"
        let lhs = w.substring(0, dotInd);
        let rhs = w.substring(dotInd + 1);
        if (rhs === 'width') {
            selectedDimensionForAttr2IsWidth = true;
        } else if (rhs === 'height') {
            selectedDimensionForAttr2IsWidth = false;
        } else {
            throw 'Strange expression found for width on id: ' + id + ', expression is: ' + w
        }
        let v2;
        if (lhs === 'parent' || rhs === 'parent') {
            v2 = null;
        } else if (this.childrenIds.indexOf(lhs) !== -1) {
            v2 = lhs; //you have the sibling!
        } else {
            throw 'Bad expression found for width on id: ' + id + ', expression is: ' + w
        }

        constraints.push({
            view1: id,
            attr1: 'width',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: v2,
            attr2: selectedDimensionForAttr2IsWidth ? "width" : "height",
            constant: 0,
            multiplier: 1,
            priority: priority
        });

    } else {
        console.log(parseObj);
        throw 'invalid value for width on id: ' + id + ", bad value is: " + w;
    }

};
View.prototype.setHeightConstraints = function (constraints, id, h, priority) {

    let mulInd = h.indexOf("*");
    let addInd = h.indexOf("+");
    let subInd = h.indexOf("-");
    let dotInd = h.indexOf(".");
    let  parseObj;
    let selectedDimensionForAttr2IsHeight;

    if (isNumber(h)) {
        h = typeof h === 'string' ? parseFloat(h) : h;
        constraints.push({
            view1: id,
            attr1: 'height',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: null,
            attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
            constant: h,
            multiplier: 1,
            priority: priority
        });
    } else if ((parseObj = parseNumberAndUnitsNoValidation(h, true)).number) {
        let val = parseFloat(parseObj.number);
        switch (parseObj.units) {
            case CssSizeUnits.PX:
                constraints.push({
                    view1: id,
                    attr1: 'height',    // see AutoLayout.Attribute
                    relation: 'equ',   // see AutoLayout.Relation
                    view2: null,
                    attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                    constant: val,
                    multiplier: 1,
                    priority: priority
                });
                break;
            case CssSizeUnits.PCT:
                constraints.push({
                    view1: id,
                    attr1: 'height',    // see AutoLayout.Attribute
                    relation: 'equ',   // see AutoLayout.Relation
                    view2: null,
                    attr2: 'height',    // see AutoLayout.Attribute
                    constant: 0,
                    multiplier: val / 100.0,
                    priority: priority
                });
                break;
            default:
                throw 'height value is bad on id: ' + id + ", bad value is: " + h
        }

    } else if (h === 'width') {//height = width refers to the width of same element... so use this element's width for its height
        constraints.push({
            view1: id,
            attr1: 'height',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: id,
            attr2: "width",
            constant: 0,
            multiplier: 1,
            priority: priority
        });
    } else if (h === 'parent' || this.childrenIds.indexOf(h) !== -1) {//height is an id of another element... so use that element's height for height
        constraints.push({
            view1: id,
            attr1: 'height',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: h === 'parent' ? null : h,
            attr2: "height",
            constant: 0,
            multiplier: 1,
            priority: priority
        });
    }
    // width cannot be a combination of 2 operators * and - or + and - or + and *
    else if ((mulInd !== -1 && addInd !== -1) || (addInd !== -1 && subInd !== -1) || (mulInd !== -1 && subInd !== -1)) {
        throw 'width can only compare using one of `*` or `+` or `-`';
    }
    else if (mulInd !== -1 || addInd !== -1 || subInd !== -1) {
        let tokens = quickScan(h, true);

        if (tokens.length !== 3 && tokens.length !== 5) {
            throw 'invalid expression for height found on view.id=' + id + ',... ' + tokens;
        }

        let mulIndex = tokens.indexOf("*");
        let sumIndex = tokens.indexOf("+");
        let subIndex = tokens.indexOf("-");


        if (mulIndex !== -1) {
            let vid;
            let number;
            if (isNumber(number = tokens[0])) {//format is number*elemid or number*width or number*elemid.width or number*elemid.height
                vid = tokens[2] === 'width' ? id : tokens[2];
                if (vid === 'height') {
                    throw 'the height is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the width of the same element
                    selectedDimensionForAttr2IsHeight = tokens[2] !== 'width';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsHeight = tokens[4] === 'height';
                } else {
                    throw 'error in value specified for height on view.id=' + id + '... expression ' + h
                }
            }
            else if (isNumber(number = tokens[tokens.length - 1])) {//format is elemid*number or width*number or elemid.width*number or elemid.height*number
                vid = tokens[0] === 'width' ? id : tokens[0];
                if (vid === 'height') {
                    throw 'the height is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the width of the same element
                    selectedDimensionForAttr2IsHeight = tokens[0] !== 'width';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsHeight = tokens[2] === 'height';
                } else {
                    throw 'error in value specified for height on view.id=' + id + '... expression ' + h
                }
            }

            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: vid === 'parent' ? null : vid,
                attr2: selectedDimensionForAttr2IsHeight ? "height" : "width",
                constant: 0,
                multiplier: parseFloat(number),
                priority: priority
            });

        } else if (sumIndex !== -1) {
            let vid;
            let number;
            if (isNumber(number = tokens[0])) {//format is number+elemid or number+elemid.width or number+elemid.height
                vid = tokens[2] === 'width' ? id : tokens[2];
                if (vid === 'height') {
                    throw 'the height is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the width of the same element
                    selectedDimensionForAttr2IsHeight = tokens[2] !== 'width';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsHeight = tokens[4] === 'height';
                } else {
                    throw 'error in value specified for height on view.id=' + id + '... expression ' + h
                }
            }
            else if (isNumber(number = tokens[tokens.length - 1])) {//format is elemid+number or elemid.width+number or elemid.height+number
                vid = tokens[0] === 'width' ? id : tokens[0];
                if (vid === 'height') {
                    throw 'the height is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the width of the same element
                    selectedDimensionForAttr2IsHeight = tokens[0] !== 'width';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsHeight = tokens[2] === 'height';
                } else {
                    throw 'error in value specified for height on view.id=' + id + '... expression ' + h
                }
            }

            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: vid === 'parent' ? null : vid,
                attr2: selectedDimensionForAttr2IsHeight ? "height" : "width",
                constant: parseFloat(number),
                multiplier: 1,
                priority: priority
            });

        }else if (subIndex !== -1) {
            let vid;
            let number;
            if (isNumber(number = tokens[0])) {
                //format is number-elemid or number-elemid.width or number-elemid.height
                throw '`value-elem[.width|height]` is not allowed, but `elem[.width|height]-value is allowed on ` view.id=' + cid + '... expression ' + w
            }

            else if (isNumber(number = tokens[tokens.length - 1])) {//format is elemid+number or elemid.width+number or elemid.height+number
                vid = tokens[0] === 'width' ? id : tokens[0];
                if (vid === 'height') {
                    throw 'the height is not yet initialized';
                }
                if (tokens.length === 3) {
                    //if the first token is width, then it refers to the width of the same element
                    selectedDimensionForAttr2IsHeight = tokens[0] !== 'width';
                } else if (tokens.length === 5) {
                    selectedDimensionForAttr2IsHeight = tokens[2] === 'height';
                } else {
                    throw 'error in value specified for height on view.id=' + id + '... expression ' + h
                }
            }

            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: vid === 'parent' ? null : vid,
                attr2: selectedDimensionForAttr2IsHeight ? "height" : "width",
                constant: -1*parseFloat(number),
                multiplier: 1,
                priority: priority
            });

        }
    } else if (mulInd === -1 && addInd === -1 && dotInd !== -1) {//test for width="some_id.width" or width="some_id.height"
        let lhs = h.substring(0, dotInd);
        let rhs = h.substring(dotInd + 1);
        if (rhs === 'height') {
            selectedDimensionForAttr2IsHeight = true;
        } else if (rhs === 'width') {
            selectedDimensionForAttr2IsHeight = false;
        } else {
            throw 'Strange expression found for height on id: ' + id + ', expression is: ' + h
        }
        let v2;
        if (lhs === 'parent' || rhs === 'parent') {
            v2 = null;
        } else if (this.childrenIds.indexOf(lhs) !== -1) {
            v2 = lhs; //you have the sibling!
        } else {
            throw 'Bad expression found for height on id: ' + id + ', expression is: ' + h
        }

        constraints.push({
            view1: id,
            attr1: 'height',    // see AutoLayout.Attribute
            relation: 'equ',   // see AutoLayout.Relation
            view2: v2,
            attr2: selectedDimensionForAttr2IsHeight ? "height" : "width",
            constant: 0,
            multiplier: 1,
            priority: priority
        });

    } else {
        throw 'invalid value for height on id: ' + id + ", bad value is: " + h;
    }

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
View.prototype.createElement = function (wkspc, node) {
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
    if (!(view instanceof View)) {
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
            let cStyle = getComputedStyle(this.htmlElement);
            options.width = cStyle.width;
            options.height = cStyle.height;
            let background = new MysteryImage(options);
            background.draw();
            let style = new Style('#' + this.htmlElement.id, []);
            style.addFromOptions({
                "background-image": "url('" + background.getImage() + "')",
                "background-position": "0% 0%"
            });
            updateOrCreateSelectorInStyleSheet(styleSheet, style);
            background.cleanup();
        };
    }
};



View.prototype.calculateWrapContentSizes = function (node) {
    //bold 12pt arial;
    let w = node.getAttribute(attrKeys.layout_width);
    let h = node.getAttribute(attrKeys.layout_height);
    let elem = this.htmlElement.cloneNode(true);


    //elem.style.visibility = 'hidden';
    if (w === sizes.WRAP_CONTENT && h === sizes.WRAP_CONTENT) {
        this.style.applyInline(elem);
        document.body.appendChild(elem);

        let computedStyle = window.getComputedStyle(elem);
        if (computedStyle.width === 'auto' || !isNumber(parseInt(computedStyle.width)) ||
            computedStyle.height === 'auto' || !isNumber(parseInt(computedStyle.height))) {
            let rect = elem.getBoundingClientRect();
            this.wrapWidth = (0.813 * rect.width) + 'px';
            this.wrapHeight = (0.825 * rect.height) + 'px';
        } else {
            this.wrapWidth = (0.813 * parseFloat(computedStyle.width)) + 'px';
            this.wrapHeight = (0.825 * parseFloat(computedStyle.height)) + 'px';
        }
        elem.remove();
    } else if (w !== sizes.WRAP_CONTENT && h === sizes.WRAP_CONTENT) {
        let stl = this.style.clone('.quick_clone_' + this.id);
        stl.addFromOptions({
            width: w
        });
        stl.applyInline(elem);
        document.body.appendChild(elem);

        let computedStyle = window.getComputedStyle(elem);
        if (computedStyle.height === 'auto' || !isNumber(parseInt(computedStyle.height))) {
            let rect = elem.getBoundingClientRect();
            this.wrapHeight = (0.825 * rect.height) + 'px';
        } else {
            this.wrapHeight = (0.825 * parseFloat(computedStyle.height)) + 'px';
        }

        elem.remove();
    } else if (w === sizes.WRAP_CONTENT && h !== sizes.WRAP_CONTENT) {
        let stl = this.style.clone('.quick_clone_' + this.id);
        stl.addFromOptions({
            height: h
        });
        stl.applyInline(elem);
        document.body.appendChild(elem);

        let computedStyle = window.getComputedStyle(elem);
        if (computedStyle.width === 'auto' || !isNumber(parseInt(computedStyle.width))) {
            let rect = elem.getBoundingClientRect();
            this.wrapWidth = (0.813 * rect.width) + 'px';
        } else {
            this.wrapWidth = (0.813 * parseFloat(computedStyle.width)) + 'px';
        }


        elem.remove();
    }

};

View.prototype.hide = function (){
     this.htmlElement.style.display = 'none';
};

View.prototype.show = function (){
    this.htmlElement.style.display = 'block';
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

HyperLink.prototype = Object.create(View.prototype);
HyperLink.prototype.constructor = HyperLink;

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

CheckBox.prototype.createElement = function (wkspc, node) {
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

Button.prototype.createElement = function (wkspc, node) {
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

ImageButton.prototype.createElement = function (wkspc, node) {

    this.htmlElement = document.createElement('input');
    this.htmlElement.type = 'button';
    this.style.addStyleElementCss('border: 0;');
    this.style.addStyleElementCss('background-repeat: no-repeat;');
    this.style.addStyleElementCss('background-position: center;');
    this.style.addStyleElementCss('background-size: contain;');
    this.style.addStyleElementCss('background-origin: content-box;');
    this.style.addStyleElementCss('background-image: url(\'' + getImagePath(node.getAttribute(attrKeys.src), !wkspc.isLibsLayout()) + '\');');
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

NativeTable.prototype.createElement = function (wkspc, node) {
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


CustomTableView.prototype.createElement = function (wkspc, node) {
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
    let icon = PATH_TO_USER_IMAGES + node.getAttribute(attrKeys.src);
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

InputTableView.prototype.createElement = function (wkspc, node) {
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
    let icon = PATH_TO_USER_IMAGES + node.getAttribute(attrKeys.src);
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


GrowableTableView.prototype.createElement = function (wkspc, node) {
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
    let icon = PATH_TO_USER_IMAGES + node.getAttribute(attrKeys.src);
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

SearchableTableView.prototype.createElement = function (wkspc, node) {
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
    let icon = PATH_TO_USER_IMAGES + node.getAttribute(attrKeys.src);
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

TextField.prototype.createElement = function (wkspc, node) {
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

ProgressBar.prototype.createElement = function (wkspc, node) {

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
TextArea.prototype.createElement = function (wkspc, node) {
    this.htmlElement = document.createElement('textarea');
    let id = node.getAttribute(attrKeys.id);
    let maxLength = node.getAttribute(attrKeys.maxLength);
    let rows = node.getAttribute(attrKeys.rows);
    let cols = node.getAttribute(attrKeys.cols);
    let value = node.getAttribute(attrKeys.value);
    let text = node.getAttribute(attrKeys.text);
    let placeholder = node.getAttribute(attrKeys.placeholder);

    if (attributeNotEmpty(placeholder)) {
        this.htmlElement.setAttribute('placeholder', placeholder);
    }

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


DropDown.prototype.createElement = function (wkspc, node) {
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
DropDown.prototype.selectedIndex = function () {
    return this.htmlElement.selectedIndex;
};
DropDown.prototype.selectedValue = function () {
    return this.htmlElement.options[this.htmlElement.selectedIndex].innerText;
};
DropDown.prototype.selectIndex = function (index) {
    if (index < this.htmlElement.options.length) {
        this.htmlElement.selectedIndex = index;
    }
};
/**
 * Set the selected value on the drop down if it exists on it.
 * @param value The value to set the dropdown to.
 * @return {number|*}
 */
DropDown.prototype.setValue = function (value) {
    if(value){
        let index = -1;
        for(let i=0;i<this.htmlElement.options.length; i++){
            if(this.htmlElement.options[i].innerText === value){
                this.htmlElement.selectedIndex = i;
                return i;
            }
        }
    }
    return -1;
};
/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function NativeList(wkspc, node) {
    View.call(this, wkspc, node);
}

NativeList.prototype.createElement = function (wkspc, node) {

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



    let cellPaddingLeft = node.getAttribute(attrKeys.cellPaddingLeft);
    let cellPaddingRight = node.getAttribute(attrKeys.cellPaddingRight);
    let cellPaddingTop = node.getAttribute(attrKeys.cellPaddingTop);
    let cellPaddingBottom = node.getAttribute(attrKeys.cellPaddingBottom);


    let cellBg = node.getAttribute(attrKeys.cellBackground);
    let cellFg = node.getAttribute(attrKeys.cellForeground);

    let cellSelBg = node.getAttribute(attrKeys.cellSelectedBackground);
    let cellSelFg = node.getAttribute(attrKeys.cellSelectedForeground);


    let liStyle = new Style(listType + '#' + this.id + " > li", []);
    let liStyleHover = new Style(listType + '#' + this.id + " > li:hover", []);
    liStyleHover.addStyleElement("cursor", "pointer");


    if (!isEmpty(cellBg)) {
        liStyle.addStyleElement("background-color", cellBg);
    }
    if (!isEmpty(cellFg)) {
        liStyle.addStyleElement("color", cellFg);
    }

    if (!isEmpty(cellSelBg)) {
        liStyleHover.addStyleElement("background-color", cellSelBg);
    }
    if (!isEmpty(cellSelFg)) {
        liStyleHover.addStyleElement("color", cellSelFg);
    }



    if (!isEmpty(cellPaddingLeft)) {
        parseNumberAndUnits(cellPaddingLeft, true);
        liStyle.addStyleElement("padding-left", cellPaddingLeft);
    }
    if (!isEmpty(cellPaddingRight)) {
        parseNumberAndUnits(cellPaddingRight, true);
        liStyle.addStyleElement("padding-right", cellPaddingRight);
    }
    if (!isEmpty(cellPaddingTop)) {
        parseNumberAndUnits(cellPaddingTop, true);
        liStyle.addStyleElement("padding-top", cellPaddingTop);
    }
    if (!isEmpty(cellPaddingBottom)) {
        parseNumberAndUnits(cellPaddingBottom, true);
        liStyle.addStyleElement("padding-bottom", cellPaddingBottom);
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

    updateOrCreateSelectorsInStyleSheet(styleSheet, [liStyle, liStyleHover]);

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
ListView.prototype.createElement = function (wkspc, node) {

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

HorizontalListView.prototype.createElement = function (wkspc, node) {


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

GridView.prototype.createElement = function (wkspc, node) {

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


MultiLineLabel.prototype.createElement = function (wkspc, node) {

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


IconLabelView.prototype.createElement = function (wkspc, node) {

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
        this.options[attrKeys.src] = getImagePath(node.getAttribute(attrKeys.src), !wkspc.isLibsLayout());
    }
    this.assignId();
    let font = new Font(fontStyle, parseFontSize.number, fontName, parseFontSize.units);
    let size = getTextSize(text, font.string());

    setWrapSize: {
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


Label.prototype.createElement = function (wkspc, node) {
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
Label.prototype.setText = function (text) {
    if (typeof text === 'string') {
        this.htmlElement.textContent = text;
    }
};

/**
 * @param {Workspace} wkspc
 * @param {type} node key-value object
 * @returns {undefined}
 */
function Paragraph(wkspc, node) {
    View.call(this, wkspc, node);
}


Paragraph.prototype.createElement = function (wkspc, node) {
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

function HyperLink(wkspc, node) {
    View.call(this, wkspc, node);
}

HyperLink.prototype.createElement = function (wkspc, node) {
    this.htmlElement = document.createElement('a');


    let text = node.getAttribute(attrKeys.text);//link text
    let href = node.getAttribute(attrKeys.href);// link href
    let title = node.getAttribute(attrKeys.title);// link title
    if (attributeEmpty(text)) {
        text = "";
    }
    if (attributeEmpty(href)) {
        href = "";
    }
    if (attributeEmpty(title)) {
        title = "";
    }

    var linkText = document.createTextNode(text);
    this.htmlElement.appendChild(linkText);
    this.htmlElement.title = title;
    this.htmlElement.href = href;

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

CanvasView.prototype.createElement = function (wkspc, node) {
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


ClockView.prototype.createElement = function (wkspc, node) {

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

RadioGroup.prototype.createElement = function (wkspc, node) {
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

Radio.prototype.createElement = function (wkspc, node) {
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

TabView.prototype.createElement = function (wkspc, node) {
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

ImageView.prototype.createElement = function (wkspc, node) {
    this.htmlElement = document.createElement('img');
    this.htmlElement.src = getImagePath(node.getAttribute(attrKeys.src), !wkspc.isLibsLayout());
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

Separator.prototype.createElement = function (wkspc, node) {
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

Guideline.prototype.createElement = function (wkspc, node) {
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

Guideline.prototype.layoutGuide = function (constraints) {
    const orientation = this.refIds.get(attrKeys.orientation);
    if (!orientation || orientation === '') {
        throw 'Please specify the orientation of the Guideline whose id is `' + this.id + '`';
    }

    let id = this.id;
    let guidePct = this.refIds.get(attrKeys.layout_constraintGuide_percent);
    let guideBegin = this.refIds.get(attrKeys.layout_constraintGuide_begin);
    let guideEnd = this.refIds.get(attrKeys.layout_constraintGuide_end);


    if (isEmpty(guidePct) && isEmpty(guideBegin) && isEmpty(guideEnd)) {
        throw 'Please specify either constraint-guide-(percentage|begin|end) for the Guideline whose id is `' + this.id + '`';
    }

    let val = 0;

    if (!isEmpty(guidePct)) {
        if (!isEmpty(guideBegin) || !isEmpty(guideEnd)) {
            throw 'Conflicting guide constraints! only one of guide_percent, guide_begin and guide_end hould be set!'
        }

        if (endsWith(guidePct, '%')) {
            if (isNaN(val = parseFloat(guidePct))) {
                throw 'Please specify a floating point number between 0 and 1 to signify 0 - 100% of width';
            }
            val = val > 1 ? val/100.0 : val;
        } else if (isNaN(val = parseFloat(guidePct))) {
            throw 'Please specify a floating point number between 0 and 1 to signify 0 - 100% of width';
        } else {
            if (val > 1) {
                throw 'The guide percentage may not be greater than 1';
            } else if (val < 0) {
                throw 'The guide percentage may not be less than 0';
            }
        }

        if (orientation === orientations.VERTICAL) {
            //vfl.append('H:|-' + val + '-[' + this.id + '(1)]\nV:|[' + this.id + ']-|');
            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: "height",
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: 0.1,
                multiplier: 1,
                priority: 1000
            });

            let hiddenViewId = id + "_dummy_" + ULID.ulid();
            constraints.push({
                view1: hiddenViewId,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'width',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });

        } else if (orientation === orientations.HORIZONTAL) {
            // vfl.append('H:|[' + this.id + ']|\nV:|-' + val + '-[' + this.id + '(1)]');
            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: "width",
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: 0.1,
                multiplier: 1,
                priority: 1000
            });

            let hiddenViewId = id + "_dummy_" + ULID.ulid();
            constraints.push({
                view1: hiddenViewId,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: hiddenViewId,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'height',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: val,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: hiddenViewId,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: 1,
                multiplier: 1,
                priority: 1000
            });
        }

    }

    if (!isEmpty(guideBegin)) {
        if (!isEmpty(guidePct) || !isEmpty(guideEnd)) {
            throw 'Conflicting guide constraints! only one of `guide_percent`, `guide_begin` and `guide_end` should be set!'
        }

        if (isNumber(guideBegin) || (endsWith(guideBegin, "px") && isNumber(parseInt(guideBegin)))) {
            guideBegin = parseFloat(guideBegin);
        } else {
            throw "`guide_begin` must be a unitless number or be specified in pixels"
        }

        if (isNaN(guideBegin)) {
            throw "please specify a number for `guide_begin`"
        }

        val = guideBegin;


        if (orientation === orientations.VERTICAL) {
            // vfl.append('H:|-' + val + '-[' + this.id + '(1)]\nV:|[' + this.id + ']-|');

            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: "height",
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: 0.1,
                multiplier: 1,
                priority: 1000
            });

            constraints.push({
                view1: id,
                attr1: 'left',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'left',    // see AutoLayout.Attribute
                constant: val,
                multiplier: 1,
                priority: 1000
            });

        } else if (orientation === orientations.HORIZONTAL) {
            // vfl.append('H:|[' + this.id + ']|\nV:|-' + val + '-[' + this.id + '(1)]');
            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: "width",
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: 0.1,
                multiplier: 1,
                priority: 1000
            });

            constraints.push({
                view1: id,
                attr1: 'top',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'top',    // see AutoLayout.Attribute
                constant: val,
                multiplier: 1,
                priority: 1000
            });

        }

    }

    if (!isEmpty(guideEnd)) {
        if (!isEmpty(guidePct) || !isEmpty(guideBegin)) {
            throw 'Conflicting guide constraints! only one of `guide_percent`, `guide_begin` and `guide_end` should be set!'
        }

        if (isNumber(guideEnd) || (endsWith(guideEnd, "px") && isNumber(parseInt(guideEnd)))) {
            guideEnd = parseFloat(guideEnd);
        } else {
            throw "`guide_end` must be a unitless number or be specified in pixels"
        }


        if (isNaN(guideEnd)) {
            throw "please specify a number for `guide_end`"
        }

        val = guideEnd;


        if (orientation === orientations.VERTICAL) {
            // vfl.append('H:|-0-[' + this.id + '(1)]-' + val + '-|\nV:|[' + this.id + ']-0-|');

            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: "height",
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: 0.1,
                multiplier: 1,
                priority: 1000
            });

            constraints.push({
                view1: id,
                attr1: 'right',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'right',    // see AutoLayout.Attribute
                constant: -val,
                multiplier: 1,
                priority: 1000
            });

        } else if (orientation === orientations.HORIZONTAL) {
            // vfl.append('H:|[' + this.id + ']|\nV:|-' + val + '-[' + this.id + '(1)]');
            constraints.push({
                view1: id,
                attr1: 'width',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: "width",
                constant: 0,
                multiplier: 1,
                priority: 1000
            });
            constraints.push({
                view1: id,
                attr1: 'height',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: AutoLayout.Attribute.NOTANATTRIBUTE,
                constant: 0.1,
                multiplier: 1,
                priority: 1000
            });

            constraints.push({
                view1: id,
                attr1: 'bottom',    // see AutoLayout.Attribute
                relation: 'equ',   // see AutoLayout.Relation
                view2: null,
                attr2: 'bottom',    // see AutoLayout.Attribute
                constant: -val,
                multiplier: 1,
                priority: 1000
            });

        }

    }

};
/**
 *
 * @param {Workspace} wkspc
 * @param {type} node
 * @returns {IncludedView}
 */
function IncludedView(wkspc, node) {
    View.call(this, wkspc, node);
    let layout = node.getAttribute(attrKeys.layout);
    if (!layout || typeof layout !== 'string') {
        throw 'An included layout must be the name of a valid xml file in the `' + PATH_TO_LAYOUTS_FOLDER + '` folder';
    }
    let len = layout.length;
    if (layout.substring(len - 4) !== '.xml') {
        layout += '.xml';
    }
    let mp = new Parser(wkspc,layout, this.id);
    //this.constraints = mp.constraints;
}


IncludedView.prototype.createElement = function (wkspc, node) {

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
FormView.prototype.createElement = function (wkspc, node) {
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
 * @param {Workspace} wkspc
 * @param {HTMLElement} node
 * @returns {VideoView}
 */
function VideoView(wkspc, node) {
    View.call(this, wkspc, node);
}
/**
 *
 * @param {Workspace} wkspc
 * @param {HTMLElement} node
 * @returns {VideoView}
 */
VideoView.prototype.createElement = function (wkspc, node) {
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

AudioView.prototype.createElement = function (wkspc, node) {
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