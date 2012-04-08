// Tested in
// IE 7-9
// Firefox
// Chrome
// Safari
// Opera

(function () {
  "use strict";

  function ajaxRequest(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        callback(xmlhttp.responseText);
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  function getDataAndWrite(url, el) {
    ajaxRequest(url, function (data) {
      var element = document.getElementById(el);
      element.innerHTML = element.innerHTML + data + "<br/>";
    });
  }

  function addListener(el, type, method, useCapture) {
    if (typeof (useCapture === "undefined")) { useCapture = false; }

    if (el.addEventListener) {
      el.addEventListener(type, method, false);
    } else if (el.attachEvent) {
      el.attachEvent("on" + type, method);
    }
  }

  // Add listeners
  addListener(window, "load", function () {
    var el = document.getElementById("getBtn");
    addListener(el, "click", function () {
      getDataAndWrite("ajaxData.txt", "response");
    });
  });
}());
