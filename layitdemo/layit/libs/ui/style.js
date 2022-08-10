/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @param {string} attr The attribute
 * @param {string} value Its value
 * @returns {StyleElement}
 */
function StyleElement(attr, value) {
    if (typeof attr === 'string' && typeof value === 'string') {
        this.attr = attr.trim();
        this.value = value.trim();
    } else {
        throw new Error("attr or value must be string...`attr` = " + attr + ", `value` = " + value);
    }
}

StyleElement.prototype.setAttr = function (attr) {
    this.attr = attr;
};
StyleElement.prototype.getAttr = function () {
    return this.attr;
};
StyleElement.prototype.setValue = function (value) {
    this.value = value;
};
StyleElement.prototype.getValue = function () {
    return this.value;
};
StyleElement.prototype.getCss = function () {
    return this.attr + ":" + this.value + ";";
};


/**
 *
 * @param {string} name The name of the Style
 * @param {StyleElement[]} values An array of StyleElement values
 * @returns {Style}
 */
function Style(name, values) {
    if (!values) {
        values = [];
    }
    if (!isOneDimArray(values)) {
        throw new Error('One dimensional array of style elements expected');
    }
    this.name = name.trim();
    this.styleElements = values;
}

Style.prototype.setName = function (name) {
    this.name = name;
};
Style.prototype.getName = function () {
    return this.name;
};

Style.prototype.setStyleElements = function (styleElements) {
    this.styleElements = styleElements;
};
Style.prototype.getStyleElements = function () {
    return this.styleElements;
};
/**
 * Checks if the Style object contains any css styles.
 * @return {boolean}
 */
Style.prototype.isEmpty = function () {
    return this.styleElements.length === 0;
};


/**
 *  @param {string} entryName The class or  id or other selector name just the
 *  way it must appear in the stylesheet...e.g .cols or #values or table > tbody > tr > td > span
 * @returns {String} The pure css that can be injected directly
 * into a stylesheet
 */
Style.prototype.styleSheetEntry = function (entryName) {
    this.name = entryName;
    let styleBuffer = new StringBuffer();
    if (this.styleElements.length === 0) {
        return '';
    }
    styleBuffer.append(entryName).append(" { \n");
    for (let i = 0; i < this.styleElements.length; i++) {
        let styleObj = this.styleElements[i];
        styleBuffer.append(styleObj.getCss()).append("\n");
    }
    styleBuffer.append("} \n");
    return styleBuffer.toString();
};


Style.prototype.injectStyleSheet = function () {
    if (typeof this.name === 'undefined' || this.name === null || this.name === '') {
        throw 'Please define the name of this style!... e.g #name or .name';
    }
    let style = document.createElement('style');
    if (this.styleElements.length > 0) {
        style.setAttribute('type', 'text/css');
        style.innerHTML = this.styleSheetEntry(this.name);
        document.getElementsByTagName('head')[0].appendChild(style);
    }
};
/**
 * Converts a Style object to a generic Javascript/JSON object
 * @returns {Object}
 */
Style.prototype.toOptions = function () {
    let o = {};
    for (let i = 0; i < this.styleElements.length; i++) {
        let el = this.styleElements[i];
        let values = getObjectValues(el); //Object.values(el);
        o[values[0]] = values[1];
    }
    return o;
};

/**
 * @param htmlStyleElement An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param stylesArray An array of Style objects
 */
function injectStyleSheets(htmlStyleElement, stylesArray) {
    if (Object.prototype.toString.call(stylesArray) === '[object Array]') {
        let cssSheet = new StringBuffer('');
        cssSheet.append(htmlStyleElement.innerHTML);

        for (let i = 0; i < stylesArray.length; i++) {
            let style = stylesArray[i];
            if (style.constructor.name !== 'Style') {
                throw new Error('Please put only styles in the supplied array');
            }
            if (typeof style.name === 'undefined' || style.name === null || style.name === '') {
                throw 'Please define the name of this style!... e.g #name or .name';
            }
            cssSheet.append(style.styleSheetEntry(style.name));
            cssSheet.append('\n');
        }//end for loop
        htmlStyleElement.innerHTML = cssSheet.toString();
        document.getElementsByTagName('head')[0].appendChild(htmlStyleElement);
    } else {
        throw new Error("Please supply an array of styles");
    }
}

