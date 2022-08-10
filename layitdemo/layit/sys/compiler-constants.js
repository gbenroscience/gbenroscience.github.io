


/* global SCRIPTS_BASE, PROJECT_BASE */

/**
 * The folder that the user should use for storing
 * xml layouts
 */
const PATH_TO_LAYOUTS_FOLDER = PROJECT_BASE + RESOURCES+'/layouts/';
/**
 * The native folder for layouts used by this library for
 * its own widgets, if necessary.
 * The user should not modify this!
 */
const PATH_TO_LIB_LAYOUTS_FOLDER = SCRIPTS_BASE + 'layouts/';
/**
 * The path to the user's images
 */
 const PATH_TO_USER_IMAGES = PROJECT_BASE + RESOURCES+'/images/';
/**
 * The path to the lib's images
 */
 const PATH_TO_LIB_IMAGES = SCRIPTS_BASE + 'images/';

/**
 * The path to the scripts used by this library
 */
const PATH_TO_ENGINE_SCRIPTS = SCRIPTS_BASE + "sys/";
/**
 * The path to the user's project's scripts
 */
const PATH_TO_USER_SCRIPTS = PROJECT_BASE + RESOURCES+'/scripts/';
/**
 * The path to the library's widget scripts
 */
 const PATH_TO_LIB_SCRIPTS = SCRIPTS_BASE + "scripts/";






const DISABLE_INPUT_SHADOW = true;

const sizes = {
    MATCH_PARENT: 'match_parent',
    WRAP_CONTENT: 'wrap_content'
};


const orientations = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal',
    GRID: 'grid'// Not available to all views
};

const Alignments = {
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
    TOP: 'top',
    BOTTOM: 'bottom'
};

const DRAG_STATE = {
    NO_DRAG: 0,
    READY: 1,
    DRAGGING: 2
};

const xmlKeys = {
    imports: "imports",
    root: "ConstraintLayout",
    view: "View",
    button: "Button",
    imageButton: "ImageButton",
    field: "TextField",
    area: "TextArea",
    video: 'VideoView',
    audio: 'AudioView',
    imageView: "ImageView",
    progress: "ProgressBar",
    check: "CheckBox",
    radiogroup: "RadioGroup",
    radio: "Radio",
    separator: "Separator",
    dropDown: "DropDown",
    guide: "Guideline",
    listView: "ListView",
    horizontalListView: "HorizontalListView",
    gridView: "GridView",
    link: "HyperLink",
    list: "NativeList",
    table: "NativeTable",
    form: "Form",
    inputTable: "InputTableView",
    growableTable: "GrowableTableView",
    searchableTable: "SearchableTableView",
    customTable: "CustomTableView",
    label: "Label",
    paragraph: "Paragraph",
    multiLineLabel: "MultiLineLabel",
    iconLabel: "IconLabelView",
    clock: "Clock",
    canvas: "Canvas",
    tabview: "TabView",
    include: "include"
};


