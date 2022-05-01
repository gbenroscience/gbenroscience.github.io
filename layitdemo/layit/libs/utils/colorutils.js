/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Converts html color names like white, red, purple or RGB(123,234,142) etc to the hex values
 * @param str
 * @returns {string | CanvasGradient | CanvasPattern}
 */
function standardizeColor(str){
    let ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = str;
    return ctx.fillStyle;
}

function standardColor(context, colorStr){
    context.fillStyle = colorStr;
    return context.fillStyle;
}


function rgbToHex(rgb) {
    if (typeof rgb !== 'string') {
        throw new Error("Please supply a color in the format: `rgb(redVal , greenVal , blueVal)`. input: rgb = " + rgb);
    }

    if (!startsWith(rgb, "rgb(")) {
        throw new Error("Invalid format supplied. Allowed format is: `rgb(redVal , greenVal , blueVal)`. input: rgb = " + rgb);
    }

    rgb = rgb.trim(); //remove leading and trailing whitespaces
    rgb = rgb.substring(4, rgb.length - 1); // remove the rgb( and the )
    var colors = rgb.split(",");


    if (colors.length === 3) {
        var red = parseInt(colors[0].trim());
        var green = parseInt(colors[1].trim());
        var blue = parseInt(colors[2].trim());


        if (Number.isNaN(red)) {
            throw new Error('The red component must be a number. input: rgb = ' + rgb);
        }
        if (Number.isNaN(green)) {
            throw new Error('The green component must be a number. input: rgb = ' + rgb);
        }
        if (Number.isNaN(blue)) {
            throw new Error('The blue component must be a number. input: rgb = ' + rgb);
        }

        if (red > 255) {
            throw new Error('The red component must be less than or equal to 255 input: rgb = ' + rgb);
        }
        if (green > 255) {
            throw new Error('The green component must be less than or equal to 255 input: rgb = ' + rgb);
        }
        if (blue > 255) {
            throw new Error('The blue component must be less than or equal to 255 input: rgb = ' + rgb);
        }


        if (red < 0) {
            throw new Error('The red component must be greater than 0 input: rgb = ' + rgb);
        }
        if (green < 0) {
            throw new Error('The green component must be greater than 0 input: rgb = ' + rgb);
        }
        if (blue < 0) {
            throw new Error('The blue component must be greater than 0 input: rgb = ' + rgb);
        }


        let rr = red.toString(16);
        let gg = green.toString(16);
        let bb = blue.toString(16);
        return "#" + normalizeHexColor(rr) + normalizeHexColor(gg) + normalizeHexColor(bb);

    } else {
        throw new Error('Invalid rgb format was used input: rgb = ' + rgb);
    }
}

function normalizeHexColor(hexString) {
    return hexString.length === 1 ? "0" + hexString : hexString;
}

/**
 * Darkens a given hexadecimal color
 * If an rgb color is supplied it converts it to hexadecimal and then darkens it, and returns the result in hexadecimal
 * @param {String} color An hexadecimal string e.g #00FFCC
 * @param {Number} percent A number between 0.0 and 1.0
 * @returns {undefined} an hexadecimal string that is a darkened version of the color
 */
function darkenColor(color, percent) {
    if (typeof color !== 'string') {
        throw new Error("Invalid color format! hexadecimal string alone allowed... input: color = " + color + " , percent = " + percent);
    }
    if (typeof percent !== 'number') {
        throw new Error("Invalid number format! Only numbers between 0.0 and 1.0 are allowed... input: color = " + color + " , percent = " + percent);
    }
    if (percent < 0 || percent > 1) {
        throw new Error("Invalid number format! Please supply a number between 0.0 and 1.0... input: color = " + color + " , percent = " + percent);
    }
    color = color.trim();
    var isRGB = false;
    if (startsWith(color, "rgb(")) {
        color = rgbToHex(color);
        isRGB = true;
    }
    if (!startsWith(color, "#")) {
        color = standardizeColor(color);
    }

    if (color.length === 4 || color.length === 5 || color.length === 7 || color.length === 9) {
        if (color.length === 4) {//#FFF 
            let cl = color.substring(1, 4);
            let r = cl.substring(0, 1);
            let red = parseInt(r + r, 16);
            let g = cl.substring(1, 2);
            let green = parseInt(g + g, 16);
            let b = cl.substring(2, 3);
            let blue = parseInt(b + b, 16);

            let tonedRed = Math.round(red - red * percent);
            let tonedGreen = Math.round(green - green * percent);
            let tonedBlue = Math.round(blue - blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + ")";
            }
        } else if (color.length === 5) {//#FFFA RGBA 
            let cl = color.substring(1, 5);
            let r = cl.substring(0, 1);
            let red = parseInt(r + r, 16);
            let g = cl.substring(1, 2);
            let green = parseInt(g + g, 16);
            let b = cl.substring(2, 3);
            let blue = parseInt(b + b, 16);
            let a = cl.substring(3, 4);
            let alpha = parseInt(a + a, 16);
            let tonedRed = Math.round(red - red * percent);
            let tonedGreen = Math.round(green - green * percent);
            let tonedBlue = Math.round(blue - blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16))) + normalizeHexColor(((alpha > 255 ? 255 : alpha).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + "," + alpha + ")";
            }
        } else if (color.length === 7) {//#FFFFFF --- hex color alone
            let cl = color.substring(1, 7);
            let red = parseInt(cl.substring(0, 2), 16);
            let green = parseInt(cl.substring(2, 4), 16);
            let blue = parseInt(cl.substring(4, 6), 16);
            let tonedRed = Math.round(red - red * percent);
            let tonedGreen = Math.round(green - green * percent);
            let tonedBlue = Math.round(blue - blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + ")";
            }
        } else if (color.length === 9) {//#ABFFFFFF ---with alphaa
            var cl = color.substring(1, 9);
            let red = parseInt(cl.substring(0, 2), 16);
            let green = parseInt(cl.substring(2, 4), 16);
            let blue = parseInt(cl.substring(4, 6), 16);
            let alpha = parseInt(cl.substring(6, 8), 16);
            let tonedRed = Math.round(red - red * percent);
            let tonedGreen = Math.round(green - green * percent);
            let tonedBlue = Math.round(blue - blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16))) + normalizeHexColor(((alpha > 255 ? 255 : alpha).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + "," + alpha + ")";
            }
        }

    } else {
        console.log(color);
        throw new Error("Invalid hexadecimal color format!... input: color = " + color + " , percent = " + percent);
    }

}
/**
 * Brightens a given hexadecimal color.
 * If an rgb color is supplied it converts it to hexadecimal and then brightens it, and returns the result in hexadecimal
 * @param {String} color An hexxadecimal string e.g #00FFCC
 * @param {Number} percent A number between 0 and 100
 * @returns {undefined} an hexadecimal string that is a brighter version of the color
 */
