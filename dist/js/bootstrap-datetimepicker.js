import $ from "jquery";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import objectSupport from "dayjs/plugin/objectSupport";
dayjs.extend(objectSupport);
dayjs.extend(customParseFormat);

var dateTimePicker = function dateTimePicker(element, _options2) {
  var _date,
      _viewDate,
      unset = true,
      input,
      component = false,
      widget = false,
      use24Hours,
      minViewModeNumber = 0,
      actualFormat,
      parseFormats,
      currentViewMode,
      datePickerModes = [{
    clsName: "days",
    navFnc: "M",
    navStep: 1
  }, {
    clsName: "months",
    navFnc: "y",
    navStep: 1
  }, {
    clsName: "years",
    navFnc: "y",
    navStep: 10
  }, {
    clsName: "decades",
    navFnc: "y",
    navStep: 100
  }],
      viewModes = ["days", "months", "years", "decades"],
      verticalModes = ["top", "bottom", "auto"],
      horizontalModes = ["left", "right", "auto"],
      toolbarPlacements = ["default", "top", "bottom"],
      keyMap = {
    up: 38,
    38: "up",
    down: 40,
    40: "down",
    left: 37,
    37: "left",
    right: 39,
    39: "right",
    tab: 9,
    9: "tab",
    escape: 27,
    27: "escape",
    enter: 13,
    13: "enter",
    pageUp: 33,
    33: "pageUp",
    pageDown: 34,
    34: "pageDown",
    shift: 16,
    16: "shift",
    control: 17,
    17: "control",
    space: 32,
    32: "space",
    t: 84,
    84: "t",
    delete: 46,
    46: "delete"
  },
      keyState = {};

  function getDayJs(d) {
    var returnDayJs;

    if (d === undefined || d === null) {
      returnDayJs = dayjs();
    } else if (dayjs(d).isValid() || dayjs.isDayjs(d)) {
      returnDayJs = dayjs(d);
    } else {
      returnDayJs = dayjs(d, parseFormats, _options2.useStrict);
    }

    return returnDayJs;
  }

  function isEnabled(granularity) {
    if (typeof granularity !== "string" || granularity.length > 1) {
      throw new TypeError("isEnabled expects a single character string parameter");
    }

    switch (granularity) {
      case "Y":
        return actualFormat.indexOf("Y") !== -1;

      case "M":
        return actualFormat.indexOf("M") !== -1;

      case "D":
        return actualFormat.indexOf("D") !== -1;

      case "h":
      case "H":
        return actualFormat.toLowerCase().indexOf("h") !== -1;

      case "m":
        return actualFormat.indexOf("m") !== -1;

      case "s":
        return actualFormat.indexOf("s") !== -1;

      default:
        return false;
    }
  }

  function hasTime() {
    return isEnabled("h") || isEnabled("m") || isEnabled("s");
  }

  function hasDate() {
    return isEnabled("Y") || isEnabled("M") || isEnabled("D");
  }

  function getDatePickerTemplate() {
    var headTemplate = $("<thead>").append($("<tr>").append($("<th>").addClass("prev").attr("data-action", "previous").append($("<span>").addClass(_options2.icons.previous))).append($("<th>").addClass("picker-switch").attr("data-action", "pickerSwitch").attr("colspan", _options2.calendarWeeks ? "6" : "5")).append($("<th>").addClass("next").attr("data-action", "next").append($("<span>").addClass(_options2.icons.next)))),
        contTemplate = $("<tbody>").append($("<tr>").append($("<td>").attr("colspan", _options2.calendarWeeks ? "8" : "7")));
    return [$("<div>").addClass("datepicker-days").append($("<table>").addClass("table-condensed").append(headTemplate).append($("<tbody>"))), $("<div>").addClass("datepicker-months").append($("<table>").addClass("table-condensed").append(headTemplate.clone()).append(contTemplate.clone())), $("<div>").addClass("datepicker-years").append($("<table>").addClass("table-condensed").append(headTemplate.clone()).append(contTemplate.clone())), $("<div>").addClass("datepicker-decades").append($("<table>").addClass("table-condensed").append(headTemplate.clone()).append(contTemplate.clone()))];
  }

  function getTimePickerMainTemplate() {
    var topRow = $("<tr>"),
        middleRow = $("<tr>"),
        bottomRow = $("<tr>");

    if (isEnabled("h")) {
      topRow.append($("<td>").append($("<a>").attr({
        href: "#",
        tabindex: "-1",
        title: _options2.tooltips.incrementHour
      }).addClass("btn").attr("data-action", "incrementHours").append($("<span>").addClass(_options2.icons.up))));
      middleRow.append($("<td>").append($("<span>").addClass("timepicker-hour").attr({
        "data-time-component": "hours",
        title: _options2.tooltips.pickHour
      }).attr("data-action", "showHours")));
      bottomRow.append($("<td>").append($("<a>").attr({
        href: "#",
        tabindex: "-1",
        title: _options2.tooltips.decrementHour
      }).addClass("btn").attr("data-action", "decrementHours").append($("<span>").addClass(_options2.icons.down))));
    }

    if (isEnabled("m")) {
      if (isEnabled("h")) {
        topRow.append($("<td>").addClass("separator"));
        middleRow.append($("<td>").addClass("separator").html(":"));
        bottomRow.append($("<td>").addClass("separator"));
      }

      topRow.append($("<td>").append($("<a>").attr({
        href: "#",
        tabindex: "-1",
        title: _options2.tooltips.incrementMinute
      }).addClass("btn").attr("data-action", "incrementMinutes").append($("<span>").addClass(_options2.icons.up))));
      middleRow.append($("<td>").append($("<span>").addClass("timepicker-minute").attr({
        "data-time-component": "minutes",
        title: _options2.tooltips.pickMinute
      }).attr("data-action", "showMinutes")));
      bottomRow.append($("<td>").append($("<a>").attr({
        href: "#",
        tabindex: "-1",
        title: _options2.tooltips.decrementMinute
      }).addClass("btn").attr("data-action", "decrementMinutes").append($("<span>").addClass(_options2.icons.down))));
    }

    if (isEnabled("s")) {
      if (isEnabled("m")) {
        topRow.append($("<td>").addClass("separator"));
        middleRow.append($("<td>").addClass("separator").html(":"));
        bottomRow.append($("<td>").addClass("separator"));
      }

      topRow.append($("<td>").append($("<a>").attr({
        href: "#",
        tabindex: "-1",
        title: _options2.tooltips.incrementSecond
      }).addClass("btn").attr("data-action", "incrementSeconds").append($("<span>").addClass(_options2.icons.up))));
      middleRow.append($("<td>").append($("<span>").addClass("timepicker-second").attr({
        "data-time-component": "seconds",
        title: _options2.tooltips.pickSecond
      }).attr("data-action", "showSeconds")));
      bottomRow.append($("<td>").append($("<a>").attr({
        href: "#",
        tabindex: "-1",
        title: _options2.tooltips.decrementSecond
      }).addClass("btn").attr("data-action", "decrementSeconds").append($("<span>").addClass(_options2.icons.down))));
    }

    if (!use24Hours) {
      topRow.append($("<td>").addClass("separator"));
      middleRow.append($("<td>").append($("<button>").addClass("btn btn-primary").attr({
        "data-action": "togglePeriod",
        tabindex: "-1",
        title: _options2.tooltips.togglePeriod
      })));
      bottomRow.append($("<td>").addClass("separator"));
    }

    return $("<div>").addClass("timepicker-picker").append($("<table>").addClass("table-condensed").append("<tbody>").append([topRow, middleRow, bottomRow]));
  }

  function getTimePickerTemplate() {
    var hoursView = $("<div>").addClass("timepicker-hours").append($("<table>").addClass("table-condensed")),
        minutesView = $("<div>").addClass("timepicker-minutes").append($("<table>").addClass("table-condensed")),
        secondsView = $("<div>").addClass("timepicker-seconds").append($("<table>").addClass("table-condensed")),
        ret = [getTimePickerMainTemplate()];

    if (isEnabled("h")) {
      ret.push(hoursView);
    }

    if (isEnabled("m")) {
      ret.push(minutesView);
    }

    if (isEnabled("s")) {
      ret.push(secondsView);
    }

    return ret;
  }

  function getToolbar() {
    var row = [];

    if (_options2.showTodayButton) {
      pushToolbarItem(row, _options2.icons.today, _options2.tooltips.today, "today");
    }

    if (!_options2.sideBySide && hasDate() && hasTime()) {
      pushToolbarItem(row, _options2.icons.time, _options2.tooltips.selectTime, "togglePicker");
    }

    if (_options2.showClear) {
      pushToolbarItem(row, _options2.icons.clear, _options2.tooltips.clear, "clear");
    }

    if (_options2.showClose) {
      pushToolbarItem(row, _options2.icons.close, _options2.tooltips.close, "close");
    }

    return $("<table>").addClass("table-condensed").append($("<tbody>").append($("<tr>").append(row)));
  }

  function pushToolbarItem(row, icon, tooltip, dataAction) {
    if (typeof icon === "boolean" && icon === false) {
      row.push($("<td>").append($("<a>").attr({
        "data-action": dataAction
      }).append($("<span>").text(tooltip))));
    } else {
      row.push($("<td>").append($("<a>").attr({
        "data-action": dataAction,
        title: tooltip
      }).append($("<span>").addClass(icon))));
    }
  }

  function getTemplate() {
    var template = $("<div>").addClass("bootstrap-datetimepicker-widget dropdown-menu"),
        dateView = $("<div>").addClass("datepicker").append(getDatePickerTemplate()),
        timeView = $("<div>").addClass("timepicker").append(getTimePickerTemplate()),
        content = $("<ul>").addClass("list-unstyled"),
        toolbar = $("<li>").addClass("picker-switch" + (_options2.collapse ? " accordion-toggle" : "")).append(getToolbar());

    if (_options2.inline) {
      template.removeClass("dropdown-menu");
    }

    if (use24Hours) {
      template.addClass("usetwentyfour");
    }

    if (isEnabled("s") && !use24Hours) {
      template.addClass("wider");
    }

    if (_options2.sideBySide && hasDate() && hasTime()) {
      template.addClass("timepicker-sbs");

      if (_options2.toolbarPlacement === "top") {
        template.append(toolbar);
      }

      template.append($("<div>").addClass("row").append(dateView.addClass("col-md-6")).append(timeView.addClass("col-md-6")));

      if (_options2.toolbarPlacement === "bottom") {
        template.append(toolbar);
      }

      return template;
    }

    if (_options2.toolbarPlacement === "top") {
      content.append(toolbar);
    }

    if (hasDate()) {
      content.append($("<li>").addClass(_options2.collapse && hasTime() ? "collapse in" : "").append(dateView));
    }

    if (_options2.toolbarPlacement === "default") {
      content.append(toolbar);
    }

    if (hasTime()) {
      content.append($("<li>").addClass(_options2.collapse && hasDate() ? "collapse" : "").append(timeView));
    }

    if (_options2.toolbarPlacement === "bottom") {
      content.append(toolbar);
    }

    return template.append(content);
  }

  function dataToOptions() {
    var eData,
        dataOptions = {};

    if (element.is("input") || _options2.inline) {
      eData = element.data();
    } else {
      eData = element.find("input").data();
    }

    if (eData.dateOptions && eData.dateOptions instanceof Object) {
      dataOptions = $.extend(true, dataOptions, eData.dateOptions);
    }

    $.each(_options2, function (key) {
      var attributeName = "date" + key.charAt(0).toUpperCase() + key.slice(1);

      if (eData[attributeName] !== undefined) {
        dataOptions[key] = eData[attributeName];
      }
    });
    return dataOptions;
  }

  function place() {
    if (_options2.inline) {
      element.append(widget);
      return;
    }

    var parent = $(_options2.widgetParent).append(widget);
    var calendarWidth = widget.outerWidth();
    var calendarHeight = widget.outerHeight();
    var visualPadding = 10;
    var offset = component ? component.parent().offset() : element.offset();
    var scrollTop = parent.is("body") ? $(document).scrollTop() : parent.scrollTop();
    var appendOffset = parent.offset();
    var height = component ? component.outerHeight(true) : element.outerHeight(false);
    var width = component ? component.outerWidth(true) : element.outerWidth(false);
    var vertical = _options2.widgetPositioning.vertical;
    var horizontal = _options2.widgetPositioning.horizontal;
    var left = offset.left - appendOffset.left;
    var top = offset.top - appendOffset.top;
    var zIndexes = element.parents().map(function () {
      if (this.style.zIndex !== "auto") {
        return Number(this.style.zIndex);
      }

      return null;
    }).get();
    var zIndex = zIndexes.length ? Math.max.apply(Math, zIndexes) + 10 : 10;

    if (!parent.is("body")) {
      top += scrollTop;
    }

    if (vertical === "auto") {
      if (-scrollTop + top - calendarHeight < 0) {
        vertical = "bottom";
      } else {
        vertical = "top";
      }
    }

    if (horizontal === "auto") {
      if (offset.left < 0) {
        horizontal = "left";
        left -= offset.left - visualPadding;
      } else if (left + calendarWidth > parent.width()) {
        horizontal = "right";
        left += width - calendarWidth;
      } else {
        horizontal = "left";
      }
    } else {
      if (horizontal === "right") {
        left -= calendarHeight - width;
      }
    }

    if (vertical === "top") {
      top -= calendarHeight + parseInt(widget.css("padding-top"));
      widget.addClass("top").removeClass("bottom");
    } else {
      top += height;
      widget.addClass("bottom").removeClass("top");
    }

    widget.toggleClass("pull-right", horizontal === "right");
    widget.css({
      top: top,
      left: left,
      zIndex: zIndex
    });
  }

  function notifyEvent(e) {
    if (e.type === "dp.change" && (e.date && e.date.isSame(e.oldDate) || !e.date && !e.oldDate)) {
      return;
    }

    element.trigger(e);
  }

  function viewUpdate(e) {
    if (e === "y") {
      e = "YYYY";
    }

    notifyEvent({
      type: "dp.update",
      change: e,
      viewDate: _viewDate.clone()
    });
  }

  function showMode(dir) {
    if (!widget) {
      return;
    }

    if (dir) {
      currentViewMode = Math.max(minViewModeNumber, Math.min(3, currentViewMode + dir));
    }

    widget.find(".datepicker > div").hide().filter(".datepicker-" + datePickerModes[currentViewMode].clsName).show();
  }

  function fillDow() {
    var row = $("<tr>"),
        currentDate = _viewDate.startOf("w").startOf("d");

    if (_options2.calendarWeeks === true) {
      row.append($("<th>").addClass("cw").text("#"));
    }

    while (currentDate.isBefore(_viewDate.endOf("w"))) {
      row.append($("<th>").addClass("dow").text(currentDate.format("dd")));
      currentDate = currentDate.add(1, "d");
    }

    widget.find(".datepicker-days thead").append(row);
  }

  function isInDisabledDates(testDate) {
    return _options2.disabledDates[testDate.format("YYYY-MM-DD")] === true;
  }

  function isInEnabledDates(testDate) {
    return _options2.enabledDates[testDate.format("YYYY-MM-DD")] === true;
  }

  function isInDisabledHours(testDate) {
    return _options2.disabledHours[testDate.format("H")] === true;
  }

  function isInEnabledHours(testDate) {
    return _options2.enabledHours[testDate.format("H")] === true;
  }

  function isValid(targetDayJs, granularity) {
    if (!targetDayJs.isValid()) {
      return false;
    }

    if (_options2.disabledDates && granularity === "d" && isInDisabledDates(targetDayJs)) {
      return false;
    }

    if (_options2.enabledDates && granularity === "d" && !isInEnabledDates(targetDayJs)) {
      return false;
    }

    if (_options2.minDate && targetDayJs.isBefore(_options2.minDate, granularity)) {
      return false;
    }

    if (_options2.maxDate && targetDayJs.isAfter(_options2.maxDate, granularity)) {
      return false;
    }

    if (_options2.daysOfWeekDisabled && granularity === "d" && _options2.daysOfWeekDisabled.indexOf(targetDayJs.day()) !== -1) {
      return false;
    }

    if (_options2.disabledHours && (granularity === "h" || granularity === "m" || granularity === "s") && isInDisabledHours(targetDayJs)) {
      return false;
    }

    if (_options2.enabledHours && (granularity === "h" || granularity === "m" || granularity === "s") && !isInEnabledHours(targetDayJs)) {
      return false;
    }

    if (_options2.disabledTimeIntervals && (granularity === "h" || granularity === "m" || granularity === "s")) {
      var found = false;
      $.each(_options2.disabledTimeIntervals, function () {
        if (targetDayJs.isBetween(this[0], this[1])) {
          found = true;
          return false;
        }
      });

      if (found) {
        return false;
      }
    }

    return true;
  }

  function fillMonths() {
    var spans = [],
        monthsShort = _viewDate.startOf("y").startOf("d");

    while (monthsShort.isSame(_viewDate, "y")) {
      spans.push($("<span>").attr("data-action", "selectMonth").addClass("month").text(monthsShort.format("MMM")));
      monthsShort = monthsShort.add(1, "M");
    }

    widget.find(".datepicker-months td").empty().append(spans);
  }

  function updateMonths() {
    var monthsView = widget.find(".datepicker-months"),
        monthsViewHeader = monthsView.find("th"),
        months = monthsView.find("tbody").find("span");
    monthsViewHeader.eq(0).find("span").attr("title", _options2.tooltips.prevYear);
    monthsViewHeader.eq(1).attr("title", _options2.tooltips.selectYear);
    monthsViewHeader.eq(2).find("span").attr("title", _options2.tooltips.nextYear);
    monthsView.find(".disabled").removeClass("disabled");

    if (!isValid(_viewDate.subtract(1, "y"), "y")) {
      monthsViewHeader.eq(0).addClass("disabled");
    }

    monthsViewHeader.eq(1).text(_viewDate.year());

    if (!isValid(_viewDate.add(1, "y"), "y")) {
      monthsViewHeader.eq(2).addClass("disabled");
    }

    months.removeClass("active");

    if (_date.isSame(_viewDate, "y") && !unset) {
      months.eq(_date.month()).addClass("active");
    }

    months.each(function (index) {
      if (!isValid(_viewDate.month(index), "M")) {
        $(this).addClass("disabled");
      }
    });
  }

  function updateYears() {
    var year = _viewDate.year();

    var yearsView = widget.find(".datepicker-years"),
        yearsViewHeader = yearsView.find("th"),
        startYearNumber = Math.floor(year / 10) * 10,
        endYearNumber = startYearNumber + 1 * 9,
        startYear = _viewDate.year(startYearNumber),
        endYear = _viewDate.year(endYearNumber),
        html = "";

    yearsViewHeader.eq(0).find("span").attr("title", _options2.tooltips.prevDecade);
    yearsViewHeader.eq(1).attr("title", _options2.tooltips.selectDecade);
    yearsViewHeader.eq(2).find("span").attr("title", _options2.tooltips.nextDecade);
    yearsView.find(".disabled").removeClass("disabled");

    if (_options2.minDate && _options2.minDate.isAfter(startYear, "y")) {
      yearsViewHeader.eq(0).addClass("disabled");
    }

    yearsViewHeader.eq(1).text(startYear.year() + "-" + endYear.year());

    if (_options2.maxDate && _options2.maxDate.isBefore(endYear, "y")) {
      yearsViewHeader.eq(2).addClass("disabled");
    }

    startYear = startYear.add(-1, "y");
    endYear = endYear.add(1, "y");

    while (!startYear.isAfter(endYear, "y")) {
      html += "<span data-action=\"selectYear\" class=\"year" + (startYear.isSame(_date, "y") && !unset ? " active" : "") + (!isValid(startYear, "y") ? " disabled" : "") + (startYear.year() < startYearNumber ? " old" : "") + (startYear.year() > endYearNumber ? " new" : "") + "\">" + startYear.year() + "</span>";
      startYear = startYear.add(1, "y");
    }

    yearsView.find("td").html(html);
  }

  function updateDecades() {
    var decadesView = widget.find(".datepicker-decades"),
        decadesViewHeader = decadesView.find("th"),
        startDecade = dayjs({
      y: _viewDate.year() - _viewDate.year() % 100 - 1
    }),
        endDecade = startDecade.add(100, "y"),
        startedAt = startDecade.clone(),
        minDateDecade = false,
        maxDateDecade = false,
        endDecadeYear,
        html = "";
    decadesViewHeader.eq(0).find("span").attr("title", _options2.tooltips.prevCentury);
    decadesViewHeader.eq(2).find("span").attr("title", _options2.tooltips.nextCentury);
    decadesView.find(".disabled").removeClass("disabled");

    if (startDecade.isSame(dayjs({
      y: 1900
    })) || _options2.minDate && _options2.minDate.isAfter(startDecade, "y")) {
      decadesViewHeader.eq(0).addClass("disabled");
    }

    decadesViewHeader.eq(1).text(startDecade.year() + "-" + endDecade.year());

    if (startDecade.isSame(dayjs({
      y: 2000
    })) || _options2.maxDate && _options2.maxDate.isBefore(endDecade, "y")) {
      decadesViewHeader.eq(2).addClass("disabled");
    }

    while (!startDecade.isAfter(endDecade, "y")) {
      endDecadeYear = startDecade.year() + 12;
      minDateDecade = _options2.minDate && _options2.minDate.isAfter(startDecade, "y") && _options2.minDate.year() <= endDecadeYear;
      maxDateDecade = _options2.maxDate && _options2.maxDate.isAfter(startDecade, "y") && _options2.maxDate.year() <= endDecadeYear;
      html += "<span data-action=\"selectDecade\" class=\"decade" + (_date.isAfter(startDecade) && _date.year() <= endDecadeYear ? " active" : "") + (!isValid(startDecade, "y") && !minDateDecade && !maxDateDecade ? " disabled" : "") + "\" data-selection=\"" + (startDecade.year() + 6) + "\">" + (startDecade.year() + 1) + " - " + (startDecade.year() + 12) + "</span>";
      startDecade = startDecade.add(12, "y");
    }

    html += "<span></span><span></span><span></span>";
    decadesView.find("td").html(html);
    decadesViewHeader.eq(1).text(startedAt.year() + 1 + "-" + startDecade.year());
  }

  function fillDate() {
    var daysView = widget.find(".datepicker-days"),
        daysViewHeader = daysView.find("th"),
        currentDate,
        html = [],
        row,
        clsNames = [],
        i;

    if (!hasDate()) {
      return;
    }

    daysViewHeader.eq(0).find("span").attr("title", _options2.tooltips.prevMonth);
    daysViewHeader.eq(1).attr("title", _options2.tooltips.selectMonth);
    daysViewHeader.eq(2).find("span").attr("title", _options2.tooltips.nextMonth);
    daysView.find(".disabled").removeClass("disabled");
    daysViewHeader.eq(1).text(_viewDate.format(_options2.dayViewHeaderFormat));

    if (!isValid(_viewDate.subtract(1, "M"), "M")) {
      daysViewHeader.eq(0).addClass("disabled");
    }

    if (!isValid(_viewDate.add(1, "M"), "M")) {
      daysViewHeader.eq(2).addClass("disabled");
    }

    currentDate = _viewDate.startOf("M").startOf("w").startOf("d");

    for (i = 0; i < 42; i++) {
      if (currentDate.day() === 0) {
        row = $("<tr>");

        if (_options2.calendarWeeks) {
          row.append("<td class=\"cw\">" + currentDate.week() + "</td>");
        }

        html.push(row);
      }

      clsNames = ["day"];

      if (currentDate.isBefore(_viewDate, "M")) {
        clsNames.push("old");
      }

      if (currentDate.isAfter(_viewDate, "M")) {
        clsNames.push("new");
      }

      if (currentDate.isSame(_date, "d") && !unset) {
        clsNames.push("active");
      }

      if (!isValid(currentDate, "d")) {
        clsNames.push("disabled");
      }

      if (currentDate.isSame(getDayJs(), "d")) {
        clsNames.push("today");
      }

      if (currentDate.day() === 0 || currentDate.day() === 6) {
        clsNames.push("weekend");
      }

      notifyEvent({
        type: "dp.classify",
        date: currentDate,
        classNames: clsNames
      });
      row.append("<td data-action=\"selectDay\" data-day=\"" + currentDate.format("L") + "\" class=\"" + clsNames.join(" ") + "\">" + currentDate.date() + "</td>");
      currentDate = currentDate.add(1, "d");
    }

    daysView.find("tbody").empty().append(html);
    updateMonths();
    updateYears();
    updateDecades();
  }

  function fillHours() {
    var table = widget.find(".timepicker-hours table"),
        currentHour = _viewDate.startOf("d"),
        html = [],
        row = $("<tr>");

    if (_viewDate.hour() > 11 && !use24Hours) {
      currentHour.hour(12);
    }

    while (currentHour.isSame(_viewDate, "d") && (use24Hours || _viewDate.hour() < 12 && currentHour.hour() < 12 || _viewDate.hour() > 11)) {
      if (currentHour.hour() % 4 === 0) {
        row = $("<tr>");
        html.push(row);
      }

      row.append("<td data-action=\"selectHour\" class=\"hour" + (!isValid(currentHour, "h") ? " disabled" : "") + "\">" + currentHour.format(use24Hours ? "HH" : "hh") + "</td>");
      currentHour = currentHour.add(1, "h");
    }

    table.empty().append(html);
  }

  function fillMinutes() {
    var table = widget.find(".timepicker-minutes table"),
        currentMinute = _viewDate.startOf("h"),
        html = [],
        row = $("<tr>"),
        step = _options2.stepping === 1 ? 5 : _options2.stepping;

    while (_viewDate.isSame(currentMinute, "h")) {
      if (currentMinute.minute() % (step * 4) === 0) {
        row = $("<tr>");
        html.push(row);
      }

      row.append("<td data-action=\"selectMinute\" class=\"minute" + (!isValid(currentMinute, "m") ? " disabled" : "") + "\">" + currentMinute.format("mm") + "</td>");
      currentMinute = currentMinute.add(step, "m");
    }

    table.empty().append(html);
  }

  function fillSeconds() {
    var table = widget.find(".timepicker-seconds table"),
        currentSecond = _viewDate.startOf("m"),
        html = [],
        row = $("<tr>");

    while (_viewDate.isSame(currentSecond, "m")) {
      if (currentSecond.second() % 20 === 0) {
        row = $("<tr>");
        html.push(row);
      }

      row.append("<td data-action=\"selectSecond\" class=\"second" + (!isValid(currentSecond, "s") ? " disabled" : "") + "\">" + currentSecond.format("ss") + "</td>");
      currentSecond = currentSecond.add(5, "s");
    }

    table.empty().append(html);
  }

  function fillTime() {
    var toggle,
        newDate,
        timeComponents = widget.find(".timepicker span[data-time-component]");

    if (!use24Hours) {
      toggle = widget.find(".timepicker [data-action=togglePeriod]");
      newDate = _date.add(_date.hour() >= 12 ? -12 : 12, "h");
      toggle.text(_date.format("A"));

      if (isValid(newDate, "h")) {
        toggle.removeClass("disabled");
      } else {
        toggle.addClass("disabled");
      }
    }

    timeComponents.filter("[data-time-component=hours]").text(_date.format(use24Hours ? "HH" : "hh"));
    timeComponents.filter("[data-time-component=minutes]").text(_date.format("mm"));
    timeComponents.filter("[data-time-component=seconds]").text(_date.format("ss"));
    fillHours();
    fillMinutes();
    fillSeconds();
  }

  function update() {
    if (!widget) {
      return;
    }

    fillDate();
    fillTime();
  }

  function setValue(targetDayJs) {
    var oldDate = unset ? null : _date;

    if (!targetDayJs) {
      unset = true;
      input.val("");
      element.data("date", "");
      notifyEvent({
        type: "dp.change",
        date: false,
        oldDate: oldDate
      });
      update();
      return;
    }

    targetDayJs = targetDayJs.clone();

    if (_options2.stepping !== 1) {
      targetDayJs.minute(Math.round(targetDayJs.minute() / _options2.stepping) * _options2.stepping).second(0);

      while (_options2.minDate && targetDayJs.isBefore(_options2.minDate)) {
        targetDayJs = targetDayJs.add(_options2.stepping, "minutes");
      }
    }

    if (isValid(targetDayJs)) {
      _date = targetDayJs;
      _viewDate = _date.clone();
      input.val(_date.format(actualFormat));
      element.data("date", _date.format(actualFormat));
      unset = false;
      update();
      notifyEvent({
        type: "dp.change",
        date: _date.clone(),
        oldDate: oldDate
      });
    } else {
      if (!_options2.keepInvalid) {
        input.val(unset ? "" : _date.format(actualFormat));
      } else {
        notifyEvent({
          type: "dp.change",
          date: targetDayJs,
          oldDate: oldDate
        });
      }

      notifyEvent({
        type: "dp.error",
        date: targetDayJs,
        oldDate: oldDate
      });
    }
  }

  function hide() {
    var transitioning = false;

    if (!widget) {
      return picker;
    }

    widget.find(".collapse").each(function () {
      var collapseData = $(this).data("collapse");

      if (collapseData && collapseData.transitioning) {
        transitioning = true;
        return false;
      }

      return true;
    });

    if (transitioning) {
      return picker;
    }

    if (component && component.hasClass("btn")) {
      component.toggleClass("active");
    }

    widget.hide();
    $(window).off("resize", place);
    widget.off("click", "[data-action]");
    widget.off("mousedown", false);
    widget.remove();
    widget = false;
    notifyEvent({
      type: "dp.hide",
      date: _date.clone()
    });
    input.blur();
    _viewDate = _date.clone();
    return picker;
  }

  function _clear() {
    setValue(null);
  }

  function parseInputDate(inputDate) {
    if (_options2.parseInputDate === undefined) {
      if (!dayjs.isDayjs(inputDate) || inputDate instanceof Date) {
        inputDate = getDayJs(inputDate);
      }
    } else {
      inputDate = _options2.parseInputDate(inputDate);
    }

    return inputDate;
  }

  function doAction(e) {
    if ($(e.currentTarget).is(".disabled")) {
      return false;
    }

    actions[$(e.currentTarget).data("action")].apply(picker, arguments);
    return false;
  }

  function show() {
    var currentDayJs,
        useCurrentGranularity = {
      year: function year(m) {
        return m.month(0).date(1).hour(0).second(0).minute(0);
      },
      month: function month(m) {
        return m.date(1).hour(0).second(0).minute(0);
      },
      day: function day(m) {
        return m.hour(0).second(0).minute(0);
      },
      hour: function hour(m) {
        return m.second(0).minute(0);
      },
      minute: function minute(m) {
        return m.second(0);
      }
    };

    if (input.prop("disabled") || !_options2.ignoreReadonly && input.prop("readonly") || widget) {
      return picker;
    }

    if (input.val() !== undefined && input.val().trim().length !== 0) {
      setValue(parseInputDate(input.val().trim()));
    } else if (unset && _options2.useCurrent && (_options2.inline || input.is("input") && input.val().trim().length === 0)) {
      currentDayJs = getDayJs();

      if (typeof _options2.useCurrent === "string") {
        currentDayJs = useCurrentGranularity[_options2.useCurrent](currentDayJs);
      }

      setValue(currentDayJs);
    }

    widget = getTemplate();
    fillDow();
    fillMonths();
    widget.find(".timepicker-hours").hide();
    widget.find(".timepicker-minutes").hide();
    widget.find(".timepicker-seconds").hide();
    update();
    showMode();
    $(window).on("resize", place);
    widget.on("click", "[data-action]", doAction);
    widget.on("mousedown", false);

    if (component && component.hasClass("btn")) {
      component.toggleClass("active");
    }

    place();
    widget.show();

    if (_options2.focusOnShow && !input.is(":focus")) {
      input.focus();
    }

    notifyEvent({
      type: "dp.show"
    });
    return picker;
  }

  function toggle() {
    return widget ? hide() : show();
  }

  function keydown(e) {
    var handler = null,
        index,
        index2,
        pressedKeys = [],
        pressedModifiers = {},
        currentKey = e.which,
        keyBindKeys,
        allModifiersPressed,
        pressed = "p";
    keyState[currentKey] = pressed;

    for (index in keyState) {
      if (Object.prototype.hasOwnProperty.call(keyState, index) && keyState[index] === pressed) {
        pressedKeys.push(index);

        if (parseInt(index, 10) !== currentKey) {
          pressedModifiers[index] = true;
        }
      }
    }

    for (index in _options2.keyBinds) {
      if (Object.prototype.hasOwnProperty.call(_options2.keyBinds, index) && typeof _options2.keyBinds[index] === "function") {
        keyBindKeys = index.split(" ");

        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
          allModifiersPressed = true;

          for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
            if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
              allModifiersPressed = false;
              break;
            }
          }

          if (allModifiersPressed) {
            handler = _options2.keyBinds[index];
            break;
          }
        }
      }
    }

    if (handler) {
      handler.call(picker, widget);
      e.stopPropagation();
      e.preventDefault();
    }
  }

  function keyup(e) {
    keyState[e.which] = "r";
    e.stopPropagation();
    e.preventDefault();
  }

  function change(e) {
    var val = $(e.target).val().trim(),
        parsedDate = val ? parseInputDate(val) : null;
    setValue(parsedDate);
    e.stopImmediatePropagation();
    return false;
  }

  function attachDatePickerElementEvents() {
    input.on({
      change: change,
      blur: _options2.debug ? "" : hide,
      keydown: keydown,
      keyup: keyup,
      focus: _options2.allowInputToggle ? show : ""
    });

    if (element.is("input")) {
      input.on({
        focus: show
      });
    } else if (component) {
      component.on("click", toggle);
      component.on("mousedown", false);
    }
  }

  function detachDatePickerElementEvents() {
    input.off({
      change: change,
      blur: blur,
      keydown: keydown,
      keyup: keyup,
      focus: _options2.allowInputToggle ? hide : ""
    });

    if (element.is("input")) {
      input.off({
        focus: show
      });
    } else if (component) {
      component.off("click", toggle);
      component.off("mousedown", false);
    }
  }

  function indexGivenDates(givenDatesArray) {
    var givenDatesIndexed = {};
    $.each(givenDatesArray, function () {
      var dDate = parseInputDate(this);

      if (dDate.isValid()) {
        givenDatesIndexed[dDate.format("YYYY-MM-DD")] = true;
      }
    });
    return Object.keys(givenDatesIndexed).length ? givenDatesIndexed : false;
  }

  function indexGivenHours(givenHoursArray) {
    var givenHoursIndexed = {};
    $.each(givenHoursArray, function () {
      givenHoursIndexed[this] = true;
    });
    return Object.keys(givenHoursIndexed).length ? givenHoursIndexed : false;
  }

  function initFormatting() {
    actualFormat = _options2.format || "DD MMM YYYY h:mm A";
    parseFormats = _options2.extraFormats ? _options2.extraFormats.slice() : [];

    if (parseFormats.indexOf(actualFormat) < 0) {
      parseFormats.push(actualFormat);
    }

    use24Hours = actualFormat.toLowerCase().indexOf("a") < 1 && actualFormat.replace(/\[.*?\]/g, "").indexOf("h") < 1;

    if (isEnabled("Y")) {
      minViewModeNumber = 2;
    }

    if (isEnabled("M")) {
      minViewModeNumber = 1;
    }

    if (isEnabled("D")) {
      minViewModeNumber = 0;
    }

    currentViewMode = Math.max(minViewModeNumber, currentViewMode);

    if (!unset) {
      setValue(_date);
    }
  }

  var actions = {
    next: function next() {
      var navFnc = datePickerModes[currentViewMode].navFnc;
      _viewDate = _viewDate.add(datePickerModes[currentViewMode].navStep, navFnc);
      fillDate();
      viewUpdate(navFnc);
    },
    previous: function previous() {
      var navFnc = datePickerModes[currentViewMode].navFnc;
      _viewDate = _viewDate.subtract(datePickerModes[currentViewMode].navStep, navFnc);
      fillDate();
      viewUpdate(navFnc);
    },
    pickerSwitch: function pickerSwitch() {
      showMode(1);
    },
    selectMonth: function selectMonth(e) {
      var month = $(e.target).closest("tbody").find("span").index($(e.target));
      _viewDate = _viewDate.month(month);

      if (currentViewMode === minViewModeNumber) {
        setValue(_date.clone().year(_viewDate.year()).month(_viewDate.month()));

        if (!_options2.inline) {
          hide();
        }
      } else {
        showMode(-1);
        fillDate();
      }

      viewUpdate("M");
    },
    selectYear: function selectYear(e) {
      var year = parseInt($(e.target).text(), 10) || 0;
      _viewDate = _viewDate.year(year);

      if (currentViewMode === minViewModeNumber) {
        setValue(_date.clone().year(_viewDate.year()));

        if (!_options2.inline) {
          hide();
        }
      } else {
        showMode(-1);
        fillDate();
      }

      viewUpdate("YYYY");
    },
    selectDecade: function selectDecade(e) {
      var year = parseInt($(e.target).data("selection"), 10) || 0;
      _viewDate = _viewDate.year(year);

      if (currentViewMode === minViewModeNumber) {
        setValue(_date.clone().year(_viewDate.year()));

        if (!_options2.inline) {
          hide();
        }
      } else {
        showMode(-1);
        fillDate();
      }

      viewUpdate("YYYY");
    },
    selectDay: function selectDay(e) {
      var day = _viewDate.clone();

      if ($(e.target).is(".old")) {
        day = day.subtract(1, "M");
      }

      if ($(e.target).is(".new")) {
        day = day.add(1, "M");
      }

      setValue(day.date(parseInt($(e.target).text(), 10)));

      if (!hasTime() && !_options2.keepOpen && !_options2.inline) {
        hide();
      }
    },
    incrementHours: function incrementHours() {
      var newDate = _date.add(1, "h");

      if (isValid(newDate, "h")) {
        setValue(newDate);
      }
    },
    incrementMinutes: function incrementMinutes() {
      var newDate = _date.add(_options2.stepping, "m");

      if (isValid(newDate, "m")) {
        setValue(newDate);
      }
    },
    incrementSeconds: function incrementSeconds() {
      var newDate = _date.add(1, "s");

      if (isValid(newDate, "s")) {
        setValue(newDate);
      }
    },
    decrementHours: function decrementHours() {
      var newDate = _date.subtract(1, "h");

      if (isValid(newDate, "h")) {
        setValue(newDate);
      }
    },
    decrementMinutes: function decrementMinutes() {
      var newDate = _date.subtract(_options2.stepping, "m");

      if (isValid(newDate, "m")) {
        setValue(newDate);
      }
    },
    decrementSeconds: function decrementSeconds() {
      var newDate = _date.subtract(1, "s");

      if (isValid(newDate, "s")) {
        setValue(newDate);
      }
    },
    togglePeriod: function togglePeriod() {
      setValue(_date.add(_date.hour() >= 12 ? -12 : 12, "h"));
    },
    togglePicker: function togglePicker(e) {
      var $this = $(e.target),
          $parent = $this.closest("ul"),
          expanded = $parent.find(".in"),
          closed = $parent.find(".collapse:not(.in)"),
          collapseData;

      if (expanded && expanded.length) {
        collapseData = expanded.data("collapse");

        if (collapseData && collapseData.transitioning) {
          return;
        }

        if (expanded.collapse) {
          expanded.collapse("hide");
          closed.collapse("show");
        } else {
          expanded.removeClass("in");
          closed.addClass("in");
        }

        var datePicker = closed.find(".datepicker");
        var dateExpanded = datePicker && datePicker.length;
        var timeAsText = typeof _options2.icons.time === "boolean" && _options2.icons.time === false;
        var dateAsText = typeof _options2.icons.date === "boolean" && _options2.icons.date === false;
        var $span = $this.is("span") ? $this : $this.find("span");

        if (timeAsText) {
          if (dateExpanded) {
            $span.text(_options2.tooltips.selectTime);
          } else if (!dateAsText) {
            $span.empty();
          }
        } else {
          $span.toggleClass(_options2.icons.time);

          if (dateExpanded) {
            $span.attr("title", _options2.tooltips.selectTime);
          }
        }

        if (dateAsText) {
          if (!dateExpanded) {
            $span.text(_options2.tooltips.selectDate);
          } else if (!timeAsText) {
            $span.empty();
          }
        } else {
          $span.toggleClass(_options2.icons.date);

          if (!dateExpanded) {
            $span.attr("title", _options2.tooltips.selectDate);
          }
        }
      }
    },
    showPicker: function showPicker() {
      widget.find(".timepicker > div:not(.timepicker-picker)").hide();
      widget.find(".timepicker .timepicker-picker").show();
    },
    showHours: function showHours() {
      widget.find(".timepicker .timepicker-picker").hide();
      widget.find(".timepicker .timepicker-hours").show();
    },
    showMinutes: function showMinutes() {
      widget.find(".timepicker .timepicker-picker").hide();
      widget.find(".timepicker .timepicker-minutes").show();
    },
    showSeconds: function showSeconds() {
      widget.find(".timepicker .timepicker-picker").hide();
      widget.find(".timepicker .timepicker-seconds").show();
    },
    selectHour: function selectHour(e) {
      var hour = parseInt($(e.target).text(), 10);

      if (!use24Hours) {
        if (_date.hour() >= 12) {
          if (hour !== 12) {
            hour += 12;
          }
        } else {
          if (hour === 12) {
            hour = 0;
          }
        }
      }

      setValue(_date.clone().hour(hour));
      actions.showPicker.call(picker);
    },
    selectMinute: function selectMinute(e) {
      setValue(_date.clone().minute(parseInt($(e.target).text(), 10)));
      actions.showPicker.call(picker);
    },
    selectSecond: function selectSecond(e) {
      setValue(_date.clone().second(parseInt($(e.target).text(), 10)));
      actions.showPicker.call(picker);
    },
    clear: _clear,
    today: function today() {
      var todaysDate = getDayJs();

      if (isValid(todaysDate, "d")) {
        setValue(todaysDate);
      }
    },
    close: hide
  };
  var picker = {
    destroy: function destroy() {
      hide();
      detachDatePickerElementEvents();
      element.removeData("DateTimePicker");
      element.removeData("date");
    },
    toggle: toggle,
    show: show,
    hide: hide,
    disable: function disable() {
      hide();

      if (component && component.hasClass("btn")) {
        component.addClass("disabled");
      }

      input.prop("disabled", true);
      return picker;
    },
    enable: function enable() {
      if (component && component.hasClass("btn")) {
        component.removeClass("disabled");
      }

      input.prop("disabled", false);
      return picker;
    },
    ignoreReadonly: function ignoreReadonly(_ignoreReadonly) {
      if (arguments.length === 0) {
        return _options2.ignoreReadonly;
      }

      if (typeof _ignoreReadonly !== "boolean") {
        throw new TypeError("ignoreReadonly () expects a boolean parameter");
      }

      _options2.ignoreReadonly = _ignoreReadonly;
      return picker;
    },
    options: function options(newOptions) {
      if (arguments.length === 0) {
        return $.extend(true, {}, _options2);
      }

      if (!(newOptions instanceof Object)) {
        throw new TypeError("options() options parameter should be an object");
      }

      $.extend(true, _options2, newOptions);
      $.each(_options2, function (key, value) {
        if (picker[key] !== undefined) {
          picker[key](value);
        } else {
          throw new TypeError("option " + key + " is not recognized!");
        }
      });
      return picker;
    },
    date: function date(newDate) {
      if (arguments.length === 0) {
        if (unset) {
          return null;
        }

        return _date.clone();
      }

      if (newDate !== null && typeof newDate !== "string" && !dayjs.isDayjs(newDate) && !(newDate instanceof Date)) {
        throw new TypeError("date() parameter must be one of [null, string, dayjs or Date]");
      }

      setValue(newDate === null ? null : parseInputDate(newDate));
      return picker;
    },
    format: function format(newFormat) {
      if (arguments.length === 0) {
        return _options2.format;
      }

      if (typeof newFormat !== "string" && (typeof newFormat !== "boolean" || newFormat !== false)) {
        throw new TypeError("format() expects a string or boolean:false parameter " + newFormat);
      }

      _options2.format = newFormat;

      if (actualFormat) {
        initFormatting();
      }

      return picker;
    },
    dayViewHeaderFormat: function dayViewHeaderFormat(newFormat) {
      if (arguments.length === 0) {
        return _options2.dayViewHeaderFormat;
      }

      if (typeof newFormat !== "string") {
        throw new TypeError("dayViewHeaderFormat() expects a string parameter");
      }

      _options2.dayViewHeaderFormat = newFormat;
      return picker;
    },
    extraFormats: function extraFormats(formats) {
      if (arguments.length === 0) {
        return _options2.extraFormats;
      }

      if (formats !== false && !(formats instanceof Array)) {
        throw new TypeError("extraFormats() expects an array or false parameter");
      }

      _options2.extraFormats = formats;

      if (parseFormats) {
        initFormatting();
      }

      return picker;
    },
    disabledDates: function disabledDates(dates) {
      if (arguments.length === 0) {
        return _options2.disabledDates ? $.extend({}, _options2.disabledDates) : _options2.disabledDates;
      }

      if (!dates) {
        _options2.disabledDates = false;
        update();
        return picker;
      }

      if (!(dates instanceof Array)) {
        throw new TypeError("disabledDates() expects an array parameter");
      }

      _options2.disabledDates = indexGivenDates(dates);
      _options2.enabledDates = false;
      update();
      return picker;
    },
    enabledDates: function enabledDates(dates) {
      if (arguments.length === 0) {
        return _options2.enabledDates ? $.extend({}, _options2.enabledDates) : _options2.enabledDates;
      }

      if (!dates) {
        _options2.enabledDates = false;
        update();
        return picker;
      }

      if (!(dates instanceof Array)) {
        throw new TypeError("enabledDates() expects an array parameter");
      }

      _options2.enabledDates = indexGivenDates(dates);
      _options2.disabledDates = false;
      update();
      return picker;
    },
    daysOfWeekDisabled: function daysOfWeekDisabled(_daysOfWeekDisabled) {
      if (arguments.length === 0) {
        return _options2.daysOfWeekDisabled ? _options2.daysOfWeekDisabled.splice(0) : _options2.daysOfWeekDisabled;
      }

      if (typeof _daysOfWeekDisabled === "boolean" && !_daysOfWeekDisabled) {
        _options2.daysOfWeekDisabled = false;
        update();
        return picker;
      }

      if (!(_daysOfWeekDisabled instanceof Array)) {
        throw new TypeError("daysOfWeekDisabled() expects an array parameter");
      }

      _options2.daysOfWeekDisabled = _daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
        currentValue = parseInt(currentValue, 10);

        if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
          return previousValue;
        }

        if (previousValue.indexOf(currentValue) === -1) {
          previousValue.push(currentValue);
        }

        return previousValue;
      }, []).sort();

      if (_options2.useCurrent && !_options2.keepInvalid) {
        var tries = 0;

        while (!isValid(_date, "d")) {
          _date = _date.add(1, "d");

          if (tries === 31) {
            throw "Tried 31 times to find a valid date";
          }

          tries++;
        }

        setValue(_date);
      }

      update();
      return picker;
    },
    maxDate: function maxDate(_maxDate) {
      if (arguments.length === 0) {
        return _options2.maxDate ? _options2.maxDate.clone() : _options2.maxDate;
      }

      if (typeof _maxDate === "boolean" && _maxDate === false) {
        _options2.maxDate = false;
        update();
        return picker;
      }

      if (typeof _maxDate === "string") {
        if (_maxDate === "now" || _maxDate === "dayjs") {
          _maxDate = getDayJs();
        }
      }

      var parsedDate = parseInputDate(_maxDate);

      if (!parsedDate.isValid()) {
        throw new TypeError("maxDate() Could not parse date parameter: " + _maxDate);
      }

      if (_options2.minDate && parsedDate.isBefore(_options2.minDate)) {
        throw new TypeError("maxDate() date parameter is before options.minDate: " + parsedDate.format(actualFormat));
      }

      _options2.maxDate = parsedDate;

      if (_options2.useCurrent && !_options2.keepInvalid && _date.isAfter(_maxDate)) {
        setValue(_options2.maxDate);
      }

      if (_viewDate.isAfter(parsedDate)) {
        _viewDate = parsedDate.subtract(_options2.stepping, "m");
      }

      update();
      return picker;
    },
    minDate: function minDate(_minDate) {
      if (arguments.length === 0) {
        return _options2.minDate ? _options2.minDate.clone() : _options2.minDate;
      }

      if (typeof _minDate === "boolean" && _minDate === false) {
        _options2.minDate = false;
        update();
        return picker;
      }

      if (typeof _minDate === "string") {
        if (_minDate === "now" || _minDate === "dayjs") {
          _minDate = getDayJs();
        }
      }

      var parsedDate = parseInputDate(_minDate);

      if (!parsedDate.isValid()) {
        throw new TypeError("minDate() Could not parse date parameter: " + _minDate);
      }

      if (_options2.maxDate && parsedDate.isAfter(_options2.maxDate)) {
        throw new TypeError("minDate() date parameter is after options.maxDate: " + parsedDate.format(actualFormat));
      }

      _options2.minDate = parsedDate;

      if (_options2.useCurrent && !_options2.keepInvalid && _date.isBefore(_minDate)) {
        setValue(_options2.minDate);
      }

      if (_viewDate.isBefore(parsedDate)) {
        _viewDate = parsedDate.add(_options2.stepping, "m");
      }

      update();
      return picker;
    },
    defaultDate: function defaultDate(_defaultDate) {
      if (arguments.length === 0) {
        return _options2.defaultDate ? _options2.defaultDate.clone() : _options2.defaultDate;
      }

      if (!_defaultDate) {
        _options2.defaultDate = false;
        return picker;
      }

      if (typeof _defaultDate === "string") {
        if (_defaultDate === "now" || _defaultDate === "dayjs") {
          _defaultDate = getDayJs();
        } else {
          _defaultDate = getDayJs(_defaultDate);
        }
      }

      var parsedDate = parseInputDate(_defaultDate);

      if (!parsedDate.isValid()) {
        throw new TypeError("defaultDate() Could not parse date parameter: " + _defaultDate);
      }

      if (!isValid(parsedDate)) {
        throw new TypeError("defaultDate() date passed is invalid according to component setup validations");
      }

      _options2.defaultDate = parsedDate;

      if (_options2.defaultDate && _options2.inline || input.val().trim() === "") {
        setValue(_options2.defaultDate);
      }

      return picker;
    },
    stepping: function stepping(_stepping) {
      if (arguments.length === 0) {
        return _options2.stepping;
      }

      _stepping = parseInt(_stepping, 10);

      if (isNaN(_stepping) || _stepping < 1) {
        _stepping = 1;
      }

      _options2.stepping = _stepping;
      return picker;
    },
    useCurrent: function useCurrent(_useCurrent) {
      var useCurrentOptions = ["year", "month", "day", "hour", "minute"];

      if (arguments.length === 0) {
        return _options2.useCurrent;
      }

      if (typeof _useCurrent !== "boolean" && typeof _useCurrent !== "string") {
        throw new TypeError("useCurrent() expects a boolean or string parameter");
      }

      if (typeof _useCurrent === "string" && useCurrentOptions.indexOf(_useCurrent.toLowerCase()) === -1) {
        throw new TypeError("useCurrent() expects a string parameter of " + useCurrentOptions.join(", "));
      }

      _options2.useCurrent = _useCurrent;
      return picker;
    },
    collapse: function collapse(_collapse) {
      if (arguments.length === 0) {
        return _options2.collapse;
      }

      if (typeof _collapse !== "boolean") {
        throw new TypeError("collapse() expects a boolean parameter");
      }

      if (_options2.collapse === _collapse) {
        return picker;
      }

      _options2.collapse = _collapse;

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    icons: function icons(_icons) {
      if (arguments.length === 0) {
        return $.extend({}, _options2.icons);
      }

      if (!(_icons instanceof Object)) {
        throw new TypeError("icons() expects parameter to be an Object");
      }

      $.extend(_options2.icons, _icons);

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    tooltips: function tooltips(_tooltips) {
      if (arguments.length === 0) {
        return $.extend({}, _options2.tooltips);
      }

      if (!(_tooltips instanceof Object)) {
        throw new TypeError("tooltips() expects parameter to be an Object");
      }

      $.extend(_options2.tooltips, _tooltips);

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    useStrict: function useStrict(_useStrict) {
      if (arguments.length === 0) {
        return _options2.useStrict;
      }

      if (typeof _useStrict !== "boolean") {
        throw new TypeError("useStrict() expects a boolean parameter");
      }

      _options2.useStrict = _useStrict;
      return picker;
    },
    sideBySide: function sideBySide(_sideBySide) {
      if (arguments.length === 0) {
        return _options2.sideBySide;
      }

      if (typeof _sideBySide !== "boolean") {
        throw new TypeError("sideBySide() expects a boolean parameter");
      }

      _options2.sideBySide = _sideBySide;

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    viewMode: function viewMode(_viewMode) {
      if (arguments.length === 0) {
        return _options2.viewMode;
      }

      if (typeof _viewMode !== "string") {
        throw new TypeError("viewMode() expects a string parameter");
      }

      if (viewModes.indexOf(_viewMode) === -1) {
        throw new TypeError("viewMode() parameter must be one of (" + viewModes.join(", ") + ") value");
      }

      _options2.viewMode = _viewMode;
      currentViewMode = Math.max(viewModes.indexOf(_viewMode), minViewModeNumber);
      showMode();
      return picker;
    },
    toolbarPlacement: function toolbarPlacement(_toolbarPlacement) {
      if (arguments.length === 0) {
        return _options2.toolbarPlacement;
      }

      if (typeof _toolbarPlacement !== "string") {
        throw new TypeError("toolbarPlacement() expects a string parameter");
      }

      if (toolbarPlacements.indexOf(_toolbarPlacement) === -1) {
        throw new TypeError("toolbarPlacement() parameter must be one of (" + toolbarPlacements.join(", ") + ") value");
      }

      _options2.toolbarPlacement = _toolbarPlacement;

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    widgetPositioning: function widgetPositioning(_widgetPositioning) {
      if (arguments.length === 0) {
        return $.extend({}, _options2.widgetPositioning);
      }

      if ({}.toString.call(_widgetPositioning) !== "[object Object]") {
        throw new TypeError("widgetPositioning() expects an object variable");
      }

      if (_widgetPositioning.horizontal) {
        if (typeof _widgetPositioning.horizontal !== "string") {
          throw new TypeError("widgetPositioning() horizontal variable must be a string");
        }

        _widgetPositioning.horizontal = _widgetPositioning.horizontal.toLowerCase();

        if (horizontalModes.indexOf(_widgetPositioning.horizontal) === -1) {
          throw new TypeError("widgetPositioning() expects horizontal parameter to be one of (" + horizontalModes.join(", ") + ")");
        }

        _options2.widgetPositioning.horizontal = _widgetPositioning.horizontal;
      }

      if (_widgetPositioning.vertical) {
        if (typeof _widgetPositioning.vertical !== "string") {
          throw new TypeError("widgetPositioning() vertical variable must be a string");
        }

        _widgetPositioning.vertical = _widgetPositioning.vertical.toLowerCase();

        if (verticalModes.indexOf(_widgetPositioning.vertical) === -1) {
          throw new TypeError("widgetPositioning() expects vertical parameter to be one of (" + verticalModes.join(", ") + ")");
        }

        _options2.widgetPositioning.vertical = _widgetPositioning.vertical;
      }

      update();
      return picker;
    },
    calendarWeeks: function calendarWeeks(_calendarWeeks) {
      if (arguments.length === 0) {
        return _options2.calendarWeeks;
      }

      if (typeof _calendarWeeks !== "boolean") {
        throw new TypeError("calendarWeeks() expects parameter to be a boolean value");
      }

      _options2.calendarWeeks = _calendarWeeks;
      update();
      return picker;
    },
    showTodayButton: function showTodayButton(_showTodayButton) {
      if (arguments.length === 0) {
        return _options2.showTodayButton;
      }

      if (typeof _showTodayButton !== "boolean") {
        throw new TypeError("showTodayButton() expects a boolean parameter");
      }

      _options2.showTodayButton = _showTodayButton;

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    showClear: function showClear(_showClear) {
      if (arguments.length === 0) {
        return _options2.showClear;
      }

      if (typeof _showClear !== "boolean") {
        throw new TypeError("showClear() expects a boolean parameter");
      }

      _options2.showClear = _showClear;

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    widgetParent: function widgetParent(_widgetParent) {
      if (arguments.length === 0) {
        return _options2.widgetParent;
      }

      if (_widgetParent !== null && typeof _widgetParent !== "string" && !(_widgetParent instanceof $)) {
        throw new TypeError("widgetParent() expects a string or a jQuery object parameter");
      }

      _options2.widgetParent = _widgetParent;

      if (widget) {
        hide();
        show();
      }

      return picker;
    },
    keepOpen: function keepOpen(_keepOpen) {
      if (arguments.length === 0) {
        return _options2.keepOpen;
      }

      if (typeof _keepOpen !== "boolean") {
        throw new TypeError("keepOpen() expects a boolean parameter");
      }

      _options2.keepOpen = _keepOpen;
      return picker;
    },
    focusOnShow: function focusOnShow(_focusOnShow) {
      if (arguments.length === 0) {
        return _options2.focusOnShow;
      }

      if (typeof _focusOnShow !== "boolean") {
        throw new TypeError("focusOnShow() expects a boolean parameter");
      }

      _options2.focusOnShow = _focusOnShow;
      return picker;
    },
    inline: function inline(_inline) {
      if (arguments.length === 0) {
        return _options2.inline;
      }

      if (typeof _inline !== "boolean") {
        throw new TypeError("inline() expects a boolean parameter");
      }

      _options2.inline = _inline;
      return picker;
    },
    clear: function clear() {
      _clear();

      return picker;
    },
    keyBinds: function keyBinds(_keyBinds) {
      if (arguments.length === 0) {
        return _options2.keyBinds;
      }

      _options2.keyBinds = _keyBinds;
      return picker;
    },
    getDayJs: getDayJs,
    debug: function debug(_debug) {
      if (typeof _debug !== "boolean") {
        throw new TypeError("debug() expects a boolean parameter");
      }

      _options2.debug = _debug;
      return picker;
    },
    allowInputToggle: function allowInputToggle(_allowInputToggle) {
      if (arguments.length === 0) {
        return _options2.allowInputToggle;
      }

      if (typeof _allowInputToggle !== "boolean") {
        throw new TypeError("allowInputToggle() expects a boolean parameter");
      }

      _options2.allowInputToggle = _allowInputToggle;
      return picker;
    },
    showClose: function showClose(_showClose) {
      if (arguments.length === 0) {
        return _options2.showClose;
      }

      if (typeof _showClose !== "boolean") {
        throw new TypeError("showClose() expects a boolean parameter");
      }

      _options2.showClose = _showClose;
      return picker;
    },
    keepInvalid: function keepInvalid(_keepInvalid) {
      if (arguments.length === 0) {
        return _options2.keepInvalid;
      }

      if (typeof _keepInvalid !== "boolean") {
        throw new TypeError("keepInvalid() expects a boolean parameter");
      }

      _options2.keepInvalid = _keepInvalid;
      return picker;
    },
    datepickerInput: function datepickerInput(_datepickerInput) {
      if (arguments.length === 0) {
        return _options2.datepickerInput;
      }

      if (typeof _datepickerInput !== "string") {
        throw new TypeError("datepickerInput() expects a string parameter");
      }

      _options2.datepickerInput = _datepickerInput;
      return picker;
    },
    parseInputDate: function parseInputDate(_parseInputDate) {
      if (arguments.length === 0) {
        return _options2.parseInputDate;
      }

      if (typeof _parseInputDate !== "function") {
        throw new TypeError("parseInputDate() sholud be as function");
      }

      _options2.parseInputDate = _parseInputDate;
      return picker;
    },
    disabledTimeIntervals: function disabledTimeIntervals(_disabledTimeIntervals) {
      if (arguments.length === 0) {
        return _options2.disabledTimeIntervals ? $.extend({}, _options2.disabledTimeIntervals) : _options2.disabledTimeIntervals;
      }

      if (!_disabledTimeIntervals) {
        _options2.disabledTimeIntervals = false;
        update();
        return picker;
      }

      if (!(_disabledTimeIntervals instanceof Array)) {
        throw new TypeError("disabledTimeIntervals() expects an array parameter");
      }

      _options2.disabledTimeIntervals = _disabledTimeIntervals;
      update();
      return picker;
    },
    disabledHours: function disabledHours(hours) {
      if (arguments.length === 0) {
        return _options2.disabledHours ? $.extend({}, _options2.disabledHours) : _options2.disabledHours;
      }

      if (!hours) {
        _options2.disabledHours = false;
        update();
        return picker;
      }

      if (!(hours instanceof Array)) {
        throw new TypeError("disabledHours() expects an array parameter");
      }

      _options2.disabledHours = indexGivenHours(hours);
      _options2.enabledHours = false;

      if (_options2.useCurrent && !_options2.keepInvalid) {
        var tries = 0;

        while (!isValid(_date, "h")) {
          _date = _date.add(1, "h");

          if (tries === 24) {
            throw "Tried 24 times to find a valid date";
          }

          tries++;
        }

        setValue(_date);
      }

      update();
      return picker;
    },
    enabledHours: function enabledHours(hours) {
      if (arguments.length === 0) {
        return _options2.enabledHours ? $.extend({}, _options2.enabledHours) : _options2.enabledHours;
      }

      if (!hours) {
        _options2.enabledHours = false;
        update();
        return picker;
      }

      if (!(hours instanceof Array)) {
        throw new TypeError("enabledHours() expects an array parameter");
      }

      _options2.enabledHours = indexGivenHours(hours);
      _options2.disabledHours = false;

      if (_options2.useCurrent && !_options2.keepInvalid) {
        var tries = 0;

        while (!isValid(_date, "h")) {
          _date = _date.add(1, "h");

          if (tries === 24) {
            throw "Tried 24 times to find a valid date";
          }

          tries++;
        }

        setValue(_date);
      }

      update();
      return picker;
    },
    viewDate: function viewDate(newDate) {
      if (arguments.length === 0) {
        return _viewDate.clone();
      }

      if (!newDate) {
        _viewDate = _date.clone();
        return picker;
      }

      if (typeof newDate !== "string" && !dayjs.isDayjs(newDate) && !(newDate instanceof Date)) {
        throw new TypeError("viewDate() parameter must be one of [string, dayjs or Date]");
      }

      _viewDate = parseInputDate(newDate);
      viewUpdate();
      return picker;
    }
  };

  if (element.is("input")) {
    input = element;
  } else {
    input = element.find(_options2.datepickerInput);

    if (input.length === 0) {
      input = element.find("input");
    } else if (!input.is("input")) {
      throw new Error("CSS class \"" + _options2.datepickerInput + "\" cannot be applied to non input element");
    }
  }

  if (element.hasClass("input-group")) {
    if (element.find(".datepickerbutton").length === 0) {
      component = element.find(".input-group-addon");
    } else {
      component = element.find(".datepickerbutton");
    }
  }

  if (!_options2.inline && !input.is("input")) {
    throw new Error("Could not initialize DateTimePicker without an input element");
  }

  _date = getDayJs();
  _viewDate = _date.clone();
  $.extend(true, _options2, dataToOptions());
  picker.options(_options2);
  initFormatting();
  attachDatePickerElementEvents();

  if (input.prop("disabled")) {
    picker.disable();
  }

  if (input.is("input") && input.val().trim().length !== 0) {
    setValue(parseInputDate(input.val().trim()));
  } else if (_options2.defaultDate && input.attr("placeholder") === undefined) {
    setValue(_options2.defaultDate);
  }

  if (_options2.inline) {
    show();
  }

  return picker;
};

$.fn.datetimepicker = function (options) {
  options = options || {};
  var args = Array.prototype.slice.call(arguments, 1),
      isInstance = true,
      thisMethods = ["destroy", "hide", "show", "toggle"],
      returnValue;

  if (typeof options === "object") {
    return this.each(function () {
      var $this = $(this),
          _options;

      if (!$this.data("DateTimePicker")) {
        _options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
        $this.data("DateTimePicker", dateTimePicker($this, _options));
      }
    });
  } else if (typeof options === "string") {
    this.each(function () {
      var $this = $(this),
          instance = $this.data("DateTimePicker");

      if (!instance) {
        throw new Error("bootstrap-datetimepicker(\"" + options + "\") method was called on an element that is not using DateTimePicker");
      }

      returnValue = instance[options].apply(instance, args);
      isInstance = returnValue === instance;
    });

    if (isInstance || $.inArray(options, thisMethods) > -1) {
      return this;
    }

    return returnValue;
  }

  throw new TypeError("Invalid arguments for DateTimePicker: " + options);
};

$.fn.datetimepicker.defaults = {
  format: false,
  dayViewHeaderFormat: "MMMM YYYY",
  extraFormats: false,
  stepping: 1,
  minDate: false,
  maxDate: false,
  useCurrent: true,
  collapse: true,
  defaultDate: false,
  disabledDates: false,
  enabledDates: false,
  icons: {
    time: "glyphicon glyphicon-time",
    date: "glyphicon glyphicon-calendar",
    up: "glyphicon glyphicon-chevron-up",
    down: "glyphicon glyphicon-chevron-down",
    previous: "glyphicon glyphicon-chevron-left",
    next: "glyphicon glyphicon-chevron-right",
    today: "glyphicon glyphicon-screenshot",
    clear: "glyphicon glyphicon-trash",
    close: "glyphicon glyphicon-remove"
  },
  tooltips: {
    today: "Go to today",
    clear: "Clear selection",
    close: "Close the picker",
    selectMonth: "Select Month",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    selectYear: "Select Year",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    selectDecade: "Select Decade",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevCentury: "Previous Century",
    nextCentury: "Next Century",
    pickHour: "Pick Hour",
    incrementHour: "Increment Hour",
    decrementHour: "Decrement Hour",
    pickMinute: "Pick Minute",
    incrementMinute: "Increment Minute",
    decrementMinute: "Decrement Minute",
    pickSecond: "Pick Second",
    incrementSecond: "Increment Second",
    decrementSecond: "Decrement Second",
    togglePeriod: "Toggle Period",
    selectTime: "Select Time",
    selectDate: "Select Date"
  },
  useStrict: false,
  sideBySide: false,
  daysOfWeekDisabled: false,
  calendarWeeks: false,
  viewMode: "days",
  toolbarPlacement: "default",
  showTodayButton: false,
  showClear: false,
  showClose: false,
  widgetPositioning: {
    horizontal: "auto",
    vertical: "auto"
  },
  widgetParent: "body",
  ignoreReadonly: false,
  keepOpen: false,
  focusOnShow: true,
  inline: false,
  keepInvalid: false,
  datepickerInput: ".datepickerinput",
  keyBinds: {
    up: function up(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.subtract(7, "d"));
      } else {
        this.date(d.add(this.stepping(), "m"));
      }
    },
    down: function down(widget) {
      if (!widget) {
        this.show();
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.add(7, "d"));
      } else {
        this.date(d.subtract(this.stepping(), "m"));
      }
    },
    "control up": function controlUp(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.subtract(1, "y"));
      } else {
        this.date(d.add(1, "h"));
      }
    },
    "control down": function controlDown(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.add(1, "y"));
      } else {
        this.date(d.subtract(1, "h"));
      }
    },
    left: function left(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.subtract(1, "d"));
      }
    },
    right: function right(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.add(1, "d"));
      }
    },
    pageUp: function pageUp(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.subtract(1, "M"));
      }
    },
    pageDown: function pageDown(widget) {
      if (!widget) {
        return;
      }

      var d = this.date() || this.getDayJs();

      if (widget.find(".datepicker").is(":visible")) {
        this.date(d.add(1, "M"));
      }
    },
    enter: function enter() {
      this.hide();
    },
    escape: function escape() {
      this.hide();
    },
    "control space": function controlSpace(widget) {
      if (!widget) {
        return;
      }

      if (widget.find(".timepicker").is(":visible")) {
        widget.find(".btn[data-action=\"togglePeriod\"]").click();
      }
    },
    t: function t() {
      this.date(this.getDayJs());
    },
    delete: function _delete() {
      this.clear();
    }
  },
  debug: false,
  allowInputToggle: false,
  disabledTimeIntervals: false,
  disabledHours: false,
  enabledHours: false,
  viewDate: false
};
export default $.fn.datetimepicker;