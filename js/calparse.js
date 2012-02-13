// Calparse.js
// by Daniel Ma (danielghma@gmail.com)
// 
// Written for the digital signage system at YWAM Kona
// 4th qtr 2011

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, jquery:true, indent:2, maxerr:50 */
/*global google,alert*/

var tickers = [];

String.prototype.capitalize = function () {
  "use strict";
  return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};

var by_mealtime = function (a, b) { // array sorter
  // console.log("a: " + a.title + " b: " + b.title);
  "use strict";
  var vals = [a, b];
  for (var i = 0; i < vals.length; i ++) {
    switch (vals[i].title.toLowerCase()) {
    case "breakfast":
      vals[i] = 0;
      break;
    case "lunch":
      vals[i] = 1;
      break;
    case "dinner":
      vals[i] = 2;
      break;
    default:
      // nil
    }
  }
  // console.log(vals);
  
  return vals[0] - vals[1];
};

var by_time = function (a, b) { // array sorter
  // console.log("a: " + a.title + " b: " + b.title);
  "use strict";
  return a.start_time - b.start_time;
};

function Event(opts) {
  "use strict";
  if (typeof (opts) !== "undefined") {
    this.title        = opts.title;
    this.start_time   = opts.start_time || Date.today();
    this.end_time     = opts.end_time || Date.today().set({hour: 23, minute: 59, second: 59});
    this.location     = opts.location || "";
    this.description  = opts.description || "";
    this.attachment   = opts.attachment;
  }
}

function Ticker(opts) {
  "use strict";
  var self = this;

  if (typeof (opts) !== "undefined") {
    this.element      = $(opts.element);
    this.items        = opts.items || [];
    this.running      = opts.running || false;
    this.speed        = opts.speed || 10000;

    // just to define these. maybe javascript should use .h files :P
    this.currentItem  = 0;
    this.interval     = null;
    this.tickerHeight = 0;
  }
  
  this.addItem = function (html) {
    this.element.append(html);
    this.items.push(html);
    this.setSize();
    if (!this.running) {
      this.start();
    }
  };
  
  this.start = function () {
    // console.log("Starting the ticker")
    // console.log(this.element)
    // console.log(this.items)
    if (this.running) {
      clearInterval(this.interval);
    }
    // this.rotate();
    this.interval = setInterval(this.rotate, this.speed);
    this.running = true;
  };
  
  this.stop = function () {
    clearInterval(this.interval);
    this.running = false;
  };
  
  this.rotate = function () {
    // console.log("rotating");
    if (self.items.length > 1) {
      $(self.element.children()[self.currentItem]).fadeOut(function () {
        self.stepCurrentItem();

        $(self.element.children()[self.currentItem]).fadeIn();
      });
    } else {
      $(self.element.children()[0]).fadeIn();
      self.stop();
    }
  };
  
  this.stepCurrentItem = function () {
    this.currentItem += 1;
    
    if (this.currentItem > (this.items.length - 1)) {
      this.currentItem = 0;
    }
  };
  
  this.setSize = function () {
    var parentHeight = this.element.parent().outerHeight();
    // console.log("parentHeight = " + parentHeight)
    var siblingHeight = this.element.siblings().outerHeight();
    // console.log("siblingHeight = " + siblingHeight)
    var padding = this.element.outerHeight() - this.element.height();
    // console.log("padding = " + padding)
    this.tickerHeight = parentHeight - siblingHeight - padding;
    // console.log("this.tickerHeight = " + this.tickerHeight)
    
    // console.log(tickerHeight)
        
    // console.log(this.tickerHeight)
    // this.element //.css("height", "0px")
    //   .children().css("height", this.tickerHeight + "px")
    //   .find("img").css("height", this.tickerHeight - 20 + "px");
    
    this.element.find("img").css("height", this.tickerHeight + "px");
  };
  
  this.setSize();
  if (this.running) {
    this.start();
  }
  tickers.push(this);
}

String.prototype.repeat = function (num) {
  "use strict";
  return [num + 1].join(this);
};

