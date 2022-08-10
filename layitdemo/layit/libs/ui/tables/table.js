/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let tableSheets = document.createElement('style');
tableSheets.setAttribute('type', 'text/css');


/* global StyleElement */

/**
 * TableCell definition.
 * @param {string} colData A string which is the data to be placed in the TableCell
 * @param {Boolean} header if true, this TableCell must belong to a header row.
 * @param {Boolean} footer if true, this TableCell must belong to a footer row.
 *
 *
 * The table cell id is computed from the table id.
 *
 * If the table id is smsc_table.
 *
 * Then for the row on index 2, its id will be smsc_table_3
 * For a cell on index 1 on this row, the cell id will be smsc_table_3_2
 *
 *
 * @returns {TableCell}
 */
function TableCell(colData, header, footer) {
    this.rowSpan = 0;
    this.colSpan = 0;
    this.colData = colData !== null ? colData : '';
    this.id = '';
    this.className = '';
    this.footer = footer;
    this.header = header;
    this.listenerNames = []; //an array of javascript event names supported by the td element.
    this.listenerCodes = []; //an array of functions
    this.style = new Style("#" + this.id, []);
    this.style.addFromOptions({
        'max-width': '100%',
        'white-space': 'nowrap'
    });
}

/**
 * TableCell function<br>
 * Factory method that produces the code for a cell of each TableRow
 * @returns {undefined}
 */
TableCell.prototype.build = function () {

    let td = (this.header === true || this.footer === true) ? document.createElement('th') : document.createElement('td');
    addClass(td, this.className);
    td.setAttribute("id", this.id);
    if (this.rowSpan > 0) {
        td.rowSpan = this.rowSpan;
    }
    if (this.colSpan > 0) {
        td.colSpan = this.colSpan;
    }

    if (this.listenerNames.length === this.listenerCodes.length) {
        for (let i = 0; i < this.listenerCodes.length; i++) {
            td.addEventListener(this.listenerNames[i], this.listenerCodes[i]);
        }
    }

    td.innerHTML = this.colData;
    let style = document.createElement('style');
    if (this.style.styleElements.length > 0) {
        style.setAttribute('type', 'text/css');
        style.innerHTML = this.style.getCss();
        td.style = style;
    }


    return td;
};
/**
 * TableCell function<br>
 * Sets the listener TableCell rowSpan
 * @param {string} listenerName The name of the listener, e.g. onclick etc.
 * @param {string} listenerCode The code of the listener, the RHS that is assigned to the listenerName.
 * @returns {undefined}
 */
TableCell.prototype.listen = function (listenerName, listenerCode) {
    if (!listenerName || !listenerCode) {
        return;
    }
    for (let i = 0; i < this.listenerNames.length; i++) {
        if (listenerName === this.listenerNames[i]) {
            this.listenerCodes[i] = listenerCode;
            return;
        }
    }

    this.listenerNames[this.listenerNames.length] = listenerName;
    this.listenerCodes[this.listenerCodes.length] = listenerCode;
};
/**
 * TableCell function<br>
 * Sets the TableCell rowSpan
 * @param {Integer} rowSpan The number of rows spanned by this object
 * @returns {undefined}
 */
TableCell.prototype.setRowSpan = function (rowSpan) {
    this.rowSpan = rowSpan;
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td) {
            let td = document.getElementById(this.id);
            td.rowSpan = rowSpan;
        }
    }
};
/**
 * TableCell function<br>
 * @returns {Integer} The number of rows spanned by this object
 */
TableCell.prototype.getRowSpan = function () {
    return this.rowSpan;
};
/**
 * TableCell function.
 * Sets the TableCell colSpan
 * @param {Integer} colSpan The number of columns panned by this object.
 * @returns {undefined}
 */
TableCell.prototype.setColSpan = function (colSpan) {
    this.colSpan = colSpan;
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td) {
            let td = document.getElementById(this.id);
            td.colSpan = colSpan;
        }
    }
};
/**
 *  TableCell function<br>
 * @returns {Integer} The number of columns spanned by this object.
 */
TableCell.prototype.getColSpan = function () {
    return this.colSpan;
};
/**
 * TableCell function<br>
 *  Sets the data to be displayed in this object
 * @param {string} colData The data to be displayed in the TableCell..text or html
 * @returns {undefined}
 */
TableCell.prototype.setColData = function (colData) {
    this.colData = colData;
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td && td !== null) {
            td.innerHTML = this.colData;
        }

    }
};
/**
 *
 * @returns {String} The column data to be displayed in the TableCell..text or html.
 */
TableCell.prototype.getColData = function () {
    return this.colData;
};
/**
 * TableCell function<br>
 * @param {Style} style The style to use on this TableCell
 * @returns {undefined}
 */
TableCell.prototype.setStyle = function (style) {
    this.style = style;
};
/**
 * TableCell function<br>
 * @returns {Style} The style to use on this TableCell
 */
TableCell.prototype.getStyle = function () {
    return this.style;
};
/**
 * TableCell function
 * @returns {Style} Refreshes inline styles of a td object.
 */
TableCell.prototype.reloadStyles = function () {
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td !== null) {
            td.style.setAttribute('type', 'text/css');
            td.style.innerHTML = this.style.getCss();
        }


    }
};
/**
 * A TableCell function.<br>
 * <i>Styles a TableCell</i>
 * @param {string} attr The css attribute
 * @param {string} val The value
 * @returns {undefined}
 */
TableCell.prototype.addStyleElem = function (attr, val) {
    this.style.addStyleElement(attr, val);
    this.reloadStyles();
};
/**
 * A TableCell function.<br>
 * <i>Styles a TableCell</i>
 * @param {StyleElement} styleElemObj A StyleElement object
 * @returns {undefined}
 */
TableCell.prototype.addStyleElemObj = function (styleElemObj) {
    if (StyleElement.prototype.isPrototypeOf(styleElemObj)) {
        this.style.addStyleElementObj(styleElemObj);
    } else {
        this.style.addStyleElementCss(styleElemObj);
    }


    this.reloadStyles();
};
/**
 * A TableCell function.<br>
 * <i>Styles a TableCell</i>
 * @param {string} css A a css element e.g. width:100px
 * @returns {undefined}
 */
TableCell.prototype.addStyleElemCss = function (css) {
    this.style.addStyleElementCss(css);
    this.reloadStyles();
};
/**
 * A TableCell function<br>
 * @param {type} style The StyleElement to remove from the TableRow's stylesheet..supply as StyleElement object.
 * @returns {undefined}
 */
TableCell.prototype.removeStyleElemObj = function (style) {
    if (StyleElement.prototype.isPrototypeOf(style)) {
        this.style.removeStyleElementObj(style);
        this.reloadStyles();
    }
};
/**
 * A TableCell function<br>
 * @param {string} styleAttr The css attribute to remove from the TableRow's stylesheet e.g.(width)
 * @returns {undefined}
 */
TableCell.prototype.removeStyleElemCss = function (styleAttr) {
    if (styleAttr) {
        this.style.removeStyleElementByAttr(styleAttr);
        this.reloadStyles();
    }
};
/**
 * A TableCell function<br>
 * @param {string} id The id..without the #..it is added automatically.
 * @returns {undefined}
 */
TableCell.prototype.setId = function (id) {
    this.style.name = "#" + id;
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td !== null) {
            td.setAttribute("id", id);
        }
    }

    this.id = id;
};
/**
 * A TableCell function<br>
 * @returns {string}
 */
TableCell.prototype.getId = function () {
    return this.id;
};
/**
 * A TableCell function<br>
 * @param {Boolean} header Set this variable to true if this TableCell is part of an header row
 * @returns {undefined}
 */
TableCell.prototype.setHeader = function (header) {
    this.header = header;
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td !== null) {
            let tr = td.parentNode;
            let th = header === true ? document.createElement("th") : document.createElement("td");
            th.setAttribute("id", td.getAttribute("id"));
            th.style = td.style;
            replaceInParent(td, th);
        }


    }


};
/**
 * A TableCell function<br>
 * @returns {Boolean} true if this TableCell is part of an header row
 */
TableCell.prototype.getHeader = function () {
    return this.header;
};
/**
 * A TableCell function<br>
 * @param {Boolean} footer Set this variable to true if this TableCell is part of a footer row
 * @returns {undefined}
 */
TableCell.prototype.setFooter = function (footer) {
    this.footer = footer;
    if (this.id !== null && this.id !== '') {
        let td = document.getElementById(this.id);
        if (td !== null) {
            let tr = td.parentNode;
            let th = footer === true ? document.createElement("th") : document.createElement("td");
            th.setAttribute("id", td.getAttribute("id"));
            th.style = td.style;
            replaceInParent(td, th);
        }
    }
};
/**
 * A TableCell function<br>
 * @returns {Boolean} true if this TableCell is part of a footer row
 */