/**
 * Loads a stylesheet and checks if a name like the given style name already exists...e.g. #id or .kkk or table > tr > td.inner
 * If it does, it returns the index of the selector in the scanned stylesheet. Else it returns -1.
 * This index may make no meaning to the developer
 * except someone who knows how the Scanner method works.
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param selector A given selector.
 * @return The index of the selector in the scanned style sheet
 */
function indexOfSelector(htmlStyleElement, selector) {
    let css = htmlStyleElement.innerHTML;
    let scanner = new Scanner(css, true, ['{', '}']);
    let tokens = scanner.scan();
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '{') {
            if (i - 1 >= 0) {
                if (selector.trim() === tokens[i - 1].trim()) {
                    return i - 1;
                }
            }
        }
    }
    return -1;
}


/**
 * Loads a stylesheet and checks if a name like the given style name already exists...e.g. #id or .kkk or table > tr > td.inner
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param selector A given selector.
 */
function sheetContainsSelector(htmlStyleElement, selector) {
    let css = htmlStyleElement.innerHTML;
    return indexOfSelector(css, selector) !== -1;
}

/**
 * Parses a style sheet, and generates an array of styles
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @return {*[]} An array of Style objects
 */
function getAllStyles(htmlStyleElement) {
    let css = htmlStyleElement.innerHTML;
    let scanner = new Scanner(css, true, ['{', '}', ';']);
    let tokens = scanner.scan();

    /**
     * normalize data for input such as background-image: url(data:image/png;base64,iVBO...); which would have been split on the
     * ;base64 area which we do not intend, as our targets are the `;` that end each line of css style...e.g: width: 12px;
     * 
     * The scanner would have split the `url(data:image/png;base64,iVBO...)` pattern into:
     *  [,..,'url(data:image/png' ,';', 'base64,iVBO',...), so 'weld' the disjoint together again, lol
     *  
     *  NOTE:
     *  This occurs around the background-image property:
     *  background-image: url(data:[<mime type>][;charset=<charset>][;base64],<encoded data>)
     *  
     */
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === ';') {
            if (i + 1 < tokens.length) {
                if (startsWith(tokens[i + 1], '\n') === false) {
                    //invalid split occurred. Please weld!
                    tokens[i-1] = tokens[i-1]+tokens[i]+tokens[i+1];
                    //console.log('WELD-POINT:',tokens[i-1]);
                    tokens.splice(i, 1);
                    tokens.splice(i, 1);
                }
            }
        }
    }


    let styles = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '{') {
            if (i - 1 >= 0) {
                let selector = tokens[i - 1].trim();
                let currentStyle = new Style(selector, []);
                styles.push(currentStyle);
            }
        }
        if (tokens[i] === ';') {
            let currentStyle = styles[styles.length - 1];
            currentStyle.addStyleElementCss(tokens[i - 1] + ";");
        }
    }

    return styles;
}

/**
 * Looks through a css style sheet and returns a Style object that models the given selector if it exists in the
 * style sheet. Else it returns null;
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param selector A given style to fetch.
 */
function getStyle(htmlStyleElement, selector) {
    if (selector) {
        selector = selector.trim();
    } else {
        throw new Error('No selector supplied!');
    }
    let css = htmlStyleElement.innerHTML;
    let scanner = new Scanner(css, true, [selector, '{', '}', ';']);
    let tokens = scanner.scan();
    let buildingStyle = false;
    let currentStyle;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].trim() === selector) {
            if (i + 1 < tokens.length) {
                let  j = i + 1;
                //check between selector and opening curly brace to be sure no strange non-whitespace token is there
                while (tokens[j] !== '{' && j < tokens.length) {
                    if (tokens[j].trim() !== '') {
                        throw new Error('Invalid token found in browser style sheet! File a bug report with browser manufacturer!! Description:\n\
                  No token like: ``' + tokens[j] + "`` should exist between ``" + selector + "`` and a ``{``");
                    }
                    j++;
                }
                currentStyle = new Style(selector, []);
                buildingStyle = true;
                i = j;
            }
        }
        if (buildingStyle === true) {
            if (tokens[i] === ';') {
                currentStyle.addStyleElementCss(tokens[i - 1] + ";");
            } else if (tokens[i] === '}') {
                return currentStyle;
            }
        }

    }

    return null;
}

