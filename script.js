/** Constant values */
const ELEMENT_LIST_NAME_SLICE_LEN = 30;

/** Constant text elements */
const DEL_ELEM_BTN_TEXT = "Delete Selected Element";
const IFRAME_ERROR_TEXT = "Live view not supported by current browser";
const CODE_LOCK_BTN_TEXT = "Lock Code Editing";
const CODE_UNLOCK_BTN_TEXT = "Unlock Code Editing";
const NO_SELECTED_ELEMENT_ERROR_TEXT = "No element selected for change";

/** HTML Tags to be used while generation */
const tagStart = "<html>\n<head>\n";
const tagBody = "</head>\n<body>";
const tagEnd = "</body>\n</html>";

/** Global Variables */
let head = "";
let style = "";
let title = "";
let body = "\n";
let code = "";
let iframedoc;

/** Initialization */
$(document).ready(function () {
    /* Split the screen in two verticals and 3 horizontals */
    Split(['.elemlistcontainer', '.codetextcontainer', '.outputcontainer'], { gutterSize: 7, }).setSizes([20, 40, 40]);
    Split(['.menubar', '.playarea'], { direction: 'vertical', gutterSize: 7, }).setSizes([15, 85]);

    iframedoc = getIframedocInstance();

    for (let i = 2; i <= 100; i += 2) {
        $("#comboFontSize").append('<option value="' + i + '">' + i + '</option>');
    }

    /* Declare the event handlers */
    $("#code").on("keyup", updateTypedCode);
    $("#btnSetTitle").on("click", setTitle);
    $("#btnLockCodeEdit").on("click", toggleCodeLock);
    $("#btnAddP").on("click", addP);
    $("#btnAddH").on("click", addH);
    $(".elementlist").on("click", handleRadioSelect);
    $("#btnDeleteElement").on("click", handleDeletion);
    $("#btnChangeText").on("click", changeText);
    $("#comboFontSize").on("change", () => {
        addCssProp($("input[type='radio']:checked").val(),
            "font-size", $("#comboFontSize").val() + $("#comboFontUnit").val())
    });
    $("#comboFontUnit").on("change", () => {
        addCssProp($("input[type='radio']:checked").val(),
            "font-size", $("#comboFontSize").val() + $("#comboFontUnit").val())
    });
});

/** Utility functions */
/**
 * Generate the code for the HTML page and put it in the iframe
 */
function generateCode() {
    /* This is a simple check to see if the last character in the body is a newline character. If it is
    not, then we add a newline character to the end of the body. This is to ensure that the next
    line in the body will start from a new line. */
    if (body[body.length - 1] != '\n') body += '\n';
    if (style.length > 0) head = "<style>" + style + "\n</style>\n";

    code = tagStart + title + head + tagBody + body + tagEnd;
    $("#code").val(code);
    $("#charCount").html(code.length + " Characters");

    $("#btnDeleteElement").html(DEL_ELEM_BTN_TEXT);

    // Put the content in the iframe
    iframedoc.open();
    iframedoc.writeln(code);
    iframedoc.close();
}
/**
 * It takes the text in the textarea and puts it into the code variable
 * This is to ensure that the manually typed code is also updated in the bacakend
 */
function updateTypedCode() {
    $("#code").html($(this).val());
    body = $("#code").val().split('<body>\n').pop().split('\n</body>')[0];
    generateCode();
}
function getIframedocInstance() {
    /** step 1: get the DOM object of the iframe. */
    let iframe = $('iframe#output').get(0);
    let iframed;

    /** step 2: obtain the document associated with the iframe tag
        most of the browser supports .document. 
        Some supports (such as the NetScape series) .contentDocumet, 
        while some (e.g. IE5/6) supports .contentWindow.document
        we try to read whatever that exists.
        var iframedoc = iframe.document; */
    if (iframe.contentDocument)
        iframed = iframe.contentDocument;
    else if (iframe.contentWindow)
        iframed = iframe.contentWindow.document;

    if (iframed) {
        // Put the content in the iframe
        return iframed;
    } else {
        /** just in case of browsers that don't support the above 3 properties.
            fortunately we don't come across such case so far. */
        alert(IFRAME_ERROR_TEXT);
        return -1;
    }
}
/**
 * Generate a random id
 * @returns a random string of numbers and letters.
 */
function genRandomId() {
    return '_' + Math.random().toString(36).slice(2, 9);
}
/**
 * It adds a radio button to the element list
 * @param type - The type of element.
 * @param text - The text of the element.
 * @param uid - The unique ID of the element.
 */
function addRadiobtn(type, text, uid) {
    if ($(".elementlist").html[$(".elementlist").html.length - 1] != '\n') $(".elementlist").append('\n');
    let elementstring = '<input type="radio" name="radioElement" value="' + uid +
        '" id="' + uid + '"><label for="' + uid + '"><span class="elemType"> ' + type +
        '</span> <span class="elemID">UID: ' + uid +
        '</span>';
    if (text.length > 0) {
        elementstring += '<br><span class="elemText">' + text.slice(0, ELEMENT_LIST_NAME_SLICE_LEN);
        if (text.length > ELEMENT_LIST_NAME_SLICE_LEN) {
            elementstring += "...";
        }
    }
    elementstring += '</label><br>\n';
    $(".elementlist").append(elementstring);
}
/**
 * This is to delete an element from the list of elements
 * Given a string, find the index of the first character that is not a newline. 
 * Then, starting from that index, find the index of the first newline. 
 * Finally, replace the substring between the two indices with an empty string
 * @param uid - The unique ID of the radio button.
 */
