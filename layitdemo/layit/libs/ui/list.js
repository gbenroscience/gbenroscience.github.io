
const LIST_VERTICAL = 1;
const LIST_HORIZONTAL = 2;
/**
 * 
 * @param {type} options The options used to define the list
 * 
 * {
 *  id : "blablabla", 
 *  width: "10em",
 *  height: "15em",
 *  "background-color" : "#aaaaaa",
 *  "item-background-color" : "#bbbbbb",
 *  
 *  orientation : 1, (may be 1(vertical) or 2(horizontal) 
 *  data : [],
 *  viewmodel : function(){},
 *  main-style : {},
 *  list-style : {},
 *  item-style : function(){}
 *  
 *  
 * }
 * 
 * @returns {undefined}
 */
function List(options) {
    let self = this;
  
    if (typeof options === 'undefined') {
         throw new Error("Please define list parameters");
    }

    if (typeof options.id === "undefined") {
        throw new Error("List id not specified");
    }
    this.id = options.id;
    if (Object.prototype.toString.call(options.data) !== '[object Array]') {
        this.data = [];
    } else {
        this.data = options.data;
    }

    if (typeof options.orientation !== "number") {
        this.orientation = LIST_VERTICAL;
    }

    this.orientation = options.orientation;
    if (!options.width || typeof options.width === 'undefined') {
        if (this.orientation === LIST_HORIZONTAL) {
            options.width = "15em";
        } else {
            options.width = "7em";
        }
    }
    this.width = options.width;
    if (!options.height || typeof options.height === 'undefined') {
        if (this.orientation === LIST_HORIZONTAL) {
            options.height = "3em";
        } else {
            options.height = "20em";
        }
    }
    this.height = options.height;
    
    if (!options.viewmodel || {}.toString.call(options.viewmodel) !== '[object Function]') {

        options.viewmodel = function (index) {
            let modelItem = self.data[index];
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(modelItem));
            return li;
        };
    }
    if(options.viewmodel && {}.toString.call(options.viewmodel) === '[object Function]' ){
        if(options.viewmodel.length !== 1){
            throw new Error('Your viewmodel should have only 1 argument, please.');
        }
    }
    this.viewmodel = options.viewmodel;
    if (typeof options["background-color"] === 'undefined') {
        options["background-color"] = "black";
    }
    if (typeof options["item-background-color"] === 'undefined') {
        options["item-background-color"] = "black";
    }
    
     
    
    if (!options.onItemClick || {}.toString.call(options.onItemClick) !== '[object Function]') {

        options.viewmodel = function (index) {
            let modelItem = self.data[index];
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(modelItem));
            return li;
        };
    }
    this.onItemClick = options.onItemClick;
    
 
    this.mainStyle = new Style("#" + this.id + "_main_style", []);
    this.navStyle = new Style("#" + this.id + "_nav_style", []);
    this.listStyle = new Style("#" + this.id + "_list_style", []);
    this.itemStyle = new Style("#" + this.id + "_item_style", []);
    
    initMainStyleCss:{ 
        this.mainStyle.addFromOptions({
            "float": "left",
            'display': 'flex',
            'justify-content': 'flex-end',
            'flex-direction': 'column',
            "width": self.width,
            "height": self.height,
            "font-weight": "bold",
            "background-color": options["background-color"],
            "color": "#000000",
            "font-size": "1.0em",
            "font-family": "\"Open Sans\",sans-serif"
        });
        if (typeof options["main-style"] === "object") {
            let mainStyleCss = options["main-style"];
            for (let key in mainStyleCss) {
                this.mainStyle.addStyleElement(key, mainStyleCss[key]);
            }
        }
    }


    initNavStyleCss:{ 
        this.navStyle.addFromOptions({
            "display": "table",
            margin: "0 auto"
        });
        if (typeof options["nav-style"] === "object") {
            let navStyleCss = options["nav-style"];
            for (let key in navStyleCss) {
                this.navStyle.addStyleElement(key, navStyleCss[key]);
            }
        }
    }

    initListStyleCss:{ 
        this.listStyle.addFromOptions({
            "padding-right": "1em",
            "font-weight": "bold",
            "list-style": "none",
            "list-style-type": "none", 
            "text-align": "center"
        });
        if ( typeof options["list-style"] === 'object' ) {
            let listStyleCss = options["list-style"];
            for (let key in listStyleCss) {
                this.listStyle.addStyleElement(key, listStyleCss[key]);
            }
        }
    }


    initItemStyleCss:{
        if (this.orientation === LIST_HORIZONTAL) {
            this.itemStyle.addFromOptions({
                "display": "inline-block",
                color: "#ffffff",
                "background-color": options["item-background-color"],
                "font-size": "1.0em",
                "padding-left": "1em",
                "padding-right": "1em",
                "padding-top": "0.5em",
                "padding-bottom": "0.5em",
                "text-align" : "center"
            });
        } else {
            this.itemStyle.addFromOptions({
                color: "#ffffff",
                "background-color": options["item-background-color"], 
                "font-size": "1.0em",
                "padding-left": "0.3em" 
            });
        }
     
        
        this.itemStyle.addFromOptions({
            '-moz-user-select': '-moz-none',
            '-khtml-user-select': 'none',
            '-webkit-user-select': 'none',
            '-ms-user-select': 'none', 
            "border-bottom" : "5px solid transparent",
            'user-select' : 'none'
        });
        


        if (typeof options["item-style"] === "object") {
            let itemStyleCss = options["item-style"];
            for (let key in itemStyleCss) {
                this.itemStyle.addStyleElement(key, itemStyleCss[key]);
            }
        }
    }





    let a1 = this.getListItemClass();
    let a2 = this.getContainerDivClass();
    let a3 = this.getNavClass();
    this.registry = {};
    this.registry[this.id] = this.listStyle;
    this.registry[a1] = this.itemStyle;
    this.registry[a2] = this.mainStyle;
    this.registry[a3] = this.navStyle;
}