/**
 * Edits the individual style-elements of a selector existing in a stylesheet already.
 * If it tries to edit a non-existent style, it will create a new style for it instead.
 * Checks if a style exists in the specified stylesheet, then applies the style elements in <code>newStyle</code>
 *  (e.g. width: 20px;) to it. 
 *  If it already contains the specified elements, it updates their values to the ones specified in 
 * <code>newStyle</code>
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param newStyle A given style.
 */
function editSelectorInStyleSheet(htmlStyleElement, newStyle) {
    if (newStyle.constructor.name === 'Style') {
        let selector = newStyle.name;
        let styles = getAllStyles(htmlStyleElement);
        let found = false;
        for (let i = 0; i < styles.length; i++) {
            let style = styles[i];
            if (style.name.trim() === selector) {
                found = true;
                for (let k = 0; k < newStyle.styleElements.length; k++) {
                    let elem = newStyle.styleElements[k];
                    style.addStyleElement(elem.attr, elem.value, false);
                }
                break;
            }
        }
        if (!found) {
            styles.push(newStyle);
        }

        htmlStyleElement.innerHTML = '';
        injectStyleSheets(htmlStyleElement, styles);
        return true;
    } else {
        throw new Error('Invalid style object supplied');
    }
}

/**
 * Adds a style to a stylesheet if it doesn't already exist in it. If it does exist in it, it updates it to the new one
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param newStyle A given style.
 */
function updateOrCreateSelectorInStyleSheet(htmlStyleElement, newStyle) {
    if (newStyle.constructor.name === 'Style') {
        let selector = newStyle.name;
        let styles = getAllStyles(htmlStyleElement);
        let found = false;
        for (let i = 0; i < styles.length; i++) {
            let style = styles[i];
            if (style.name.trim() === selector) {
                found = true;
                style.styleElements = newStyle.styleElements;
            }
        }
        if (!found) {
            styles.push(newStyle);
        }

        htmlStyleElement.innerHTML = '';
        injectStyleSheets(htmlStyleElement, styles);
        return true;
    } else {
        throw new Error('Invalid style object supplied');
    }
}


/**
 * Adds an array of styles to a stylesheet if it doesn't already exist in it. If it does exist in it, it updates it to the new one
 * @param htmlStyleElement  An html style element <<<htmlStyleElement = document.createElement('style');>>>
 * @param newStyles An array of styles.
 */
function updateOrCreateSelectorsInStyleSheet(htmlStyleElement, newStyles) {
    if (!isOneDimArray(newStyles)) {
        throw new Error('A one dimensional array expected for `newStyles`');
    }
    let styles = getAllStyles(htmlStyleElement);
    for (let i = 0; i < newStyles.length; i++) {
        let newStyle = newStyles[i];
        if (newStyle.constructor.name === 'Style') {
            let selector = newStyle.name;
            let found = false;
            for (let j = 0; j < styles.length; j++) {
                let style = styles[j];
                if (style.name.trim() === selector) {
                    found = true;
                    style.styleElements = newStyle.styleElements;//update
                }
            }
            if (!found) {
                styles.push(newStyle);// create if not found
            }
        } else {
            throw new Error('Invalid style object supplied');
        }
    }

    htmlStyleElement.innerHTML = '';
    injectStyleSheets(htmlStyleElement, styles);
}

/**
 *
 * @param {type} options A map of css keys and values, e.g.
 * {
 * width: "12em",
 * height: "100%",
 * color: "red",
 * border: "1px solid red"
 * }
 * @returns {undefined}
 */
Style.prototype.addFromOptions = function (options) {
    for (let key in options) {
        this.addStyleElement(key, options[key]);
    }
};
/**
 *
 * @returns {String} A css that can be injected as inline css on an html element.
 */
