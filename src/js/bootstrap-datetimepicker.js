/*!
 * Bootstrap Datetime Picker
 * Copyright 2015-2020 Jonathan Peterson
 * Licensed under MIT (https://github.com/Eonasdan/bootstrap-datetimepicker/blob/master/LICENSE)
 */
import $ from "jquery";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import objectSupport from "dayjs/plugin/objectSupport";

dayjs.extend(objectSupport);
dayjs.extend(customParseFormat);

const dateTimePicker = function (element, options) {
    let date,
        viewDate,
        unset = true,
        input,
        component = false,
        widget = false,
        use24Hours,
        minViewModeNumber = 0,
        actualFormat,
        parseFormats,
        currentViewMode,
        datePickerModes = [
            {
                clsName: "days",
                navFnc: "M",
                navStep: 1,
            },
            {
                clsName: "months",
                navFnc: "y",
                navStep: 1,
            },
            {
                clsName: "years",
                navFnc: "y",
                navStep: 10,
            },
            {
                clsName: "decades",
                navFnc: "y",
                navStep: 100,
            },
        ],
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
            46: "delete",
        },
        keyState = {};

    /********************************************************************************
     *
     * Private functions
     *
     ********************************************************************************/

    function getDayJs(d) {
        var returnDayJs;

        if (d === undefined || d === null) {
            returnDayJs = dayjs();
        } else if (dayjs(d).isValid() || dayjs.isDayjs(d)) {
            // If the date that is passed in is already a Date() or dayjs() object,
            // pass it directly to dayjs.
            returnDayJs = dayjs(d);
        } else {
            returnDayJs = dayjs(d, parseFormats, options.useStrict);
        }

        return returnDayJs;
    }

    function isEnabled(granularity) {
        if (typeof granularity !== "string" || granularity.length > 1) {
            throw new TypeError(
                "isEnabled expects a single character string parameter"
            );
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
        var headTemplate = $("<thead>").append(
                $("<tr>")
                    .append(
                        $("<th>")
                            .addClass("prev")
                            .attr("data-action", "previous")
                            .append(
                                $("<span>").addClass(options.icons.previous)
                            )
                    )
                    .append(
                        $("<th>")
                            .addClass("picker-switch")
                            .attr("data-action", "pickerSwitch")
                            .attr(
                                "colspan",
                                options.calendarWeeks ? "6" : "5"
                            )
                    )
                    .append(
                        $("<th>")
                            .addClass("next")
                            .attr("data-action", "next")
                            .append(
                                $("<span>").addClass(options.icons.next)
                            )
                    )
            ),
            contTemplate = $("<tbody>").append(
                $("<tr>").append(
                    $("<td>").attr(
                        "colspan",
                        options.calendarWeeks ? "8" : "7"
                    )
                )
            );

        return [
            $("<div>")
                .addClass("datepicker-days")
                .append(
                    $("<table>")
                        .addClass("table-condensed")
                        .append(headTemplate)
                        .append($("<tbody>"))
                ),
            $("<div>")
                .addClass("datepicker-months")
                .append(
                    $("<table>")
                        .addClass("table-condensed")
                        .append(headTemplate.clone())
                        .append(contTemplate.clone())
                ),
            $("<div>")
                .addClass("datepicker-years")
                .append(
                    $("<table>")
                        .addClass("table-condensed")
                        .append(headTemplate.clone())
                        .append(contTemplate.clone())
                ),
            $("<div>")
                .addClass("datepicker-decades")
                .append(
                    $("<table>")
                        .addClass("table-condensed")
                        .append(headTemplate.clone())
                        .append(contTemplate.clone())
                ),
        ];
    }

    function getTimePickerMainTemplate() {
        var topRow = $("<tr>"),
            middleRow = $("<tr>"),
            bottomRow = $("<tr>");

        if (isEnabled("h")) {
            topRow.append(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            href: "#",
                            tabindex: "-1",
                            title: options.tooltips.incrementHour,
                        })
                        .addClass("btn")
                        .attr("data-action", "incrementHours")
                        .append($("<span>").addClass(options.icons.up))
                )
            );
            middleRow.append(
                $("<td>").append(
                    $("<span>")
                        .addClass("timepicker-hour")
                        .attr({
                            "data-time-component": "hours",
                            title: options.tooltips.pickHour,
                        })
                        .attr("data-action", "showHours")
                )
            );
            bottomRow.append(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            href: "#",
                            tabindex: "-1",
                            title: options.tooltips.decrementHour,
                        })
                        .addClass("btn")
                        .attr("data-action", "decrementHours")
                        .append($("<span>").addClass(options.icons.down))
                )
            );
        }
        if (isEnabled("m")) {
            if (isEnabled("h")) {
                topRow.append($("<td>").addClass("separator"));
                middleRow.append($("<td>").addClass("separator").html(":"));
                bottomRow.append($("<td>").addClass("separator"));
            }
            topRow.append(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            href: "#",
                            tabindex: "-1",
                            title: options.tooltips.incrementMinute,
                        })
                        .addClass("btn")
                        .attr("data-action", "incrementMinutes")
                        .append($("<span>").addClass(options.icons.up))
                )
            );
            middleRow.append(
                $("<td>").append(
                    $("<span>")
                        .addClass("timepicker-minute")
                        .attr({
                            "data-time-component": "minutes",
                            title: options.tooltips.pickMinute,
                        })
                        .attr("data-action", "showMinutes")
                )
            );
            bottomRow.append(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            href: "#",
                            tabindex: "-1",
                            title: options.tooltips.decrementMinute,
                        })
                        .addClass("btn")
                        .attr("data-action", "decrementMinutes")
                        .append($("<span>").addClass(options.icons.down))
                )
            );
        }
        if (isEnabled("s")) {
            if (isEnabled("m")) {
                topRow.append($("<td>").addClass("separator"));
                middleRow.append($("<td>").addClass("separator").html(":"));
                bottomRow.append($("<td>").addClass("separator"));
            }
            topRow.append(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            href: "#",
                            tabindex: "-1",
                            title: options.tooltips.incrementSecond,
                        })
                        .addClass("btn")
                        .attr("data-action", "incrementSeconds")
                        .append($("<span>").addClass(options.icons.up))
                )
            );
            middleRow.append(
                $("<td>").append(
                    $("<span>")
                        .addClass("timepicker-second")
                        .attr({
                            "data-time-component": "seconds",
                            title: options.tooltips.pickSecond,
                        })
                        .attr("data-action", "showSeconds")
                )
            );
            bottomRow.append(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            href: "#",
                            tabindex: "-1",
                            title: options.tooltips.decrementSecond,
                        })
                        .addClass("btn")
                        .attr("data-action", "decrementSeconds")
                        .append($("<span>").addClass(options.icons.down))
                )
            );
        }

        if (!use24Hours) {
            topRow.append($("<td>").addClass("separator"));
            middleRow.append(
                $("<td>").append(
                    $("<button>")
                        .addClass("btn btn-primary")
                        .attr({
                            "data-action": "togglePeriod",
                            tabindex: "-1",
                            title: options.tooltips.togglePeriod,
                        })
                )
            );
            bottomRow.append($("<td>").addClass("separator"));
        }

        return $("<div>")
            .addClass("timepicker-picker")
            .append(
                $("<table>")
                    .addClass("table-condensed")
                    .append("<tbody>")
                    .append([topRow, middleRow, bottomRow])
            );
    }

    function getTimePickerTemplate() {
        var hoursView = $("<div>")
                .addClass("timepicker-hours")
                .append($("<table>").addClass("table-condensed")),
            minutesView = $("<div>")
                .addClass("timepicker-minutes")
                .append($("<table>").addClass("table-condensed")),
            secondsView = $("<div>")
                .addClass("timepicker-seconds")
                .append($("<table>").addClass("table-condensed")),
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
        if (options.showTodayButton) {
            pushToolbarItem(row, options.icons.today, options.tooltips.today, "today");
        }
        if (!options.sideBySide && hasDate() && hasTime()) {
            pushToolbarItem(row, options.icons.time, options.tooltips.selectTime, "togglePicker");
        }
        if (options.showClear) {
            pushToolbarItem(row, options.icons.clear, options.tooltips.clear, "clear");
        }
        if (options.showClose) {
            pushToolbarItem(row, options.icons.close, options.tooltips.close, "close");
        }
        return $("<table>")
            .addClass("table-condensed")
            .append($("<tbody>").append($("<tr>").append(row)));
    }

    function pushToolbarItem(row, icon, tooltip, dataAction) {
        if (typeof icon === "boolean" && icon === false) {
            row.push(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            "data-action": dataAction
                        })
                        .append($("<span>").text(tooltip))
                )
            );
        } else {
            row.push(
                $("<td>").append(
                    $("<a>")
                        .attr({
                            "data-action": dataAction,
                            title: tooltip
                        })
                        .append($("<span>").addClass(icon))
                )
            );
        }
    }

    function getTemplate() {
        var template = $("<div>").addClass(
                "bootstrap-datetimepicker-widget dropdown-menu"
            ),
            dateView = $("<div>")
                .addClass("datepicker")
                .append(getDatePickerTemplate()),
            timeView = $("<div>")
                .addClass("timepicker")
                .append(getTimePickerTemplate()),
            content = $("<ul>").addClass("list-unstyled"),
            toolbar = $("<li>")
                .addClass(
                    "picker-switch" +
                        (options.collapse ? " accordion-toggle" : "")
                )
                .append(getToolbar());

        if (options.inline) {
            template.removeClass("dropdown-menu");
        }

        if (use24Hours) {
            template.addClass("usetwentyfour");
        }

        if (isEnabled("s") && !use24Hours) {
            template.addClass("wider");
        }

        if (options.sideBySide && hasDate() && hasTime()) {
            template.addClass("timepicker-sbs");
            if (options.toolbarPlacement === "top") {
                template.append(toolbar);
            }
            template.append(
                $("<div>")
                    .addClass("row")
                    .append(dateView.addClass("col-md-6"))
                    .append(timeView.addClass("col-md-6"))
            );
            if (options.toolbarPlacement === "bottom") {
                template.append(toolbar);
            }
            return template;
        }

        if (options.toolbarPlacement === "top") {
            content.append(toolbar);
        }
        if (hasDate()) {
            content.append(
                $("<li>")
                    .addClass(
                        options.collapse && hasTime() ? "collapse in" : ""
                    )
                    .append(dateView)
            );
        }
        if (options.toolbarPlacement === "default") {
            content.append(toolbar);
        }
        if (hasTime()) {
            content.append(
                $("<li>")
                    .addClass(
                        options.collapse && hasDate() ? "collapse" : ""
                    )
                    .append(timeView)
            );
        }
        if (options.toolbarPlacement === "bottom") {
            content.append(toolbar);
        }
        return template.append(content);
    }

    function dataToOptions() {
        var eData,
            dataOptions = {};

        if (element.is("input") || options.inline) {
            eData = element.data();
        } else {
            eData = element.find("input").data();
        }

        if (eData.dateOptions && eData.dateOptions instanceof Object) {
            dataOptions = $.extend(true, dataOptions, eData.dateOptions);
        }

        $.each(options, function (key) {
            var attributeName =
                "date" + key.charAt(0).toUpperCase() + key.slice(1);
            if (eData[attributeName] !== undefined) {
                dataOptions[key] = eData[attributeName];
            }
        });
        return dataOptions;
    }

    function topPlace() {
        if (widget.hasClass("top")) {
            place();
        }
    }

    function place() {
        if (options.inline) {
            element.append(widget);
            return;
        }

        const parent = $(options.widgetParent).append(widget);
        const calendarWidth = widget.outerWidth();
        const calendarHeight = widget.outerHeight();
        const visualPadding = 10;
        const offset = component ? component.parent().offset() : element.offset();
        const scrollTop = parent.is("body") ? $(document).scrollTop() : parent.scrollTop();
        const appendOffset = parent.offset();
        const height = component ? component.outerHeight(true) : element.outerHeight(false);
        const width = component ? component.outerWidth(true) : element.outerWidth(false);
        let vertical = options.widgetPositioning.vertical;
        let horizontal = options.widgetPositioning.horizontal;
        let left = offset.left - appendOffset.left;
        let top = offset.top - appendOffset.top;

        //fetch max z-index of parents
        const zIndexes = element.parents().map(function () {
            if (this.style.zIndex !== "auto") {
                return Number(this.style.zIndex);
            }
            return null;
        }).get();

        const zIndex = zIndexes.length ? Math.max.apply(Math, zIndexes) + 10 : 10;

        if (!parent.is("body")) {
            top += scrollTop;
        }

        // Top and bottom logic
        if (vertical === "auto") {
            if ((-scrollTop + top - calendarHeight) < 0) {
                vertical = "bottom";
            } else {
                vertical = "top";
            }
        }

        // Left and right logic
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
        if (
            e.type === "dp.change" &&
            ((e.date && e.date.isSame(e.oldDate)) ||
                (!e.date && !e.oldDate))
        ) {
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
            viewDate: viewDate.clone(),
        });
    }

    function showMode(dir) {
        if (!widget) {
            return;
        }
        if (dir) {
            currentViewMode = Math.max(
                minViewModeNumber,
                Math.min(3, currentViewMode + dir)
            );
        }
        widget
            .find(".datepicker > div")
            .hide()
            .filter(
                ".datepicker-" + datePickerModes[currentViewMode].clsName
            )
            .show();

        topPlace();
    }

    function fillDow() {
        var row = $("<tr>"),
            currentDate = viewDate.startOf("w").startOf("d");

        if (options.calendarWeeks === true) {
            row.append($("<th>").addClass("cw").text("#"));
        }

        while (currentDate.isBefore(viewDate.endOf("w"))) {
            row.append(
                $("<th>").addClass("dow").text(currentDate.format("dd"))
            );
            currentDate = currentDate.add(1, "d");
        }
        widget.find(".datepicker-days thead").append(row);
    }

    function isInDisabledDates(testDate) {
        return (
            options.disabledDates[testDate.format("YYYY-MM-DD")] === true
        );
    }

    function isInEnabledDates(testDate) {
        return options.enabledDates[testDate.format("YYYY-MM-DD")] === true;
    }

    function isInDisabledHours(testDate) {
        return options.disabledHours[testDate.format("H")] === true;
    }

    function isInEnabledHours(testDate) {
        return options.enabledHours[testDate.format("H")] === true;
    }

    function isValid(targetDayJs, granularity) {
        if (!targetDayJs.isValid()) {
            return false;
        }
        if (
            options.disabledDates &&
            granularity === "d" &&
            isInDisabledDates(targetDayJs)
        ) {
            return false;
        }
        if (
            options.enabledDates &&
            granularity === "d" &&
            !isInEnabledDates(targetDayJs)
        ) {
            return false;
        }
        if (
            options.minDate &&
            targetDayJs.isBefore(options.minDate, granularity)
        ) {
            return false;
        }
        if (
            options.maxDate &&
            targetDayJs.isAfter(options.maxDate, granularity)
        ) {
            return false;
        }
        if (
            options.daysOfWeekDisabled &&
            granularity === "d" &&
            options.daysOfWeekDisabled.indexOf(targetDayJs.day()) !== -1
        ) {
            return false;
        }
        if (
            options.disabledHours &&
            (granularity === "h" ||
                granularity === "m" ||
                granularity === "s") &&
            isInDisabledHours(targetDayJs)
        ) {
            return false;
        }
        if (
            options.enabledHours &&
            (granularity === "h" ||
                granularity === "m" ||
                granularity === "s") &&
            !isInEnabledHours(targetDayJs)
        ) {
            return false;
        }
        if (
            options.disabledTimeIntervals &&
            (granularity === "h" ||
                granularity === "m" ||
                granularity === "s")
        ) {
            var found = false;
            $.each(options.disabledTimeIntervals, function () {
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
            monthsShort = viewDate.startOf("y").startOf("d");
        while (monthsShort.isSame(viewDate, "y")) {
            spans.push(
                $("<span>")
                    .attr("data-action", "selectMonth")
                    .addClass("month")
                    .text(monthsShort.format("MMM"))
            );
            monthsShort = monthsShort.add(1, "M");
        }
        widget.find(".datepicker-months td").empty().append(spans);
    }

    function updateMonths() {
        var monthsView = widget.find(".datepicker-months"),
            monthsViewHeader = monthsView.find("th"),
            months = monthsView.find("tbody").find("span");

        monthsViewHeader
            .eq(0)
            .find("span")
            .attr("title", options.tooltips.prevYear);
        monthsViewHeader.eq(1).attr("title", options.tooltips.selectYear);
        monthsViewHeader
            .eq(2)
            .find("span")
            .attr("title", options.tooltips.nextYear);

        monthsView.find(".disabled").removeClass("disabled");

        if (!isValid(viewDate.subtract(1, "y"), "y")) {
            monthsViewHeader.eq(0).addClass("disabled");
        }

        monthsViewHeader.eq(1).text(viewDate.year());

        if (!isValid(viewDate.add(1, "y"), "y")) {
            monthsViewHeader.eq(2).addClass("disabled");
        }

        months.removeClass("active");
        if (date.isSame(viewDate, "y") && !unset) {
            months.eq(date.month()).addClass("active");
        }

        months.each(function (index) {
            if (!isValid(viewDate.month(index), "M")) {
                $(this).addClass("disabled");
            }
        });
    }

    function updateYears() {
        var yearsView = widget.find(".datepicker-years"),
            yearsViewHeader = yearsView.find("th"),
            startYearNumber = Math.floor(viewDate.year() / 10) * 10,
            endYearNumber = startYearNumber + 1 * 9,
            startYear = viewDate.year(startYearNumber),
            endYear = viewDate.year(endYearNumber),
            html = "";

        yearsViewHeader
            .eq(0)
            .find("span")
            .attr("title", options.tooltips.prevDecade);
        yearsViewHeader.eq(1)
            .attr("title", options.tooltips.selectDecade);
        yearsViewHeader
            .eq(2)
            .find("span")
            .attr("title", options.tooltips.nextDecade);

        yearsView.find(".disabled").removeClass("disabled");

        if (options.minDate && options.minDate.isAfter(startYear, "y")) {
            yearsViewHeader.eq(0).addClass("disabled");
        }

        yearsViewHeader.eq(1).text(startYear.year() + "-" + endYear.year());

        if (options.maxDate && options.maxDate.isBefore(endYear, "y")) {
            yearsViewHeader.eq(2).addClass("disabled");
        }

        startYear = startYear.add(-1, "y");
        endYear = endYear.add(1, "y");

        while (!startYear.isAfter(endYear, "y")) {
            html +=
                "<span data-action=\"selectYear\" class=\"year" +
                (startYear.isSame(date, "y") && !unset ? " active" : "") +
                (!isValid(startYear, "y") ? " disabled" : "") +
                (startYear.year() < startYearNumber ? " old" : "") +
                (startYear.year() > endYearNumber ? " new" : "") +
                "\">" +
                startYear.year() +
                "</span>";
            startYear = startYear.add(1, "y");
        }

        yearsView.find("td").html(html);
    }

    function updateDecades() {
        var decadesView = widget.find(".datepicker-decades"),
            decadesViewHeader = decadesView.find("th"),
            minDateDecade = false,
            maxDateDecade = false,
            endDecadeYear,
            startYearNumber = Math.floor(viewDate.year() / 100) * 100,
            endYearNumber = startYearNumber + 10 * 9,
            startDecade = viewDate.year(startYearNumber),
            endDecade = viewDate.year(endYearNumber),
            html = "";

        decadesViewHeader
            .eq(0)
            .find("span")
            .attr("title", options.tooltips.prevCentury);
        decadesViewHeader
            .eq(2)
            .find("span")
            .attr("title", options.tooltips.nextCentury);

        decadesView.find(".disabled").removeClass("disabled");

        if (
            startDecade.isSame(dayjs({ y: 1900 })) ||
            (options.minDate && options.minDate.isAfter(startDecade, "y"))
        ) {
            decadesViewHeader.eq(0).addClass("disabled");
        }

        decadesViewHeader
            .eq(1)
            .text(startYearNumber + "-" + endYearNumber);

        if (
            startDecade.isSame(dayjs({ y: 2000 })) ||
            (options.maxDate && options.maxDate.isBefore(endDecade, "y"))
        ) {
            decadesViewHeader.eq(2).addClass("disabled");
        }

        startDecade = startDecade.add(-10, "y");
        endDecade = endDecade.add(10, "y");

        while (!startDecade.isAfter(endDecade, "y")) {
            endDecadeYear = startDecade.year() + 10;
            minDateDecade =
                options.minDate &&
                options.minDate.isAfter(startDecade, "y") &&
                options.minDate.year() <= endDecadeYear;
            maxDateDecade =
                options.maxDate &&
                options.maxDate.isAfter(startDecade, "y") &&
                options.maxDate.year() <= endDecadeYear;

            html +=
                "<span data-action=\"selectDecade\" class=\"decade" +
                (date.isAfter(startDecade) && date.year() <= endDecadeYear ? " active" : "") +
                (!isValid(startDecade, "y") && !minDateDecade && !maxDateDecade ? " disabled" : "") +
                (startDecade.year() < startYearNumber ? " old" : "") +
                (startDecade.year() > endYearNumber ? " new" : "") +
                "\" data-selection=\"" + startDecade.year() + "\">" +
                startDecade.year()  +
                "</span>";

            startDecade = startDecade.add(10, "y");
        }

        decadesView.find("td").html(html);
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

        daysViewHeader
            .eq(0)
            .find("span")
            .attr("title", options.tooltips.prevMonth);
        daysViewHeader.eq(1).attr("title", options.tooltips.selectMonth);
        daysViewHeader
            .eq(2)
            .find("span")
            .attr("title", options.tooltips.nextMonth);

        daysView.find(".disabled").removeClass("disabled");
        daysViewHeader
            .eq(1)
            .text(viewDate.format(options.dayViewHeaderFormat));

        if (!isValid(viewDate.subtract(1, "M"), "M")) {
            daysViewHeader.eq(0).addClass("disabled");
        }
        if (!isValid(viewDate.add(1, "M"), "M")) {
            daysViewHeader.eq(2).addClass("disabled");
        }

        currentDate = viewDate
            .startOf("M")
            .startOf("w")
            .startOf("d");

        for (i = 0; i < 42; i++) {
            //always display 42 days (should show 6 weeks)
            if (currentDate.day() === 0) {
                row = $("<tr>");
                if (options.calendarWeeks) {
                    row.append(
                        "<td class=\"cw\">" + currentDate.week() + "</td>"
                    );
                }
                html.push(row);
            }
            clsNames = ["day"];
            if (currentDate.isBefore(viewDate, "M")) {
                clsNames.push("old");
            }
            if (currentDate.isAfter(viewDate, "M")) {
                clsNames.push("new");
            }
            if (currentDate.isSame(date, "d") && !unset) {
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
                classNames: clsNames,
            });
            row.append(
                "<td data-action=\"selectDay\" data-day=\"" +
                    currentDate.format("L") +
                    "\" class=\"" +
                    clsNames.join(" ") +
                    "\">" +
                    currentDate.date() +
                    "</td>"
            );
            currentDate = currentDate.add(1, "d");
        }

        daysView.find("tbody").empty().append(html);

        updateMonths();

        updateYears();

        updateDecades();
    }

    function fillHours() {
        var table = widget.find(".timepicker-hours table"),
            currentHour = viewDate.startOf("d"),
            html = [],
            row = $("<tr>");

        if (viewDate.hour() > 11 && !use24Hours) {
            currentHour = currentHour.hour(12);
        }
        while (
            currentHour.isSame(viewDate, "d") &&
            (use24Hours ||
                (viewDate.hour() < 12 && currentHour.hour() < 12) ||
                viewDate.hour() > 11)
        ) {
            if (currentHour.hour() % 4 === 0) {
                row = $("<tr>");
                html.push(row);
            }
            row.append(
                "<td data-action=\"selectHour\" class=\"hour" +
                    (!isValid(currentHour, "h") ? " disabled" : "") +
                    "\">" +
                    currentHour.format(use24Hours ? "HH" : "hh") +
                    "</td>"
            );
            currentHour = currentHour.add(1, "h");
        }
        table.empty().append(html);
    }

    function fillMinutes() {
        var table = widget.find(".timepicker-minutes table"),
            currentMinute = viewDate.startOf("h"),
            html = [],
            row = $("<tr>"),
            step = options.stepping === 1 ? 5 : options.stepping;

        while (viewDate.isSame(currentMinute, "h")) {
            if (currentMinute.minute() % (step * 4) === 0) {
                row = $("<tr>");
                html.push(row);
            }
            row.append(
                "<td data-action=\"selectMinute\" class=\"minute" +
                    (!isValid(currentMinute, "m") ? " disabled" : "") +
                    "\">" +
                    currentMinute.format("mm") +
                    "</td>"
            );
            currentMinute = currentMinute.add(step, "m");
        }
        table.empty().append(html);
    }

    function fillSeconds() {
        var table = widget.find(".timepicker-seconds table"),
            currentSecond = viewDate.startOf("m"),
            html = [],
            row = $("<tr>");

        while (viewDate.isSame(currentSecond, "m")) {
            if (currentSecond.second() % 20 === 0) {
                row = $("<tr>");
                html.push(row);
            }
            row.append(
                "<td data-action=\"selectSecond\" class=\"second" +
                    (!isValid(currentSecond, "s") ? " disabled" : "") +
                    "\">" +
                    currentSecond.format("ss") +
                    "</td>"
            );
            currentSecond = currentSecond.add(5, "s");
        }

        table.empty().append(html);
    }

    function fillTime() {
        var toggle,
            newDate,
            timeComponents = widget.find(
                ".timepicker span[data-time-component]"
            );

        if (!use24Hours) {
            toggle = widget.find(".timepicker [data-action=togglePeriod]");
            newDate = date.add(date.hour() >= 12 ? -12 : 12, "h");

            toggle.text(date.format("A"));

            if (isValid(newDate, "h")) {
                toggle.removeClass("disabled");
            } else {
                toggle.addClass("disabled");
            }
        }
        timeComponents
            .filter("[data-time-component=hours]")
            .text(date.format(use24Hours ? "HH" : "hh"));
        timeComponents
            .filter("[data-time-component=minutes]")
            .text(date.format("mm"));
        timeComponents
            .filter("[data-time-component=seconds]")
            .text(date.format("ss"));

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
        var oldDate = unset ? null : date;

        // case of calling setValue(null or false)
        if (!targetDayJs) {
            unset = true;
            input.val("");
            element.data("date", "");
            notifyEvent({
                type: "dp.change",
                date: false,
                oldDate: oldDate,
            });
            update();
            return;
        }

        targetDayJs = targetDayJs.clone();

        if (options.stepping !== 1) {
            targetDayJs
                .minute(
                    Math.round(targetDayJs.minute() / options.stepping) *
                        options.stepping
                )
                .second(0);

            while (
                options.minDate &&
                targetDayJs.isBefore(options.minDate)
            ) {
                targetDayJs = targetDayJs.add(options.stepping, "minutes");
            }
        }

        if (isValid(targetDayJs)) {
            date = targetDayJs;
            viewDate = date.clone();
            input.val(date.format(actualFormat));
            element.data("date", date.format(actualFormat));
            unset = false;
            update();
            notifyEvent({
                type: "dp.change",
                date: date.clone(),
                oldDate: oldDate,
            });
        } else {
            if (!options.keepInvalid) {
                input.val(unset ? "" : date.format(actualFormat));
            } else {
                notifyEvent({
                    type: "dp.change",
                    date: targetDayJs,
                    oldDate: oldDate,
                });
            }
            notifyEvent({
                type: "dp.error",
                date: targetDayJs,
                oldDate: oldDate,
            });
        }
    }

    /**
     * Hides the widget. Possibly will emit dp.hide
     *
     * @returns {object} picker
     */
    function hide() {
        var transitioning = false;
        if (!widget) {
            return picker;
        }
        // Ignore event if in the middle of a picker transition
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
            date: date.clone(),
        });

        input.blur();

        viewDate = date.clone();

        return picker;
    }

    function clear() {
        setValue(null);
    }

    function parseInputDate(inputDate) {
        if (options.parseInputDate === undefined) {
            if (!dayjs.isDayjs(inputDate) || inputDate instanceof Date) {
                inputDate = getDayJs(inputDate);
            }
        } else {
            inputDate = options.parseInputDate(inputDate);
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

    /**
     * Shows the widget. Possibly will emit dp.show and dp.change
     *
     * @returns {object} picker
     */
    function show() {
        var currentDayJs,
            useCurrentGranularity = {
                year(m) {
                    return m
                        .month(0)
                        .date(1)
                        .hour(0)
                        .second(0)
                        .minute(0);
                },
                month(m) {
                    return m.date(1).hour(0).second(0).minute(0);
                },
                day(m) {
                    return m.hour(0).second(0).minute(0);
                },
                hour(m) {
                    return m.second(0).minute(0);
                },
                minute(m) {
                    return m.second(0);
                },
            };

        if (
            input.prop("disabled") ||
            (!options.ignoreReadonly && input.prop("readonly")) ||
            widget
        ) {
            return picker;
        }
        if (input.val() !== undefined && input.val().trim().length !== 0) {
            setValue(parseInputDate(input.val().trim()));
        } else if (
            unset &&
            options.useCurrent &&
            (options.inline ||
                (input.is("input") && input.val().trim().length === 0))
        ) {
            currentDayJs = getDayJs();
            if (typeof options.useCurrent === "string") {
                currentDayJs =
                    useCurrentGranularity[options.useCurrent](
                        currentDayJs
                    );
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
        widget.on("click", "[data-action]", doAction); // this handles clicks on the widget
        widget.on("mousedown", false);

        if (component && component.hasClass("btn")) {
            component.toggleClass("active");
        }
        place();
        widget.show();
        if (options.focusOnShow && !input.is(":focus")) {
            input.focus();
        }

        notifyEvent({
            type: "dp.show",
        });
        return picker;
    }

    /**
     * Shows or hides the widget
     *
     * @returns {object} picker
     */
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
            if (
                Object.prototype.hasOwnProperty.call(keyState, index) &&
                keyState[index] === pressed
            ) {
                pressedKeys.push(index);
                if (parseInt(index, 10) !== currentKey) {
                    pressedModifiers[index] = true;
                }
            }
        }

        for (index in options.keyBinds) {
            if (
                Object.prototype.hasOwnProperty.call(
                    options.keyBinds,
                    index
                ) &&
                typeof options.keyBinds[index] === "function"
            ) {
                keyBindKeys = index.split(" ");
                if (
                    keyBindKeys.length === pressedKeys.length &&
                    keyMap[currentKey] ===
                        keyBindKeys[keyBindKeys.length - 1]
                ) {
                    allModifiersPressed = true;
                    for (
                        index2 = keyBindKeys.length - 2;
                        index2 >= 0;
                        index2--
                    ) {
                        if (
                            !(
                                keyMap[keyBindKeys[index2]] in
                                pressedModifiers
                            )
                        ) {
                            allModifiersPressed = false;
                            break;
                        }
                    }
                    if (allModifiersPressed) {
                        handler = options.keyBinds[index];
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
            blur: options.debug ? "" : hide,
            keydown: keydown,
            keyup: keyup,
            focus: options.allowInputToggle ? show : "",
        });

        if (element.is("input")) {
            input.on({
                focus: show,
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
            focus: options.allowInputToggle ? hide : "",
        });

        if (element.is("input")) {
            input.off({
                focus: show,
            });
        } else if (component) {
            component.off("click", toggle);
            component.off("mousedown", false);
        }
    }

    function indexGivenDates(givenDatesArray) {
        // Store given enabledDates and disabledDates as keys.
        // This way we can check their existence in O(1) time instead of looping through whole array.
        // (for example: options.enabledDates['2014-02-27'] === true)
        var givenDatesIndexed = {};
        $.each(givenDatesArray, function () {
            var dDate = parseInputDate(this);
            if (dDate.isValid()) {
                givenDatesIndexed[dDate.format("YYYY-MM-DD")] = true;
            }
        });
        return Object.keys(givenDatesIndexed).length
            ? givenDatesIndexed
            : false;
    }

    function indexGivenHours(givenHoursArray) {
        // Store given enabledHours and disabledHours as keys.
        // This way we can check their existence in O(1) time instead of looping through whole array.
        // (for example: options.enabledHours['2014-02-27'] === true)
        var givenHoursIndexed = {};
        $.each(givenHoursArray, function () {
            givenHoursIndexed[this] = true;
        });
        return Object.keys(givenHoursIndexed).length
            ? givenHoursIndexed
            : false;
    }

    function initFormatting() {
        actualFormat = options.format || "DD MMM YYYY h:mm A";

        parseFormats = options.extraFormats
            ? options.extraFormats.slice()
            : [];

        if (parseFormats.indexOf(actualFormat) < 0) {
            parseFormats.push(actualFormat);
        }

        use24Hours =
            actualFormat.toLowerCase().indexOf("a") < 1 &&
            actualFormat.replace(/\[.*?\]/g, "").indexOf("h") < 1;

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
            setValue(date);
        }
    }


    /********************************************************************************
     *
     * Widget UI interaction functions
     *
     ********************************************************************************/
    const actions = {
        next() {
            var navFnc = datePickerModes[currentViewMode].navFnc;
            viewDate = viewDate.add(datePickerModes[currentViewMode].navStep, navFnc);
            fillDate();
            viewUpdate(navFnc);
        },

        previous() {
            var navFnc = datePickerModes[currentViewMode].navFnc;
            viewDate = viewDate.subtract(
                datePickerModes[currentViewMode].navStep,
                navFnc
            );
            fillDate();
            viewUpdate(navFnc);
        },

        pickerSwitch() {
            showMode(1);
        },

        selectMonth(e) {
            var month = $(e.target)
                .closest("tbody")
                .find("span")
                .index($(e.target));
            viewDate = viewDate.month(month);
            if (currentViewMode === minViewModeNumber) {
                setValue(
                    date
                        .clone()
                        .year(viewDate.year())
                        .month(viewDate.month())
                );
                if (!options.inline) {
                    hide();
                }
            } else {
                showMode(-1);
                fillDate();
            }
            viewUpdate("M");
        },

        selectYear(e) {
            var year = parseInt($(e.target).text(), 10) || 0;
            viewDate = viewDate.year(year);
            if (currentViewMode === minViewModeNumber) {
                setValue(date.clone().year(viewDate.year()));
                if (!options.inline) {
                    hide();
                }
            } else {
                showMode(-1);
                fillDate();
            }
            viewUpdate("YYYY");
        },

        selectDecade(e) {
            var year = parseInt($(e.target).data("selection"), 10) || 0;
            viewDate = viewDate.year(year);
            if (currentViewMode === minViewModeNumber) {
                setValue(date.clone().year(viewDate.year()));
                if (!options.inline) {
                    hide();
                }
            } else {
                showMode(-1);
                fillDate();
            }
            viewUpdate("YYYY");
        },

        selectDay(e) {
            var day = viewDate.clone();
            if ($(e.target).is(".old")) {
                day = day.subtract(1, "M");
            }
            if ($(e.target).is(".new")) {
                day = day.add(1, "M");
            }
            setValue(day.date(parseInt($(e.target).text(), 10)));
            if (!hasTime() && !options.keepOpen && !options.inline) {
                hide();
            }
        },

        incrementHours() {
            var newDate = date.add(1, "h");
            if (isValid(newDate, "h")) {
                setValue(newDate);
            }
        },

        incrementMinutes() {
            var newDate = date.add(options.stepping, "m");
            if (isValid(newDate, "m")) {
                setValue(newDate);
            }
        },

        incrementSeconds() {
            var newDate = date.add(1, "s");
            if (isValid(newDate, "s")) {
                setValue(newDate);
            }
        },

        decrementHours() {
            var newDate = date.subtract(1, "h");
            if (isValid(newDate, "h")) {
                setValue(newDate);
            }
        },

        decrementMinutes() {
            var newDate = date.subtract(options.stepping, "m");
            if (isValid(newDate, "m")) {
                setValue(newDate);
            }
        },

        decrementSeconds() {
            var newDate = date.subtract(1, "s");
            if (isValid(newDate, "s")) {
                setValue(newDate);
            }
        },

        togglePeriod() {
            setValue(date.add(date.hour() >= 12 ? -12 : 12, "h"));
        },

        togglePicker(e) {
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
                    // if collapse plugin is available through bootstrap.js then use it
                    expanded.collapse("hide");
                    closed.collapse("show");
                } else {
                    // otherwise just toggle in class on the two views
                    expanded.removeClass("in");
                    closed.addClass("in");
                }

                const datePicker = closed.find(".datepicker");
                const dateExpanded = datePicker && datePicker.length;
                const timeAsText = typeof options.icons.time === "boolean" && options.icons.time === false;
                const dateAsText = typeof options.icons.date === "boolean" && options.icons.date === false;
                const $span = $this.is("span") ? $this : $this.find("span");

                if (timeAsText) {
                    if (dateExpanded) {
                        $span.text(options.tooltips.selectTime);
                    } else if (!dateAsText) {
                        $span.empty();
                    }
                } else {
                    $span.toggleClass(options.icons.time);
                    if (dateExpanded) {
                        $span.attr("title", options.tooltips.selectTime);
                    }
                }
                if (dateAsText) {
                    if (!dateExpanded) {
                        $span.text(options.tooltips.selectDate);
                    } else if (!timeAsText) {
                        $span.empty();
                    }
                } else {
                    $span.toggleClass(options.icons.date);
                    if (!dateExpanded) {
                        $span.attr("title", options.tooltips.selectDate);
                    }
                }

                topPlace();
                // NOTE: uncomment if toggled state will be restored in show()
                //if (component) {
                //    component.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                //}
            }
        },

        showPicker() {
            widget.find(".timepicker > div:not(.timepicker-picker)").hide();
            widget.find(".timepicker .timepicker-picker").show();
            topPlace();
        },

        showHours() {
            widget.find(".timepicker .timepicker-picker").hide();
            widget.find(".timepicker .timepicker-hours").show();
            topPlace();
        },

        showMinutes() {
            widget.find(".timepicker .timepicker-picker").hide();
            widget.find(".timepicker .timepicker-minutes").show();
            topPlace();
        },

        showSeconds() {
            widget.find(".timepicker .timepicker-picker").hide();
            widget.find(".timepicker .timepicker-seconds").show();
            topPlace();
        },

        selectHour(e) {
            var hour = parseInt($(e.target).text(), 10);

            if (!use24Hours) {
                if (date.hour() >= 12) {
                    if (hour !== 12) {
                        hour += 12;
                    }
                } else {
                    if (hour === 12) {
                        hour = 0;
                    }
                }
            }
            setValue(date.clone().hour(hour));
            actions.showPicker.call(picker);
        },

        selectMinute(e) {
            setValue(
                date.clone().minute(parseInt($(e.target).text(), 10))
            );
            actions.showPicker.call(picker);
        },

        selectSecond(e) {
            setValue(
                date.clone().second(parseInt($(e.target).text(), 10))
            );
            actions.showPicker.call(picker);
        },

        clear,

        today() {
            var todaysDate = getDayJs();
            if (isValid(todaysDate, "d")) {
                setValue(todaysDate);
            }
        },

        close: hide,
    };

    /********************************************************************************
     *
     * Public API functions
     * =====================
     *
     * Important: Do not expose direct references to private objects or the options
     * object to the outer world. Always return a clone when returning values or make
     * a clone when setting a private variable.
     *
     ********************************************************************************/
    const picker = {

        destroy() {
            ///<summary>Destroys the widget and removes all attached event listeners</summary>
            hide();
            detachDatePickerElementEvents();
            element.removeData("DateTimePicker");
            element.removeData("date");
        },

        toggle,

        show,

        hide,

        /**
         * Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
         * If the widget was visible before that call it is hidden. Possibly emits dp.hide
         *
         * @returns {object} picker
         */
        disable() {
            hide();
            if (component && component.hasClass("btn")) {
                component.addClass("disabled");
            }
            input.prop("disabled", true);
            return picker;
        },

        /**
         * Enables the input element, the component is attached to, by removing disabled attribute from it.
         *
         * @returns {object} picker
         */
        enable() {
            if (component && component.hasClass("btn")) {
                component.removeClass("disabled");
            }
            input.prop("disabled", false);
            return picker;
        },

        ignoreReadonly(ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== "boolean") {
                throw new TypeError(
                    "ignoreReadonly () expects a boolean parameter"
                );
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        },

        options(newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError(
                    "options() options parameter should be an object"
                );
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError("option " + key + " is not recognized!");
                }
            });
            return picker;
        },

        /**
         * Gets or sets the date.
         * If gettings then returns the component's model current date, a dayjs object or null if not set.
         * If setting then passing a null value unsets the components model current dayjs. Parsing of the
         * newDate parameter is made using dayjs library with the options.format and options.useStrict
         * components configuration.
         *
         * @param {any} newDate Takes string, Date, dayjs, null parameter.
         * @returns If no parameter, date.clone() otherwise picker
         */
        date(newDate) {
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                return date.clone();
            }

            if (
                newDate !== null &&
                typeof newDate !== "string" &&
                !dayjs.isDayjs(newDate) &&
                !(newDate instanceof Date)
            ) {
                throw new TypeError(
                    "date() parameter must be one of [null, string, dayjs or Date]"
                );
            }

            setValue(newDate === null ? null : parseInputDate(newDate));
            return picker;
        },

        /**
         * Gets or sets the date format
         *
         * @param {string|bool|object} If no parameter returns the current format otherwise returns picker
         * @returns
         */
        format(newFormat) {
            if (arguments.length === 0) {
                return options.format;
            }

            if (
                typeof newFormat !== "string" &&
                (typeof newFormat !== "boolean" || newFormat !== false)
            ) {
                throw new TypeError(
                    "format() expects a string or boolean:false parameter " +
                        newFormat
                );
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        },

        dayViewHeaderFormat(newFormat) {
            if (arguments.length === 0) {
                return options.dayViewHeaderFormat;
            }

            if (typeof newFormat !== "string") {
                throw new TypeError(
                    "dayViewHeaderFormat() expects a string parameter"
                );
            }

            options.dayViewHeaderFormat = newFormat;
            return picker;
        },

        extraFormats(formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError(
                    "extraFormats() expects an array or false parameter"
                );
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        },

        /**
         * Gets or sets the currently disabled dates.         *
         * Setting this takes precedence over options.minDate, options.maxDate configuration.
         * Also calling this function removes the configuration of options.enabledDates if such exist.
         *
         * @param {Array} dates Takes an array of string or Date or dayjs and allows the user not to select from those days.
         * @returns Current disabled dates or picker
         */
        disabledDates(dates) {
            if (arguments.length === 0) {
                return options.disabledDates
                    ? $.extend({}, options.disabledDates)
                    : options.disabledDates;
            }

            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError("disabledDates() expects an array parameter");
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        },

        /**
         * Gets or sets the enabled dates
         * Setting this takes precedence over options.minDate, options.maxDate configuration.
         * Also calling this function removes the configuration of options.disabledDates if such exist.
         *
         * @param {Array} dates Takes an array of string or Date or dayjs and allows the user to select only from those days.
         * @returns Currently enabled dates or picker
         */
        enabledDates(dates) {
            if (arguments.length === 0) {
                return options.enabledDates
                    ? $.extend({}, options.enabledDates)
                    : options.enabledDates;
            }

            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError("enabledDates() expects an array parameter");
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        },

        daysOfWeekDisabled(daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled
                    ? options.daysOfWeekDisabled.splice(0)
                    : options.daysOfWeekDisabled;
            }

            if (typeof daysOfWeekDisabled === "boolean" && !daysOfWeekDisabled) {
                options.daysOfWeekDisabled = false;
                update();
                return picker;
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError(
                    "daysOfWeekDisabled() expects an array parameter"
                );
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled
                .reduce(function (previousValue, currentValue) {
                    currentValue = parseInt(currentValue, 10);
                    if (
                        currentValue > 6 ||
                        currentValue < 0 ||
                        isNaN(currentValue)
                    ) {
                        return previousValue;
                    }
                    if (previousValue.indexOf(currentValue) === -1) {
                        previousValue.push(currentValue);
                    }
                    return previousValue;
                }, [])
                .sort();
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, "d")) {
                    date = date.add(1, "d");
                    if (tries === 31) {
                        throw "Tried 31 times to find a valid date";
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        },

        maxDate(maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }

            if (typeof maxDate === "boolean" && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }

            if (typeof maxDate === "string") {
                if (maxDate === "now" || maxDate === "dayjs") {
                    maxDate = getDayJs();
                }
            }

            var parsedDate = parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError(
                    "maxDate() Could not parse date parameter: " + maxDate
                );
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError(
                    "maxDate() date parameter is before options.minDate: " +
                        parsedDate.format(actualFormat)
                );
            }
            options.maxDate = parsedDate;
            if (
                options.useCurrent &&
                !options.keepInvalid &&
                date.isAfter(maxDate)
            ) {
                setValue(options.maxDate);
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.subtract(options.stepping, "m");
            }
            update();
            return picker;
        },

        minDate(minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }

            if (typeof minDate === "boolean" && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }

            if (typeof minDate === "string") {
                if (minDate === "now" || minDate === "dayjs") {
                    minDate = getDayJs();
                }
            }

            var parsedDate = parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError(
                    "minDate() Could not parse date parameter: " + minDate
                );
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError(
                    "minDate() date parameter is after options.maxDate: " +
                        parsedDate.format(actualFormat)
                );
            }
            options.minDate = parsedDate;
            if (
                options.useCurrent &&
                !options.keepInvalid &&
                date.isBefore(minDate)
            ) {
                setValue(options.minDate);
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.add(options.stepping, "m");
            }
            update();
            return picker;
        },

        /**
         * Gets or sets the default date
         * Will set the picker's inital date. If a boolean:false value is passed the options.defaultDate parameter is cleared.
         *
         * @param {any} defaultDate Takes a string, Date, dayjs, boolean:false
         * @returns Default date or picker
         */
        defaultDate(defaultDate) {
            if (arguments.length === 0) {
                return options.defaultDate
                    ? options.defaultDate.clone()
                    : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }

            if (typeof defaultDate === "string") {
                if (defaultDate === "now" || defaultDate === "dayjs") {
                    defaultDate = getDayJs();
                } else {
                    defaultDate = getDayJs(defaultDate);
                }
            }

            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError(
                    "defaultDate() Could not parse date parameter: " + defaultDate
                );
            }
            if (!isValid(parsedDate)) {
                throw new TypeError(
                    "defaultDate() date passed is invalid according to component setup validations"
                );
            }

            options.defaultDate = parsedDate;

            if (
                (options.defaultDate && options.inline) ||
                input.val().trim() === ""
            ) {
                setValue(options.defaultDate);
            }
            return picker;
        },

        stepping(stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            options.stepping = stepping;
            return picker;
        },

        useCurrent(useCurrent) {
            var useCurrentOptions = ["year", "month", "day", "hour", "minute"];
            if (arguments.length === 0) {
                return options.useCurrent;
            }

            if (typeof useCurrent !== "boolean" && typeof useCurrent !== "string") {
                throw new TypeError(
                    "useCurrent() expects a boolean or string parameter"
                );
            }
            if (
                typeof useCurrent === "string" &&
                useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1
            ) {
                throw new TypeError(
                    "useCurrent() expects a string parameter of " +
                        useCurrentOptions.join(", ")
                );
            }
            options.useCurrent = useCurrent;
            return picker;
        },

        collapse(collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== "boolean") {
                throw new TypeError("collapse() expects a boolean parameter");
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        icons(icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError("icons() expects parameter to be an Object");
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        tooltips(tooltips) {
            if (arguments.length === 0) {
                return $.extend({}, options.tooltips);
            }

            if (!(tooltips instanceof Object)) {
                throw new TypeError("tooltips() expects parameter to be an Object");
            }
            $.extend(options.tooltips, tooltips);
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        useStrict(useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }

            if (typeof useStrict !== "boolean") {
                throw new TypeError("useStrict() expects a boolean parameter");
            }
            options.useStrict = useStrict;
            return picker;
        },

        sideBySide (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== "boolean") {
                throw new TypeError("sideBySide() expects a boolean parameter");
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        viewMode(viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof viewMode !== "string") {
                throw new TypeError("viewMode() expects a string parameter");
            }

            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError(
                    "viewMode() parameter must be one of (" +
                        viewModes.join(", ") +
                        ") value"
                );
            }

            options.viewMode = viewMode;
            currentViewMode = Math.max(
                viewModes.indexOf(viewMode),
                minViewModeNumber
            );

            showMode();
            return picker;
        },

        toolbarPlacement(toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== "string") {
                throw new TypeError(
                    "toolbarPlacement() expects a string parameter"
                );
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError(
                    "toolbarPlacement() parameter must be one of (" +
                        toolbarPlacements.join(", ") +
                        ") value"
                );
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        widgetPositioning(widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if ({}.toString.call(widgetPositioning) !== "[object Object]") {
                throw new TypeError(
                    "widgetPositioning() expects an object variable"
                );
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== "string") {
                    throw new TypeError(
                        "widgetPositioning() horizontal variable must be a string"
                    );
                }
                widgetPositioning.horizontal =
                    widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError(
                        "widgetPositioning() expects horizontal parameter to be one of (" +
                            horizontalModes.join(", ") +
                            ")"
                    );
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== "string") {
                    throw new TypeError(
                        "widgetPositioning() vertical variable must be a string"
                    );
                }
                widgetPositioning.vertical =
                    widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError(
                        "widgetPositioning() expects vertical parameter to be one of (" + verticalModes.join(", ") + ")"
                    );
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        },

        calendarWeeks(calendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }

            if (typeof calendarWeeks !== "boolean") {
                throw new TypeError(
                    "calendarWeeks() expects parameter to be a boolean value"
                );
            }

            options.calendarWeeks = calendarWeeks;
            update();
            return picker;
        },

        showTodayButton(showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== "boolean") {
                throw new TypeError(
                    "showTodayButton() expects a boolean parameter"
                );
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        showClear(showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }

            if (typeof showClear !== "boolean") {
                throw new TypeError("showClear() expects a boolean parameter");
            }

            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        widgetParent(widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (
                widgetParent !== null &&
                typeof widgetParent !== "string" &&
                !(widgetParent instanceof $)
            ) {
                throw new TypeError(
                    "widgetParent() expects a string or a jQuery object parameter"
                );
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        },

        keepOpen(keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }

            if (typeof keepOpen !== "boolean") {
                throw new TypeError("keepOpen() expects a boolean parameter");
            }

            options.keepOpen = keepOpen;
            return picker;
        },

        focusOnShow(focusOnShow) {
            if (arguments.length === 0) {
                return options.focusOnShow;
            }

            if (typeof focusOnShow !== "boolean") {
                throw new TypeError("focusOnShow() expects a boolean parameter");
            }

            options.focusOnShow = focusOnShow;
            return picker;
        },

        inline(inline) {
            if (arguments.length === 0) {
                return options.inline;
            }

            if (typeof inline !== "boolean") {
                throw new TypeError("inline() expects a boolean parameter");
            }

            options.inline = inline;
            return picker;
        },

        clear() {
            clear();
            return picker;
        },

        keyBinds(keyBinds) {
            if (arguments.length === 0) {
                return options.keyBinds;
            }

            options.keyBinds = keyBinds;
            return picker;
        },

        getDayJs,

        debug(debug) {
            if (typeof debug !== "boolean") {
                throw new TypeError("debug() expects a boolean parameter");
            }

            options.debug = debug;
            return picker;
        },

        allowInputToggle(allowInputToggle) {
            if (arguments.length === 0) {
                return options.allowInputToggle;
            }

            if (typeof allowInputToggle !== "boolean") {
                throw new TypeError(
                    "allowInputToggle() expects a boolean parameter"
                );
            }

            options.allowInputToggle = allowInputToggle;
            return picker;
        },

        showClose(showClose) {
            if (arguments.length === 0) {
                return options.showClose;
            }

            if (typeof showClose !== "boolean") {
                throw new TypeError("showClose() expects a boolean parameter");
            }

            options.showClose = showClose;
            return picker;
        },

        keepInvalid(keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }

            if (typeof keepInvalid !== "boolean") {
                throw new TypeError("keepInvalid() expects a boolean parameter");
            }
            options.keepInvalid = keepInvalid;
            return picker;
        },

        datepickerInput(datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }

            if (typeof datepickerInput !== "string") {
                throw new TypeError("datepickerInput() expects a string parameter");
            }

            options.datepickerInput = datepickerInput;
            return picker;
        },

        parseInputDate(parseInputDate) {
            if (arguments.length === 0) {
                return options.parseInputDate;
            }

            if (typeof parseInputDate !== "function") {
                throw new TypeError("parseInputDate() sholud be as function");
            }

            options.parseInputDate = parseInputDate;

            return picker;
        },

        /**
         * Gets or sets the disabled time intervals.
         *
         * @param {Array} disabledTimeIntervals Takes an array of start and end times
         * @returns Currently set intervals or picker
         */
        disabledTimeIntervals(disabledTimeIntervals) {
            if (arguments.length === 0) {
                return options.disabledTimeIntervals
                    ? $.extend({}, options.disabledTimeIntervals)
                    : options.disabledTimeIntervals;
            }

            if (!disabledTimeIntervals) {
                options.disabledTimeIntervals = false;
                update();
                return picker;
            }
            if (!(disabledTimeIntervals instanceof Array)) {
                throw new TypeError(
                    "disabledTimeIntervals() expects an array parameter"
                );
            }
            options.disabledTimeIntervals = disabledTimeIntervals;
            update();
            return picker;
        },

        /**
         * Gets or sets the disabled hours
         * Setting this takes precedence over options.minDate, options.maxDate configuration.
         * Also calling this function removes the configuration of options.enabledHours if such exist.
         *
         * @param {Array<int>} hours Disallows the user to select only from those hour
         * @returns
         */
        disabledHours(hours) {
            if (arguments.length === 0) {
                return options.disabledHours
                    ? $.extend({}, options.disabledHours)
                    : options.disabledHours;
            }

            if (!hours) {
                options.disabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError("disabledHours() expects an array parameter");
            }
            options.disabledHours = indexGivenHours(hours);
            options.enabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, "h")) {
                    date = date.add(1, "h");
                    if (tries === 24) {
                        throw "Tried 24 times to find a valid date";
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        },

        /**
         * Gets or sets the enabled hours
         * Setting this takes precedence over options.minDate, options.maxDate configuration.
         * Also calling this function removes the configuration of options.disabledHours if such exist.
         *
         * @param {Array<int>} hours Allows the user to select only from those hour
         * @returns
         */
        enabledHours(hours) {
            if (arguments.length === 0) {
                return options.enabledHours
                    ? $.extend({}, options.enabledHours)
                    : options.enabledHours;
            }

            if (!hours) {
                options.enabledHours = false;
                update();
                return picker;
            }
            if (!(hours instanceof Array)) {
                throw new TypeError("enabledHours() expects an array parameter");
            }
            options.enabledHours = indexGivenHours(hours);
            options.disabledHours = false;
            if (options.useCurrent && !options.keepInvalid) {
                var tries = 0;
                while (!isValid(date, "h")) {
                    date = date.add(1, "h");
                    if (tries === 24) {
                        throw "Tried 24 times to find a valid date";
                    }
                    tries++;
                }
                setValue(date);
            }
            update();
            return picker;
        },

        /**
         * Returns the component's model current viewDate, a dayjs object or null if not set.
         * Passing a null value unsets the components model current dayjs.
         * Parsing of the newDate parameter is made using dayjs library with the options.format and options.useStrict components configuration.
         *
         * @param {any} newDate Takes string, viewDate, dayjs, null parameter.
         * @returns {any} The component's model current viewDate, a dayjs object or null if not set
         */
        viewDate(newDate) {
            if (arguments.length === 0) {
                return viewDate.clone();
            }

            if (!newDate) {
                viewDate = date.clone();
                return picker;
            }

            if (
                typeof newDate !== "string" &&
                !dayjs.isDayjs(newDate) &&
                !(newDate instanceof Date)
            ) {
                throw new TypeError(
                    "viewDate() parameter must be one of [string, dayjs or Date]"
                );
            }

            viewDate = parseInputDate(newDate);
            viewUpdate();
            return picker;
        }
    };

    // initializing element and component attributes
    if (element.is("input")) {
        input = element;
    } else {
        input = element.find(options.datepickerInput);
        if (input.length === 0) {
            input = element.find("input");
        } else if (!input.is("input")) {
            throw new Error(
                "CSS class \"" + options.datepickerInput + "\" cannot be applied to non input element"
            );
        }
    }

    if (element.hasClass("input-group")) {
        // in case there is more then one 'input-group-addon' Issue #48
        if (element.find(".datepickerbutton").length === 0) {
            component = element.find(".input-group-addon");
        } else {
            component = element.find(".datepickerbutton");
        }
    }

    if (!options.inline && !input.is("input")) {
        throw new Error(
            "Could not initialize DateTimePicker without an input element"
        );
    }

    // Set defaults for date here now instead of in var declaration
    date = getDayJs();
    viewDate = date.clone();

    $.extend(true, options, dataToOptions());

    picker.options(options);

    initFormatting();

    attachDatePickerElementEvents();

    if (input.prop("disabled")) {
        picker.disable();
    }
    if (input.is("input") && input.val().trim().length !== 0) {
        setValue(parseInputDate(input.val().trim()));
    } else if (options.defaultDate && input.attr("placeholder") === undefined) {
        setValue(options.defaultDate);
    }
    if (options.inline) {
        show();
    }
    return picker;
};

