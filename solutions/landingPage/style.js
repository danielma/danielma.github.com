$(function() {
  if (window.PIE) {
    $('#columns > div').each(function() {
      PIE.attach(this);
    });
  }
});