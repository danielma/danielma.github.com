// Tested in
// IE 7-9
// Chrome
// Firefox
// Safari
// Opera

(function ($) {
  "use strict";

  $(document).ready(function () {
    $("a[href$='.pdf']").addClass("icon pdf");
  });
}(jQuery));