var videoPlayer = {
  list: ["1", '2'], // '3', '4', '5', '6', '7', '8', '9', '10'],
  path: "videos/",
  format: ".webm",
  currentVideo: 0,
  element: null,
  // refresh: false,
  fnQueue: [],
   
  playVideos: function (opts) {
    "use strict";
    if (typeof(opts) != "undefined") {
      this.list = opts.list || this.list;
      this.path = opts.path || this.path;
      this.format = opts.format || this.format;
    }
    $("#video .content").html("<video id='videoPlayer' src='" + this.path + this.list[0] + this.format + "' autoplay autobuffer />");

    var video = $("#video");
    var padding = video.children().outerHeight() - video.children().height();
    var maxHeight = video.outerHeight() - padding;
    this.element = $("#videoPlayer");
    this.element.css("max-height", maxHeight + "px").bind("ended", function () {
      videoPlayer.nextVideo();
    });
  }, 
  
  nextVideo: function () {
    "use strict";
    if (this.fnQueue.length > 0) { // if it's time to reload the page
      for (var i=0; i < this.fnQueue.length; i++) {
        this.fnQueue.pop()(); // double () to execute functions in queue
      };
      return "";
    }
    this.currentVideo += 1;
    if (this.currentVideo >= this.list.length) {
      this.currentVideo = 0;
    }
    this.element.attr("src", this.path + this.list[this.currentVideo] + this.format);
    this.element[0].play();
  },
  
  queueFn: function(callback) {
    "use strict";
    this.fnQueue.push(callback);
  }, 
  
  queueRefresh: function() {
    "use strict";
    this.fnQueue.push(function() {location.reload(true);});
  }
};

