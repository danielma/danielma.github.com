// Tested in
// IE 7-9
// Firefox
// Chrome
// Safari
// Opera

(function () {
  "use strict";

  function alertClicked() {
    alert("You clicked on me!");
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
    var el = document.getElementById("clickMe");
    addListener(el, "click", alertClicked);
  });
}());