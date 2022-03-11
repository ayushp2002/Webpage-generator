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
function removeCssProp(elemID, propertyName) {
    if (elemID != undefined) {
        let elemPos = style.indexOf(elemID);
        // Check if style for the element has been initialized
        if (elemPos == -1) { // No rulesets exist
            // Do nothing here
        } else { // existing style ruleset needs to changed
            // search the property name inside the specific ruleset of the element
            let startPos = style.indexOf(propertyName, elemPos) == -1 ? -1 :
                (style.indexOf(propertyName, elemPos));
            if (startPos == -1) { // if the property is not found
                // Do nothing here as well
            } else { // if the property is defined
                let i;
                for (i = startPos; style[i] != '\n'; i++);
                style = style.replace(style.slice(startPos, i + 1), "");
            }
        }
        generateCode();
    }
}
function toggleCssProp(elemID, propertyName, propertyValue) {
    let elemPos = style.indexOf(elemID);
    if (elemPos != -1) {
        if (style.indexOf(propertyName + ": " + propertyValue + ";",  elemPos) == -1) { //if not found
            addCssProp(elemID, propertyName, propertyValue);
        } else {
            removeCssProp(elemID, propertyName);
        }
    } else {
        addCssProp(elemID, propertyName, propertyValue);
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
            headlinks = headlinks.replaceAll(headlinks.slice(startpos, endpos + 1), link);
        }
        // search for the usage of last active font and remove if not used.
        usedFonts.forEach((lastused, index) => {
            if (lastused != undefined) {
                pos = style.indexOf(lastused);
                if (pos == -1) {    // not used
                    if (headlinks.indexOf(lastused.replaceAll(" ", "+")) != -1) {
                        for (startpos = headlinks.indexOf(lastused.replaceAll(" ", "+")); headlinks[startpos] != '\n'; startpos--);
                        startpos++;
                        for (endpos = startpos; headlinks[endpos] != '\n'; endpos++);
                        headlinks = headlinks.replace(headlinks.slice(startpos, endpos + 1), "");
                        usedFonts.splice(index, 1); // remove this unused item from array  
                    } else {
                        alert(UNKNOWN_ERROR_MAKING_CHANGES + (new Error().stack));
                    }
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