const attrKeys = {
    id: "id",
    layout: "layout", //specifies the layout file to use with an include tag
    layout_width: "width",
    layout_height: "height",

    layout_maxWidth: "maxWidth",
    layout_maxHeight: "maxHeight",
    layout_minWidth: "minWidth",
    layout_minHeight: "minHeight",

    width: "cWidth", //on canvas element
    height: "cHeight", //on canvas element
    translationZ: "translationZ", //the z index
    layout_margin: "margin",
    layout_marginStart: "marginStart",
    layout_marginEnd: "marginEnd",
    layout_marginTop: "marginTop",
    layout_marginBottom: "marginBottom",
    layout_marginHorizontal: "marginHorizontal",
    layout_marginVertical: "marginVertical",
    layout_padding: "padding",
    layout_paddingStart: "paddingStart",
    layout_paddingEnd: "paddingEnd",
    layout_paddingTop: "paddingTop",
    layout_paddingBottom: "paddingBottom",
    layout_paddingHorizontal: "paddingHorizontal",//Not yet implemented
    layout_paddingVertical: "paddingVertical",//Not yet implemented
    layout_constraintTop_toTopOf: "top_top",
    layout_constraintBottom_toBottomOf: "bottom_bottom",
    layout_constraintStart_toStartOf: "start_start",
    layout_constraintEnd_toEndOf: "end_end",
    layout_constraintTop_toBottomOf: "top_bottom",
    layout_constraintStart_toEndOf: "start_end",
    layout_constraintEnd_toStartOf: "end_start",
    layout_constraintBottom_toTopOf: "bottom_top",
    layout_constraintCenterXAlign: "cx_align",
    layout_constraintCenterYAlign: "cy_align",
    layout_constraintGuide_percent: "guide_percent",
    layout_constraintGuide_begin: "guide_begin",
    layout_constraintGuide_end: "guide_end",
    layout_horizontalBias: "hor_bias",// a floating point bumber between 0 and 1 specifying the priority of the horizontal constraint attributes
    layout_verticalBias: "ver_bias",// a floating point bumber between 0 and 1 specifying the priority of the vertical constraint attributes
    dimension_ratio: "dim_ratio",
    orientation: "orientation", //
    
    
    listType: 'listType', //ol or ul
    showBullets: 'showBullets', //for lists, if true, will show the bullets or numbers
    
    //These four apply to the NativeList widget alone
    cellPaddingLeft: "cellPaddingLeft",
    cellPaddingRight: "cellPaddingRight",
    cellPaddingTop: "cellPaddingTop",
    cellPaddingBottom: "cellPaddingBottom",
    cellForeground: "cellForeground", //applies to NativeList
    
    cellSelectedForeground: "cellSelectedForeground",
    cellSelectedBackground: "cellSelectedBackground",
    
    


    // an array of view template(reference them by their filenames) to be used to construct the custom views for the list's cell. The type of the view is its index in this array
    itemViews: 'itemViews',
    items: "items", // an array of items to display in a list or a dropdown
    tableHeaders: 'tableHeaders', //a 1d array of items to display as a custom table view's headers
    tableItems: 'tableItems', //a 2d array of items to display on a table
    title: 'title', // table title and for hyper links also
    showBorders: 'showBorders', // show the custom table's inner borders(does not apply to the native table)
    pagingEnabled: 'pagingEnabled',
    tableTheme: 'tableTheme', // for custom tables only
    cellPadding: 'cellPadding', //works only for the custom tables, and the ListView, HorizontalListView and teh GridView
    headerPadding: 'headerPadding',
    showLeftBtn: 'showLeftBtn', // only works for the SeachableTableView
    buttonText: "buttonText", // the text on the top left button
    hasHeader: "hasHeader", //check if a native html table node must have an header row
    hasFooter: "hasFooter", //check if a native html table node or a custom table must have a footer row
    hasContainer: "hasContainer", //check if a custom table must have a container
    actionColumns: "actionColumns", // a list of columns on an InputTableView, GrowableTableView or a SearchableTableView that will be rendered as buttons
    checkableColumns: "checkableColumns", // a list of columns on an InputTableView, GrowableTableView or a SearchableTableView that will be rendered as checkboxes
    textColumns: "textColumns", // a list of columns on an InputTableView, GrowableTableView or a SearchableTableView that will be rendered as textfields
    selectColumns: "selectColumns", // a list of columns on an InputTableView, GrowableTableView or a SearchableTableView that will be rendered as dropdowns


//for video and audio
    sources: 'sources', // sources='[{"src": "/videos/stuff.mp4","type": "/videos/stuff.mp4", "codecs": "avc1.42E01E, mp4a.40.2, theora, vorbis"},]'
    autoplay: 'autoplay', //boolean
    muted: 'muted', //boolean
    controls: 'controls', // boolean
    preload: 'preload', //boolean
    hasCaption: "hasCaption",
    caption: "caption",
    //for custom tables and the MultiLineLabel
    scrollHeight: "scrollHeight",
    withNumbering: "withNumbering",
    //All views
    cssClass: "cssClass",
    resize: "resize",
    progressColor: "progressColor",

    files: "files",
    controller: "controller",
    src: "src",
    alt: "alt", //image tag
    border: "border", //e.g 1px solid red
    borderRadius: "borderRadius", //e.g 4px
    background: "background",
    backgroundImage: "backgroundImage",
    backgroundColor: "backgroundColor",
    backgroundAttachment: "backgroundAttachment",
    backgroundPosition: "backgroundPosition",
    backgroundPositionX: "backgroundPositionX",
    backgroundPositionY: "backgroundPositionY",
    backgroundOrigin: "backgroundOrigin",
    backgroundRepeat: "backgroundRepeat",
    backgroundSize: "backgroundSize",
    backgroundClip: "backgroundClip",
    backgroundBlendMode: "background-blend-mode",

    borderTop: 'borderTop',
    borderBottom: 'borderBottom',
    borderLeft: 'borderLeft',
    borderRight: 'borderRight',
    borderTopColor: 'borderTopColor',
    borderBottomColor: 'borderBottomColor',
    borderLeftColor: 'borderLeftColor',
    borderRightColor: 'borderRightColor',
    borderTopWidth: 'borderTopWidth',
    borderBottomWidth: 'borderBottomWidth',
    borderLeftWidth: 'borderLeftWidth',
    borderRightWidth: 'borderRightWidth',
    borderTopLeftRadius: "borderTopLeftRadius",
    borderTopRightRadius: "borderTopRightRadius",
    borderBottomLeftRadius: "borderBottomLeftRadius",
    borderBottomRightRadius: "borderBottomRightRadius",

    overflow: "overflow",
    overflowX: "overflowX",
    overflowY: "overflowY",

    boxShadow: "boxShadow",
    inputType: "inputType", //text or password
    text: "text",
    textColor: "textColor",
    textSize: "textSize",
    textStyle: "textStyle",
    font: "font",
    fontFamily: "fontFamily",
    fontSize: "fontSize",
    fontWeight: "fontWeight", // normal | bold | oblique
    fontStyle: "fontStyle", // normal | italic | oblique
    gravity: 'gravity',
    fontStretch: "fontStretch",
    checked: "checked",
    name: "name",
    value: "value",

    
    href: "href", // for hyperlinks

    placeholder: "placeholder",
    maxLength: 'maxLength',
    rows: 'rows',
    cols: 'cols',
    clockOuterColor: 'clockOuterColor',
    clockMiddleColor: 'clockMiddleColor',
    clockInnerColor: 'clockInnerColor',
    clockTickColor: 'clockTickColor',
    clockSecondsColor: "clockSecondsColor",
    clockMinutesColor: 'clockMinutesColor',
    clockHoursColor: 'clockHoursColor',
    clockCenterSpotWidth: 'clockHoursColor',
    clockOuterCircleAsFractionOfFrameSize: 'clockOuterCircleAsFractionOfFrameSize',
    clockShowBaseText: 'clockShowBaseText',
    description: 'description',

    //FORM properties
    action: "action",
    method: "method",
    target: "target",
    autocomplete: "autocomplete",
    novalidate: "novalidate",
    enctype: "enctype", //application/x-www-form-urlencoded OR multipart/form-data OR text/plain
    rel: "rel",
    acceptCharset: "acceptCharset",

    // properties for TabView
    selectedBg: "selectedBg",
    selectedFg: "selectedFg",
    deselectedBg: "deselectedBg",
    deselectedFg: "deselectedFg",
    tabItems: "tabItems",
    tabEdgeColor: "tabEdgeColor",
    tabEdgeWidth: "tabEdgeWidth", // the thickness of the dividing line between tabs
    iconSize: "iconSize",

    //GridView properties"
    minGridHeight: "minGridHeight", // All items in the grid will be at least this height

    //HorizontalListView property
    minCellWidth: "minCellWidth",

    //ListView AND HorizontalListView property
    minCellHeight: "minCellHeight",

    //ListView and HorizontalListView and GridView's property... The gap between consecutive cells
    cellSpacing: "cellSpacing", // the space between items in the ListView|HorizontalListView|GridView's cells
    //ListView and HorizontalListView and GridView's property... The background of a list|grid cell
    //Also applies to NativeList
    cellBackground: "cellBackground",
    //ListView and HorizontalListView and GridView's property... The border of a list|grid cell
    cellBorder: "cellBorder",
    //IconLabel
    backgroundColorHover: 'backgroundColorHover',
    textColorHover: 'textColorHover',
    iconTextGap: 'iconTextGap',
    lineSpacing: 'lineSpacing',
    
    //Properties used for the MultiLineLabel
    scrollBarTheme: 'scrollBarTheme',
    scrollBarWidth: 'scrollBarWidth',
    scrollBarHeight: 'scrollBarHeight',
    //Align text in span
    horAlign: 'horAlign',//left|center|right
    verAlign: 'verAlign',//top|center|bottom

    //If true, a configurable background with patterns of shapes and text will be added to the View
    useMiBackground: "useMiBackground",//
    //use these tags when you want to configure an auto-generated background image for a View... they begin with `mi`.. for MysteryImage
    miFgColor: "miFgColor",
    miBgColor: "miBgColor",
    miStrokeWidth: "miStrokeWidth",
    miMinSize: "miMinSize",
    miTextArray: "miTextArray",
    miFontName: "miFontName", // font name... Arial
    miFontWeight: "miFontWeight", // font name... 100|200|bold...etc.
    miFontStyle: "miFontStyle", // font style... normal|italic
    miFontSize: "miFontSize", //font size... 20px, 2em, etc.
    miNumShapes: "miNumShapes",//integer value
    miShapesDensity: "miShapesDensity", //floating point value
    miOpacity: "miOpacity", //integer value
    miBgOpacityEnabled: "miBgOpacityEnabled", //boolean. If true, the opacity will affect the miBgColor field also
    miCacheAfterDraw: "miCacheAfterDraw",// boolean
    miTextOnly: "miTextOnly" //boolean

};
