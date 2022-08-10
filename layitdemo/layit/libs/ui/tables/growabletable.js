/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global InputTable */
GrowableTable.prototype.constructor = GrowableTable;
GrowableTable.prototype = Object.create(InputTable.prototype);

/**
 * 
 * This is a InputTable table that has an add button that allows you to add more items.
 * 
 * @param {type} options Normal options of a Table element. In addition, you can add the following options:
 * 
 * {
 * ...,
 * showLeftBtn : true,
 * buttonText : "Add New",
 * onAddBtnClicked    : function(){}
 * 
 * 
 * }
 * 
 * @returns {GrowableTable}
 */
function GrowableTable(options) {
    InputTable.call(this, options);
    if (this.validObject === false) {
        return;
    }

    if (isEmptyText(options.buttonText)) {
        logIfConsole("The button text is not specified for the table.  Specify with `buttonText: Add New` option.");
        this.buttonText = 'Button';
    } else {
        this.buttonText = options.buttonText;
    }

    if (options.onAddBtnClicked && {}.toString.call(options.onAddBtnClicked) === '[object Function]') {
        this.onAddBtnClicked = options.onAddBtnClicked;
    }
    
   if (typeof options.showLeftBtn === 'undefined') {
        logIfConsole("`showLeftBtn: true|false` not specified. Defaulting to true");
        this.showLeftBtn = false;
    } else {
        this.showLeftBtn = options.showLeftBtn;
    }



    this.btnStyle = new Style("#" + this.getBtnClass(), []);
    this.btnStyleHover = new Style("#" + this.getBtnClass() + "_hover", []);
    this.btnStyleActive = new Style("#" + this.getBtnClass() + "_active", []);
    let cssOptions = {
        float: "left",
        "margin-top": "0em",
        "margin-bottom": '0.75em',
        "font-weight": 'bold',
        padding: '0.4em 1.2em',
        "background-color": this.colorTheme,
        color: 'white',
        "border-radius": '4px'
    };

    cssOptions['font-size'] = "calc( 0.85 * " + this.fontSize + ")";
    cssOptions.visibility = this.showLeftBtn === true ? 'visible' : 'hidden';


    let cssOptionsHover = {
        cursor: "pointer"
    };

    let cssOptionsActive = {
        cursor: "pointer",
        opacity: '0.5',
        filter: 'alpha(opacity = 50)'
    };

    this.btnStyle.addFromOptions(cssOptions);
    this.btnStyleHover.addFromOptions(cssOptionsHover);
    this.btnStyleActive.addFromOptions(cssOptionsActive);

    this.registry[this.getBtnClass()] = this.btnStyle;
    this.registry[this.getBtnClass() + ":hover"] = this.btnStyleHover;
    this.registry[this.getBtnClass() + ":active"] = this.btnStyleActive;
}








GrowableTable.prototype.build = function (parent) {
    let checkBoxStyle = new Style("#" + this.getTableCellCheckBoxTypeClass(), []);

    checkBoxStyle.addFromOptions({
        'display': "table",
        'background': "red",
        'margin': "0 auto"
    });


    let btnStyle = new Style("#" + this.getTableCellButtonTypeClass(), []);

    btnStyle.addFromOptions({
        'display': "table",
        'margin': "0 auto",
        'padding': '3px 1em'
    });


    this.registry[this.getTableCellCheckBoxTypeClass()] = checkBoxStyle;
    this.registry[this.getTableCellButtonTypeClass()] = btnStyle;

    let table = this;

//call to the overriden function from Table
    InputTable.prototype.build.call(this, parent);
   // Object.getPrototypeOf(GrowableTable.prototype).build.call(this, parent);

 let btn = document.getElementById(table.getBtnClass());
        if (btn !== null) {
            btn.onclick = table.onAddBtnClicked;
        }

};


/**
 * A Table function
 * Factory funcion that produces the HTML output of this
 * javascript brouhaha.
 * @returns {StringBuffer.prototype@pro;dataArray@call;join}
 */
GrowableTable.prototype.buildTable = function () {

    let div = document.createElement("div");

    div.setAttribute("id", this.getTableContentAreaId());
    addClass(div, this.getTableContentAreaClass());
    div.appendChild(this.buildContentHeader());
    div.appendChild(this.buildRawTable());
    div.appendChild(this.buildContentFooter());

    return div;
};
GrowableTable.prototype.getBtnClass = function () {
    return this.id + "_grow_btn_class";
};



/**
 * Override this function in Table to insert the button to the content-header.
 * Generate the ui portion just above the table but still within the 
 * content area that contains the table. SearchableTable and GrowableTable
 * work by adding a Search field and a button respectively to this ui-area.
 * @returns {unresolved}
 */
GrowableTable.prototype.buildContentHeader = function () {
    let div = document.createElement("div");
    div.setAttribute("id", this.getContentHeaderId());
    addClass(div, this.getContentHeaderClass());
     div.appendChild(this.buildButton());  
    return div;
};



/**
 * A Table function
 * Generates the button above the table.
 * @returns {StringBuffer.prototype@pro;dataArray@call;join}
 */
GrowableTable.prototype.buildButton = function () {

    let btn = document.createElement("input");
    btn.type = "button";
    btn.setAttribute("id", this.getBtnClass());

    addClass(btn, this.getBtnClass());
    btn.value = this.buttonText;

    return btn;

};


GrowableTable.prototype.setButtonLabel = function (text) {
    if (!text || text.length === '') {
        text = 'Add +';
    }
    let btn = document.getElementById(this.getBtnClass());
    if (btn && btn !== null) {
        btn.value = text;
    }
};