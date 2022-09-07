import $ from "jquery";
import "./shim";
import "../src/js/bootstrap-datetimepicker";
import "bootstrap";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";

$(function () {
    // Register dayjs plugins
    dayjs.extend(advancedFormat);
    dayjs.extend(weekOfYear);

    const showOutput = function (el) {
        $(el).on("dp.change", function (e) {
            $(el + "-output").text(e.date.format("DD MMM YYYY HH:mm:ss.SSS Z"));
        });
    };

    // Default Options
    showOutput("#datetimepicker1");
    $("#datetimepicker1").datetimepicker();

    // Time Only
    showOutput("#datetimepicker2");
    $("#datetimepicker2").datetimepicker({
        format: "HH:mm",
        date: dayjs("1901-01-01T22:22"),
    });

    // Date Only
    showOutput("#datetimepicker3");
    $("#datetimepicker3").datetimepicker({
        format: "DD MMM YYYY",
        useCurrent: "day",
    });

    // Date Only (with initial time)
    showOutput("#datetimepicker4");
    $("#datetimepicker4").datetimepicker({
        format: "DD MMM YYYY",
        date: dayjs("2000-05-20T12:34:56.789"),
    });

    // Day Only
    showOutput("#datetimepicker5");
    $("#datetimepicker5").datetimepicker({
        format: "DD",
        date: dayjs("1901-08-31T12:00"),
    });

    // Year Only
    showOutput("#datetimepicker6");
    $("#datetimepicker6").datetimepicker({
        format: "YYYY",
    });

    // Month And Year
    showOutput("#datetimepicker7");
    $("#datetimepicker7").datetimepicker({
        format: "MMM YYYY",
    });

    // Week And Year
    showOutput("#datetimepicker8");
    $("#datetimepicker8").datetimepicker({
        format: "[W]w YYYY",
    });

    // Quarter And Year
    showOutput("#datetimepicker9");
    $("#datetimepicker9").datetimepicker({
        format: "[Q]Q YYYY",
    });

    // Inline Date Only
    showOutput("#datetimepicker10");
    $("#datetimepicker10").datetimepicker({
        inline: true,
        useCurrent: false,
        showClear: true,
        date: "1901-08-31T12:00Z",
        format: "DD MMM YYYY",
    });

    // Disabled Inline Date
    showOutput("#datetimepicker11");
    $("#datetimepicker11").datetimepicker({
        inline: true,
        useCurrent: false,
        showClear: true,
        date: "1901-08-31T12:00Z",
        format: "DD MMM YYYY",
        disable:true
    });
});
