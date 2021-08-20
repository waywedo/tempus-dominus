import $ from "jquery";
import "./shim";
import "../src/js/bootstrap-datetimepicker";
import "bootstrap";
import dayjs from "dayjs";

$(function () {
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
        useCurrent: "day"
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

    // Inline Date Only
    showOutput("#datetimepicker6");
    $("#datetimepicker6").datetimepicker({
        inline: true,
        useCurrent: false,
        showClear: true,
        date: "1901-08-31T12:00Z",
        format: "DD MMM YYYY",
    });
});
