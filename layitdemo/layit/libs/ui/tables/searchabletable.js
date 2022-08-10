
SearchableTable.prototype.constructor = SearchableTable;
SearchableTable.prototype = Object.create(GrowableTable.prototype);



/* global GrowableTable, Table, inputTypes */

/**
 * 
 * This is a growable table that includes a search option.
 * 
 * @param {type} options Normal options of a GrowableTable element. It however allows you
 * to specify additional keys in the options:
 * {
 * ...,
 * "showLeftBtn" : true,
 * "search-label" : "Find",
 * "search-label-color" : "red",
 * "search-field-style" : {
 * //normal-css options.
 * },
 * "search-label-style" : {
 * //normal-css options.
 * },
 * remoteSearch: function(){},
 * onSearchModeToggled: function(){}// toggle the checkbox between online anad offline search
 * }
 * @returns {SearchableTable}
 */
function SearchableTable(options) {
    
    GrowableTable.call(this, options);
    
    if (this.validObject === false) {
        return;
    }

    this.searchLabel = 'Search: ';
    if (typeof options['search-label'] === 'string') {
        this.searchLabel = options['search-label'];
    } else {
        this.searchLabel = "Search: ";
    }
    if (typeof options['search-label-color'] === 'string') {
        this.searchLabelColor = options['search-label-color'];
    } else {
        this.searchLabelColor = "#000000";
    }
    if (typeof options.remoteSearch === 'function') {
       if(options.remoteSearch.length === 1){
        this.remoteSearchFunction = options.remoteSearch;
       }else{
           throw new Error('The remote search function must take one parameter,  the search string');
       }
    } else {
        this.remoteSearchFunction = function () {
            console.log('Please enable remote search function!');
        };
    }
    
    if (typeof options.onSearchModeToggled === 'function') {
       if(options.onSearchModeToggled.length === 1){
        this.onSearchModeToggled = options.onSearchModeToggled;
       }else{
           throw new Error('The onSearchModeToggled function must take one parameter,  the toggle state... true is online, false is offline');
       }
    } else {
        this.onSearchModeToggled = function () {
            console.log('Please enable onSearchModeToggled function!');
        };
    }
    
    
    
    let self = this;
    this.search = new Search(function (searchText, row) {
        for (var j = 0; j < row.length; j++) {
            let col = row[j];
            if (typeof col !== 'string') {
                col += '';
            }
            if (col.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                return true;
            }
        }
        return false;
    }, function (filteredData) {
        self.updateTable(filteredData);
    });

    this.searchLabelStyle = new Style("#" + this.id, []);
    this.searchFieldStyle = new Style("#" + this.id, []);
    this.searchCheckBoxStyle = new Style("#" + this.getSearchCheckBoxClass(), []);

    initSearchLabelStyleCss:{

        var options = {};
        options["float"] = "left";
        options["font-size"] = "0.8em";
        options["margin-right"] = "0.5em",
                options["font-family"] = "\"Open Sans\",sans-serif";
        options["color"] = "black";
        options["font-weight"] = "bold";
        options["height"] = "100%";
        options['padding'] = '0.5em';


        this.searchLabelStyle.addFromOptions(options);





        if (typeof options["search-label-style"] === "object") {
            var searchLabelStyleCss = options["search-label-style"];
            for (var key in searchLabelStyleCss) {
                this.searchLabelStyle.addStyleElement(key, searchLabelStyleCss[key]);
            }
        }
    }

    initSearchFieldStyleCss:{


        this.searchFieldStyle.addFromOptions({
            "float": "left",
            "width": "15em",
            "padding": "0.5em",
            "color": "black",
            "font-size": "0.8em",
            "font-weight": "normal",
            "font-family": "\"Open Sans\",sans-serif",
            "font-style": "italic",
            "border-radius": "0.5em"
        });
        if (typeof options["search-field-style"] === "object") {
            var searchFieldStyleCss = options["search-field-style"];
            for (var key in searchFieldStyleCss) {
                this.searchFieldStyle.addStyleElement(key, searchFieldStyleCss[key]);
            }
        }
    }


    initSearchCheckBoxStyleCss:{
        this.searchCheckBoxStyle.addFromOptions({
            "float": "left",
            "padding": "0.5em",
            "color": "black",
            'margin-left': '0.5em',
            "border-radius": "0.5em"
        });
    }

    this.registry[this.getSearchLabelClass()] = this.searchLabelStyle;
    this.registry[this.getSearchFieldClass()] = this.searchFieldStyle;
    this.registry[this.getSearchCheckBoxClass()] = this.searchCheckBoxStyle;

}


