async function loadGFontsAPIClient() {
  gapi.client.setApiKey(API_KEY);
  return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/webfonts/v1/rest")
    .then(function () { /*console.log("GAPI client loaded for API");*/ },
      function (err) { console.error("Error loading GAPI client for API", err); });
}
// This code is moved to script.js
// function executeGFontsAPI(fontArray) {
//   return gapi.client.webfonts.webfonts.list({
//     "sort": "Alpha"
//   })
//     .then(function (response) {
//       // Handle the results here (response.result has the parsed body).
//       console.log(response.result);
//       fontArray.push(response.result.items);//.forEach(font => {
//       // $(".content").append('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=' + font.family.replaceAll(' ', '+') + '">' + "<br>")
//       //$(".content").append(font.family.replaceAll(' ', '+') + "<br>");
//       //});
//     },
//       function (err) { console.error("Execute error", err); });
// }
gapi.load("client");