var layoutParser = {
  output: "", 
  // layoutFnQueue: [],
  layout: {},
  
  parse: function (layout) {
    "use strict";
    this.layout = layout;
    this.recursiveParse(layout, {id: layout[0].parent});
    
    $("div[data-height], div[data-width]").each(function(idx, el) {
      var element = $(el);
      var height  = element.attr("data-height");
      var width   = element.attr("data-width");
      var compute;

      if(typeof(height) != "undefined") { // if there's data-height
        compute = (height/100 * (element.parent().height() - 1));
        element.height(compute + "px");
      } else {
        compute = (width/100 * (element.parent().width() - 1));
        element.width(compute + "px");
      }
    });
    
    // alert("are there stuff?")
    // $(".layout").layout();
    
    // $("#wrapper").append("<textarea cols=100 rows=100>" + this.output + "</textarea>")
    // $("#wrapper").css({width: "50%"}).layout({
    //   type: "flexgrid",
    //   hgap: 3,
    //   vgap: 3,
    //   rows: 1,
    //   columns: 2
    // }) //.children().layout();
    // for (var i = this.layoutFnQueue.length - 1; i >= 0; i--){
    //   $("#" + this.layoutFnQueue[i]).layout();
    // };
    // for (var i=0; i < this.layoutFnQueue.length; i++) {
    //   // eval(this.layoutFnQueue[i]);
    //   console.log("#" + this.layoutFnQueue[i] + ".layout()");
    //   $("#" + this.layoutFnQueue[i]).layout();
    // };
  },
  
  queueReloadData: function() {
	  videoPlayer.queueFn(function() {layoutParser.loadData();})
  }, 
  
  loadData: function (obj) {
    "use strict";
    if (typeof(obj) === "undefined") {
      obj = this.layout;
    }
    for (var i = 0; i < obj.length; i++) {
      var object = obj[i];
      if (typeof(object.content) === "function") {
        object.content();
      }
      if (typeof(object.content) === "object") {
        this.loadData(object.content);
      }
    } // for()   
    
  }, 
  
  recursiveParse: function (obj, parent) {
    "use strict";
    var tab = "  ";
    
    // if (typeof(level) === "undefined") {
    //   level = 0;
    // }
  
    for (var i = 0; i < obj.length; i++) {
      var object = obj[i];
      // console.log(tab.repeat(level) + object.id)
      var beforeContent = "";
      var afterContent  = "";
      var output = "";
      
      // wType = typeof(parent);
      // 
      // if (wType != "undefined") {
        // console.log(object.id + " has a parent!")
        
      var preWrap = "";
      var postWrap = "";
        // preWrap = "<" + tag + " id='" + object.id + "' " + wrapIn.sizeProp + "='" + object.size + "%'>";
      // if (typeof(object.content) === "object") {
      // var layout = {type:'grid', hgap: 3, vgap: 3};
      // layout[wrapIn.sizeProp] = 1
      
      preWrap = "<div id='" + object.id + "'"; // class='layout ";
      // preWrap += "" + JSON.stringify({layout: layout})
      preWrap += ">";
      postWrap = "</div>";
        // this.layoutFnQueue.push(object.id);
      // }
      beforeContent = preWrap + "<!-- !wrapin#" + object.id + "-->\n" + beforeContent;
      // console.log(beforeContent)
      afterContent += postWrap + "<!-- /wrapin#" + object.id + "-->\n";
        // console.log(afterContent)
      // }
      
      output += beforeContent;
      
      if (typeof(object.content) === "function") {
        // console.log(tab.repeat(level) + "recursiveParse-ing " + object.id);
        // console.log(wrapIn)
        // output += tab.repeat(level + 3) + "<!-- content of #" + object.id + " -->\n";
        // if (typeof(wrapIn) != "undefined") {
        //   this.layoutFnQueue.push('$("#' + object.id + '").layout({type: "grid", hgap: 3, vgap: 3, ' + wrapIn.sizeProp +': 1})');
        // }
        // output += tab.repeat(level + 3) + "\n";
        if (object.title) {
          output += "<h1>" + object.title + "</h1>";
        }
        output += "<div class='content'>" + object.id + "</div>\n";        
      }
      
      output += afterContent;

      // console.log("#" + parent.id + ".append(#" + object.id + ")")
      // console.log(output)

      $(output).appendTo("#" + parent.id);

      var element = $("#" + object.id);
      if (typeof(object.content) === "object") {
        if (object.orient === "horizontal") {
          element.attr("data-height", object.size);
          // element.addClass("layout {layout: {type: 'flexGrid', resize: false, rows: 1, columns: " + object.content.length + "}}");
          // element.addClass("layout {layout: {type: 'flexGrid', resize: false, rows: 1}}");
          element.addClass("hbox");
        } else {
          element.attr("data-width", object.size);
          // element.addClass("layout {layout: {type: 'flexGrid', hgap: 3, columns: 1, rows: " + object.content.length + "}}");
          // element.addClass("layout {layout: {type: 'flexGrid', resize: false, hgap: 3, columns: 1}}");
          element.addClass("vbox");
        }
        this.recursiveParse(object.content, object);
      } else {
        if (parent.orient === "horizontal") {
          element.attr("data-width", object.size || 100 / parent.content.length);
        } else {
          element.attr("data-height", object.size || 100 / parent.content.length);
        }
      }
      
      
      // console.log(tab.repeat(level) + "made it to the end of " + object.id)
    } // for()   
  }
};


var imdbAPI = {
  get_movie: function (ev, callback) {
    "use strict";
    var req = $.ajax({
      url : "http://www.imdbapi.com/",
      data: {t: ev.title},
      dataType : "jsonp",
      timeout : 10000,
      success: function (data) {
        // console.log(data.Title.toLowerCase() + " === " + ev.title.toLowerCase())
        if (data.Title.toLowerCase() === ev.title.toLowerCase()) {
          // console.log(title);
          ev.attachment = data.Poster;
          ev.title = data.Title;
          ev.description = data.Plot;
          
          callback(ev);
        } else {
          // console.log("no match");
          callback(ev);
        }
      },
			error: function (data) {
				callback(ev);
			}
    });
    
    // ev.attachment = "http://ia.media-imdb.com/images/M/MV5BMjEzNjg1NTg2NV5BMl5BanBnXkFtZTYwNjY3MzQ5._V1._SX320.jpg";
    // ev.description = "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
    // callback(ev);
  }
};

