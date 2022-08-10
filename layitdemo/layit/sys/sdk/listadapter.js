/* global attrKeys, ListView, styleSheet */

const PROTO_LI_ID = "proto_item";
let cachedDiv;
/**
 *
 * @param list The layit List which encapsulates an html list
 * @param callback A function that runs when the adapter has loaded and rendered the list data
 * @constructor
 */
function ListAdapter(list, callback) {

    if (list && list instanceof ListView) {
        let self = this;
        this.data = null;
        this.adapterViewId = null;
        this.viewTypeCount = 0;
        this.protoLi = null;
        this.adapterViewInstanceName = list.constructor.name;
        this.protoStylesMap = new Map();
        /**
         * view cell ids are mapped to a particular prototype cell id
         * The view cell id is the key, the prototype cell id is the value
         */
        this.cellRegistry = new Map();
        /**
         * Necessary for styling the cells generated from the prototype
         */
        this.protoClassName = null;
        this.viewTemplates = [];// the key is the viewtype , the value is the template to use for that view type
        self.bind(list, callback);
    } else {
        //make sure you call setAdapter on ListView or subclass if you didn't specify list in adapter's constructor
    }

}

ListAdapter.prototype.bind = function (list, callback) {
    if (!list) {
        throw new Error('Please specify a ListView|HorizontalListView|GridView for this adapter');
    }
    if (!(list instanceof ListView)) {
        throw new Error('No ListView|HorizontalListView|GridView specified for this adapter');
    }
    let self = this;
    this.data = list.data;
    this.adapterViewInstanceName = list.constructor.name;
    this.adapterViewId = list.htmlElement.id;
    this.viewTypeCount = list.itemViews.length;
    this.protoLi = null;
    /**
     * view cell ids are mapped to a particular prototype cell id
     * The view cell id is the key, the prototype cell id is the value
     */
    this.cellRegistry = new Map();
    this.protoStylesMap = new Map();
    this.viewTemplates = [];// the key is the viewtype , the value is the template to use for that view type
    this.fetchPrototypeCells(list, function () {
        self.notifyDataSetChanged(list.htmlElement);
        callback();
    });
};

ListAdapter.prototype.protoListItemId = function () {
    return this.adapterViewId + "_li_" + PROTO_LI_ID;
};


/**
 * Uses a quick hack to retrieve the width and height of the root element(<ConstrainLayout/>) in a layit layout
 *  xml document
 * @param {type} layoutXML
 * @returns {undefined}
 */
function getRootDimensions(layoutXML) {

    let index = layoutXML.indexOf("<" + xmlKeys.root);
    let closeTagIndex = layoutXML.indexOf(">", index + xmlKeys.root.length);

    let rootTagString = layoutXML.substring(index, closeTagIndex + 1);

    let arr = new Scanner(rootTagString, false, ["\"", "'", "=", "\r\n", "  "]).scan();
    let w, h;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].trim() === "width") {
            w = arr[i + 1];
        }
        if (arr[i].trim() === "height") {
            h = arr[i + 1];
        }
    }

    return {
        width: w,
        height: h
    };
}
/**
 * Fetch all template cells at the beginning
 * @param list The ListView intance that has prototype cells(they are in the list.itemViews array)
 * @param callback Call this function once all template cells have been loaded.
 */
ListAdapter.prototype.fetchPrototypeCells = function (list, callback) {
    let self = this;
    let itemViews = list.itemViews;
    let load = function (index) {
        let template = itemViews[index];
        let protoLi = document.createElement('li');
        protoLi.setAttribute(attrKeys.id, self.protoListItemId());
        list.htmlElement.appendChild(protoLi);
        self.protoLi = protoLi;

        getWorkspace({
            layoutName: template,
            bindingElemId: self.protoListItemId(),
            isTemplate: true,
            onLayoutLoaded: function (fileName, xml) {

            },
            onComplete: function (rootView) {
                self.viewTemplates.push(rootView);
                index++;
                if (index < itemViews.length) {
                    load(index);
                } else {
                    protoLi.remove();
                    if (callback) {
                        if (typeof callback === "function") {
                            callback();
                        } else {
                            throw new Error('The callback should be a function!');
                        }
                    } else {
                        throw new Error('Please supply a callback function to indicate when all views have been loaded');
                    }
                }
            }
        });
    };
    load(0);
};

