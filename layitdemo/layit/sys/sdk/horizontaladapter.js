/* global attrKeys, ListView */

HorizontalListAdapter.prototype = Object.create(ListAdapter.prototype);
HorizontalListAdapter.prototype.constructor = HorizontalListAdapter;
/**
 *
 * @param list The layit List which encapsulates an html list
 * @param callback A function that runs when the adapter has loaded and rendered the list data
 * @constructor
 */
function HorizontalListAdapter(list, callback) {
    ListAdapter.call(this, list, callback);
    this.protoRect = {};
}

/**
 * Fetch all template cells at the beginning
 * @param list The ListView intance that has prototype cells(they are in the list.itemViews array)
 * @param callback Call this function once all template cells have been loaded.
 */
HorizontalListAdapter.prototype.fetchPrototypeCells = function (list, callback) {
  let self = this;
    let itemViews = list.itemViews;
    let load = function (index) {
        let template = itemViews[index];
        let protoLi = document.createElement('li');
        let protoId = self.protoListItemId();
        protoLi.setAttribute(attrKeys.id, protoId);
        list.htmlElement.appendChild(protoLi);
        self.protoRect = protoLi.getBoundingClientRect();

        protoLi.style.width = self.protoRect.width;
        self.protoLi = protoLi;


        getWorkspace({
            layoutName: template,
            bindingElemId: protoId,
            isTemplate: true,
            onLayoutLoaded: function (fileName, xml) {

            },
            onComplete: function (rootView) {
                self.viewTemplates.push(rootView);
                let style = rootView.style.clone('.' + rootView.id);
                self.protoClassName = rootView.id;
                updateOrCreateSelectorInStyleSheet(styleSheet, style);


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

HorizontalListAdapter.prototype.makeCell = function (adapterView , viewType) {
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
    li.style.width = self.protoRect.width+'px';
    li.style.height =  self.protoRect.height+'px';

    li.setAttribute('id', this.adapterViewId + "_li_" + childrenCount);

    let clone = rootView.htmlElement.cloneNode(true);
    addClass(clone, self.protoClassName);


    let cloneId = clone.id + "_" + childrenCount;
    clone.setAttribute(attrKeys.id, cloneId);
    renameIds(clone, childrenCount, cloneId, this.protoStylesMap, this.cellRegistry);
    li.appendChild(clone);
    htmlElement.appendChild(li);

    return li;
};
