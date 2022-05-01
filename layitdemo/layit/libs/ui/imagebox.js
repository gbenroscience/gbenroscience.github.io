/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 *  
 * @param {object} options A key-value object used to pass css properties (i.e style) to the TextBox
 * The format of the options object is:
 * 
 * {
 *   "id" : "text-box-1"
 *   "title" : "Title",
 *   "text" : "Content Text",
 *   "url" : "image-url",
 *   "alt" : "Alt Text",
 *   "main-style" : {
 *   "float" : "left",
 *   "background-color" : "red", ...
 *   },
 *   "header-style" : {
 *    "float" : "left",
 *    "color" : "blue", ...
 *   }
 *   "content-style" : {
 *    "float" : "left",
 *    "color" : "blue", ...
 *   }
 * 
 * }
 * 
 * The keys and values are just css properties and  relevant value, just the way they are defined in any style-sheet.
 * 
 * @returns {TextBox}
 */
function ImageBox(options) {

    if (typeof options !== "object") {
        throw new Error('Please supply the options parameter!')
    }

    if (!options.id || typeof options.id === 'undefined') {
        throw new Error("Please supply the `id` field of the options variable. It is mandatory.\n Couldn't create the ImageBox");
    }

    if (!options.url || options.url === '') {
        throw new Error("No url specified for image! Couldn't create the ImageBox.");
    }

    if (!options.alt || options.alt === '') {
        throw new Error("No alt text specified for image! Wont create the ImageBox as a matter of principle.");
    }

    if (!options.title || typeof options.title === 'undefined') {
        options.title = "My ImageBox!";
    }

    if (!options.text || typeof options.text === 'undefined') {
        options.text = "Image Caption goes here!";
    }

    if (typeof options.id !== 'string') {
        throw new Error("The `id` field of the `options` variable must be a string type, not a `" + (typeof options.id) + "` type.\n Couldn't create the TextBox");
    }

    if (typeof options.title !== 'string') {
        throw new Error("The `title` field of the `options` variable must be a string type, not a `" + (typeof options.title) + "` type.\n Couldn't create the TextBox");
    }

    if (typeof options.text !== 'string') {
        throw new Error("The `text` field of the `options` variable must be a string type, not a `" + (typeof options.text) + "` type.\n Couldn't create the TextBox");
    }

    this.title = options.title;
    this.text = options.text;
    this.id = options.id;
    this.url = options.url;
    this.alt = options.alt;
    this.alt = options.alt;

    this.mainStyle = new Style("#" + this.id + "_main_style", []);
    this.headerStyle = new Style("#" + this.id + "_header_style", []);
    this.contentStyle = new Style("#" + this.id + "_content_style", []);

    this.imageStyle = new Style("#" + this.id + "_content_img_style", []);
    this.textStyle = new Style("#" + this.id + "_content_text_style", []);



    initHeaderCss:{

        this.headerStyle.addStyleElement("float", "left");
        this.headerStyle.addStyleElement("width", "100%");
        this.headerStyle.addStyleElement("padding", "0.3em");
        this.headerStyle.addStyleElement("background-color", "#000088");
        this.headerStyle.addStyleElement("color", "#ffffff");
        this.headerStyle.addStyleElement("font-size", "0.65em");
        this.headerStyle.addStyleElement("border-top-left-radius", "0.3em");
        this.headerStyle.addStyleElement("border-top-right-radius", "0.3em");



        if (typeof options["header-style"] === "object") {
            let headerStyleCss = options["header-style"];
            for (let key in headerStyleCss) {
                this.headerStyle.addStyleElement(key, headerStyleCss[key]);
            }

        }
    }

    initContentCss:{

        this.contentStyle.addStyleElement("float", "left");
        this.contentStyle.addStyleElement("width", "100%");
        this.contentStyle.addStyleElement("padding", "0.5em");
        this.contentStyle.addStyleElement("background-color", "white");
        this.contentStyle.addStyleElement("color", "black");
        this.contentStyle.addStyleElement("font-size", "0.55em");
        this.contentStyle.addStyleElement("border", "1px solid #000088");
        this.contentStyle.addStyleElement("font-weight", "normal");
        this.contentStyle.addStyleElement("min-height", "8em");
        this.contentStyle.addStyleElement("border-bottom-left-radius", "0.3em");
        this.contentStyle.addStyleElement("border-bottom-right-radius", "0.3em");

        if (typeof options["header-style"] === "object") {
            let contentStyleCss = options["content-style"];
            for (let key in contentStyleCss) {
                this.contentStyle.addStyleElement(key, contentStyleCss[key]);
            }
        }
    }

    initMainCss:{

        this.mainStyle.addStyleElement("float", "left");

        if (typeof options["main-style"] === "object") {
            let mainStyleCss = options["main-style"];
            for (let key in mainStyleCss) {
                this.mainStyle.addStyleElement(key, mainStyleCss[key]);
            }
        }
    }


    initImageCss:{


        this.imageStyle.addStyleElement("float", "left");
        this.imageStyle.addStyleElement("width", "80%");
        this.imageStyle.addStyleElement("height", "auto");
        this.imageStyle.addStyleElement("margin", "0.5em 10%");

        if (typeof options["image-style"] === "object") {
            let imgStyleCss = options["image-style"];
            for (let key in imgStyleCss) {
                this.imageStyle.addStyleElement(key, imgStyleCss[key]);
            }
        }
    }


    initTextCss:{

        this.textStyle.addStyleElement("float", "left");
        this.textStyle.addStyleElement("width", "80%");
        this.textStyle.addStyleElement("text-align", "center");
        this.textStyle.addStyleElement("margin", "0.5em 10%");

        if (typeof options["text-style"] === "object") {
            let paraStyleCss = options["text-style"];
            for (let key in paraStyleCss) {
                this.textStyle.addStyleElement(key, paraStyleCss[key]);
            }
        }
    }

}