ListAdapter.prototype.makeCell = function (adapterView, viewType) {
    if (typeof viewType === "undefined") {
        throw new Error('Please specify a view type...');
    }
    if (typeof viewType !== "number") {
        throw new Error('The view type should be a number');
    }

    let self = this;
    let htmlElement = adapterView;

    let childrenCount = adapterView.getElementsByTagName("li").length;
    let rootView = self.viewTemplates[viewType];
    let li = document.createElement('li');
    li.setAttribute('id', this.adapterViewId + "_li_" + childrenCount);

    let clone = rootView.htmlElement.cloneNode(true);

    let cellWidth = clone.style.width;
    let cellHeight = clone.style.height;
    li.style.width = cellWidth;
    li.style.height = cellHeight;

    let cloneId = clone.id + "_" + childrenCount;
    clone.setAttribute(attrKeys.id, cloneId);

    renameIds(clone, childrenCount, cloneId, this.protoStylesMap, this.cellRegistry);
    li.appendChild(clone);
    htmlElement.appendChild(li);

    return li;
};

/**
 * May be called with or without the html list param.
 * If not called, the method will search for the list in the DOM
 * If you make any changes to the data supplied to this adapter,
 * call this method to refresh the list, so it reflects the updated data.
 * @param {ListView} list 
 */
ListAdapter.prototype.notifyDataSetChanged = function (list) {
    //choose the one that first returns a value. If dev didnt supply the html list, then search for it in the DOM.
    let adapterView = list || document.getElementById(this.adapterViewId);

    adapterView.innerHTML = "";
    this.build(adapterView);
};

ListAdapter.prototype.getItem = function (i) {
    return this.data[i];
};

ListAdapter.prototype.getItemViewType = function (i) {
    return 0;
};

ListAdapter.prototype.getViewTypeCount = function () {
    return this.viewTypeCount;
};
ListAdapter.prototype.isEmpty = function () {
    return this.getCount() === 0;
};

/**
 *
 * @returns {number} The number of items in the dataset we are presenting.
 */
ListAdapter.prototype.getCount = function () {
    return this.data.length;
};
/**
 * Ooverride this to bind(apply) the data to the view
 * @param pos The index where this view will reside on the ul
 * @param view The created customized li
 */
ListAdapter.prototype.bindData = function (pos, view) {

};

/**
 * Upgrade to recyclerview in future
 * @param adapterView The ListView instance
 * @param pos The index of the view in the list
 * @returns {*|HTMLLIElement}
 */
ListAdapter.prototype.getView = function (adapterView, pos) {
    let viewType = this.getItemViewType(pos);
    let li = this.makeCell(adapterView, viewType);
    this.bindData(pos, li);
    return li;
};
/**
 * Build the ListView's cells
 * @param list The ListView instance
 * @returns {*|HTMLLIElement}
 */
ListAdapter.prototype.build = function (list) {
    for (let i = 0; i < this.data.length; i++) {
        let li = this.getView(list, i);
    }
};
/**
 *
 * @param li The parent li of this child view
 * @param viewId The id of the child in the layit xml file.
 * @returns {HTMLElement} The html view for the cell... the direct child of the li
 */
