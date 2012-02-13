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
      to_append += "<li><span class='ui-li-count'>" + mealtimes[meal.start_time.getDay()][meal.title.toLowerCase()] + "</span>" + 
                      meal.description.capitalize() + "</li>"
    });
    $(list).append(to_append).listview('refresh');
  });
}

get_menu(0, "#menu-today");
get_menu(1, "#menu-tomorrow");