TableCell.prototype.getFooter = function () {
    return this.footer;
};
/**
 * Adds a css style to the table caption.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
TableCell.prototype.addStyle = function (attrName, attrVal) {
    this.style.addStyleElement(attrName, attrVal);
};

/**
 *
 * @param {Array} colData An array of strings containing the data to be placed in the columns
 * @param {Boolean} header If true, then this row is an header row
 * @param {Boolean} footer If true, then this row is a footer row
 *
 * @returns {TableRow}
 * Note: Cell ids are auto generated and can be accessed using the
 * TableRow.getCellIdAt(column) function.
 * Individual cells can also be styled using the TableRow.addColumnStyleElement
 * function or accessing the TableCell by its index and then styling it by adding
 * StyleElement objects to its Style property.
 */
function TableRow(colData, header, footer) {
    let colDat = colData !== null ? colData : [];
    this.id = '';
    this.className = "";
    this.style = new Style("#" + this.id, []);
    this.header = header;
    this.footer = footer;
    /**
     * Accomodates TableCell objects.
     */
    this.tableCells = [];
    for (let i = 0; i < colDat.length; i++) {
        let tableCell = new TableCell(colDat[i], header, footer);
        tableCell.setId(this.getCellIdAt(i));
        tableCell.setStyle(new Style("#" + tableCell.getId(), []));
        this.tableCells[this.tableCells.length] = tableCell;
    }
    this.addStyle("border", "1px solid #e7ecf1");
}


/**
 * A TableRow function
 * The factory function that generates the HTML code for the table row.
 * @returns {HTMLTableRowElement} A tr element
 */
TableRow.prototype.getHtml = function () {

    let tr = document.createElement("tr");
    if (this.id !== null && this.id !== '') {
        tr.setAttribute('id', this.id);
    }
    if (this.className !== null && this.className !== '') {
        addClass(tr, this.className);
    }

    if (this.style.styleElements.length > 0) {
        if (!this.style.isEmpty()) {
            updateOrCreateSelectorInStyleSheet(tableSheets, this.style);
        }
    }

    let columns = this.size();
    for (let i = 0; i < columns; i++) {
        let tableCell = this.tableCells[i];
        tableCell.setId(this.id + '_' + i);
        tr.appendChild(tableCell.build());
    }

    return tr;
};
/**
 * A TableRow function
 * @param {Integer} column The column index of the cell on this TableRow
 * @returns {string} The id of the cell.
 */
TableRow.prototype.getCellIdAt = function (column) {
    return this.id + '_' + (column);
};
/**
 * A TableRow function
 * @param {string} id  The id of the TableRow...without the #. It is added automatically.
 * @returns {undefined}
 */
TableRow.prototype.setId = function (id) {
    this.style.name = "#" + id;
    if (this.id !== null && this.id !== '') {
        let tr = document.getElementById(this.id);
        if (tr !== null) {
            tr.setAttribute("id", id);
        }
    }

    this.id = id;
};
/**
 * A TableRow function
 * @returns {String} the id of the TableRow
 */
TableRow.prototype.getId = function () {
    return this.id;
};
/**
 * A TableRow function
 * @param {Integer} column The column index
 * @returns {TableCell} The TableCell at that column.
 */
TableRow.prototype.getTableCell = function (column) {
    return this.tableCells[column];
};
/**
 * TableCell function
 * @returns {Style} Refreshes inline styles of a tr object.
 */
TableRow.prototype.reloadStyles = function () {
    if (this.id !== null && this.id !== '') {
        let tr = document.getElementById(this.id);
        if (tr !== null) {
            tr.style.setAttribute('type', 'text/css');
            tr.style.innerHTML = this.style.getCss();
        }
    }
};
/**
 * A TableRow function.<br>
 * Adds the style element to the cell at the column index.
 * @param {Integer} column The column index of the cell
 * @param {object} styleElem The StyleElement object or css(e.g. width:10px) to add.
 * @returns {undefined}
 */
TableRow.prototype.addColumnStyleElement = function (column, styleElem) {
    if (StyleElement.prototype.isPrototypeOf(styleElem)) {
        this.getTableCell(column).addStyleElemObj(styleElem);
    } else {
        this.getTableCell(column).addStyleElemCss(styleElem);
    }
    this.reloadStyles();
};
/**
 * A TableRow function
 * @param {Integer} column The column index of the cell
 * @param {StyleElement|string} styleElemAttrOrObj The StyleElement attribute or object.
 * @returns {undefined}
 */
TableRow.prototype.removeColumnStyleElement = function (column, styleElemAttrOrObj) {
    if (StyleElement.prototype.isPrototypeOf(styleElemAttrOrObj)) {
        this.getTableCell(column).removeStyleElemObj(styleElemAttrOrObj);
    } else {
        this.getTableCell(column).removeStyleElemCss(styleElemAttrOrObj);
    }
    this.reloadStyles();
};
/**
 * Adds a css style to the table caption.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
TableRow.prototype.addStyle = function (attrName, attrVal) {
    this.style.addStyleElement(attrName, attrVal);
    this.reloadStyles();
};
/**
 * A TableRow function.<br>
 * <i>Styles a TableRow</i>
 * @param {string} attr The css attribute
 * @param {string} val The value
 * @returns {undefined}
 */
TableRow.prototype.addStyleElem = function (attr, val) {
    if (!attr || !val) {
        return;
    }
    this.style.addStyleElement(attr, val);
    this.reloadStyles();
};
/**
 * A TableRow function.<br>
 * <i>Styles a TableRow</i>
 * @param {StyleElement} styleElemObj A StyleElement object
 * @returns {undefined}
 */
TableRow.prototype.addStyleElemObj = function (styleElemObj) {
    if (StyleElement.prototype.isPrototypeOf(styleElemObj)) {
        this.style.addStyleElementObj(styleElemObj);
    } else {
        this.style.addStyleElementCss(styleElemObj);
    }
    this.reloadStyles();
};
/**
 * A TableRow function.<br>
 * <i>Styles a TableRow</i>
 * @param {string} css A a css element e.g. width:100px
 * @returns {undefined}
 */
TableRow.prototype.addStyleElemCss = function (css) {
    this.style.addStyleElementCss(css);
    this.reloadStyles();
};
/**
 * A TableRow function.<br>
 * <i>Styles a TableRow</i>
 * @param {Integer} column The column to change.
 * @param {Integer} colspan The colspan to set.
 *
 * @returns {undefined}
 */
TableRow.prototype.setColSpanAt = function (column, colspan) {
    this.getTableCell(column).setColSpan(colspan);
};
/**
 * A TableRow function.<br>
 * <i>Styles a TableRow</i>
 * @param {Integer} column The column of the TableCell to change.
 * @param {rowSpan} rowSpan The rowspan to set.
 *
 * @returns {undefined}
 */
TableRow.prototype.setRowSpanAt = function (column, rowSpan) {
    this.getTableCell(column).setRowSpan(rowSpan);
};
/**
 * A Table function<br>
 * @param {type} style The StyleElement to remove from the TableRow's stylesheet..supply as StyleElement object.
 * @returns {undefined}
 */
TableRow.prototype.removeStyleElemObj = function (style) {
    if (StyleElement.prototype.isPrototypeOf(style)) {
        this.style.removeStyleElementObj(style);
    }
    this.reloadStyles();
};
/**
 * A TableRow function<br>
 * @param {string} styleAttr The css attribute to remove from the TableRow's stylesheet e.g.(width)
 * @returns {undefined}
 */
TableRow.prototype.removeStyleElemCss = function (styleAttr) {
    if (styleAttr) {
        this.style.removeStyleElementByAttr(styleAttr);
    }
    this.reloadStyles();
};
/**
 * A TableRow function
 * @param {Boolean} header A boolean specifying that this row is an header row
 */
TableRow.prototype.setHeader = function (header) {
    if (this.header !== header) {
        if (this.id) {
            let tr = document.getElementById(this.id);
            if (tr) {
                if (header === true) {
                    if (tr.parentNode.nodeName.toLowerCase() !== 'thead') {
                        let thead = document.createTextNode("thead");
                        thead.appendChild(tr);
                    }
                } else {
                    if (tr.parentNode.nodeName.toLowerCase() === 'thead') {
                        let parent = tr.parentNode;
                        replaceInParent(parent, tr);
                    }
                }
            }
        }
    }
    this.header = header;
};
/**
 * A TableRow function
 * @returns {boolean} true if the row is an header and false otherwise.
 */
