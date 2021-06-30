import $ from "jquery";
import "../src/js/bootstrap-datetimepicker";

window.$ = window.jQuery = $;

$(function () {
    $("#datetimepicker1").datetimepicker();
});