var CalData = {
  write_table: function (events, element, format) {
    "use strict";
    // Format: 
    // Start Time: s(hh:mm:t)
    // End Time: e(hh:mm:t)
    // Column break: |
    var start_time, end_time;
    
    var fmt = this.auto_format(format);
    
    format      = fmt[0];
    start_time  = fmt[1];
    end_time    = fmt[2];
    
    var html = "<table>";
    // console.log(data.feed);
    // console.log(element);
    if (events.length === 0) {
      $(element).html("No events");
      return;
    }
    for (var i = 0; i < events.length; i++) {
      var item = events[i];
      // var eventTitle = eventEntry.getTitle().getText();
      // console.log('Event title = ' + eventTitle);
      // console.log(html);
      // console.log(item);
      var newstr = "";
      // console.log(format)
      newstr = format.replace(/s\((.*?)\)/, item.start_time.toString(start_time));
      // console.log(newstr)
      newstr = newstr.replace(/e\((.*?)\)/, item.end_time.toString(end_time));
      // console.log(newstr);
      newstr = newstr.replace(/t\(\)/, item.title);
      // console.log(newstr)
      newstr = newstr.replace(/d\(\)/, item.description);
      newstr = newstr.replace(/\n/g, "<br/>");
      newstr = newstr.replace(/\|/g, "</td><td>");
      // console.log(newstr)
      // newstr = newstr.replace(/ /g, "&nbsp;");
      html += "<tr><td>" + newstr + "</td></tr>";
    }
    
    html += "</table>";
    
    // console.log(html);
    // console.log("$(" + element + ").append(" + html + ")")
    // console.log("putting table into" + element)
    $(element).html(html);
  },
  
  auto_format: function (format) {
    "use strict";
    var start_time, end_time;
    
    if (typeof(format) === "undefined") {
      start_time  = "h:mm";
      end_time    = "h:mm";
      format      = "s() - e() &mdash; t()";
    } else {
      format.replace(/s\(([\s\S]*?)\)/m, "");
      start_time = RegExp.$1;
      format.replace(/e\(([\s\S]*?)\)/m, "");
      end_time = RegExp.$1;
    }
    
    return [format, start_time, end_time];
  },
  
  ticker_html: function (item, format, start_time, end_time) {
    "use strict";
    var html = "";
    var timestr = "";
    // console.log("format = " + format)
    // console.log("start_time = " + start_time)
    timestr = format.replace(/s\(([\s\S]*?)\)/gm, item.start_time.toString(start_time));
    // console.log(newstr)
    timestr = timestr.replace(/e\(([\s\S]*?)\)/gm, item.end_time.toString(end_time));
    timestr = timestr.replace(/\n/g, "<br/>");
    // console.log(newstr);
    // newstr = newstr.replace(/t\(\)/, ev.title);
    // console.log(newstr)
    // newstr = newstr.replace(/d\(\)/, ev.description);
    // newstr = newstr.replace(/\n/g, "<br/>");
    // console.log(newstr)
    // newstr = newstr.replace(/ /g, "&nbsp;");
    html += "<div class='item' style='display: none'>";
    if (item.attachment) {
      html += "<img src='" + item.attachment + "' />";
    }
    html += "<div class='title'>" + item.title + "</div>";
    html += "<div class='time'>" + timestr + "</div>";
    html += "<div class='description'>" + item.description + "</div>";
    html += "</div>";
    
    return html;
  }, 
  
  write_ticker: function (events, element, format, movies) {
    "use strict";
    var start_time, end_time;
    var ticker = new Ticker({element: element});

    var fmt = this.auto_format(format);
    
    format      = fmt[0];
    start_time  = fmt[1];
    end_time    = fmt[2];

    $(element).addClass("ticker");
    // console.log(data.feed);
    // console.log(element);
    if (events.length === 0) {
      $(element).html("No events");
      return;
    } else {
      $(element).html("");
      for (var i = 0; i < events.length; i++) {
        var item = events[i];
        if (movies === true) {
          imdbAPI.get_movie(item, this.makeCallback(ticker, item, format, start_time, end_time));
        } else {
          ticker.addItem(this.ticker_html(item, format, start_time, end_time));
        }
      }
    } 
  },
  
  makeCallback: function (ticker, ev, format, start_time, end_time) {
    "use strict";
    return function () {
      ticker.addItem(CalData.ticker_html(ev, format, start_time, end_time));   
    }; 
  }, 
  
  write_movies: function (events, element, format) {
    "use strict";
    this.write_ticker(events, element, format, true);
  }
};

