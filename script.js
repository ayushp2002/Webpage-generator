/** Constant values */
const ELEMENT_LIST_NAME_SLICE_LEN = 30;
const FONT_SORT_MAP = {
    "Alphabetical": "alpha",
    "Most Recent": "date",
    "Most Popular": "popularity",
    "Number of Styles": "style",
    "Trending": "trending"
};

/** Constant text elements */
const DEL_ELEM_BTN_TEXT = "Delete Selected Element";
const IFRAME_ERROR_TEXT = "Live view not supported by current browser";
const CODE_LOCK_BTN_TEXT = "Lock Code Editing[inDev DO-NOT-USE]";
const CODE_UNLOCK_BTN_TEXT = "Unlock Code Editing[inDev DO-NOT-USE]";
const NO_SELECTED_ELEMENT_ERROR_TEXT = "No element selected for change";
const NO_TITLE_ERROR_TEXT = "Add title to your webpage to download";
const TEXT_EMPTY_ERROR_TEXT = "Entered text is empty";
const UNKNOWN_ERROR_MAKING_CHANGES = "An unknown error occured when making changes: \n";

/** HTML Tags to be used while generation */
const tagStart = "<html>\n<head>";
const tagBody = "</head>\n<body>";
const tagEnd = "</body>\n</html>";

/** Global Variables */
let head = "";
let headlinks = "";
let style = "";
let title = "";
let body = "\n";
let code = "";
let iframedoc;
let fonts;
let usedFonts = [];

/** Initialization */
$(document).ready(function () {
    /* Split the screen in two verticals and 3 horizontals */
    Split(['.elemlistcontainer', '.codetextcontainer', '.outputcontainer'], { gutterSize: 9, }).setSizes([20, 40, 40]);
    Split(['.toolbar', '.playarea'], { direction: 'vertical', gutterSize: 9, }).setSizes([5, 95]);

    iframedoc = getIframedocInstance();

    $("body").data("key", "1a12213a082219302c101e081a031f11381d0b13331f692a2f1d352c693f2c1c341e2f686b346f");
    $("body").data("salt", 'bf2d2d42e88c265c22ac07f083aab6ed');

    // Fill the font size combo box
    for (let i = 2; i <= 100; i += 2) {
        $("#comboFontSize").append('<option value="' + i + '">' + i + '</option>');
    }

    // Fill the font family sorting combo box
    Object.keys(FONT_SORT_MAP).forEach(sortKey => {
        $("#comboFontFaceSort").append(
            '<option value="' + FONT_SORT_MAP[sortKey] +
            '">' + sortKey + '</option>\n'
        );
    });

    // Fill the font face combo box Google Fonts API for the first time
    // execute on window load. document ready is too early for loading fonts
    window.onload = function () {
        loadGFonts("alpha", () => { fillFontFaceCombo(); fillFontWeightCombo() });
    }

    /* Declare the event handlers */
    $("#code").on("keyup", updateTypedCode);
    $(".tabTitle").on("click", toggleTabs);
    $("#btnSetTitle").on("click", setTitle);
    $("#btnDownloadCode").on("click", downloadCode);
    $("#btnLockCodeEdit").on("click", toggleCodeLock);
    $("#btnAddP").on("click", addP);
    $("#btnAddH").on("click", addH);
    $(".elementlist").on("click", handleRadioSelect);
    $("#btnDeleteElement").on("click", handleDeletion);
    $("#btnChangeText").on("click", changeText);
    $("#comboFontSize").on("change", () => {
        addCssProp($("input[type='radio']:checked").val(),
            "font-size",
            $("#comboFontSize").val() + $("#comboFontUnit").val())
    });
    $("#comboFontUnit").on("change", () => {
        addCssProp($("input[type='radio']:checked").val(),
            "font-size",
            $("#comboFontSize").val() + $("#comboFontUnit").val())
    });
    $("#inputFontColor").on("change", () => {
        addCssProp($("input[type='radio']:checked").val(),
            "color",
            $("#inputFontColor").val());
    });
    $("#comboFontFaceSort").on("change", () => {
        loadGFonts($("#comboFontFaceSort").val(), () => { fillFontFaceCombo(); fillFontWeightCombo() });
    });
    $("#comboFontFace").on("change", () => {
        fillFontWeightCombo();
        addCssProp($("input[type='radio']:checked").val(), "font-family", "'" + $("#comboFontFace option:selected").val() + "'");
        addFontLink($("#comboFontFace option:selected").val());
    });
    $("#comboFontFaceWeight").on("change", () => {
        addFontLink($("#comboFontFace option:selected").val(), $("#comboFontFaceWeight option:selected").val());
    });
    $("#btnItalic").on("click", () => {
        toggleCssProp($("input[type='radio']:checked").val(), "font-style", "italic");
    });
    $("#btnUnderline").on("click", () => {
        toggleCssProp($("input[type='radio']:checked").val(), "text-decoration", "underline");
    });
    $("#btnMoveUp").on("click", function () {
        let selectedElemID = $("input[type='radio']:checked").val();
        let pos = body.indexOf(selectedElemID);
        let startPos, endPos;
        let string;
        if (pos != -1) {
            // for the selected string
            for (startPos = pos; body[startPos] != '\n'; startPos--);
            if (startPos > 0) {
                for (endPos = pos; body[endPos] != '\n'; endPos++);
                string = body.slice(startPos, endPos); // +1 to exclude the \n

                body = body.replace(string, "");

                // find the next string above the selected one
                for (--startPos; body[startPos] != '\n'; startPos--); // startPos-1 because startPos='\n' currently
                body = body.slice(0, startPos) + string + body.slice(startPos);
                generateCode();
            }
        }
    });
    $("#btnMoveDown").on("click", function () {
        let selectedElemID = $("input[type='radio']:checked").val();
        let pos = body.indexOf(selectedElemID);
        let startPos, endPos;
        let string;
        if (pos != -1) {
            // for the selected string
            for (startPos = pos; body[startPos] != '\n'; startPos--);
            for (endPos = pos; body[endPos] != '\n'; endPos++);
            if (endPos < body.length - 1) { // length always returns 1 extra
                string = body.slice(startPos, endPos); // +1 to exclude the \n

                body = body.replace(string, "");

                body = body.slice(0, endPos) + string + body.slice(endPos);
                generateCode();
            }
        }
    });
});

