(function () {
  'use strict';

  var el = document.getElementById("clickMe");

  function alertClicked() {
    alert("You clicked on me!");
  }

  // Add listeners
  if (el.addEventListener) {
    el.addEventListener('click', alertClicked, false);
  } else if (el.attachEvent) {
    el.attachEvent('onclick', alertClicked);
  }
}());