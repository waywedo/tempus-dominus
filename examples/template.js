import $ from "jquery";
import "./shim";
import "../src/js/bootstrap-datetimepicker";
import "bootstrap";
import dayjs from "dayjs";

$(function () {
    $("#datetimepicker1").datetimepicker();

    $("#datetimepicker2").on("dp.change", function (e) {
        $("#datetimepicker2-output").text(e.date.format("DD MMM YYYY HH:mm"));
    });
    $("#datetimepicker2").datetimepicker({
        format: "HH:mm",
        date: dayjs("1901-01-01T22:22"),
    });

    $("#datetimepicker3").on("dp.change", function (e) {
        $("#datetimepicker3-output").text(e.date.format("DD MMM YYYY HH:mm"));
    });
    $("#datetimepicker3").datetimepicker({
        format: "DD",
        date: dayjs("1901-08-20T12:00"),
    });
});