TableRow.prototype.isHeader = function () {
    return this.header;
};
/**
 * A TableRow function
 * @param {Boolean} footer A boolean specifying that this row is a footer row
 */
TableRow.prototype.setFooter = function (footer) {


    if (this.footer !== footer) {
        if (this.id) {
            let tr = document.getElementById(this.id);
            if (tr) {
                if (footer === true) {
                    if (tr.parentNode.nodeName.toLowerCase() !== 'tfoot') {
                        let thead = document.createTextNode("tfoot");
                        thead.appendChild(tr);
                    }
                } else {
                    if (tr.parentNode.nodeName.toLowerCase() === 'tfoot') {
                        let parent = tr.parentNode;
                        replaceInParent(parent, tr);
                    }
                }
            }
        }
    }

    this.footer = footer;
};
/**
 * A TableRow function
 * @returns {boolean} true if the row is an footer and false otherwise.
 */
TableRow.prototype.isFooter = function () {
    return this.footer;
};
/**
 * A TableRow function
 * @returns {TableRow.colData.length} the array containing the column entries of the table.
 */
TableRow.prototype.getColumns = function () {
    return this.tableCells;
};
/**
 * A TableRow function
 * @returns {TableRow.colData.length} the number of column entries on the table.
 */
TableRow.prototype.size = function () {
    return this.tableCells.length;
};
/**
 * A TableRow function
 * @param {Style} style The Style object conssisting of css values used to style the row.
 * @returns {undefined}
 */
TableRow.prototype.setStyle = function (style) {
    this.style = style;
    if (this.id) {
        let tr = document.getElementById(this.id);
        if (tr) {
            this.reloadStyles();
        }
    }
};
/**
 * A TableRow function
 * @returns {Style} The row style.
 */
TableRow.prototype.getStyle = function () {
    return this.style;
};

function logIfConsole(text) {
    if (typeof console !== 'undefined') {
        console.log(text);
    } else {
        print(text);
    }
}

/**
 *
 * The format for options is like this:
 * <br>
 * <code>
 * {
 * id : "table_id", 
 * parent: zzzz,//id or actual html element of parent that will hold this table
 * showBorders : true,
 * hasCaption: true,
 * hasContainer: true,
 * hasFooter : true,//Will treat the last row as a footer row.
 * theme: "#ff00ff",
 * "font-size" : "14px",
 * title: "Multiplication Table",//the title shown on the container bar, if the table has a container.
 * scrollable: true,
 * classname: "nicetable",
 * caption:  "Data table", 
 * cellPadding: "1em",
 * scrollHeight: "150px",
 * icon : "icon.png",
 * headers: [],
 * data:[[],[],[],...],
 * hasFooter : true,
 * pagingEnabled :  true,
 * withNumbering: true,
 * numberCellWidth: 80px,
 * footerText : 'Footer text',
 * "main-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * "header-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * }, 
 *  "image-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * }, 
 * "content-area-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * "content-header-style" : {//styles the first div within the content area; the one just above the table element.
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * "table-style" : { 
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * "caption-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * "content-footer-text-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * "pager-style" : {
 *  //exact css definitions e.g
 *  border-radius : "3px"
 * },
 * page : {
 * width : 300,
 * size : 50,
 * onPrev : function(){},
 * onNext : function(){},
 * current :1
 * }
 *  
 
 *  
 * }
 * </code>
 * @param {object} options The key-value object that defines the table.
 * @returns {Table}
 */
