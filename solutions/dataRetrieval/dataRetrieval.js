// Tested in
// Chrome
// Firefox
// Safari
// Opera
// IE

(function ($) {
  "use strict";

  $.fn.reverse = [].reverse;

  $.fn.sortable = function () {
    var sorted_by, reversed;
    var table = this;
    var columns = table.find("th").length;

    function by_date(a, b) {
      var compA = new Date($(a).text());
      var compB = new Date($(b).text());
      return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    }

    function by_text(a, b) {
      var compA = $(a).text().toUpperCase();
      var compB = $(b).text().toUpperCase();
      return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    }

    table.addClass("sortable");
    table.find("th").click(function () {
      var th = $(this);
      var idx = th.index();
      var cells = table.find("td:nth-child(" + columns + "n+" + (idx + 1) + ")");
      var sorted;
      // If it does not exist, it returns -1. +1 makes it 0 (false). Any other value returns true
      if (th.text().toUpperCase().indexOf("DATE") + 1) {
        sorted = cells.get().sort(by_date);
      } else {
        sorted = cells.get().sort(by_text);
      }

      // Set sorted_by and reversed properly
      if (sorted_by === idx && reversed === false) {
        sorted = sorted.reverse();
        reversed = true;
      } else {
        sorted_by = idx;
        reversed = false;
      }

      // This is the actual reordering of the rows
      $.each(sorted, function (index, element) {
        table.append($(element).parent());
      });

      // Apply some styling
      th.addClass("sortedBy").siblings().removeClass("sortedBy reverse");
      if (reversed) {
        th.addClass("reverse");
      } else {
        th.removeClass("reverse");
      }
      table.find("tr:even").removeClass("odd").addClass("even");
      table.find("tr:odd").removeClass("even").addClass("odd");
    });

  };

  function writeTable(el, data) {
    el = $(el);
    data = JSON.parse(data);
    var score, table, prop, i;

    table = "<table><thead><tr>";

    // Create <th> tags for each property
    for (prop in data.scores[0]) {
      table += "<th>" + prop + "</th>";
    }

    // Close up the <thead> and begin <tbody>
    table += "</tr></thead><tbody>";

    for (i = 0; i < data.scores.length; i ++) {
      score = data.scores[i];
      table += "<tr class='";
      table += i % 2 === 0 ? "even" : "odd";
      table += "'>";
      for (prop in score) {
        if(score.hasOwnProperty(prop)) {
          table += "<td>" + score[prop] + "</td>";         
        }
      }
      table += "</tr>";
    }
    
    table += "</tbody></table>";
    el.html(table);
    
    return el.children("table");
  }
  
  $(document).ready(function () {
    var req = $.ajax("dataRetrieval.txt");
    req.success(function(data) { writeTable("#tableContainer", data).sortable(); });
    req.fail(function() { alert("error"); });
  });
}(jQuery));