var YConnect = {
  
  date_format: "yyyy/MM/dd", 
  
  // This function will need to add options as the YWAMConnect API Grows
  get_calendar: function (range, callback) {
    "use strict";
    var uri     = "http://api.ywamconnect.net/menu/get.php";
    var params  = {format: "json"};
    var query   = {};
    var events  = [];
    
    var today = Date.today();
    var time  = [];
    
    switch (range) {
    case "today":
      time = [today];
      break;
    case "tomorrow":
      time = [today.addDays(1)];
      break;
    // case "week":
    //   time = [today,
    //     today.clone().addDays(7)]
    //   break;
    // case "nextweek":
    //   time = [today.addDays(7),
    //     today.clone().addDays(7)]
    //   break;
    default:
      time = [today.addDays(range)];
    }
    
    // var multiple_days   = (time.length > 1);
    // var multiple_months;
    var parseable_days  = [];
    // console.log(events)
    
    // All the multiple_days code is on hold because it's unnecessary. Who needs multiple days worth of food data?
    // if (multiple_days) { // if time is more than just one day
    //   
    //   if (time[0].getMonth() === time[1].getMonth()) { // if both in the same month
    //     params.month  = time[0].getMonth() + 1;
    //     params.year   = time[0].getFullYear();
    //     queries       = [params];
    //     multiple_months = false;
    //     
    //     while(time[0].compareTo(time[1]) !== 1) { // while time[0] is before or equal to time[1]
    //       parseable_days.push(time[0].toString(this.date_format));
    //       time[0].addDays(1);
    //     }
    //   } else { // if multiple months
    //     queries[0] = $.extend({month: time[0].getMonth() + 1, year: time[0].getFullYear()}, params);
    //     queries[1] = $.extend({month: time[1].getMonth() + 1, year: time[1].getFullYear()}, params);
    //     multiple_months = true;
    //     parseable_days  = [[], []];
    //     var month       = time[0].getMonth();
    // 
    //     while(time[0].compareTo(time[1]) !== 1) { // while time[0] is before or equal to time[1]
    //       if (time[0].getMonth() === month) {
    //         parseable_days[0].push(time[0].toString(this.date_format));
    //       } else {
    //         parseable_days[1].push(time[0].toString(this.date_format));
    //       }
    //       time[0].addDays(1);
    //     }
    //   }      
    //   
    // } else { // if only one day
      // console.log(time[0])
      // console.log(time[0].getMonth() + 1)
    params.month  = time[0].getMonth() + 1;
    params.year   = time[0].getFullYear();
    query       = params;
    // console.log(queries)
    parseable_days = time[0].toString(this.date_format);
      // console.log(parseable_days);
      
    // };
    
    // Again, multiple_days is on hold.
    //     //   this.create_events(data, events);
    //     // }
    //   // }).then(
    //   //   function () {console.log(events)}
    //   // )
    //   var req = $.ajax({
    //       url : uri,
    //       data: queries[0],
    //       dataType : "jsonp",
    //       timeout : 10000
    //   });
    // 
    //   req.success(function (data) {
    //       // console.log('Yes! Success!');
    //       // console.log(data);
    //       for (var i = 0; i < parseable_days[0].length; i++) {
    //         // console.log("events = " + events);
    //         // console.log(data);
    //         // console.log(data.data[parseable_days[0][i]]);
    //         
    //         YConnect.create_events(data.data[parseable_days[0][i]], parseable_days[0][i], events);
    //       }
    //       
    //       CalData.write_table(events, $("#today .content"), "t()|&mdash;|d()")
    //   });
    // 
    //   req.error(function (data) {
    //       console.log('Oh noes!');
    //   });
    // } else {
    var req = $.ajax({
      url : uri,
      data: query,
      dataType : "jsonp",
      timeout : 10000
    });
      
    req.success(function (data) {
      // console.log('Yes! Success!');
      // console.log(data);
      data = data.data[parseable_days];
      // console.log(data);
      for (var item in data) {
        if (data.hasOwnProperty(item)) {
        // console.log(item + " is " + data[item]);
          events.push(new Event({
            title: item.toLowerCase().capitalize(),
            description: data[item],
            start_time: time[0]
          }));
        }
      }
      events = events.sort(by_mealtime);
      // console.log(events);
      callback(events);
    });
  
    req.error(function (data) {
        // console.log('Error getting data');
    });
    // }
  } //,
  
  // create_events: function (data, date, events) {
  //   "use strict";
  //   // console.log(data);
  //   for(var item in data) {
  //     // console.log(item + " is " + data[item]);
  //     events.push(new Event({
  //       title: item.toLowerCase().capitalize(),
  //       description: data[item]
  //     }));
  //   }
  // }, 
};