function Table(options) {
    /**
     * Use this to convince the subclass constructor that the superclass
     * constructor completed successfully.
     */
    this.validObject = false;
    if (!options) {
        throw new Error("No options specified for creating the table.");
    }
    if (!options.id) {
        throw new Error("Please specify the table id... e.g. `id: table_id`");
    }

    if (isEmptyText(options.fontSize)) {
        logIfConsole("`font-size` not specifed. Defaulting to 16px");
        options.fontSize = "16px";
    }

    this.fontSize = options.fontSize;
    if (typeof options.hasCaption !== 'boolean') {
        logIfConsole("`hasCaption: true|false` not specified. Defaulting to false");
        this.hasCaption = false;
    } else {
        this.hasCaption = options.hasCaption;
    }
    if (typeof options.hasFooter !== 'boolean') {
        logIfConsole("`hasFooter: true|false` not specified. Defaulting to false");
        this.hasFooter = false;
    } else {
        this.hasFooter = options.hasFooter;
    }
    if (typeof options.showBorders !== 'boolean') {
        logIfConsole("`showBorders: true|false` not specified. Defaulting to true");
        this.showBorders = false;
    } else {
        this.showBorders = options.showBorders;
    }


    if (typeof options.hasContainer !== 'boolean') {
        logIfConsole("`hasContainer: true|false` not specified. Defaulting to false");
        this.hasContainer = true;
    } else {
        this.hasContainer = options.hasContainer;
    }
    if (typeof options.scrollable !== 'boolean') {
        logIfConsole("Not sure if this table should be scrollable. Specify with `scrollable: true` option. Defaulting to true.");
        this.scrollable = true;
    } else {
        this.scrollable = options.scrollable;
    }
    if (typeof options.pagingEnabled !== 'boolean') {
        logIfConsole("Not sure if this table should be paged. Specify with `pagingEnabled: true` option. Defaulting to false.");
        this.pagingEnabled = false;
    } else {
        this.pagingEnabled = options.pagingEnabled;
    }
    if (isEmptyText(options.className)) {
        logIfConsole("Class name not specified for the table.  Specify with `className: class_name` option.");
        this.className = options.id;
    } else {
        this.className = options.className;
    }
    if (isEmptyText(options.theme)) {
        logIfConsole("The color theme is not specified.  Specify with `theme: #ff00ff` option.");
        this.colorTheme = '#32c5d2';
    } else {
        this.colorTheme = options.theme;
    }
    if (isEmptyText(options.width)) {
        logIfConsole("The table width is not specified.  Specify with `width: 90%` option. Other css units are allowed. ");
        this.width = "100%";
    } else {
        this.width = options.width;
    }
    if (isEmptyText(options.icon)) {
        logIfConsole("The icon is not specified.  Specify with `icon: 'icon.png'` option. Other css units are allowed. ");
        this.icon = "";
    } else {
        this.icon = options.icon;
    }

    if (isEmptyText(options.footerText)) {
        logIfConsole("Footer text not specified for the table.  Specify with `footerText: Table footer` option.");
        this.footerText = '';
    } else {
        this.footerText = options.footerText;
    }

    if (isEmptyText(options.caption)) {
        logIfConsole("Caption not specified for the table.  Specify with `caption: table_caption` option.");
        this.caption = 'gQuery TABLE';
    } else {
        this.caption = options.caption;
    }

    if (isEmptyText(options.cellPadding)) {
        logIfConsole("Cell-padding not specified for the table.  Specify with the format: `cellPadding: 4px` option.");
        this.cellPadding = "1em";
    } else {
        this.cellPadding = options.cellPadding;
    }

    if (isEmptyText(options.headerPadding)) {
        logIfConsole("header padding not specified for the table.  Specify with the format: `headerPadding: 4px` option.");
        this.headerPadding = "1.3em";
    } else {
        this.headerPadding = options.headerPadding;
    }

    if (isEmptyText(options.scrollHeight)) {
        logIfConsole("Cell-scroll-height not specified for the table.  Specify with `scrollHeight: 120px` option. Defaulting to 120px.");
        /**
         * Default value for the inner div that enables scrolling if scrolling is enabled.
         */
        this.scrollHeight = '120px';
    } else {
        this.scrollHeight = options.scrollHeight;
    }


    this.id = options.id;

    this.headers = [];
    this.rows = [];
    this.pageSize = 10000;
    this.pageNumber = 1;
    let onPrev, onNext;
    if (options.page && typeof options.page === 'object') {
        if (typeof options.page["size"] === 'number') {
            this.pageSize = options.page["size"];
        }
        if (typeof options.page["current"] === 'number') {
            this.pageNumber = options.page["current"];
        }
        if (options.page["onPrev"]) {
            onPrev = options.page["onPrev"];
        } else {
            onPrev = function () {
            };
        }
        if (options.page["onNext"]) {
            onNext = options.page["onNext"];
        } else {
            onNext = function () {
            };
        }

    }


    let pagerOptions = {};
    pagerOptions['id'] = this.getPagerClass();
    pagerOptions['background'] = 'white';
    pagerOptions['theme'] = this.colorTheme;
    pagerOptions['pageNum'] = this.pageNumber;
    pagerOptions['pageSize'] = this.pageSize;
    pagerOptions['thickness'] = 1;
    pagerOptions['canvas-width'] = 300;
    pagerOptions['onPrevious'] = onPrev;
    pagerOptions['onNext'] = onNext;
    this.pager = new Pager(pagerOptions);
    if (typeof options.withNumbering !== 'boolean') {
        logIfConsole("`withNumbering: true|false` not specified. Defaulting to false");
        this.withNumbering = false;
    } else {
        this.withNumbering = options.withNumbering;
    }


    if (typeof options.numberCellWidth !== 'number') {
        logIfConsole("`numberCellWidth: ` not specified. Defaulting to 80px");
        this.numberCellWidth = "80px";
    } else {
        this.numberCellWidth = options.numberCellWidth;
    }


    if (isEmptyText(options.title)) {
        options.title = "Nice data table";
    }
    this.title = options.title;
//The general style applied to the tbody.
    this.tableCellStyle = new Style("." + this.id, []);

    if (options.headers) {
        if (this.isOneDimensionalArray(options.headers)) {
            this.headers = options.headers;
            loadHeaders:{
                let row = new TableRow(this.headers, true, false);
                row.className = this.id + "_row";

                for (let i = 0; i < this.headers.length; i++) {
                    row.tableCells[i].className = this.getTableCellClass();
                    row.tableCells[i].addStyle("max-width", "calc( 100% / " + row.tableCells.length + "  )");
                }
                this.rows.push(row);
            }
        } else {
            throw new Error("Invalid table headers structure found!");
        }
    } else {
        throw new Error("No table headers supplied!");
    }


    this.tableCellStyle.addFromOptions({
        "padding": this.cellPadding,
        // "word-wrap": "break-word",
        "word-break": "break-all",
        "max-width": "calc( 100% / " + this.headers.length + "  )",
        "overflow": "hidden",
        "text-overflow": "ellipsis"
    });
    if (options.showBorders === true) {
        this.tableCellStyle.addStyleElement("border", "1px solid #e7ecf1");
    }


    if (!options.data) {
        logIfConsole("You have not supplied the table data. Specify with `data: array` option.");
    } else if (this.is2DArray(options.data)) {

        initRows:{
            loadData:{
                for (let i = 0; i < options.data.length; i++) {

                    let rw = options.data[i];
                    let row = new TableRow(rw, false, this.hasFooter === true ? (i === options.data.length - 1) : false);
                    row.className = this.id + "_row";
                    for (let j = 0; j < row.tableCells.length; j++) {
                        row.tableCells[j].className = this.getTableCellClass();
                        row.tableCells[j].addStyle("max-width", "calc( 100% / " + row.tableCells.length + "  )");
                    }

                    this.rows.push(row);
                }
            }
        }

    } else {
        logIfConsole("Bad 2D array! The table requires a 2 dimensional array.");
        return;
    }


    this.mainStyle = new Style("#" + this.id, []);
    this.headerStyle = new Style("#" + this.id, []);
    this.contentAreaStyle = new Style("#" + this.id, []);
    this.tableStyle = new Style("#" + this.id, []);
    this.tableTrNotFirstChildStyle = new Style("#" + this.id + "_11", []);
    this.tableTrTdFirstChildBeforeStyle = new Style("#" + this.id + "_22", []);
    this.captionStyle = new Style("#" + this.id, []);
    this.imageStyle = new Style("#" + this.id, []);
    this.contentHeaderStyle = new Style("#" + this.id, []); //styles the div above the table element within the content area.
    this.contentFooterStyle = new Style("#" + this.id, []);
    this.contentFooterTextStyle = new Style("#" + this.id, []);
    this.pagerStyle = new Style("#" + this.id, []);
    let wid = this.width;
    initTableContainerCss:{

        this.mainStyle.addFromOptions({
            "float": "left",
            "width": wid,
            "padding": "0.0em",
            "margin": "0",// "0.75em calc( ( 100% - " + wid + " ) / 2)",
            "font-size": options.fontSize,
            "font-weight": "normal",
            "font-family": "\"Open Sans\",sans-serif"
        });
        //  this.mainStyle.addStyleElement("text-align", "center");

        if (typeof options["main-style"] === "object") {
            let mainStyleCss = options["main-style"];
            for (let key in mainStyleCss) {
                this.mainStyle.addStyleElement(key, mainStyleCss[key]);
            }
        }
    }


    let cellpdd = this.cellPadding;
    let colorTh = this.colorTheme;
    initHeaderCss:{


        this.headerStyle.addFromOptions({
            "float": "left",
            "width": "100%",
            //"padding": "calc(" + cellpdd + " * 0.75)",
            "padding": options.headerPadding,
            "text-align": "left",
            "background-color": colorTh,
            "color": "#ffffff",
            "border-top-left-radius": "0.3em",
            "border-top-right-radius": "0.3em"

        });
        if (typeof options["header-style"] === "object") {
            let headerStyleCss = options["header-style"];
            for (let key in headerStyleCss) {
                this.headerStyle.addStyleElement(key, headerStyleCss[key]);
            }

        }
    }


    initImageCss:{

        this.imageStyle.addFromOptions({
            "float": "left",
            "width": "auto",
            "height": "1em",
            "margin-right": "0.5em",
            "margin-top": "1px",
            "vertical-align": "middle"

        });
        if (typeof options["image-style"] === "object") {
            let imageCss = options["image-style"];
            for (let key in imageCss) {
                this.imageStyle.addStyleElement(key, imageCss[key]);
            }

        }
    }


    initContentAreaCss:{
        let containerExists = this.hasContainer;
        if (containerExists === true) {

            this.contentAreaStyle.addFromOptions({

                "float": "left",
                "width": containerExists === true ? "100%" : wid,
                "color": "#ffffff",
                "margin": containerExists === true ? "0" : "0.75em 10%",
                "font-size": "0.9em",
                "padding": "1.0em",
                "border": "1px solid " + colorTh,
                "border-bottom-left-radius": "0.3em",
                "border-bottom-right-radius": "0.3em"
            });
        } else {
            this.contentAreaStyle.addFromOptions({
                "float": "left",
                "width": wid,
                "border": "1px solid " + colorTh,
                "padding": "0.0em",
                "margin": "0.75em calc( ( 100% - " + wid + " ) / 2)",
                "font-size": options.fontSize,
                "font-weight": "normal",
                "font-family": "\"Open Sans\",sans-serif"
            });
        }


        // this.contentAreaStyle.addStyleElement("border-top-left-radius", "0.3em");
        // this.contentAreaStyle.addStyleElement("border-top-right-radius", "0.3em");


        if (typeof options["content-area-style"] === "object") {
            let contentAreaCss = options["content-area-style"];
            for (let key in contentAreaCss) {
                this.contentAreaStyle.addStyleElement(key, contentAreaCss[key]);
            }

        }
    }


    initTableStyleCss:{

        this.tableStyle.addFromOptions({
            "float": "left",
            "width": "100%",
            "margin": "0",
            "table-layout": "fixed",
            "color": "black",
            "font-size": "0.8em",
            "font-weight": "normal",
            "border": "1px solid gray",
            "border-collapse": "collapse",
            "font-family": "\"Open Sans\",sans-serif"
        });
        /*
         table {
         counter-reset: rowNumber;
         }
         
         table tr:not(:first-child) {
         counter-increment: rowNumber;
         }
         
         table tr td:first-child::before {
         content: counter(rowNumber);
         min-width: 1em;
         margin-right: 0.5em;
         }
         */


        if (this.withNumbering === true) {
            this.tableStyle.addFromOptions({
                "counter-reset": "rowNumber 1"
            });

            this.tableTrNotFirstChildStyle.addFromOptions({
                "counter-increment": "rowNumber 1"
            });

            this.tableTrTdFirstChildBeforeStyle.addFromOptions({
                "content": "counter(rowNumber) '.'",
                "min-width": "1em",
                "margin-right": "1em"
            });
        }
        //this.alternateBackgroundColors("lightgray","white");
        //this.alternateForegroundColors("red", "green");

        if (typeof options["table-style"] === "object") {
            let tableStyleCss = options["table-style"];
            for (let key in tableStyleCss) {
                this.tableStyle.addStyleElement(key, tableStyleCss[key]);
            }
        }
    }


    initContentHeaderDivCss:{

        this.contentHeaderStyle.addFromOptions({
            "float": "left",
            "margin": "0",
            width: "100%"
        });
        if (typeof options["content-header-style"] === "object") {
            let contentHeaderCss = options["content-header-style"];
            for (let key in contentHeaderCss) {
                this.contentHeaderStyle.addStyleElement(key, contentHeaderCss[key]);
            }

        }
    }

    initCaptionStyleCss:{

        this.captionStyle.addFromOptions({
            "width": "80%",
            "padding": "0.5em",
            "margin": "0.75em 10%",
            "color": "black",
            "font-size": "0.40em",
            "font-weight": "normal",
            "text-align": "center",
            "font-family": "\"Open Sans\",sans-serif"

        });
        if (typeof options["caption-style"] === "object") {
            let captionStyleCss = options["caption-style"];
            for (let key in captionStyleCss) {
                this.captionStyle.addStyleElement(key, captionStyleCss[key]);
            }
        }
    }


    initContentFooterCss:{

        this.contentFooterStyle.addFromOptions({
            "float": "left",
            "width": "100%",
            "color": "#000000",
            "margin-top": "1em",
            'border-top': '1px solid ' + colorTh,
            'border-bottom': '1px solid ' + colorTh
        });
    }


    initContentFooterTextCss:{

        this.contentFooterTextStyle.addFromOptions({

            "float": "left",
            "color": "#000000",
            "margin": "0",
            "font-size": "0.9em",
            "padding": "1.0em 0em",
            "font-family": "\"Open Sans\",sans-serif"
        });
        if (typeof options["content-footer-text-style"] === "object") {
            let contentFooterTextCss = options["content-footer-text-style"];
            for (let key in contentFooterTextCss) {
                this.contentFooterTextStyle.addStyleElement(key, contentFooterTextCss[key]);
            }

        }
    }

    initPagerCss:{

//defaults
        this.pagerStyle.addFromOptions({
            "float": "right",
            "width": '15em',
            "height": '2em',
            "max-width": "50%",
            "background": 'white',
            'margin-top': '0.5em'

        });
        if (typeof options["pager-style"] === "object") {
            let pagerStyleCss = options["pager-style"];
            for (let key in pagerStyleCss) {
                this.pagerStyle.addStyleElement(key, pagerStyleCss[key]);
            }
        }
    }


    let a1 = this.getTableContainerClass();
    let a2 = this.getHeaderClass();
    let a3 = this.getImageClass();
    let a4 = this.getTableContentAreaClass();
    let a5 = this.className;
    let a6 = this.getTableCaptionClass();
    let a7 = this.getTableCellClass();
    let a8 = this.getContentFooterClass();
    let a9 = this.getContentFooterTextClass();
    let a10 = this.getContentHeaderClass();
    let a11 = this.getPagerClass();
    let a12 = this.getTableTrTdFirstChildBeforeClass();
    let a13 = this.getTableTrNotFirstChildClass();


    this.registry = {};
    this.registry[a1] = this.mainStyle;
    this.registry[a2] = this.headerStyle;
    this.registry[a3] = this.imageStyle;
    this.registry[a4] = this.contentAreaStyle;
    this.registry[a5] = this.tableStyle;
    this.registry[a6] = this.captionStyle;
    this.registry[a7] = this.tableCellStyle;
    this.registry[a8] = this.contentFooterStyle;
    this.registry[a9] = this.contentFooterTextStyle;
    this.registry[a10] = this.contentHeaderStyle;
    this.registry[a11] = this.pagerStyle;
    this.registry[a12] = this.tableTrTdFirstChildBeforeStyle;
    this.registry[a13] = this.tableTrNotFirstChildStyle;

    this.validObject = true;


    this.buildCalled = false;


    this.assignParent(options.parent);

    if (this.constructor.name === 'Table') {
        this.build(options.parent);
    }
}

