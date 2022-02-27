const tagStart = "<html>\n<head>\n";
const tagBody = "</head>\n<body>\n";
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
    body += "\n<p>" + $("#txtP").val() + "</p>";
    generateCode();
    addRadiobtn("Paragraph: " + $("#txtP").val());
}
function addH(event) {
    body += "\n<h" + $("#comboHSize").val() + ">" + $("#txtH").val() + "</h" + $("#comboHSize").val() + ">";
    generateCode();
    addRadiobtn("Heading" + $("#comboHSize").val() + ": " + $("#txtH").val());
}
function addRadiobtn(text) {
    let elementstring = "<input type=\"radio\" name=\"element\">" + text.slice(0, 40);
    if (text.length > 40) {
        elementstring += "...<br>";
    } else {
        elementstring += "<br>";
    }
    $(".elementlist").append(elementstring);
}