function brightenColor(color, percent) {
    if (typeof color !== 'string') {
        throw new Error("Invalid color format! hexadecimal string alone allowed... input: color = " + color + " , percent = " + percent);
    }
    if (typeof percent !== 'number') {
        throw new Error("Invalid number format! Only numbers between 0.0 and 1.0 are allowed... input: color = " + color + " , percent = " + percent);
    }
    if (percent < 0 || percent > 1) {
        throw new Error("Invalid number format! Please supply a number between 0.0 and 1.0... input: color = " + color + " , percent = " + percent);
    }
    color = color.trim();

    var isRGB = false;
    if (startsWith(color, "rgb(")) {
        color = rgbToHex(color);
        isRGB = true;
    }
    if (!startsWith(color, "#")) {
        color = standardizeColor(color);
    }

    if (color.length === 4 || color.length === 5 || color.length === 7 || color.length === 9) {
//(255).toString(16) == 'ff' && parseInt('ff', 16) == 255
        if (color.length === 4) {//#FFF 
            let cl = color.substring(1, 4);
            let r = cl.substring(0, 1);
            let red = parseInt(r + r, 16);
            let g = cl.substring(1, 2);
            let green = parseInt(g + g, 16);
            let b = cl.substring(2, 3);
            let blue = parseInt(b + b, 16);
            let tonedRed = red === 0 ? 1 : Math.round(red + red * percent);
            let tonedGreen = green === 0 ? 1 : Math.round(green + green * percent);
            let tonedBlue = blue === 0 ? 1 : Math.round(blue + blue * percent);
            
           
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor((tonedBlue > 255 ? 255 : tonedBlue).toString(16));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + ")";
            }
        } else if (color.length === 5) {//#FFFA RGBA 
            let cl = color.substring(1, 5);
            let r = cl.substring(0, 1);
            let red = parseInt(r + r, 16);
            let g = cl.substring(1, 2);
            let green = parseInt(g + g, 16);
            let b = cl.substring(2, 3);
            let blue = parseInt(b + b, 16);
            let a = cl.substring(3, 4);
            let alpha = parseInt(a + a, 16);
            let tonedRed = red === 0 ? 1 : Math.round(red + red * percent);
            let tonedGreen = green === 0 ? 1 : Math.round(green + green * percent);
            let tonedBlue = blue === 0 ? 1 : Math.round(blue + blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16))) + normalizeHexColor(((alpha > 255 ? 255 : alpha).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + "," + alpha + ")";
            }
        } else if (color.length === 7) {//#FFFFFF --- hex color alone
            let cl = color.substring(1, 7);
            let red = parseInt(cl.substring(0, 2), 16);
            let green = parseInt(cl.substring(2, 4), 16);
            let blue = parseInt(cl.substring(4, 6), 16);
            let tonedRed = red === 0 ? 1 : Math.round(red + red * percent);
            let tonedGreen = green === 0 ? 1 : Math.round(green + green * percent);
            let tonedBlue = blue === 0 ? 1 : Math.round(blue + blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + ")";
            }
        } else if (color.length === 9) {//#ABFFFFFF ---with alphaa
            var cl = color.substring(1, 9);
            let red = parseInt(cl.substring(0, 2), 16);
            let green = parseInt(cl.substring(2, 4), 16);
            let blue = parseInt(cl.substring(4, 6), 16);
            let alpha = parseInt(cl.substring(6, 8), 16);
            let tonedRed = red === 0 ? 1 : Math.round(red + red * percent);
            let tonedGreen = green === 0 ? 1 : Math.round(green + green * percent);
            let tonedBlue = blue === 0 ? 1 : Math.round(blue + blue * percent);
            if (isRGB === false) {
                return "#" + normalizeHexColor(((tonedRed > 255 ? 255 : tonedRed).toString(16))) + normalizeHexColor(((tonedGreen > 255 ? 255 : tonedGreen).toString(16))) +
                        normalizeHexColor(((tonedBlue > 255 ? 255 : tonedBlue).toString(16))) + normalizeHexColor(((alpha > 255 ? 255 : alpha).toString(16)));
            } else {
                return "rgb(" + tonedRed + "," + tonedGreen + "," + tonedBlue + "," + alpha + ")";
            }
        }

    } else {
        throw new Error("Invalid hexadecimal color format!... input: color = " + color + " , percent = " + percent);
    }

}