Table.prototype.assignParent = function (parent) {
    let entity = parent;
    if (entity) {
        if (typeof entity === 'string') {
            entity = document.getElementById(entity);
        }
        const isDomEntity = typeof entity === 'object' && entity.nodeType !== undefined;
        if (!entity.id || entity.id === '') {
            entity.id = "parent_" + this.id;
        }
        if (isDomEntity === false) {
            throw new Error("Invalid parent specified for table");
        }
    } else {
        throw new Error("No parent specified for table");
    }
    this.parentId = entity.id;
};

Table.prototype.getCurrentWidth = function () {
    let container = document.getElementById(this.getTableContainerId());
    return parseInt(window.getComputedStyle(container).width);
};

Table.prototype.getCurrentHeight = function () {
    let container = document.getElementById(this.getTableContainerId());
    return parseInt(window.getComputedStyle(container).height);
};

Table.prototype.getCurrentSize = function () {
    let container = document.getElementById(this.getTableContainerId());
    let w = parseInt(window.getComputedStyle(container).width);
    let h = parseInt(window.getComputedStyle(container).height);
    return {width: w, height: h};
};
/**
 *
 * @param {type} arr Is this object a 2D array.
 * @returns {Boolean} if the ssupplie parameter is a 2D array.
 */
Table.prototype.isOneDimensionalArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
};
/**
 *
 * @param {type} arr Is this object a 2D array.
 * @returns {Boolean} if the supplied parameter is a 2D array.
 */
Table.prototype.is2DArray = function (arr) {

    if (Object.prototype.toString.call(arr) === '[object Array]') {

        for (let i = 0; i < arr.length; i++) {
            if (Object.prototype.toString.call(arr[i]) !== '[object Array]') {
                return false;
            }
        }
        return true;
    }

    return false;
};
/**
 *
 * @returns {string} The id of the area of the table's topmost parent container.
 */
Table.prototype.getTableContainerId = function () {
    return this.id + "_container";
};
/**
 *
 * @returns {string} The id of the area of the table's topmost parent container's header.
 */
Table.prototype.getHeaderID = function () {
    return this.id + "_header";
};
/**
 *
 * @returns {string} The id of the area of the table immediately beneath the main container's header
 */
Table.prototype.getTableContentAreaId = function () {
    return this.id + "_content_area";
};


/**
 *
 * @returns {string} The id of the icon.
 */
Table.prototype.getImageId = function () {
    return this.id + "_icon";
};
/**
 *
 * @returns {string} The id of the bottom div.
 */
Table.prototype.getContentFooterId = function () {
    return this.id + "_content_footer_id";
};
/**
 *
 * @returns {string} The class of the bottom div.
 */
Table.prototype.getContentFooterClass = function () {
    return this.id + "_content_footer_class";
};
/**
 *
 * @returns {string} The id of the bottom div.
 */
Table.prototype.getContentHeaderId = function () {
    return this.id + "_content_header_id";
};
/**
 *
 * @returns {string} The class of the bottom div.
 */
Table.prototype.getContentHeaderClass = function () {
    return this.id + "_content_header_class";
};
/**
 *
 * @returns {string} The id of the icon.
 */
Table.prototype.getImageClass = function () {
    return this.id + "_icon_class";
};
/**
 *
 * @returns {string} The class name of the area of the table immediately beneath the main container's header
 */
Table.prototype.getTableContentAreaClass = function () {
    return this.id + "_content_area_class";
};
Table.prototype.getCaptionClass = function () {
    return this.id + "_caption_class";
};
/**
 *
 * @returns {string} The class name of the area of the table immediately beneath the main container's header
 */
Table.prototype.getTableCaptionClass = function () {
    return this.id + "_caption_class";
};
/**
 *
 * @returns {string} The class of the area of the table's topmost parent container.
 */
Table.prototype.getTableContainerClass = function () {
    return this.id + "_container_class";
};

/**
 *
 * @returns {string} The class of the area of the table's topmost parent container.
 */
Table.prototype.getTableTrTdFirstChildBeforeClass = function () {
    return this.className + " tr td:first-child::before ";
};

/**
 *
 * @returns {string} The class of the area of the table's topmost parent container.
 */
Table.prototype.getTableTrNotFirstChildClass = function () {
    return this.className + " tr:not(:first-child)";
};

/**
 *
 * @returns {string} The class of the table's pager.
 */
Table.prototype.getPagerClass = function () {
    return this.id + "_pager_class";
};
/**
 *
 * @returns {string} The class of the area of the table's topmost parent container's header.
 */
Table.prototype.getHeaderClass = function () {
    return this.id + "_header_class";
};
/**
 *
 * @returns {String}
 */
Table.prototype.getTableCellClass = function () {
    return this.id + "_tbody_text_class";
};
/**
 *
 * @returns {string} The class name of text on the content footer.
 */
Table.prototype.getContentFooterTextClass = function () {
    return this.id + "_footer_text_class";
};
/**
 *
 * @param {HTMLElement} parent The html element that will be the parent of this table.
 * For replacement purposes, it is advised that the parent should have this table to be its only child
 * @returns {StringBuffer.prototype@pro;dataArray@call;join}
 */
