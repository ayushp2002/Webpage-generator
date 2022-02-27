const ELEMENT_LIST_NAME_SLICE_LEN = 30;

const tagStart = "<html>\n<head>\n";
const tagBody = "</head>\n<body>";
const tagEnd = "\n</body>\n</html>";

let head = "";
let title = "";
let body = "";
let code = "";

$(document).ready(function () {
    $("#code").on("keyup", updateTypedCode);
    $("#btnSetTitle").on("click", setTitle);
    $("#btnLockCodeEdit").on("click", toggleCodeLock);
    $("#btnAddP").on("click", addP);
    $("#btnAddH").on("click", addH);
    $(".elementlist").on("click", function () {
        if ($("input[type='radio']:checked").val() != undefined) {
            let captionString = "Delete ";
            captionString += $("label[for='" + $("input[type='radio']:checked").val() + "'] span.elemType").html() + " ";
            captionString += $("label[for='" + $("input[type='radio']:checked").val() + "'] span.elemText").html().slice(0, 10) + "...";
            $("#btnDeleteElement").html(captionString);
        }
    });
    // $("#btnSelectedRadio").on("click", function() {
    //     alert($("input[type='radio']:checked").val());
    // });
});

function generateCode() {
    code = tagStart + title + head + tagBody + body + tagEnd;
    $("#code").val(code);

    //step 1: get the DOM object of the iframe.
    var iframe = $('iframe#playbox').get(0);

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
        alert('Live view not supported by current browser');
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
        $("#btnLockCodeEdit").html("Lock Code Editing");
    } else {
        $("#code").attr("disabled", "disabled");
        $("#btnLockCodeEdit").html("Unlock Code Editing");
    }
}

function setTitle(event) {
    title = "<title>" + $("#txtTitle").val() + "</title>\n";
    generateCode();
}
function addP(event) {
    let id = genRandomId();
    body += '\n<p id="' + id + '">' + $("#txtP").val() + "</p>";
    generateCode();
    addRadiobtn("Paragraph", $("#txtP").val(), id);
}
function addH(event) {
    let id = genRandomId();
    body += '\n<h' + $("#comboHSize").val() + ' id="' + id + '">' + $("#txtH").val() + "</h" + $("#comboHSize").val() + ">";
    generateCode();
    addRadiobtn("Heading " + $("#comboHSize").val(), $("#txtH").val(), id);
}
function addRadiobtn(type, text, uid) {
    let elementstring = '<input type="radio" name="radioElement" value="' + uid +
                        '" id="' + uid + '"><label for="' + uid + '"><span class="elemType">' 
                        + type + '</span> <span class="elemText">' + text.slice(0, ELEMENT_LIST_NAME_SLICE_LEN);
    if (text.length > ELEMENT_LIST_NAME_SLICE_LEN) {
        elementstring += "...";
    }
    elementstring += '</span> <span class="elemID">UID: ' + uid + "</span></label><br>";
    $(".elementlist").append(elementstring);
}