SearchableTable.prototype.getSearchText = function(){
  let field = document.getElementById(this.getSearchFieldClass());
  let txt = field.value;
  return txt;
};

SearchableTable.prototype.inSearchMode = function(){
  let field = document.getElementById(this.getSearchFieldClass());
  let txt = field.value;
  return typeof txt === 'string' && txt.length > 0;
};

SearchableTable.prototype.updateTable = function (data) {
    if (this.search.dataHasHeaders) {
        Table.prototype.loadTableAndHeaders.call(this, data);
    } else {
        Table.prototype.loadTable.call(this, data);
    }
    
    let map = this.listenersMap;
    let self = this;
    
    if(map.size > 0){
        map.forEach(function (func, columnAndType) {
            
            let len , column;
            if( columnAndType.indexOf(inputTypes.BUTTON) > -1){
                 len = inputTypes.BUTTON.length;
                 column = parseInt(columnAndType.substring(len));
                 self.setClickListener(column , func);
            }else if( columnAndType.indexOf(inputTypes.CHECK) > -1){
                 len = inputTypes.CHECK.length;
                 column = parseInt(columnAndType.substring(len));
                 self.setCheckListener(column , func);
            }else if( columnAndType.indexOf(inputTypes.SELECT) > -1){
                    len = inputTypes.SELECT.length;
                    column = parseInt(columnAndType.substring(len));
                    self.setSelectListener(column , func);
            }else if( columnAndType.indexOf(inputTypes.TEXTFIELD) > -1){
                    len = inputTypes.TEXTFIELD.length;
                    column = parseInt(columnAndType.substring(len));
                    self.setTextFieldEnterPressedListener(column , func);
            }
        });
    }
};
/**
 * A 2D array containing data to be loaded on this table.
 * @param {Array} data
 * @returns {undefined}
 */
SearchableTable.prototype.loadTable = function (data) {
    this.search.resetData(data , false);
    Table.prototype.loadTable.call(this, data);
};
SearchableTable.prototype.loadTableAndHeaders = function (data) {
    this.search.resetData(data , true);
    Table.prototype.loadTableAndHeaders.call(this, data);
};


/**
 * Override this function in Table to insert the button to the content-header.
 * Generate the ui portion just above the table but still within the 
 * content area that contains the table. SearchableTable and GrowableTable
 * work by adding a Search field and a button respectively to this ui-area.
 * @returns {unresolved}
 */
SearchableTable.prototype.buildContentHeader = function () {
    let div = GrowableTable.prototype.buildContentHeader.call(this);
    div.appendChild(this.buildSearchArea());
    return div;
};

/**
 * A Table function
 * Generates the button above the table.
 * @returns {StringBuffer.prototype@pro;dataArray@call;join}
 */
SearchableTable.prototype.buildSearchArea = function () {

    var div = document.createElement("div");

    div.style.float = "right";
    div.style.display = 'flex';
    div.style.alignItems = 'center';


    var span = document.createElement("span");
    addClass(span, this.getSearchLabelClass());
    span.appendChild(document.createTextNode(this.searchLabel));



    var check = document.createElement("input");
    check.type = "checkbox";
    check.setAttribute("id", this.getSearchCheckBoxClass());
    addClass(check, this.getSearchCheckBoxClass());
    check.checked = false;

    var input = document.createElement("input");
    input.type = "search";
    input.setAttribute("id", this.getSearchFieldClass());
    addClass(input, this.getSearchFieldClass());
    input.placeholder = "Search Table";

    div.appendChild(span);
    div.appendChild(input);
    div.appendChild(check);

    let self = this;

    input.addEventListener('input', function (e) {
            let val = input.value;
        if (!check.checked) {
            self.search.find(val);
        } else {
            self.remoteSearchFunction(val);
        }

    });

    check.addEventListener('change', function (e) {
        if (e.currentTarget.checked) {
            input.placeholder = 'Search Online';
        } else {
            input.placeholder = 'Search Table';
            self.pager['pageNum'] = self.pageNumber = 0;
        }
        self.onSearchModeToggled(e.currentTarget.checked);
    });


    return div;



};
SearchableTable.prototype.getSearchFieldClass = function () {
    return this.id + "_search_field_class";
};
SearchableTable.prototype.getSearchCheckBoxClass = function () {
    return this.id + "_search_checkbox_class";
};
SearchableTable.prototype.getSearchLabelClass = function () {
    return this.id + "_search_label_class";
};