/********************************************************************************
 *
 * jQuery plugin constructor and defaults object
 *
 ********************************************************************************/

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
                // create a private copy of the defaults object
                _options = $.extend(
                    true,
                    {},
                    $.fn.datetimepicker.defaults,
                    options
                );
                $this.data("DateTimePicker", dateTimePicker($this, _options));
            }
        });
    } else if (typeof options === "string") {
        this.each(function () {
            var $this = $(this),
                instance = $this.data("DateTimePicker");
            if (!instance) {
                throw new Error(
                    "bootstrap-datetimepicker(\"" +
                        options +
                        "\") method was called on an element that is not using DateTimePicker"
                );
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
        close: "glyphicon glyphicon-remove",
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
        vertical: "auto",
    },
    widgetParent: "body",
    ignoreReadonly: false,
    keepOpen: false,
    focusOnShow: true,
    inline: false,
    keepInvalid: false,
    datepickerInput: ".datepickerinput",
    keyBinds: {
        up(widget) {
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
        down(widget) {
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
        "control up"(widget) {
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
        "control down"(widget) {
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
        left(widget) {
            if (!widget) {
                return;
            }
            var d = this.date() || this.getDayJs();
            if (widget.find(".datepicker").is(":visible")) {
                this.date(d.subtract(1, "d"));
            }
        },
        right(widget) {
            if (!widget) {
                return;
            }
            var d = this.date() || this.getDayJs();
            if (widget.find(".datepicker").is(":visible")) {
                this.date(d.add(1, "d"));
            }
        },
        pageUp(widget) {
            if (!widget) {
                return;
            }
            var d = this.date() || this.getDayJs();
            if (widget.find(".datepicker").is(":visible")) {
                this.date(d.subtract(1, "M"));
            }
        },
        pageDown(widget) {
            if (!widget) {
                return;
            }
            var d = this.date() || this.getDayJs();
            if (widget.find(".datepicker").is(":visible")) {
                this.date(d.add(1, "M"));
            }
        },
        enter() {
            this.hide();
        },
        escape() {
            this.hide();
        },
        //tab(widget) { //this break the flow of the form. disabling for now
        //    var toggle = widget.find('.picker-switch a[data-action="togglePicker"]');
        //    if(toggle.length > 0) toggle.click();
        //},
        "control space"(widget) {
            if (!widget) {
                return;
            }
            if (widget.find(".timepicker").is(":visible")) {
                widget.find(".btn[data-action=\"togglePeriod\"]").click();
            }
        },
        t() {
            this.date(this.getDayJs());
        },
        delete() {
            this.clear();
        },
    },
    debug: false,
    allowInputToggle: false,
    disabledTimeIntervals: false,
    disabledHours: false,
    enabledHours: false,
    viewDate: false,
};

export default $.fn.datetimepicker;
