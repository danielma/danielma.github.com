// get some stuff from calparse and insert it into the page
var mealtimes = {
  0: {
    breakfast : "7:30 - 8:15 AM",
    dinner : "5:00 - 6:30 PM"
  },
  1: { // Monday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  2: { // Tuesday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  3: { // Wednesday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  4: { // Thursday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "4:30 - 6:00 PM"
  },
  5: { // Friday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  6: { // Saturday
    breakfast : "8:00 - 8:45 AM",
    dinner: "5:00 - 6:30 PM"
  }
};

function get_menu(range, list) {
  YConnect.get_calendar(range, function(data) {
    var to_append = "";
    var day = data[0].start_time.getDay();
    if (day == 0 || day == 6) {
      // Saturday or sunday
    } else {
      // Weekday. Add in a breakfast item
      data.unshift(
        new Event({
          title: "breakfast",
          description: "Cereal And Stuff"
        })
      );
    }
    $(data).each(function(idx, meal) {
      to_append += "<li>"
        + meal.description.capitalize()
        + "<span class='ui-li-count'>"
        + mealtimes[meal.start_time.getDay()][meal.title.toLowerCase()]
        + "</span>"
        + "</li>";
    });
    $(list).append(to_append).listview('refresh');
  });
};

var debug = [];

function get_events(range, cal, list) {
  GCal.get_calendar(cal, range, function(data) {
    var to_append = "";
    $(data).each(function(idx, evt) {
      console.log(evt);
      to_append += "<li>"
        + "<h3>" + evt.title + "</h3>"
        + "<p>" + evt.start_time.toString("dddd &#97;&#116; h:mm tt") + "</p>";
        if (evt.description.length > 0) {
          to_append += "<ul class='nested'><li>"
            + "<p><strong>" + evt.start_time.toString("dddd &#97;&#116; h:mm tt") + "</strong></p>"
            + "<p>" + evt.description + "</p>"
            + "</li></ul>";
        }
      to_append += "</li>";
    });
    $(list).append(to_append).listview('refresh');
  });
};

$(document).ready(function() {
  get_events("week", GCal.kona_events, "#campus-events");
  get_events("week", GCal.mauka_theater, "#mauka-events");
  get_menu(0, "#menu-today");
  get_menu(1, "#menu-tomorrow");
});