var GCal = {
  service: new google.gdata.calendar.CalendarService('konaSignage-app'),
  kona_schedule: "or2b5kqjl58ndf8ien8atkcplg%40group.calendar.google.com",
  kona_events: "o2jfjbba7bcrhkk5p3scfqj7vc%40group.calendar.google.com",
  mauka_theater: "oebubbrli984mh257hd986td80%40group.calendar.google.com",
  // default_opts: {singleevents: "true", v: "2", alt: "jsonc"},
  
  get_calendar: function (name, range, callback, failcount) {
    "use strict";
		if (typeof(failcount) === "undefined") {
			failcount = 0;
		}
    var uri = "https://www.google.com/calendar/feeds/" + name + "/public/full-noattendees";
    
    var query = new google.gdata.calendar.CalendarEventQuery(uri);
    var startMin, startMax;
    
    // options = $.extend(this.default_opts, options);
    var today = Date.today();
    var time = [];
    
    switch (range) {
    case "today":
      time = [today];
      break;
    case "tomorrow":
      time = [today.addDays(1)];
      break;
    case "week":
      time = [today,
        today.clone().addDays(7)];
      break;
    case "upcoming":
      time = [today,
        false];
      break;
    default:
      // nil
    }
    
    if (time.length > 1) { // if time is more than just one day
      startMin = new google.gdata.DateTime(time[0]);
      if (time[1]) {
        startMax = new google.gdata.DateTime(time[1].clone().set({hour: 23, minute: 59, second: 59}));
      } else {
        startMax = null;
      }
    } else {
      startMin = new google.gdata.DateTime(time[0]);
      startMax = new google.gdata.DateTime(time[0].clone().set({hour: 23, minute: 59, second: 59}));
    }
    
    query.setOrderBy("starttime");
    query.setSortOrder("ascending");
    query.setSingleEvents(true);
    query.setMinimumStartTime(startMin);
    query.setMaximumStartTime(startMax);
    
    var events = [];		
    
    this.service.getEventsFeed(query, function (data) {
      var entries = data.feed.entry;

      for (var i = 0; i < entries.length; i++) {
        var eventEntry = entries[i];
        // var eventTitle = eventEntry.getTitle().getText();
        // console.log('Event title = ' + eventTitle);
        events.push(new Event({
          title: eventEntry.getTitle().getText(),
          start_time: google.gdata.DateTime.fromIso8601(eventEntry.getTimes()[0].startTime).date,
          end_time: google.gdata.DateTime.fromIso8601(eventEntry.getTimes()[0].endTime).date,
          location: eventEntry.getLocations()[0].valueString,
          description: eventEntry.getSummary()
        }));
      }
      // console.log(events);
      // return events;
      callback(events);
    },
		function() {
			if (failcount >= 3) {
				videoPlayer.queueRefresh();
			} else {
				GCal.get_calendar(name, range, callback, failcount + 1);
			}
		}); // if there's a problem, you know i'll solve it (aka try again...)
  },
  
  get_two_calendars: function(cal1, cal2, range, callback) {
    "use strict";
    this.get_calendar(cal1, range, function(data1) {
      GCal.get_calendar(cal2, range, function(data2) {
        var mixData = $.merge(data1, data2);
        mixData = mixData.sort(by_time);
        callback(mixData);
      });
    });
  },
  
  handle_error: function (e) {
    "use strict";
    alert("There was an error!");
    alert(e.cause ? e.cause.statusText : e.message);
  }
};