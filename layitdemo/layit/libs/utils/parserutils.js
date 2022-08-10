/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




/* global CssSizeUnitsValues */



/**
 * Parses a number and unit string into the number and the units.
 * @param val e.g 22px or 22%
 * @param {Boolean} seeNoUnitsAsPx If true, then if the supplied string is a number without units, the function
 * will assume that the units is in px. If false, it will assume it is a wrong input.
 * If either the number or the units is not a number or a unit, it returns null for both fields
 * @return the number and the units
 */
 function parseNumberAndUnitsNoValidation(val, seeNoUnitsAsPx) {
    if(typeof val === 'number'){
        val = val + "";
    }
    if (typeof val !== "string") {
        return {number: null, units: null};
    }
    if (isNumber(val)) {
        if (seeNoUnitsAsPx && seeNoUnitsAsPx === true) {
            return {number: val, units: "px"};
        }else{
            return {number: null, units: null};
        }
    }

    let number = '';
    let i = val.length-1;
    for (; i >= 0; i--) {
        let token = val.substring(i, i + 1);
        if (token !== '0' && token !== '1' && token !== '2' && token !== '3' && token !== '4' && token !== '5' &&
                token !== '6' && token !== '7' && token !== '8' && token !== '9') {
            // units = token + units;
        } else {
            number = val.substring(0, i + 1);
            break;
        }
    }
    let units = val.substring(i + 1);
    if (CssSizeUnitsValues.indexOf(units) === -1) {
        return {number: null, units: null};
    }
    if (!isNumber(number)) {
        return {number: null, units: null};
    }
    return {number: number, units: units};
}

/**
 * Parses a number and unit string into the number and the units.
 * @param val e.g 22px or 22%
 * @param {Boolean} seeNoUnitsAsPx If true, then if the supplied string is a number without units, the function
 * will assume that the units is in px. If false, it will assume it is a wrong input.
 * @return the number and the units
 */
function parseNumberAndUnits(val, seeNoUnitsAsPx) {
    if (typeof val !== "string") {
        throw new Error('parses only string input');
    }
    if (seeNoUnitsAsPx && seeNoUnitsAsPx === true) {
        if (isNumber(val)) {
            val += "px";
        }
    }

    if (isNumber(val)) {
        if (seeNoUnitsAsPx && seeNoUnitsAsPx === true) {
            return {number: val, units: "px"};
        }else{
           throw "No units specified for number: "+val;
        }
    }

    let number = '';
    let i = val.length - 1;
    for (; i >= 0; i--) {
        let token = val.substring(i, i + 1);
        if (token !== '0' && token !== '1' && token !== '2' && token !== '3' && token !== '4' && token !== '5' &&
                token !== '6' && token !== '7' && token !== '8' && token !== '9') {
            // units = token + units;
        } else {
            number = val.substring(0, i + 1);
            break;
        }
    }
    let units = val.substring(i + 1);
    if (CssSizeUnitsValues.indexOf(units) === -1) {
        throw new Error("This unit is not a valid css unit.. Use one of:\n " + CssSizeUnitsValues);
    }
    if (!isNumber(number)) {
        throw new Error("The number is not a valid number!..." + number);
    }

    return {number: number, units: units};
}