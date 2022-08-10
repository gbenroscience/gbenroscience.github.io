/**
 *
 * @param {string} input The string input to be split
 * @param {boolean} includeTokensInOutput If true, the tokens are retained in the splitted output.
 * @param {String[]} tokens The tokens to be employed in splitting the original string.
 * @returns {Scanner}
 */
function Scanner(input, includeTokensInOutput, tokens) {
    this.input = input;
    this.includeTokensInOutput = includeTokensInOutput;
    this.tokens = tokens;
}

Scanner.prototype.scan = function () {
    let inp = this.input;

    let parse = [];
    this.tokens.sort(function (a, b) {
        return b.length - a.length; //ASC, For Descending order use: b - a
    });
    for (let i = 0; i < inp.length; i++) {

        for (let j = 0; j < this.tokens.length; j++) {
            let token = this.tokens[j];
            let len = token.length;
            if (len > 0 && i + len <= inp.length) {
                let portion = inp.substring(i, i + len);
                if (portion === token) {
                    if (i !== 0) {//avoid empty spaces
                        parse[parse.length] = inp.substring(0, i);
                    }
                    if (this.includeTokensInOutput) {
                        parse[parse.length] = token;
                    }
                    inp = inp.substring(i + len);
                    i = -1;
                    break;
                }

            }

        }

    }

    if (inp.length !== 0) {
        parse[parse.length] = inp;
    }
    return parse;
};

/**
 *
 * @param {string} str The initialization string.
 * @returns {StringBuffer}
 */
function StringBuffer(str) {
    if (str && typeof str === 'string') {
        this.dataArray = new Array(str);
    } else {
        this.dataArray = new Array(str);
    }
}

StringBuffer.prototype.append = function (str) {
    this.dataArray.push(str);
    return this;
};
StringBuffer.prototype.toString = function () {
    return this.dataArray.join("");
};
StringBuffer.prototype.length = function () {
    return this.dataArray.length;
};


let cloneText = function(originalText){
  if(originalText && typeof originalText === 'string'){
        return (' ' + originalText).slice(1);
  }
  throw new Error('Invalid text supplied.');
};

/**
 * @param str The string in consideration
 * @param startItem The string to check for at the start of <code>str</code>
 * @return true if the variable <code>str</code> ends with variable <code>startItem</code>
 */
function startsWith(str, startItem) {
    if (typeof str === "string" && typeof startItem === "string") {
        const len = str.length;
        const otherLen = startItem.length;
        if (len === otherLen) {
            return str === startItem;
        } else if (len < otherLen) {
            return false;
        } else {
            return str.indexOf(startItem, 0) === 0;
        }
    } else {
        return false;
    }
}


/**
 * @param str The string in consideration
 * @param endItem The string to check for at the end of <code>str</code>
 * @return true if the variable <code>str</code> ends with variable <code>endItem</code>
 */
function endsWith(str, endItem) {
    if (typeof str === "string" && typeof endItem === "string") {
        const len = str.length;
        const otherLen = endItem.length;
        if (len === otherLen) {
            return str === endItem;
        } else if (len < otherLen) {
            return false;
        } else {
            return str.lastIndexOf(endItem) === len - otherLen;
        }
    } else {
        return false;
    }
}


/**
 *
 * N.B..The name of this method should have been <code>contains(args..)</code>
 * but this name does not work, so the developer imagines that it could be a
 * reserved word in Javascript.
 * @param str The string in consideration
 * @param inneritem The string to check for inside <code>str</code>
 * @return true if the variable <code>str</code> contains variable <code>item</code>
 */
function contain(str, inneritem) {
    if (typeof str === "string" && typeof inneritem === "string") {
        let len = str.length;
        let otherLen = inneritem.length;
        if (len === otherLen) {
            return str === inneritem;
        } else if (len < otherLen) {
            return false;
        } else {
            return str.indexOf(inneritem, 0) !== -1;
        }
    } else {
        return false;
    }
}//end function



/**
 * @param str The string in consideration
 * @param endItems An array containing the strings to check for at the end of <code>str</code>
 * @return true if the variable <code>str</code> ends with any of the variables in <code>endItems</code>
 */
function endsWithAnyOf(str, endItems) {
    var len = endItems.length;
    for (var i = 0; i < len; i++) {
        if (endsWith(str, endItems[i])) {
            return true;
        }
    }
    return false;
}//end function

/**
 * @param str The string in consideration
 * @param endItems An array containing the strings to check for at the end of <code>str</code>
 * @return the index of the first item in the endItems which is found to end this string or -1 if none is found
 * to end it.
 */
function indexOfEnder(str, endItems) {
    var len = endItems.length;
    for (var i = 0; i < len; i++) {
        if (endsWith(str, endItems[i])) {
            return i;
        }
    }
    return -1;
}//end function

/**
 * @param str The string in consideration
 * @param startItems An array containing the strings to check for at the start of <code>str</code>
 * @return true if the variable <code>str</code> starts with any of the variables in <code>startItems</code>
 */
function startsWithAnyOf(str, startItems) {
    var len = startItems.length;
    for (var i = 0; i < len; i++) {
        if (startsWith(str, startItems[i])) {
            return true;
        }
    }
    return false;

}//end function

/**
 * @param str The string in consideration
 * @param startItems An array containing the strings to check for at the start of <code>str</code>
 * @return the index of the first item in the startItems array which is found to start this string or -1
 * if none is found to start it
 */
function indexOfStarter(str, startItems) {
    var len = startItems.length;
    for (var i = 0; i < len; i++) {
        if (startsWith(str, startItems[i])) {
            return i;
        }
    }
    return -1;

}//end function

/**
 * @param str The string in consideration
 * @param innerItems An array containing the strings to check for inside <code>str</code>
 * @return true if the variable <code>str</code> contains any of the variables in <code>endItems</code>
 */
function containsAnyOf(str, innerItems) {
    const len = innerItems.length;
    for (let i = 0; i < len; i++) {
        if (contain(str, innerItems[i])) {
            return true;
        }

    }
    return false;

}//end function




/**
 * @param str The string to reverse
 * @return the string in reversed order.
 */
function reverse(str) {
    var len = str.length;
    var reversed = '';
    for (var i = len - 1; i >= 0; i--) {
        reversed = reversed + str.charAt(i);
    }


    return reversed;
}//end function

/**
 * 
 * @param {type} input The input string to check
 * @returns {Boolean} true if the input contains only
 * white spaces or is null.
 */
function isWhiteSpacesOnly(input) {
    if (input === null) {
        return true;
    }
    if (!input) {
        return true;
    }
    if (/\S/.test(input)) {
        return false;
    }

    return true;
}

/**
 *
 * @param {string} input The input string to check
 * @returns {Boolean} true if the input contains only
 * white spaces or is null or is undefined.
 */
 function isEmpty(input) {
    if (!input) {
        return true;
    }
    return !/\S/.test(input);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateUserName(userName) {
    var re = /(?=^.{3,20}$)^[a-zA-Z][a-zA-Z0-9]*[._-]?[a-zA-Z0-9]+$/;
    return re.test(userName);
}