ListAdapter.prototype.getChildView = function (li, viewId) {
    let rootView = li.firstChild;
    let id = rootView.getAttribute(attrKeys.id);
    return document.getElementById(id + "_" + viewId);
};
/**
 * Takes an array of html elements whose data were changed in a cell and runs some quick
 * recalculations on them to be sure the UI still looks okay
 * @param {HtmlLIElement} li 
 * @param {number} pos The index of the li 
 * @param {Array} updatedViews
 * @returns {undefined}
 */
ListAdapter.prototype.repaint = function (li, pos, updatedViews) {
    if (isOneDimArray(updatedViews)) {
        for (let i = 0; i < updatedViews.length; i++) {
            let v = updatedViews[i];
            let sz = computeTextSize(v.textContent, getComputedStyle(v).font);
            v.style.width = sz.width + 'px';
            v.style.height = sz.height + 'px';
        }
        let viewType = this.getItemViewType(pos);

        let rootView = this.viewTemplates[viewType];

        rephraseCellVFL(rootView, updatedViews, this.cellRegistry);
        let adapterView = li.parentElement;
        adapterView.appendChild(this.protoLi);
        autoLayout(this.protoLi, rootView.templateConstraints);
        autoLayout(rootView.htmlElement, rootView.constraints);


        let babyRootView = li.firstChild;

        let applyStyle = function (dest, src) {
            if (isDomEntity(dest)) {
                if (isDomEntity(src)) {
                    dest.style.width = src.style.width;
                    dest.style.height = src.style.height;
                    dest.style.transform = src.style.transform;
                    dest.style.webkitTransform = src.style.webkitTransform;
                    dest.style.cssText = src.style.cssText;
                } else {
                    throw new Error("The `src` must be a valid html element");
                }
            } else {
                throw new Error("The `dest` must be a valid html element");
            }
        };
        applyStyle(babyRootView, rootView.htmlElement);

        for (let i = 0; i < updatedViews.length; i++) {
            let v = updatedViews[i];
            let id = this.cellRegistry.get(v.getAttribute(attrKeys.id));
            let orig = document.getElementById(id);
            applyStyle(v , orig);
        }
        this.protoLi.remove();
    } else {
        throw new Error("The input array must be a one dimensional array..." + updatedViews);
    }
};

/**
 *
 * Processes an html node that represents a generated view and produces reusable duplicates with changed ids.
 * A template view is one which can be reused in a list or other recurring structure
 * @param {Node} htmlNode
 * @param {Number} index
 * @param {string} rootNodeId The id of the root node that is the root parent of all the children
 * @param {Map} stylesMap 
 * @param {Map} cellRegistry 
 * @returns {undefined}
 */
let renameIds = function (htmlNode, index, rootNodeId, stylesMap, cellRegistry) {
    if (htmlNode.hasChildNodes()) {
        let childNodes = htmlNode.childNodes;
        for (let j = 0; j < childNodes.length; j++) {
            let childNode = childNodes[j];
            if (childNode.nodeName !== '#text' && childNode.nodeName !== '#comment') {
                let childId = childNode.getAttribute(attrKeys.id);
                let newId = rootNodeId + "_" + childId;
                cellRegistry.set(newId, childId);
                childNode.setAttribute(attrKeys.id, newId);
                let checkStyle = stylesMap.get(childId);
                if (!checkStyle) {
                    let style = getStyle(styleSheet, '#' + childId);
                    let clonedStyle = style.clone('.' + childId);
                    stylesMap.set(childId, clonedStyle);
                    updateOrCreateSelectorInStyleSheet(styleSheet, clonedStyle);
                }
                addClass(childNode, childId);
                renameIds(childNode, index + 1, rootNodeId, stylesMap);
            }
        }//end for loop
    }
};


/**
 * 
 * @param {View} rootView
 * @param {Array} changedViews An array of updated cells in a li's root view
 * @param {Map} cellRegistry key is generated id for cell items, value is the layit id of the original component in xml
 * @returns {undefined}
 */