Table.prototype.build = function (parent) {

    this.assignParent(parent);

    let checkMainDiv = document.getElementById(this.getTableContainerId());
    if (checkMainDiv) {
        parent.removeChild(checkMainDiv);
    }

    checkMainDiv = document.createElement("div");
    checkMainDiv.setAttribute("id", this.getTableContainerId());
    addClass(checkMainDiv, this.getTableContainerClass());
    checkMainDiv.appendChild(this.buildHeader());
    let table = this.buildTable();


    for (let key in this.registry) {
        let stl = this.registry[key];
        stl.name = '.'+key;
        updateOrCreateSelectorInStyleSheet(tableSheets , stl);
    }

    if (this.hasContainer === true) {
        checkMainDiv.appendChild(table);
        parent.appendChild(checkMainDiv);
    } else {
        parent.appendChild(table);
    }

    this.makeScrollable();

    let pager = this.pager;
    pager.draw();

    this.buildCalled = true;

};

Table.prototype.buildHeader = function () {

    let headerDiv;
    if (isEmptyText(this.icon)) {
        headerDiv = document.createElement("div");
        headerDiv.setAttribute("id", this.getHeaderID());
        addClass(headerDiv, this.getHeaderClass());
        headerDiv.appendChild(document.createTextNode(this.title));
    } else {
        headerDiv = document.createElement("div");
        headerDiv.setAttribute("id", this.getHeaderID());
        addClass(headerDiv, this.getHeaderClass());
        let img = document.createElement("img");
        img.setAttribute("id", this.getImageId());
        addClass(img, this.getImageClass());
        img.src = this.icon;
        headerDiv.appendChild(img);
        headerDiv.appendChild(document.createTextNode(this.title));
    }


    return headerDiv;
};
Table.prototype.buildContentFooter = function () {

    let mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", this.getContentFooterId());
    addClass(mainDiv, this.getContentFooterClass());
    addClass(mainDiv, "unselectable");
    if (!isEmptyText(this.footerText)) {
        let span = document.createElement("span");
        span.setAttribute("id", this.getContentFooterTextClass());
        addClass(span, this.getContentFooterTextClass());
        span.appendChild(document.createTextNode(this.footerText));
        if (this.hasContainer === false) {
            span.style.paddingLeft = "1em";
        }
        mainDiv.appendChild(span);
    }
    let canvas = this.buildPager();
    this.enablePager(this.pagingEnabled);
    document.body.removeChild(canvas);
    mainDiv.appendChild(canvas);
    this.pager.canvas = canvas;
    return mainDiv;
};
/**
 * A Table function
 * Factory function that produces the HTML output of this
 * javascript brouhaha.
 * @returns {StringBuffer.prototype@pro;dataArray@call;join}
 */
Table.prototype.buildTable = function () {

    let mainDiv = document.createElement('div');
    let tableWrapper = document.createElement('div');
    mainDiv.setAttribute("id", this.getTableContentAreaId());
    addClass(mainDiv, this.getTableContentAreaClass());
    mainDiv.appendChild(this.buildContentHeader());
    mainDiv.appendChild(this.buildRawTable());
    mainDiv.appendChild(this.buildContentFooter());

    return mainDiv;
};


/**
 *
 * A Table function
 * Factory funcion that produces the HTML output of this
 * javascript brouhaha.
 *
 * @returns {Element|Table.prototype.buildRawTable.table}
 */
Table.prototype.buildRawTable = function () {

    let div = document.createElement('div');

    let table = document.createElement('table');
    if (this.id !== null && this.id !== '') {
        table.setAttribute("id", this.id);
    }
    if (this.className !== null && this.className !== '') {
        addClass(table, this.className);
    }

    if (this.hasCaption === true) {
        let caption = table.createCaption();
        addClass(caption, this.getCaptionClass());
        caption.innerHTML = this.caption;
    }
    let rowLen = this.getRowLength();
    let thead = table.createTHead();
    let tbody = table.createTBody();
    let tfoot = table.createTFoot();
    for (let i = 0; i < rowLen; i++) {
        let row = this.rows[i];
        row.setId(this.id + '_' + i);
        if (row.header === true) {
            thead.appendChild(row.getHtml());
        }
        if (row.footer === true) {
            tfoot.appendChild(row.getHtml());
        }
        if (row.header !== true && row.footer !== true) {
            tbody.appendChild(row.getHtml());
        }
    }


    return table;
};
/**
 * Reference... accepted answer on:
 * https://stackoverflow.com/questions/23989463/how-to-set-tbody-height-with-overflow-scroll
 */
Table.prototype.makeScrollable = function () {

    let tbodyStyle = new Style('table#'+this.id + ' > tbody' , []);
    if(this.scrollable === true){
        tbodyStyle.addFromOptions({
            display: 'block',
            height: this.scrollHeight,
            overflow: 'auto',
        });
    }

    let theadAndTRsInTbodyStyle = new Style('table#'+this.id + ' > thead , ' + 'table#'+this.id + " > tbody tr " , []);

    if(this.scrollable === true){
    theadAndTRsInTbodyStyle.addFromOptions({
        display: 'table',
        width: '100%',
        'table-layout': 'fixed'// even columns width , fix width of table too
    });
    }

    let scrollBarWidth = getScrollBarWidth();
    let theadStyle = new Style('table#'+this.id + ' thead',[]);
    if(this.scrollable === true) {
        theadStyle.addFromOptions({
            width: 'calc( 100% - ' + scrollBarWidth + 'px )'// scrollbar is average 1em/16px width, remove it from thead width
        });
    }
    updateOrCreateSelectorsInStyleSheet(tableSheets , [tbodyStyle , theadAndTRsInTbodyStyle, theadStyle]);
};


/**
 *  Generate the ui portion just above the table but still within the
 * content area that contains the table. SearchableTable and GrowableTable
 * work by adding a Search field and a button respectively to this ui-area.
 *
 * @returns {Element|Table.prototype.buildContentHeader.div}
 */
Table.prototype.buildContentHeader = function () {

    let div = document.createElement('div');
    div.setAttribute('id', this.getContentHeaderId());
    addClass(div, this.getContentHeaderClass());
    return div;
};
Table.prototype.buildPager = function () {

    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", this.pager.id);
    addClass(canvas, this.getPagerClass());
    canvas.setAttribute("width", this.pager.canvasWidth);
    canvas.setAttribute("height", this.pager.canvasHeight);
    canvas.appendChild(document.createTextNode("Your browser does not support canvas drawing!"));
    document.body.appendChild(canvas);
    return canvas;
};

Table.prototype.enablePager = function (enable) {
    let elem = document.getElementById(this.pager.id);
    if (elem) {
        if (typeof enable === 'boolean') {
            elem.style.visibility = enable ? 'visible' : 'hidden';
        } else {
            elem.style.visibility = 'hidden';
        }
    }
};

Table.prototype.setFooterText = function (text) {
    document.getElementById(this.getContentFooterTextClass()).textContent = text;
};
/**
 * A 2D array containing data to be loaded on this table.
 * @param {Array} data
 * @returns {undefined}
 */
Table.prototype.loadTable = function (data) {
    if (this.buildCalled === false) {
        let par = document.getElementById(this.parentId);
        if (!par) {
            throw new Error("No valid parent specified for this table!");
        }
        this.build(par);
    }

    this.clear(false, false);
    if (this.is2DArray(data)) {
        this.addRows(data);
    }
};
Table.prototype.loadTableAndHeaders = function (data) {
    if (this.buildCalled === false) {
        let par = document.getElementById(this.parentId);
        if (!par) {
            throw new Error("No valid parent specified for this table!");
        }
        this.build(par);
    }

    this.clear(true, false);
    if (this.is2DArray(data)) {
        this.addRows(data);
    }
};

Table.prototype.reloadHeaders = function () {
    let row = new TableRow(this.headers, true, false);
    row.className = this.id + "_row";

    for (let i = 0; i < this.headers.length; i++) {
        row.tableCells[i].className = this.getTableCellClass();
        row.tableCells[i].addStyle("max-width", "calc( 100% / " + row.tableCells.length + "  )");
    }
    this.rows.shift();//remove the old header
    this.rows.unshift(row);//add the new header
};

Table.prototype.setHeaders = function (headers) {

    if (headers) {
        if (this.isOneDimensionalArray(headers)) {
            this.headers = headers;
        } else {
            throw new Error("Invalid table headers structure found!");
        }
    } else {
        throw new Error("No table headers supplied!");
    }

    this.reloadHeaders();
};

/**
 *
 * @param {type} data A 2d array of textual rows to add to the table.
 * @returns {undefined}
 */