ImageBox.prototype.build = function () {

    let html = new StringBuffer();

    html.append("<div id='").append(this.id).append("' ").append(this.mainStyle.getCss()).append(">").append(this.buildHeader()).append(this.buildContent()).append("</div>");

    return html.toString();
 
};


ImageBox.prototype.buildHeader = function () {

    let html = new StringBuffer();

    html.append("<div id='").append(this.getTitleID()).append("' ").append(this.headerStyle.getCss()).append(">").append(this.title).append("</div>");
 

    return html.toString();

};


ImageBox.prototype.buildContent = function () {

    let html = new StringBuffer();

    html.append("<div id='").append(this.getContentDivID()).append("' ").append(this.contentStyle.getCss()).append(">")
            .append("<img id='").append(this.getImageElementID()).append("' ")
            .append(this.imageStyle.getCss()).append(" src='").append(this.url)
            .append(" alt='").append(this.alt).append("' />")
            .append("<p id='").append(this.getTextElementID()).append("' ").append(this.textStyle.getCss()).append(">").append(this.text).append("</p>")
            .append("</div>");


    return html.toString();

};

ImageBox.prototype.getTitleID = function (){
    return this.id+"_image_box_title";
};

ImageBox.prototype.getTextElementID = function (){
    return this.id+"_image_box_text_one";
};


ImageBox.prototype.getImageElementID = function (){
    return this.id+"_image_box_content_img";
};

ImageBox.prototype.getContentDivID = function (){
    return this.id+"_image_box_content";
};



ImageBox.prototype.setTitle = function (title) {
    this.title = title;
  //  $("#" + this.id + "_header").text(title);

    let t = document.getElementById(this.getTitleID()).firstChild;
    t.nodeValue =  title;
};


ImageBox.prototype.setText = function (content) {
    this.text = content;
   // $("#" + this.id + "_content").text(content);
    let t = document.getElementById(this.getTextElementID()).firstChild;
    t.nodeValue =  content;
};


ImageBox.prototype.setUrl = function (url) {
    this.url = url;
   // $("#" + this.id + "_content").text(content);
    let t = document.getElementById(this.getTextElementID());
    t.src =  url;
};



/**
 * Adds a css style to the textbox frame.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
ImageBox.prototype.addMainStyle = function (attrName, attrVal) {
    this.mainStyle.addStyleElement(attrName, attrVal);
};

/**
 * Adds a css style to the header
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
ImageBox.prototype.addHeaderStyle = function (attrName, attrVal) {
    this.headerStyle.addStyleElement(attrName, attrVal);
};

/**
 * Adds a css style to the content area.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
ImageBox.prototype.addContentStyle = function (attrName, attrVal) {
    this.contentStyle.addStyleElement(attrName, attrVal);
};

/**
 * Adds a css style to the image element.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
ImageBox.prototype.addImageStyle = function (attrName, attrVal) {
    this.imageStyle.addStyleElement(attrName, attrVal);
};


/**
 * Adds a css style to the text element below the image element.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
ImageBox.prototype.addTextStyle = function (attrName, attrVal) {
    this.textStyle.addStyleElement(attrName, attrVal);
};



 