let rephraseCellVFL = function (rootView, changedViews, cellRegistry) {
    let vfl = rootView.constraints;
    // console.log('rootView: ', rootView);
    // console.log('rootView.constraints: ', rootView.constraints);

    for (let i = 0; i < vfl.length; i++) {
        let comd = vfl[i];
        if (!comd || comd.length === 0) {
            continue;
        }
        comd = cloneText(vfl[i]);

        let array = comd.split('\n');
        //  console.log('raw command: ', comd, ' , command-array: ', array);
        let newArr = [];
        for (let k = 0; k < array.length; k++) {
            let cmd = array[k].trim();

            if (startsWith(cmd, 'H:')) {//use horizontal params
                let ind = cmd.indexOf("(==", k);
                if (ind !== -1) {
                    let commaInd = cmd.indexOf(",", ind);
                    if (commaInd === -1) {//id(==widVal)
                        let closeBracInd = cmd.indexOf(")", ind);
                        if (closeBracInd === -1) {
                            throw new Error('Invalid vfl: `' + cmd + '`');
                        }

                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl");
                        }
                        let id = cmd.substring(idx + 1, ind);


                        for (let j = 0; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let w = view.style.width;
                                if (endsWith(w, "px")) {
                                    w = parseInt(w);
                                }
                                cmd = cmd.substring(0, ind + 3) + w + cmd.substring(closeBracInd);
                                break;
                            }
                        }
                        //updated or not, store the cmd             
                        newArr.push(cmd);

                    } else {//id(==widVal,<=....)

                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl");
                        }
                        let id = cmd.substring(idx + 1, ind);
                        let j = 0;
                        for (; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let w = view.style.width;
                                if (endsWith(w, "px")) {
                                    w = parseInt(w);
                                }
                                cmd = cmd.substring(0, ind + 3) + w + cmd.substring(commaInd);
                                break;
                            }
                        }
                        //updated or not, store the cmd
                        newArr.push(cmd);

                    }
                } else {
                    ind = cmd.indexOf("(", k);

                    if (ind === -1) {//No (== and (... the production must be like: H:|-margin-[id]
                        newArr.push(cmd);
                        continue;
                    }
                    let commaInd = cmd.indexOf(",", ind);// search for H:...id(wid,<=...)
                    if (commaInd === -1) {//id(widVal)
                        let closeBracInd = cmd.indexOf(")", ind);
                        if (closeBracInd === -1) {
                            throw new Error('Invalid vfl found here!...' + cmd);
                        }
                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl..." + cmd + ", no `[` found");
                        }
                        let id = cmd.substring(idx + 1, ind);

                        for (let j = 0; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let w = view.style.width;
                                if (endsWith(w, "px")) {
                                    w = parseInt(w);
                                }
                                cmd = cmd.substring(0, ind + 1) + w + cmd.substring(closeBracInd);
                                break;
                            }
                        }
                        //updated or not, store the cmd           
                        newArr.push(cmd);
                    } else {//id(widVal,<=....)

                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl...");
                        }
                        let id = cmd.substring(idx + 1, ind);
                        let j = 0;
                        for (; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let w = view.style.width;
                                if (endsWith(w, "px")) {
                                    w = parseInt(w);
                                }
                                cmd = cmd.substring(0, ind + 1) + w + cmd.substring(commaInd);
                                break;
                            }
                        }
                        //updated or not, store the cmd
                        newArr.push(cmd);
                    }
                }
            }//end if
            else if (startsWith(cmd, 'V:')) {//use horizontal params
                let ind = cmd.indexOf("(==", k);
                if (ind !== -1) {
                    let commaInd = cmd.indexOf(",", ind);
                    if (commaInd === -1) {//id(==widVal)
                        let closeBracInd = cmd.indexOf(")", ind);
                        if (closeBracInd === -1) {
                            throw new Error('Invalid vfl: `' + cmd + '`');
                        }

                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl");
                        }
                        let id = cmd.substring(idx + 1, ind);

                        for (let j = 0; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let h = view.style.height;
                                if (endsWith(h, "px")) {
                                    h = parseInt(h);
                                }
                                cmd = cmd.substring(0, ind + 3) + h + cmd.substring(closeBracInd);
                                break;
                            }
                        }

                        newArr.push(cmd);

                    } else {//id(==widVal,<=....)

                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl");
                        }
                        let id = cmd.substring(idx + 1, ind);
                        let j = 0;
                        for (; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let h = view.style.height;
                                if (endsWith(h, "px")) {
                                    h = parseInt(h);
                                }
                                cmd = cmd.substring(0, ind + 3) + h + cmd.substring(commaInd);
                                break;
                            }
                        }