function delRadiobtn(uid) {
    let i, j;
    let list = $(".elementlist").html();
    for (i = list.indexOf(uid); list[i] != '\n'; i--);
    for (j = i + 1; list[j] != '\n'; j++);
    $(".elementlist").html(list.replace(list.slice(i, j), ''));
}
function addCssProp(elemID, propertyName, propertyValue) {
    if (elemID != undefined) {
        // Check if style for the element has already been initialized
        if (style.indexOf(elemID) == -1) { // New style has to be generated
            style += "\n#" + elemID + " {\n" + propertyName + ": " + propertyValue + ";\n}";
        } else { // existing style needs to changed
            // search the property name inside the specific ruleset of the element
            let startPos = style.indexOf(propertyName, style.indexOf(elemID)) + propertyName.length + 2;
            let i;
            for (i = startPos; style[i] != '\n'; i++);
            style = style.replace(style.slice(startPos, i - 1), propertyValue);
        }
        generateCode();
    } else {
        alert(NO_SELECTED_ELEMENT_ERROR_TEXT);
    }
}

/** Event handler functions */
/**
 * When the user clicks the "Lock Code" button, the code editor is locked. When the user clicks the
 * "Unlock Code" button, the code editor is unlocked
 * @param event - The event object that triggered this function.
 */
function toggleCodeLock(event) {
    if ($("#code").attr("disabled")) {
        $("#code").removeAttr("disabled");
        $("#btnLockCodeEdit").html(CODE_LOCK_BTN_TEXT);
    } else {
        $("#code").attr("disabled", "disabled");
        $("#btnLockCodeEdit").html(CODE_UNLOCK_BTN_TEXT);
    }
}
/**
 * The function sets the title of the generated page to the value of the text box
 * @param event - The event object that was passed to the function.
 */
function setTitle(event) {
    title = "<title>" + $("#txtCommon").val() + "</title>\n";
    generateCode();
}
/**
 * The function adds a paragraph to the body of the generated document
 * @param event - The event object that was triggered.
 */
function addP(event) {
    let id = genRandomId();
    body += '<p id="' + id + '">' + $("#txtCommon").val() + "</p>";
    generateCode();
    addRadiobtn("Paragraph", $("#txtCommon").val(), id);
}
/**
 * It generates a random id, adds a heading tag with the id, and adds a radio button with the id and
 * the heading text
 * @param event - The event object that was triggered.
 */
function addH(event) {
    let id = genRandomId();
    body += '<h' + $("#comboHSize").val() + ' id="' + id + '">' + $("#txtCommon").val() + "</h" + $("#comboHSize").val() + ">";
    generateCode();
    addRadiobtn("Heading " + $("#comboHSize").val(), $("#txtCommon").val(), id);
}
/**
 * The function is called when a radio button is selected. 
 * It gets the ID of the selected radio button and uses it to get the caption of the element. 
 * It then uses the caption to create a caption for the delete button
 * @param event - The event object that was triggered.
 */
function handleRadioSelect(event) {
    let selectedElemID = $("input[type='radio']:checked").val();
    /* This is a simple check to see if the selected radio button is undefined. If it is not, then
    we can proceed with the deletion of the element. */
    if (selectedElemID != undefined) {
        let captionString = "Delete ";
        captionString += $("label[for='" + selectedElemID + "'] span.elemType").html() + " ";
        captionString += $("label[for='" + selectedElemID + "'] span.elemText").html().slice(0, 10) + "...";
        $("#btnDeleteElement").html(captionString);
    }
}
/**
 * The function searches for the line of code with the selected element ID, and deletes the line of
 * code
 * @param event - The event object that was triggered.
 */
function handleDeletion(event) {
    let selectedElemID = $("input[type='radio']:checked").val();
    let i, j;
    // search for the line of code with the selected element ID
    if (selectedElemID != undefined) {
        for (i = body.indexOf(selectedElemID); body[i] != '\n'; i--);
        for (j = i + 1; body[j] != '\n'; j++);
        body = body.replace(body.slice(i, j), '');
        generateCode();
        delRadiobtn(selectedElemID);
    } else {
        alert(NO_SELECTED_ELEMENT_ERROR_TEXT);
    }
}
function changeText(event) {
    let selectedElemID = $("input[type='radio']:checked").val();
    let selectedElemType = $("label[for=" + $("input[type='radio']:checked").val() + "] span.elemType").html();
    let elemType;
    let i, j, k;
    // search for the line of code with the selected element ID
    if (selectedElemID != undefined) {
        for (i = body.indexOf(selectedElemID); body[i] != '>'; i++);
        for (j = i + 1; body[j] != '<'; j++);
        body = body.replace(body.slice(i + 1, j), $("#txtCommon").val());
        generateCode();
        delRadiobtn(selectedElemID);
        addRadiobtn(selectedElemType.slice(1), $("#txtCommon").val(), selectedElemID);
    } else {
        alert(NO_SELECTED_ELEMENT_ERROR_TEXT);
    }
}