Style.prototype.getCss = function () {
    let styleBuffer = new StringBuffer();
    if (this.styleElements.length === 0) {
        return '';
    }
    styleBuffer.append(" style = \'");
    for (let i = 0; i < this.styleElements.length; i++) {
        let styleObj = this.styleElements[i];
        styleBuffer.append(styleObj.getCss());
    }
    styleBuffer.append("\' ");
    return styleBuffer.toString();
};
/**
 *
 * @returns {String} The pure css that can be injected directly
 * into a stylesheet, but without the id or class or the curly braces
 */
Style.prototype.rawCss = function () {
    let styleBuffer = new StringBuffer();
    if (this.styleElements.length === 0) {
        return '';
    }
    styleBuffer.append(" ");
    for (let i = 0; i < this.styleElements.length; i++) {
        let styleObj = this.styleElements[i];
        styleBuffer.append(styleObj.getCss());
    }
    styleBuffer.append(" ");
    return styleBuffer.toString();
};
/**
 * Applies this style as an inline style to the supplied element
 * @param {HTMLElement} elem 
 */
Style.prototype.applyInline = function (elem) {
    if (elem) {
        if (isDomEntity(elem)) {
            for (let i = 0; i < this.styleElements.length; i++) {
                let stl = this.styleElements[i];
                elem.style[stl.attr] = stl.value;
            }
        } else {
            throw new Error("Invalid html element: " + elem);
        }
    } else {
        throw new Error("Please specify an html element.");
    }

};


/**
 *
 * @param {StyleElement} style The style object to remove
 * @returns {undefined}
 */
Style.prototype.removeStyleElementObj = function (style) {
    if (StyleElement.prototype.isPrototypeOf(style)) {
        let attr = style.getAttr();
        for (let index = 0; index < this.styleElements.length; index++) {
            let styl = this.styleElements[index];
            if (styl.getAttr() === attr) {
                this.styleElements.splice(index, 1);
                return;
            }
        }

    }
};
/**
 *
 * @param {string} styleAttr The attribute name of the StyleElement object to remove
 * @returns {undefined}
 */
Style.prototype.removeStyleElementByAttr = function (styleAttr) {
    for (let index = 0; index < this.styleElements.length; index++) {
        let styl = this.styleElements[index];
        if (styl.getAttr() === styleAttr) {
            this.styleElements.splice(index, 1);
            return;
        }
    }
};


/**
 *
 * @param {string} attr The attribute name of the StyleElement
 * @param {string} val The value of the style
 * @param {boolean} duplicateAllowed If true, a duplicate style element can be allowed in the style.
 * Due to the messed up nature of browsers, this is desirable at times: e.g..
 * li{
 * display: -moz-inline-stack;
 * display: inline-block;
 * }
 * If this parameter is not specified, then the method assumes no duplicate styles are allowed in a selector.
 * @returns {void}
 */
Style.prototype.addStyleElement = function (attr, val, duplicateAllowed) {
    if (duplicateAllowed) {
        this.styleElements.push(new StyleElement(attr, val));
    } else {
        for (let index = 0; index < this.styleElements.length; index++) {
            let styl = this.styleElements[index];
            if (styl.getAttr() === attr) { //attribute exists already..update and exit
                this.styleElements[index] = new StyleElement(attr, val);
                return;
            }
        }
        this.styleElements.push(new StyleElement(attr, val));
    }

};

/**
 *
 * Adds an array of style elements to this Style object.
 * @param {Array} styleElemsArray An array of StyleElement objects
 * @param {boolean} duplicateAllowed If true, a duplicate style element can be allowed in the style.
 * Due to the messed up nature of browsers, this is desirable at times: e.g..
 * li{
 * display: -moz-inline-stack;
 * display: inline-block;
 * }
 * If this parameter is not specified, then the method assumes no duplicate styles are allowed in a selector.
 * @returns {undefined}
 *
 */