//updated or not, store the cmd
                        newArr.push(cmd);

                    }
                } else {
                    ind = cmd.indexOf("(", k);

                    if (ind === -1) {//No (== and (... the production must be like: V:|-margin-[id]
                        newArr.push(cmd);
                        continue;
                    }
                    let commaInd = cmd.indexOf(",", ind);// search for H:...id(wid,<=...)
                    if (commaInd === -1) {//id(widVal)
                        let closeBracInd = cmd.indexOf(")", ind);
                        if (closeBracInd === -1) {
                            throw new Error('Invalid vfl found here!...' + cmd);
                        }
                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl..." + cmd + ", no `[` found");
                        }
                        let id = cmd.substring(idx + 1, ind);

                        for (let j = 0; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let h = view.style.height;
                                if (endsWith(h, "px")) {
                                    h = parseInt(h);
                                }
                                cmd = cmd.substring(0, ind + 1) + h + cmd.substring(closeBracInd);
                                break;
                            }
                        }
                        //The id might be present in a vfl that is not being updated! do not discard, re-store it!             
                        newArr.push(cmd);
                    } else {//id(widVal,<=....)

                        let idx = cmd.indexOf("[");
                        if (idx === -1) {
                            throw new Error("Couldn't parse vfl...");
                        }
                        let id = cmd.substring(idx + 1, ind);
                        let j = 0;
                        for (; j < changedViews.length; j++) {
                            if (id === cellRegistry.get(changedViews[j].getAttribute(attrKeys.id))) {
                                let view = changedViews[j];
                                let h = view.style.height;
                                if (endsWith(h, "px")) {
                                    h = parseInt(h);
                                }
                                cmd = cmd.substring(0, ind + 1) + h + cmd.substring(commaInd);
                                //vfl[i] = cmd;
                                newArr.push(cmd);
                                break;
                            }
                        }
                        //updated or not, store the cmd
                        newArr.push(cmd);
                    }
                }
            }//end else if
            else if (startsWith(cmd, 'C:')) {
                newArr.push(cmd);
            }
        }
        vfl[i] = newArr.join('\n');
        //console.log('<<<<<<input-command: ', comd, ' , output-command: ', vfl[i], ">>>>>>");
        newArr = null;

    }//end for loop
    rootView.constraints = vfl;

};

/**
 * Calculates the size of the text.
 * @param {string} text The text
 * @param {string} font The font of the text
 * @returns {Object}
 */
let computeTextSize = function (text, font) {
    if (!cachedDiv) {
        cachedDiv = document.createElement('span');
        document.body.appendChild(cachedDiv);
        let style = new Style('span#caching_div_for_314159_271828_1828', []);
        style.addFromOptions({
            position: 'absolute',
            visibility: 'hidden',
            height: 'auto',
            width: 'auto',
            font: font,
            'white-space': 'nowrap'
        });
        style.applyInline(cachedDiv);
    }
    if (cachedDiv.style.font !== font) {
        cachedDiv.style.font = font;
    }
    cachedDiv.textContent = text;

    let w = (cachedDiv.clientWidth + 1);
    let h = (cachedDiv.clientHeight + 1);

    return {
        width: w, height: h
    };

};