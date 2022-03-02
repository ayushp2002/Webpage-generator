/** Constant values */
const ELEMENT_LIST_NAME_SLICE_LEN = 30;

/** Constant text elements */
const DEL_ELEM_BTN_TEXT = "Delete Selected Element";
const IFRAME_ERROR_TEXT = "Live view not supported by current browser";
const CODE_LOCK_BTN_TEXT = "Lock Code Editing";
const CODE_UNLOCK_BTN_TEXT = "Unlock Code Editing";
const NO_DELETE_ELEM_ERROR_TEXT = "No element to delete";
const NO_TEXT_CHANGE_ELEM_ERROR_TEXT = "No element to change text";

/** HTML Tags to be used while generation */
const tagStart = "<html>\n<head>\n";
const tagBody = "</head>\n<body>";
const tagEnd = "</body>\n</html>";

/** Global Variables */
let head = "";
let title = "";
let body = "\n";
let code = "";
let iframedoc;

/** Initialization */
$(document).ready(function () {
    /* Split the screen in two verticals and 3 horizontals */
    Split(['.elemlistcontainer', '.codetextcontainer', '.outputcontainer'], {gutterSize: 7,}).setSizes([20, 40, 40]);
    Split(['.menubar', '.playarea'], {direction: 'vertical', gutterSize: 7,}).setSizes([15,85]);

    iframedoc = getIframedocInstance();

    /* Declare the event handlers */
    $("#code").on("keyup", updateTypedCode);
    $("#btnSetTitle").on("click", setTitle);
    $("#btnLockCodeEdit").on("click", toggleCodeLock);
    $("#btnAddP").on("click", addP);
    $("#btnAddH").on("click", addH);
    $(".elementlist").on("click", handleRadioSelect);
    $("#btnDeleteElement").on("click", handleDeletion);
    $("#btnChangeText").on("click", changeText);
});