Style.prototype.addStyleElementsArray = function (styleElemsArray, duplicateAllowed) {

    for (let index = 0; index < styleElemsArray.length; index++) {
        let styl = styleElemsArray[index];
        this.addStyleElementObj(styl, duplicateAllowed);
    }

};
/**
 *
 * @param {StyleElement} style The style element object
 * @param {boolean} duplicateAllowed If true, a duplicate style element can be allowed in the style.
 * Due to the messed up nature of browsers, this is desirable at times: e.g..
 * li{
 * display: -moz-inline-stack;
 * display: inline-block;
 * }
 * If this parameter is not specified, then the method assumes no duplicate styles are allowed in a selector.
 * @returns {undefined}
 */
Style.prototype.addStyleElementObj = function (style, duplicateAllowed) {


    if (StyleElement.prototype.isPrototypeOf(style)) {
        if (duplicateAllowed) {
            this.styleElements.push(style);
        } else {
            let attr = style.getAttr();
            for (let index = 0; index < this.styleElements.length; index++) {
                let styl = this.styleElements[index];
                if (styl.getAttr() === attr) {//attribute exists already..update and exit
                    this.styleElements[index] = style;
                    return;
                }
            }
            this.styleElements.push(style);
        }
    } else {
        throw new Error("Invalid Style specified.");
    }


};
/**
 * Creates a clone of this <code>Style</code>.
 * If the newName parameter is not supplied, then the name of the style is also cloned.
 * @param {string} newName
 * @returns {Style}
 */
Style.prototype.clone = function (newName) {
    let arr = [];

    for (let i = 0; i < this.styleElements.length; i++) {
        let elem = this.styleElements[i];
        arr.push(new StyleElement(elem.attr, elem.value));
    }
    /**
     * if no name|selector was supplied, the user wants to clone the name also.
     */
    if (!newName) {
        newName = this.name;
    }
    return new Style(newName, arr);
};
/**
 * The library handles all the details for you. The string MUST describe only 1 style element..e.g. width:10px;
 * @param {string} style The style string to add e.g. width:10;
 * @param {boolean} duplicateAllowed If true, a duplicate style element can be allowed in the style.
 * Due to the messed up nature of browsers, this is desirable at times: e.g..
 * li{
 * display: -moz-inline-stack;
 * display: inline-block;
 * }
 * If this parameter is not specified, then the method assumes no duplicate styles are allowed in a selector.
 * @returns {void}
 */
Style.prototype.addStyleElementCss = function (style, duplicateAllowed) {

    if (style) {
        style = style.trim();
   let styleHasUrl = contain(style, 'url') === true;
        let indexOfColon = style.indexOf(":");
        let indexOfSemiColon = styleHasUrl ? style.lastIndexOf(";") : style.indexOf(";");
        if (indexOfSemiColon !== -1 && indexOfSemiColon === style.length - 1 && indexOfColon !== -1) {

            let attr = style.substring(0, indexOfColon);
            let val = style.substring(indexOfColon + 1, indexOfSemiColon);

            if (attr.indexOf(":") === -1 && attr.indexOf(";") === -1 &&
                    ((val.indexOf('url') === -1 && val.indexOf(":") === -1 && val.indexOf(";") === -1) ||
                            val.indexOf('url') !== '-1'/**Give more freedom, lol*/)) {
                let styleObj = new StyleElement(attr, val);
                if (duplicateAllowed) {
                    this.styleElements.push(styleObj);
                } else {
                    for (let index = 0; index < this.styleElements.length; index++) {
                        let styl = this.styleElements[index];
                        if (styl.getAttr() === attr) {//attribute exists already..update and exit
                            this.styleElements[index] = styleObj;
                            return;
                        }
                    }
                    this.styleElements.push(styleObj);
                }
            } else {
                throw new Error('Weird css line expression____!'+style);
            }
        } else {
            throw new Error('Invalid css line expression!...' + style);
        }

    } else {
        throw new Error('No css line supplied!');
    }
};

/**
 *
 * @param {string} attr The attribute name
 * @return {null|string} The value of the attribute in this style object.
 */
Style.prototype.getValue = function (attr) {

    for (let i = 0; i < this.styleElements.length; i++) {
        let elem = this.styleElements[i];
        if (elem.attr === attr) {
            return elem.value;
        }
    }

    return null;

};