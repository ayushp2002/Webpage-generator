const ELEMENT_LIST_NAME_SLICE_LEN = 30;

const DEL_ELEM_BTN_TEXT = "Delete Selected Element";
const IFRAME_ERROR_TEXT = "Live view not supported by current browser";
const CODE_LOCK_BTN_TEXT = "Lock Code Editing";
const CODE_UNLOCK_BTN_TEXT = "Unlock Code Editing";
const NO_DELETE_ELEM_ERROR_TEXT = "No element to delete";

const tagStart = "<html>\n<head>\n";
const tagBody = "</head>\n<body>";
const tagEnd = "</body>\n</html>";

let head = "";
let title = "";
let body = "\n";
let code = "";

$(document).ready(function () {
    Split(['.elemlistcontainer', '.codetextcontainer', '.outputcontainer'], {gutterSize: 7,}).setSizes([20, 40, 40]);
    Split(['.menubar', '.playarea'], {direction: 'vertical', gutterSize: 7,}).setSizes([15,85]);

    $("#code").on("keyup", updateTypedCode);
    $("#btnSetTitle").on("click", setTitle);
    $("#btnLockCodeEdit").on("click", toggleCodeLock);
    $("#btnAddP").on("click", addP);
    $("#btnAddH").on("click", addH);
    $(".elementlist").on("click", handleRadioSelect);
    $("#btnDeleteElement").on("click", handleDeletion);
});

function generateCode() {
    if (body[body.length - 1] != '\n') body += '\n';
    code = tagStart + title + head + tagBody + body + tagEnd;
    $("#code").val(code);
    $("#charCount").html(code.length + " Characters");

    //step 1: get the DOM object of the iframe.
    var iframe = $('iframe#output').get(0);

    // step 2: obtain the document associated with the iframe tag
    // most of the browser supports .document. 
    // Some supports (such as the NetScape series) .contentDocumet, 
    // while some (e.g. IE5/6) supports .contentWindow.document
    // we try to read whatever that exists.
    var iframedoc = iframe.document;
    if (iframe.contentDocument)
        iframedoc = iframe.contentDocument;
    else if (iframe.contentWindow)
        iframedoc = iframe.contentWindow.document;

    if (iframedoc) {
        // Put the content in the iframe
        iframedoc.open();
        iframedoc.writeln(code);
        iframedoc.close();
    } else {
        //just in case of browsers that don't support the above 3 properties.
        //fortunately we don't come across such case so far.
        alert(IFRAME_ERROR_TEXT);
    }
}
function updateTypedCode() {
    $("#code").html($(this).val());
    body = $("#code").val().split('<body>\n').pop().split('\n</body>')[0];
    generateCode();
}
function genRandomId() {
    return '_' + Math.random().toString(36).slice(2, 9);
}

function toggleCodeLock(event) {
    if ($("#code").attr("disabled")) {
        $("#code").removeAttr("disabled");
        $("#btnLockCodeEdit").html(CODE_LOCK_BTN_TEXT);
    } else {
        $("#code").attr("disabled", "disabled");
        $("#btnLockCodeEdit").html(CODE_UNLOCK_BTN_TEXT);
    }
}

function setTitle(event) {
    title = "<title>" + $("#txtTitle").val() + "</title>\n";
    generateCode();
}
function addP(event) {
    let id = genRandomId();
    body += '<p id="' + id + '">' + $("#txtP").val() + "</p>";
    generateCode();
    addRadiobtn("Paragraph", $("#txtP").val(), id);
}
function addH(event) {
    let id = genRandomId();
    body += '<h' + $("#comboHSize").val() + ' id="' + id + '">' + $("#txtH").val() + "</h" + $("#comboHSize").val() + ">";
    generateCode();
    addRadiobtn("Heading " + $("#comboHSize").val(), $("#txtH").val(), id);
}
function handleRadioSelect(event) {
    let selectedElemID = $("input[type='radio']:checked").val();
    if (selectedElemID != undefined) {
        let captionString = "Delete ";
        captionString += $("label[for='" + selectedElemID + "'] span.elemType").html() + " ";
        captionString += $("label[for='" + selectedElemID + "'] span.elemText").html().slice(0, 10) + "...";
        $("#btnDeleteElement").html(captionString);
    }
}
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
        $("#btnDeleteElement").html(DEL_ELEM_BTN_TEXT);
    } else {
        alert(NO_DELETE_ELEM_ERROR_TEXT);
    }
}

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
function delRadiobtn(uid) {
    let i, j;
    let list = $(".elementlist").html();
    for (i = list.indexOf(uid); list[i] != '\n'; i--);
    for (j = i + 1; list[j] != '\n'; j++);
    $(".elementlist").html(list.replace(list.slice(i, j), ''));
}