const SearchModes = {
    /**
     * The user has just stated typing in the field
     */
    STARTING: 1,
    /**
     * No search, the resting mode of the field
     */
    NORMAL: 2,
    /**
     * The user is actively searching.
     */
    SEARCH: 3,
    /**
     * The user has stopped searching the adapter, so we can switch back to
     * normal mode.
     */
    ENDING: 4
};

/**
 * 
 * @param {Function} matcher A function that represents the search criteria.
 * The matcher function should look like:
 * <code>function matcher(String searchText, Object searchableItem){} It should return a boolean.</code>
 * @param {Function} updater A function used to update the interface when the search is done.
 * The updater function should look like:
 * <code>function update(Array data){}</code>
 * The data obtained from the search results. Display in your view model/user interface
 * @returns {Search}
 */
function Search(matcher, updater) {
    this.searchMode = SearchModes.NORMAL;
    this.backupData = [];
    this.data = [];

    this.dataHasHeaders = false;

    if (typeof matcher !== 'function') {
        throw new Error('If you are supplying a callback, then it has to be a function!');
    }
    if (matcher.length !== 2) {
        throw new Error('Your matcher function should have only 2 parameter, the params are the searchText and the current item being searched');
    }
    if (typeof updater !== 'function') {
        throw new Error('If you are supplying a callback, then it has to be a function!');
    }
    if (updater.length !== 1) {
        throw new Error('Your updater function should have only 1 parameter, the param must be an array of the filtered data');
    }

    this.matcher = matcher;
    this.updater = updater;
}

Search.prototype.isStarting = function (searchMode) {
    return searchMode === SearchModes.STARTING;
};
Search.prototype.isNormal = function (searchMode) {
    return searchMode === SearchModes.NORMAL;
};
Search.prototype.isSearch = function (searchMode) {
    return searchMode === SearchModes.SEARCH;
};
Search.prototype.isEnding = function (searchMode) {
    return searchMode === SearchModes.ENDING;
};

Search.prototype.setSearchMode = function (searchMode) {

    switch (searchMode) {
        case SearchModes.STARTING:
            this.backupData = [];
            //Array.prototype.push.apply(this.backupData, this.data);
            this.backupData = this.data;
            this.data = [];
            searchMode = SearchModes.SEARCH;
            break;
        case SearchModes.ENDING:
            if (this.backupData.length > 0) {
                this.data = [];
                //Array.prototype.push.apply(this.data, this.backupData);
                this.data = this.backupData;
                this.backupData = [];
                this.updater(this.data);
            }
            searchMode = SearchModes.NORMAL;
            break;

        default:
            break;
    }
    this.searchMode = searchMode;
};
/**
 * 
 * @param {type} data
 * @param {boolean} dataHasHeaders If true, treat the first row or item of the supplied data as an header row... 
 * so that row is not searched. So it will always return the first row or item regardless of the matcher function.
 * @returns {undefined}
 */
Search.prototype.resetData = function (data, dataHasHeaders) {
    this.backupData = [];
    this.dataHasHeaders = (typeof dataHasHeaders === 'boolean') && dataHasHeaders;
    this.searchMode = SearchModes.NORMAL;
    this.data = data;
};

Search.prototype.setData = function (data) {
    this.data = data;
    this.updater(data);
};

/**
 *
 * @param searchText The text to search
 */
Search.prototype.find = function (searchText) {
    if (typeof searchText !== 'string') {
        throw new Error('The search text must be a string! error: `' + searchText + '`');
    }

    if (searchText.length === 0) {
        this.setSearchMode(SearchModes.ENDING);
        return;
    }
    if (this.isNormal(this.searchMode)) {
        this.setSearchMode(SearchModes.STARTING);
    }

    let foundData = [];
    if (this.dataHasHeaders === true) {
        if (this.backupData.length > 0) {
            foundData.push(this.backupData[0]);
        }
    }
    for (let i = (this.dataHasHeaders ? 1 : 0); i < this.backupData.length; i++) {
        let t = this.backupData[i];
        if (this.matcher(searchText, t)) {
            foundData.push(t);
        }
    }

    this.setData(foundData);
};
    