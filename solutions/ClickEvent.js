(function () {
  'use strict';
  
  var el = document.getElementById("clickMe");
  
  function alertClicked (e) {
    alert("You clicked " + e.target);
  }
  
  // Add listeners
  if (el.addEventListener) {
    el.addEventListener('click', alertClicked, false); 
  } else if (el.attachEvent)  {
    el.attachEvent('onclick', alertClicked);
  }
}());