Table.prototype.addRows = function (data) {

    if (this.is2DArray(data)) {

//new TableRow(rw, i === 0, this.hasFooter === true ? (i === options.data.length - 1) : false)

        if (this.rows.length === 0) {
            this.reloadHeaders();
        }


        for (let i = 0; i < data.length; i++) {
            let rw = data[i];
            let row = new TableRow(rw, false, false);
            row.className = this.id + "_row";
            for (let j = 0; j < row.tableCells.length; j++) {
                row.tableCells[j].className = this.getTableCellClass();
                row.tableCells[j].addStyle("max-width", "calc( 100% / " + row.tableCells.length + "  )");
            }
            this.rows.push(row);
        }

        for (let i = 0; i < this.rows.length; i++) {
            let row = this.rows[i];
            row.setHeader(i === 0);
            row.setFooter(this.hasFooter === true ? i === this.rows.length - 1 : false);
        }


        this.notifyDataSetChanged();
    }
};
/**
 * Clears the table contents; also clears the table headers if the supplied
 * parameter is true.
 * @param {type} headersIncluded If true, this function will clear the table headers also.
 * @param {type} autoRefresh If true, this function will call notifyDataSetChanged
 * @returns {undefined}
 */


Table.prototype.clear = function (headersIncluded, autoRefresh) {

    if (typeof headersIncluded === 'boolean') {

        if (headersIncluded === true) {
            this.rows.length = 0;
            this.headers.length = 0;
        } else {
            this.rows.length = 1;
        }

        if (typeof autoRefresh === 'boolean' && autoRefresh === true) {
            this.notifyDataSetChanged();
        }

    }


};
/**
 * Always call this when you have made changes to the underlying data model of this table.
 * @returns {undefined}
 */
Table.prototype.notifyDataSetChanged = function () {
    let table = document.getElementById(this.id);
    if (table && table !== null) {
        let parentNode = table.parentNode;
        let tableHtml = this.buildRawTable().outerHTML; // the new data structure of the table.


        if (table.outerHTML) { //if outerHTML is supported
            table.outerHTML = tableHtml; ///it's simple replacement of whole element with contents of str let
        } else { //if outerHTML is not supported, there is a weird but crossbrowsered trick
            let tmpObj = document.createElement("div");
            tmpObj.innerHTML = '<!--REPLACE THIS-->';
            parentNode.replaceChild(tmpObj, table); //here we placing our temporary data instead of our target, so we can find it then and replace it into whatever we want to replace to
            parentNode.innerHTML = parentNode.innerHTML.replace('<div><!--REPLACE THIS--></div>', tableHtml);
        }

        this.setFooterText("Showing " + (this.rows.length - 1) + " records");
        this.pager.pageNum = this.pageNumber;
        this.pager.pageSize = this.pageSize;
        this.pager.draw();
    }
};
/**
 * A Table function
 * @returns {TableRow}
 */
Table.prototype.getRows = function () {
    return this.rows;
};
/**
 * A Table function
 * @returns {Integer} The number of rows that this table has
 */
Table.prototype.getRowLength = function () {
    return this.rows.length;
};
/**
 * A Table function
 * @returns {jQuery}
 */
Table.prototype.getWidth = function () {
    return $("#" + this.id).css('width');
};
/**
 * A Table function
 * @returns {jQuery}
 */
Table.prototype.getHeight = function () {
    return $("#" + this.id).css('height');
};
/**
 * A Table function
 * @param {Integer} row The row index
 * @returns {TableRow}
 */
Table.prototype.getRowAt = function (row) {
    return this.rows[row];
};
/**
 * A Table function
 * @param {Integer} row The row of the cell
 * @param {Integer} col The col the cell occupies on the row.
 * @returns {object} an Html page element that represents the
 * table cell(td). This is not a jquery element.. to get it, do $(obj)..where
 * obj is what this function returns.
 * Also, only call this function once the page has loaded the table.
 */
Table.prototype.getElementAt = function (row, col) {
    let id = this.getRowAt(row).getCellIdAt(col);
    return document.getElementById(id);
};
/**
 * A Table function
 * @param {Integer} row The row of the cell
 * @param {Integer} col The col the cell occupies on the row.
 * @returns {object} and Html page element that represents the
 * cell. This is not a jquery element.. to get it, do $(obj)..where
 * obj is what this function returns.
 * Also, only call this function once the page has loaded the table.
 */
Table.prototype.getElementIdAt = function (row, col) {
    let id = this.getRowAt(row).getCellIdAt(col);
    return id;
};
/**
 * A Table function
 * @param {Style} style
 * @returns {Style}
 */
Table.prototype.setCaptionStyle = function (style) {
    this.captionStyle = style;
};
/**
 * A Table function
 * @returns {Style} The Style of the Table's caption
 */
Table.prototype.getCaptionStyle = function () {
    return this.captionStyle;
};
/**
 * A Table function
 * @param {Number} cellSpacing
 * @returns {void}
 */
Table.prototype.setCellSpacing = function (cellSpacing) {
    return this.cellspacing = cellSpacing;
};
/**
 * A Table function
 * @param {Number} cellPadding
 * @returns {void}
 */
Table.prototype.setCellPadding = function (cellPadding) {
    return this.cellPadding = cellPadding;
};
/**
 * A Table function
 * @param {Style} style The Table's Style object
 * @returns {undefined}
 */
Table.prototype.setStyle = function (style) {
    this.style = style;
};
/**
 * A Table function
 * @returns {Style} The Table's Style object.
 */
Table.prototype.getStyle = function () {
    return this.style;
};
/**
 * A Table function
 * @param {Boolean} scrollable If true, the Table will try to scroll above a certain height(default is 150px).
 * This height is determined by the scrollHeight property of this Table
 * @returns {undefined}
 */
Table.prototype.setScrollable = function (scrollable) {
    this.scrollable = scrollable;
};
/**
 * A Table function
 * @returns {scrollable} the Table can scroll above a certain height(default is 150px).
 */
Table.prototype.isScrollable = function () {
    return this.style;
};
/**
 * A Table function
 * @param {Boolean} scrollHeight The height above which the table will be forced
 * to scroll(default is 150px).
 * @returns {undefined}
 */
Table.prototype.setScrollHeight = function (scrollHeight) {
    this.scrollHeight = scrollHeight;
};
/**
 * A Table function
 * @returns {scrollable} The height above which the table will be forced
 * to scroll(default is 150px).
 */
Table.prototype.getScrollHeight = function () {
    return this.scrollHeight;
};
/**
 * A Table function
 * @param {string} className The name of the Table's css class if any.
 * @returns {undefined}
 */
Table.prototype.setClassName = function (className) {
    this.className = className;
    let table = document.getElementById(this.id);
    if (this.id && this.id !== null && table && table !== null) {
        table.className = className;
    }
};
/**
 * A Table function
 * @returns {String} The name of the Table's css class
 */
Table.prototype.getClassName = function () {
    return this.className;
};
/**
 * A Table function
 * @param {string} caption The Table's caption string
 * @returns {undefined}
 */
Table.prototype.setCaption = function (caption) {
    this.caption = caption;
};
/**
 * A Table function
 * @returns {String} The Table's caption
 */
Table.prototype.getCaption = function () {
    return this.caption;
};
/**
 * A Table function.<br>
 * <i>Styles a Table</i>
 * @param {string} attr The css attribute
 * @param {string} val The value
 * @returns {undefined}
 */
Table.prototype.addStyleElem = function (attr, val) {
    this.tableStyle.addStyleElement(attr, val);
};
/**
 * A Table function.<br>
 * <i>Styles a Table</i>
 * @param {StyleElement} styleElemObj A StyleElement object
 * @returns {undefined}
 */
Table.prototype.addStyleElemObj = function (styleElemObj) {
    if (StyleElement.prototype.isPrototypeOf(styleElemObj)) {
        this.tableStyle.addStyleElementObj(styleElemObj);
    } else {
        this.tableStyle.addStyleElementCss(styleElemObj);
    }
};
/**
 * A Table function.<br>
 * <i>Styles a Table</i>
 * @param {string} css A a css element e.g. width:100px
 * @returns {undefined}
 */
Table.prototype.addStyleElemCss = function (css) {
    this.tableStyle.addStyleElementCss(css);
};
/**
 * A Table function<br>
 * @param {type} style The StyleElement to remove from the TableRow's stylesheet..supply as StyleElement object.
 * @returns {undefined}
 */
Table.prototype.removeStyleElemObj = function (style) {
    if (StyleElement.prototype.isPrototypeOf(style)) {
        this.tableStyle.removeStyleElementObj(style);
    }
};
/**
 * A Table function<br>
 * @param {string} styleAttr The css attribute to remove from the TableRow's stylesheet e.g.(width)
 * @returns {undefined}
 */