List.prototype.build = function (parent) {

    let self = this;

    let list = document.getElementById(this.id);
    let checkMainDiv = document.getElementById(this.getContainerDivClass());
    
    if (checkMainDiv) {
       parent.removeChild(checkMainDiv);
    }

    let mainDiv = document.createElement('div');
    parent.appendChild(mainDiv);
    mainDiv.setAttribute("id", this.getContainerDivClass());
    this.addClass(mainDiv, this.getContainerDivClass());

    let nav = document.createElement('div');
    mainDiv.appendChild(nav);
    nav.setAttribute("id", this.getNavClass());
    this.addClass(nav, this.getNavClass());


    list = document.createElement('ul');
    nav.appendChild(list);
    list.setAttribute("id", this.id);
    this.addClass(list, this.id);


    let liActive = {
        "background-color": list.style.backgroundColor,
        opacity: "0.8",
        cursor: "pointer",
        border : "2px solid "+this.itemStyle.getValue("color")
    };
    
    liActive["border-bottom"] = "5px solid "+this.itemStyle.getValue("color");

    let liHover = {
        "background-color": list.style.backgroundColor,
        opacity: "0.3",
        cursor: "pointer"
    };
      
    
    
    let liHoverClass = this.getListItemClass() + ":hover";
    let liActiveClass = this.getActiveClass();

    let activeStyle = new Style("#" + this.id + "_item_active_style", []);
    let hoverStyle = new Style("#" + this.id + "_item_hover_style", []);
    
    activeStyle.addFromOptions(liActive);
    hoverStyle.addFromOptions(liHover);
    
    this.registry[liHoverClass] = hoverStyle;
    this.registry[liActiveClass] = activeStyle;

    for (let i = 0; i < this.data.length; i++) {
        let li = this.viewmodel(i);
     
        list.appendChild(li);
        
          this.addClass(li, this.getListItemClass()); 
    
    }

    let ul = document.getElementById(this.id);
    let items = ul.getElementsByTagName("li");
     for (let i = 0; i < items.length; i++) {

         let li = items[i];
        li.onclick = function (e){
            let listitem = e.target;
            let nodes = Array.prototype.slice.call( list.children );
            let index = nodes.indexOf(listitem);
            
             self.selectItem(listitem);
            self.onItemClick( index , listitem);   
        }; 
        if(i===0){
            this.selectItem(li);
        }
    }




    let style = document.createElement('style');
    style.type = 'text/css';
    let css = new StringBuffer();
    for (let key in this.registry) {
        css.append(this.registry[key].styleSheetEntry("." + key));
    }

    style.innerHTML = css.toString();
    document.getElementsByTagName('head')[0].appendChild(style);
};



List.prototype.selectItem = function (li) {

    let ul = document.getElementById(this.id);
    let items = ul.getElementsByTagName("li");
 
  for(let i=0; i < items.length; i++){
      items[i].classList.remove( this.getActiveClass() );
  } 
       li.classList.add(this.getActiveClass());
};

/**
 * 
 * @returns {string} The class name for the active selector
 */
List.prototype.getActiveClass = function () {
    return this.id + "_active_li";
};
/**
 * 
 * @returns {string} The class name of the main div
 */
List.prototype.getContainerDivClass = function () {
    return this.id + "_main_container";
};
/**
 * 
 * @returns {string} The class name of the list items
 */
List.prototype.getListItemClass = function () {
    return this.id + "_list_item";
};
/**
 * 
 * @returns {string} The class name of the nav
 */
List.prototype.getNavClass = function () {
    return this.id + "_nav_container";
};
List.prototype.addClass = function (element, className) {

    let arr = element.className.split(" ");
    if (arr.indexOf(className) === -1) {
        element.className += " " + className;
    }
};
