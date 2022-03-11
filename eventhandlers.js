/** Event handler functions */
function toggleTabs(event) {
    $(".tabActive").removeClass("tabActive");
    $(event.target).addClass("tabActive");
    $(".toolbarActive").removeClass("toolbarActive");
    $("#toolbar" + $(event.target).attr('id').slice(3)).addClass("toolbarActive");
}
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
    if ($("#txtCommon").val() != "") {
        title = "\n<title>" + $("#txtCommon").val() + "</title>\n";
        generateCode();
    } else {
        alert(TEXT_EMPTY_ERROR_TEXT);
    }
}
/**
 * The function adds a paragraph to the body of the generated document
 * @param event - The event object that was triggered.
 */
function addP(event) {
    if ($("#txtCommon").val() != "") {
        let id = genRandomId();
        body += '<p id="' + id + '">' + $("#txtCommon").val() + "</p>";
        generateCode();
        addRadiobtn("Paragraph", $("#txtCommon").val(), id);
    } else {
        alert(TEXT_EMPTY_ERROR_TEXT);
    }
}
/**
 * It generates a random id, adds a heading tag with the id, and adds a radio button with the id and
 * the heading text
 * @param event - The event object that was triggered.
 */
function addH(event) {
    if ($("#txtCommon").val() != "") {
        let id = genRandomId();
        body += '<h' + $("#comboHSize").val() + ' id="' + id + '">' + $("#txtCommon").val() + "</h" + $("#comboHSize").val() + ">";
        generateCode();
        addRadiobtn("Heading " + $("#comboHSize").val(), $("#txtCommon").val(), id);
    } else {
        alert(TEXT_EMPTY_ERROR_TEXT);
    }
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
        if ($("#txtCommon").val() != "") {
            for (i = body.indexOf(selectedElemID); body[i] != '>'; i++);
            for (j = i + 1; body[j] != '<'; j++);
            body = body.replace(body.slice(i + 1, j), $("#txtCommon").val());
            generateCode();
            delRadiobtn(selectedElemID);
            addRadiobtn(selectedElemType.slice(1), $("#txtCommon").val(), selectedElemID);
        } else {
            alert(TEXT_EMPTY_ERROR_TEXT);
        }
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