Table.prototype.removeStyleElemCss = function (styleAttr) {
    if (styleAttr) {
        this.tableStyle.removeStyleElementByAttr(styleAttr);
    }
};
/**
 *
 * @param {string} bgColorCssVal1 The text color css of the even rows..0,2,4,6.. e.g. <code>#091123;</code>
 * list.
 * @param {string} bgColorCssVal2 The text color css of the odd rows..1,3,5,7.. e.g. <code>#081123;</code>
 * list.
 *
 */
Table.prototype.alternateBackgroundColors = function (bgColorCssVal1, bgColorCssVal2) {
    for (let i = 0; i < this.rows.length; i++) {
        let row = this.rows[i];
        for (let j = 0; j < row.tableCells.length; j++) {
            let tableCell = row.tableCells[j];
            let style = tableCell.style;
            style.addStyleElementCss('background-color:' + (i % 2 === 0 ? bgColorCssVal1 : bgColorCssVal2) + ';');
        }
    }
};
/**
 *
 * @param {string} fgColorCssVal1 The text color css of the even rows..0,2,4,6.. e.g. <code>#091123;</code>
 * list.
 * @param {string} fgColorCssVal2 The text color css of the odd rows..1,3,5,7.. e.g. <code>#081123;</code>
 * list.
 *
 */
Table.prototype.alternateForegroundColors = function (fgColorCssVal1, fgColorCssVal2) {
    for (let i = 0; i < this.rows.length; i++) {
        let row = this.rows[i];
        for (let j = 0; j < row.tableCells.length; j++) {
            let tableCell = row.tableCells[j];
            let style = tableCell.style;
            style.addStyleElementCss('color:' + (i % 2 === 0 ? fgColorCssVal1 : fgColorCssVal2) + ';');
        }
    }
};
/**
 *
 * @param {string} cssVar$Val The css to apply to all the cells e.g: font-size:10px;
 * The style gets applied to all the table cells.
 *
 */
Table.prototype.applyStyleCssToCells = function (cssVar$Val) {
    for (let i = 0; i < this.rows.length; i++) {
        let row = this.rows[i];
        for (let j = 0; j < row.tableCells.length; j++) {
            let tableCell = row.tableCells[j];
            let style = tableCell.style;
            style.addStyleElementCss(csslet$Val);
        }
    }
};
/**
 * Sets a value directly into a cell... This may be a simple value...or an html sub-layout
 * of what the cell should look like.
 * @param {type} row The index of the row
 * @param {type} column The index of the column
 * @param {type} value The value to set into the cell
 *
 */
Table.prototype.setValueAt = function (row, column, value) {
    this.getRowAt(row).getTableCell(column).setColData(value);
    this.notifyDataSetChanged();
};
/**
 * Gets a value directly from a cell.
 * @param {type} row The index of the row
 * @param {type} column The index of the column
 * @returns {string} The value stored  in the cell.
 *
 */
Table.prototype.getValueAt = function (row, column) {
    return this.getRowAt(row).getTableCell(column).getColData();
};
/**
 * Adds a css style to the main div holding the table
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
Table.prototype.addMainStyle = function (attrName, attrVal) {
    this.mainStyle.addStyleElement(attrName, attrVal);
};
/**
 * Adds a css style to the header of the main div holding the table
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
Table.prototype.addHeaderStyle = function (attrName, attrVal) {
    this.headerStyle.addStyleElement(attrName, attrVal);
};
/**
 * Adds a css style to the table element.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
Table.prototype.addTableStyle = function (attrName, attrVal) {
    this.tableStyle.addStyleElement(attrName, attrVal);
};
/**
 * Adds a css style to the table caption.
 * @param {type} attrName The css attribute name, e.g color
 * @param {type} attrVal The  value of the css attribute, e.g #007700, red, etc.
 * @returns {undefined}
 */
Table.prototype.addCaptionStyle = function (attrName, attrVal) {
    this.captionStyle.addStyleElement(attrName, attrVal);
};

/**
 *
 * @param {string} input The input string to check
 * @returns {Boolean} true if the input contains only
 * white spaces or is null.
 */
function isEmptyText(input) {
    if (!input) {
        return true;
    }
    return !/\S/.test(input);
}
/**
 * This method does same as replaceChild, but it gets the
 * parentElement automatically
 * @param {type} oldChildNode The child node to remove
 * @param {type} newChildNode The new child node to replace the old one
 * @returns {undefined}
 */
function replaceInParent(oldChildNode, newChildNode) {
    let parentNode = oldChildNode.parentNode;
    if (parentNode) {
        if (oldChildNode.outerHTML) { //if outerHTML is supported
            oldChildNode.outerHTML = newChildNode.outerHTML; ///it's simple replacement of whole element with contents of str var
        } else { //if outerHTML is not supported, there is a weird but crossbrowsered trick
            let nodeName = oldChildNode.nodeName.toLowerCase();
            let tmpObj = document.createElement(oldChildNode.nodeName.toLowerCase());
            let rndContent = "RND_" + new Date().getTime();
            tmpObj.innerHTML = '<!--REPLACE RANDOM-CONTENT ON ' + rndContent + '-->';
            parentNode.replaceChild(tmpObj, oldChildNode); //here we placing our temporary data instead of our target, so we can find it then and replace it into whatever we want to replace to


            let outerHtmlHackDiv = document.createElement(newChildNode.nodeName.toLowerCase());
            outerHtmlHackDiv.appendChild(newChildNode);
            let outerHtmlHack = getOuterHtml(newChildNode);
            parentNode.innerHTML = parentNode.innerHTML.replace("<" + nodeName + ">" + tmpObj.innerHTML + "</" + nodeName + ">", outerHtmlHack);
        }
    }
}

/**
 *
 * @param {type} parentNode The node that contains a node to be replaced
 * @param {type} oldChildNode The child node to remove
 * @param {type} newChildNode The new child node to replace the old one.xs
 * @returns {undefined}
 */
function replaceChild(parentNode, oldChildNode, newChildNode) {

    if (oldChildNode.outerHTML) { //if outerHTML is supported
        oldChildNode.outerHTML = newChildNode.outerHTML; ///it's simple replacement of whole element with contents of str var
    } else { //if outerHTML is not supported, there is a weird but crossbrowsered trick
        let nodeName = oldChildNode.nodeName.toLowerCase();
        let tmpObj = document.createElement(oldChildNode.nodeName.toLowerCase());
        let rndContent = "RND_" + new Date().getTime();
        tmpObj.innerHTML = '<!--REPLACE RANDOM-CONTENT ON ' + rndContent + '-->';
        parentNode.replaceChild(tmpObj, oldChildNode); //here we placing our temporary data instead of our target, so we can find it then and replace it into whatever we want to replace to


        let outerHtmlHackDiv = document.createElement(newChildNode.nodeName.toLowerCase());
        outerHtmlHackDiv.appendChild(newChildNode);
        let outerHtmlHack = getOuterHtml(newChildNode);
        parentNode.innerHTML = parentNode.innerHTML.replace("<" + nodeName + ">" + tmpObj.innerHTML + "</" + nodeName + ">", outerHtmlHack);
    }
}


/**
 *
 * @param {HTMLElement} node An element whose outerHTML we need
 * @returns {string}
 */
function getOuterHtml1(node) {
    if (node) {
        let outerHtmlHackElem = document.createElement(node.nodeName.toLowerCase());
        outerHtmlHackElem.appendChild(node);
        let outerHtmlHack = outerHtmlHackElem.innerHTML;
        return outerHtmlHack;
    }
    return null;
}

/**
 *
 * @param {HTMLElement} node An element whose outerHTML we need
 * @returns {string}
 */
function getOuterHtml(node) {
    if (node) {
        let outerHtmlHackElem = null;
        const nodeName = node.nodeName.toLowerCase();
        if (nodeName === 'li') {
            outerHtmlHackElem = document.createElement('ul');
        } else if (nodeName === 'tr') {
            outerHtmlHackElem = document.createElement('table');
        } else if (nodeName === 'td') {
            outerHtmlHackElem = document.createElement('tr');
        } else if (nodeName === 'option') {
            outerHtmlHackElem = document.createElement('select');
        } else {//A div should be able to wrap most of the remaining element types
            outerHtmlHackElem = document.createElement('div');
        }
        outerHtmlHackElem.appendChild(node);
        let outerHtmlHack = outerHtmlHackElem.innerHTML;
        return outerHtmlHack;
    }
    return null;
}