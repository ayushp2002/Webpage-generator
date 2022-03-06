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
const CODE_LOCK_BTN_TEXT = "Lock Code Editing";
const CODE_UNLOCK_BTN_TEXT = "Unlock Code Editing";
const NO_SELECTED_ELEMENT_ERROR_TEXT = "No element selected for change";
const NO_TITLE_ERROR_TEXT = "Add title to your webpage to download";

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
    Split(['.elemlistcontainer', '.codetextcontainer', '.outputcontainer'], { gutterSize: 7, }).setSizes([20, 40, 40]);
    Split(['.toolbar', '.playarea'], { direction: 'vertical', gutterSize: 7, }).setSizes([15, 85]);

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
    if (style.length > 0) head = headlinks + "<style>" + style + "\n</style>\n";

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
        let elemPos = style.indexOf(elemID);
        // Check if style for the element has already been initialized
        if (elemPos == -1) { // New style has to be generated
            style += "\n#" + elemID + " {\n" + propertyName + ": " + propertyValue + ";\n}";
        } else { // existing style ruleset needs to changed
            // search the property name inside the specific ruleset of the element
            let startPos = style.indexOf(propertyName, elemPos) == -1 ? -1 :
                (style.indexOf(propertyName, elemPos) + propertyName.length + 2);
            if (startPos == -1) { // if we need to define a new property
                style = style.slice(0, elemPos + elemID.length + 2)
                    + "\n" + propertyName + ": " + propertyValue + ";\n"
                    + style.slice(elemPos + elemID.length + 3);
            } else { // if the property is already defined
                let i;
                for (i = startPos; style[i] != '\n'; i++);
                style = style.replace(style.slice(startPos, i - 1), propertyValue);
            }
        }
        generateCode();
    } else {
        alert(NO_SELECTED_ELEMENT_ERROR_TEXT);
    }
}
function addFontLink(fontName, weight = "") {
    if ($("input[type='radio']:checked").val() != undefined) {
        fontName = fontName.replaceAll(' ', '+');
        if (weight == 'regular') weight = "";
        if (weight != "") weight = ":wght@" + weight;
        let link = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=' + fontName + weight + '">\n';
        if (headlinks.length == 0) { //if this is the first link to be added
            link = '\n' + link;
        }
        if (headlinks.indexOf(fontName) == -1) {    // If the link does not already exist, create new
            headlinks += link;
        } else {    // if the current font is already imported, overwrite
            let startpos, endpos;
            for (startpos = headlinks.indexOf(fontName); headlinks[startpos] != '\n'; startpos--);
            startpos++;
            for (endpos = startpos; headlinks[endpos] != '\n'; endpos++);
            headlinks = headlinks.replace(headlinks.slice(startpos, endpos + 1), link);
        }
        // search for the usage of last active font and remove if not used.
        usedFonts.forEach((lastused, index) => {
            if (lastused != undefined) {
                pos = style.indexOf(lastused);
                if (pos == -1) {    // not used
                    for (startpos = headlinks.indexOf(lastused.replace(" ", "+")); headlinks[startpos] != '\n'; startpos--);
                    startpos++;
                    for (endpos = startpos; headlinks[endpos] != '\n'; endpos++);
                    headlinks = headlinks.replace(headlinks.slice(startpos, endpos + 1), "");
                    usedFonts.splice(index, 1); // remove this unused item from array
                }
            }
        });
        generateCode();
        if (usedFonts.indexOf($("#comboFontFace").val()) == -1) {
            usedFonts.push($("#comboFontFace").val());
        }
    }
}
function loadGFonts(sort, callback) {
    // fonts = {};
    loadGFontsAPIClient()
        .then(value => {   // Make sure the client is loaded before calling this method.
            return gapi.client.webfonts.webfonts.list({ "sort": sort })
                .then(function (response) {
                    // Handle the results here (response.result has the parsed body).
                    fonts = response.result.items;
                }, function (err) { console.error("Execute error", err); });
        }).then(() => callback());
}
function fillFontFaceCombo() {
    $("#comboFontFace").html("");
    fonts.forEach((font, index) => { // add font families
        $("#comboFontFace").append(
            '<option value="'
            + font.family
            + '" id="fontIndex' + index + '">' + font.family + '</option>'
        );
    });
}
function fillFontWeightCombo() {
    $("#comboFontFaceWeight").html("");
    fonts[$("#comboFontFace option:selected").index()].variants.forEach(variant => {  // add the corresponding font weights
        if (variant.indexOf("italic") == -1) {  // ignore the italics, it makes the logic more complex
            $("#comboFontFaceWeight").append(
                '<option value="'
                + variant
                + '">' + toTitleCase(variant) + '</option>'
            );
        }
    });
}
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}
const parse = (salt, encoded) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded
        .match(/.{1,2}/g)
        .map((hex) => parseInt(hex, 16))
        .map(applySaltToChar)
        .map((charCode) => String.fromCharCode(charCode))
        .join("");
};
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
    title = "\n<title>" + $("#txtCommon").val() + "</title>\n";
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
function downloadCode(event) {
    if (title != "") {
        download(title.slice(8, title.length - 9) + ".html", code);
    } else {
        alert(NO_TITLE_ERROR_TEXT);
    }
}