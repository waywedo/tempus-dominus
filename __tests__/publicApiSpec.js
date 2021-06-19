/* eslint-env jest */
import $ from "jquery";
import dayjs from "dayjs";
import "../src/js/bootstrap-datetimepicker";

describe("Plugin initialization and component basic construction", () => {

    test("loads jquery plugin properly", () => {
        expect($("<div>").datetimepicker).toBeDefined();
        expect(typeof $("<div>").datetimepicker).toEqual("function");
        expect($("<div>").datetimepicker.defaults).toBeDefined();
    });

    test("creates the component with default options on an input element", () => {
        const dtpElement = $("<input>");
        $(document).find("body").append(dtpElement);

        expect(() => {
            expect(dtpElement.datetimepicker()).toBe(dtpElement);
        }).not.toThrow();

        dtpElement.data("DateTimePicker");

        expect(dtpElement).not.toBe(null);
    });

    test("creates the component with default options merged with those provided on an input element", () => {
        const options = { collapse : false };
        const dtpElement = $("<input>");
        let dtp;

        $(document).find("body").append(dtpElement);

        expect(() => {
            expect(dtpElement.datetimepicker(options)).toBe(dtpElement);
        }).not.toThrow();

        dtp = dtpElement.data("DateTimePicker");
        expect(dtp).not.toBe(null);
        expect(dtp.options()).toEqual($.extend(true, {}, dtpElement.datetimepicker.defaults, options));
    });

    test("does not accept non-object or string types", () => {
        const dtpElement = $("<input>");
        $(document).find("body").append(dtpElement);

        expect(() => {
            dtpElement.datetimepicker(true);
        }).toThrow();
    });

    xtest("calls destroy when Element that the component is attached is removed", () => {
        const dtpElement = $("<div>").attr("class", "row").append($("<div>").attr("class", "col-md-12").append($("<input>")));
        let dtp;
        $(document).find("body").append(dtpElement);
        dtpElement.datetimepicker();
        dtp = dtpElement.data("DateTimePicker");
        jest.spyOn(dtp, "destroy");
        dtpElement.remove();
        expect(dtp.destroy).toHaveBeenCalled();
    });
});

describe("Public API method tests", () => {
    let dtp,
        dtpElement,
        dpChangeSpy,
        dpShowSpy,
        dpHideSpy,
        dpErrorSpy,
        dpClassifySpy;

    beforeEach(() => {
        dpChangeSpy = jest.fn();
        dpShowSpy = jest.fn();
        dpHideSpy = jest.fn();
        dpErrorSpy = jest.fn();
        dpClassifySpy = jest.fn();
        dtpElement = $("<input>").attr("id", "dtp");

        $(document).find("body")
            .append($("<div>").attr("class", "row").append($("<div>").attr("class", "col-md-12").append(dtpElement)))
            .on("dp.change", dpChangeSpy)
            .on("dp.show", dpShowSpy)
            .on("dp.hide", dpHideSpy)
            .on("dp.error", dpErrorSpy)
            .on("dp.classify", dpClassifySpy);

        dtpElement.datetimepicker();
        dtp = dtpElement.data("DateTimePicker");
    });

    afterEach(() => {
        dtp.destroy();
        dtpElement.remove();
    });

    describe("configuration option name match to public api function", () => {
        Object
            .getOwnPropertyNames($.fn.datetimepicker.defaults)
            .forEach((key) => {
                test("has function " + key + "()", () => {
                    expect(dtp[key]).toBeDefined();
                });
            });
    });

    describe("unknown functions", () => {
        test("are not allowed", () => {
            expect(() => {
                dtpElement.datetimepicker("abcdef");
            }).toThrow();
        });
    });

    describe("date() function", () => {
        describe("typechecking", () => {
            test("accepts a null", () => {
                expect(() => {
                    dtp.date(null);
                }).not.toThrow();
            });

            test("accepts a string", () => {
                expect(() => {
                    dtp.date("2013/05/24");
                }).not.toThrow();
            });

            test("accepts a Date object", () => {
                expect(() => {
                    dtp.date(new Date());
                }).not.toThrow();
            });

            test("accepts a Moment object", () => {
                expect(() => {
                    dtp.date(dayjs());
                }).not.toThrow();
            });

            test("does not accept undefined", () => {
                expect(() => {
                    dtp.date(undefined);
                }).toThrow();
            });

            test("does not accept a number", () => {
                expect(() => {
                    dtp.date(0);
                }).toThrow();
            });

            test("does not accept a generic Object", () => {
                expect(() => {
                    dtp.date({});
                }).toThrow();
            });

            test("does not accept a boolean", () => {
                expect(() => {
                    dtp.date(false);
                }).toThrow();
            });
        });

        describe("functionality", () => {
            test("has no date set upon construction", () => {
                expect(dtp.date()).toBe(null);
            });

            test("sets the date correctly", () => {
                const timestamp = dayjs();
                dtp.date(timestamp);
                expect(dtp.date().isSame(timestamp)).toBe(true);
            });
        });

        describe("access", () => {
            test("gets date", () => {
                expect(dtpElement.datetimepicker("date")).toBe(null);
            });

            test("sets date", () => {
                const timestamp = dayjs();
                expect(dtpElement.datetimepicker("date", timestamp)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("date").isSame(timestamp)).toBe(true);
            });
        });
    });

    describe("format() function", () => {
        describe("typechecking", () => {
            test("accepts a false value", () => {
                expect(() => {
                    dtp.format(false);
                }).not.toThrow();
            });

            test("accepts a string", () => {
                expect(() => {
                    dtp.format("YYYY-MM-DD");
                }).not.toThrow();
            });

            test("does not accept undefined", () => {
                expect(() => {
                    dtp.format(undefined);
                }).toThrow();
            });

            test("does not accept true", () => {
                expect(() => {
                    dtp.format(true);
                }).toThrow();
            });

            test("does not accept a generic Object", () => {
                expect(() => {
                    dtp.format({});
                }).toThrow();
            });
        });

        describe("functionality", () => {
            test("returns no format before format is set", () => {
                expect(dtp.format()).toBe(false);
            });

            test("sets the format correctly", () => {
                const format = "YYYY-MM-DD";
                dtp.format(format);
                expect(dtp.format()).toBe(format);
            });
        });

        describe("access", () => {
            test("gets format", () => {
                expect(dtpElement.datetimepicker("format")).toBe(false);
            });

            test("sets format", () => {
                const format = "YYYY-MM-DD";
                expect(dtpElement.datetimepicker("format", format)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("format")).toBe(format);
            });
        });
    });

    describe("destroy() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.destroy).toBeDefined();
            });
        });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("destroy")).toBe(dtpElement);
            });
        });
    });

    describe("toggle() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.toggle).toBeDefined();
            });
        });

        // describe('functionality', () => {
        //     test('')
        // });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("toggle")).toBe(dtpElement);
            });
        });
    });

    describe("show() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.show).toBeDefined();
            });
        });

        describe("functionality", () => {
            test("emits a show event when called while widget is hidden", () => {
                dtp.show();
                expect(dpShowSpy).toHaveBeenCalled();
            });

            test("does not emit a show event when called and widget is already showing", () => {
                dtp.hide();
                dtp.show();
                dpShowSpy.mockClear();
                dtp.show();
                expect(dpShowSpy).not.toHaveBeenCalled();
            });

            test("calls the classify event for each day that is shown", () => {
                dtp.show();
                expect(dpClassifySpy.mock.calls.length).toEqual(42);
            });

            test("actually shows the widget", () => {
                dtp.show();
                expect($(document).find("body").find(".bootstrap-datetimepicker-widget").length).toEqual(1);
            });

            test("applies the styles appended in the classify event handler", () => {
                const handler = function (event) {
                    if (event.date.day() === 4) {
                        event.classNames.push("humpday");
                    }
                    event.classNames.push("injected");
                };
                $(document).find("body").on("dp.classify", handler);
                dtp.show();
                $(document).find("body").off("dp.classify", handler);
                expect($(document).find("body").find(".bootstrap-datetimepicker-widget td.day.injected").length).toEqual(42);
                expect($(document).find("body").find(".bootstrap-datetimepicker-widget td.day.humpday").length).toEqual(6);
            });
        });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("show")).toBe(dtpElement);
            });
        });
    });

    describe("hide() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.hide).toBeDefined();
            });
        });

        describe("functionality", () => {
            test("emits a hide event when called while widget is shown", () => {
                dtp.show();
                dtp.hide();
                expect(dpHideSpy).toHaveBeenCalled();
            });

            test("does not emit a hide event when called while widget is hidden", () => {
                dtp.hide();
                expect(dpHideSpy).not.toHaveBeenCalled();
            });

            test("actually hides the widget", () => {
                dtp.show();
                dtp.hide();
                expect($(document).find("body").find(".bootstrap-datetimepicker-widget").length).toEqual(0);
            });
        });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("hide")).toBe(dtpElement);
            });
        });
    });

    describe("disable() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.disable).toBeDefined();
            });
        });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("disable")).toBe(dtpElement);
            });
        });
    });

    describe("enable() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.enable).toBeDefined();
            });
        });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("enable")).toBe(dtpElement);
            });
        });
    });

    describe("options() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.options).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets options", () => {
                expect(dtpElement.datetimepicker("options")).toEqual(dtpElement.datetimepicker.defaults);
            });

            test("sets options", () => {
                const options = {collapse : false};
                expect(dtpElement.datetimepicker("options", options)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("options")).toEqual($.extend(true, {}, dtpElement.datetimepicker.defaults, options));
            });
        });
    });

    describe("disabledDates() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.disabledDates).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets disabled dates", () => {
                expect(dtpElement.datetimepicker("disabledDates")).toBe(false);
            });

            test("sets disabled dates", () => {
                const timestamps = [dayjs()];
                expect(dtpElement.datetimepicker("disabledDates", timestamps)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("disabledDates")).not.toBe(false);
            });
        });
    });

    describe("enabledDates() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.enabledDates).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets enabled dates", () => {
                expect(dtpElement.datetimepicker("enabledDates")).toBe(false);
            });

            test("sets enabled dates", () => {
                const timestamps = [dayjs()];
                expect(dtpElement.datetimepicker("enabledDates", timestamps)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("enabledDates")).not.toBe(false);
            });
        });
    });

    describe("daysOfWeekDisabled() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.daysOfWeekDisabled).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets days of week disabled", () => {
                expect(dtpElement.datetimepicker("daysOfWeekDisabled")).toBe(false);
            });

            test("sets days of week disabled", () => {
                const daysOfWeek = [0];
                expect(dtpElement.datetimepicker("daysOfWeekDisabled", daysOfWeek)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("daysOfWeekDisabled")).toEqual(daysOfWeek);
            });
        });
    });

    describe("maxDate() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.maxDate).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets max date", () => {
                expect(dtpElement.datetimepicker("maxDate")).toBe(false);
            });

            test("sets max date", () => {
                const timestamp = dayjs();
                expect(dtpElement.datetimepicker("maxDate", timestamp)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("maxDate").isSame(timestamp)).toBe(true);
            });
        });
    });

    describe("minDate() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.minDate).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets min date", () => {
                expect(dtpElement.datetimepicker("minDate")).toBe(false);
            });

            test("sets min date", () => {
                const timestamp = dayjs();
                expect(dtpElement.datetimepicker("minDate", timestamp)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("minDate").isSame(timestamp)).toBe(true);
            });
        });
    });

    describe("defaultDate() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.defaultDate).toBeDefined();
            });
        });
        describe("functionality", () => {
            test("returns no defaultDate before defaultDate is set", () => {
                expect(dtp.defaultDate()).toBe(false);
            });

            test("sets the defaultDate correctly", () => {
                const timestamp = dayjs();
                dtp.defaultDate(timestamp);
                expect(dtp.defaultDate().isSame(timestamp)).toBe(true);
                expect(dtp.date().isSame(timestamp)).toBe(true);
            });

            test("triggers a change event upon setting a default date and input field is empty", () => {
                dtp.date(null);
                dtp.defaultDate(dayjs());
                expect(dpChangeSpy).toHaveBeenCalled();
            });

            test("does not override input value if it already has one", () => {
                const timestamp = dayjs();
                dtp.date(timestamp);
                dtp.defaultDate(dayjs().year(2000));
                expect(dtp.date().isSame(timestamp)).toBe(true);
            });
        });

        describe("access", () => {
            test("gets default date", () => {
                expect(dtpElement.datetimepicker("defaultDate")).toBe(false);
            });

            test("sets default date", () => {
                const timestamp = dayjs();
                expect(dtpElement.datetimepicker("defaultDate", timestamp)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("defaultDate").isSame(timestamp)).toBe(true);
            });
        });
    });

    // describe("locale() function", () => {
    //     describe("functionality", () => {
    //         test("it has the same locale as the global moment locale with default options", () => {
    //             expect(dtp.locale()).toBe(moment.locale());
    //         });

    //         test("it switches to a selected locale without affecting global moment locale", () => {
    //             dtp.locale("el");
    //             dtp.date(dayjs());
    //             expect(dtp.locale()).toBe("el");
    //             expect(dtp.date().locale()).toBe("el");
    //             expect(moment.locale()).toBe("en");
    //         });
    //     });

    //     describe("access", () => {
    //         test("gets locale", () => {
    //             expect(dtpElement.datetimepicker("locale")).toBe(moment.locale());
    //         });

    //         test("sets locale", () => {
    //             var locale = "fr";
    //             expect(dtpElement.datetimepicker("locale", locale)).toBe(dtpElement);
    //             expect(dtpElement.datetimepicker("locale")).toBe(locale);
    //         });
    //     });
    // });

    describe("useCurrent() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.useCurrent).toBeDefined();
            });
        });
        describe("check type and parameter validity", () => {
            test("accepts either a boolean value or string", () => {
                const useCurrentOptions = ["year", "month", "day", "hour", "minute"];

                expect(() => {
                    dtp.useCurrent(false);
                }).not.toThrow();
                expect(() => {
                    dtp.useCurrent(true);
                }).not.toThrow();

                useCurrentOptions.forEach(function (value) {
                    expect(() => {
                        dtp.useCurrent(value);
                    }).not.toThrow();
                });

                expect(() => {
                    dtp.useCurrent("test");
                }).toThrow();
                expect(() => {
                    dtp.useCurrent({});
                }).toThrow();
            });
        });
        describe("functionality", () => {
            test("triggers a change event upon show() and input field is empty", () => {
                dtp.useCurrent(true);
                dtp.show();
                expect(dpChangeSpy).toHaveBeenCalled();
            });
        });

        describe("access", () => {
            test("gets use current", () => {
                expect(dtpElement.datetimepicker("useCurrent")).toBe(true);
            });

            test("sets use current", () => {
                const useCurrent = false;
                expect(dtpElement.datetimepicker("useCurrent", useCurrent)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("useCurrent")).toBe(useCurrent);
            });
        });
    });

    describe("ignoreReadonly() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.ignoreReadonly).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets ignore readonly", () => {
                expect(dtpElement.datetimepicker("ignoreReadonly")).toBe(false);
            });

            test("sets ignore readonly", () => {
                const ignoreReadonly = true;
                expect(dtpElement.datetimepicker("ignoreReadonly", ignoreReadonly)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("ignoreReadonly")).toBe(ignoreReadonly);
            });
        });
    });

    describe("stepping() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.stepping).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets stepping", () => {
                expect(dtpElement.datetimepicker("stepping")).toBe(1);
            });

            test("sets stepping", () => {
                const stepping = 2;
                expect(dtpElement.datetimepicker("stepping", stepping)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("stepping")).toBe(stepping);
            });
        });
    });

    describe("collapse() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.collapse).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets collapse", () => {
                expect(dtpElement.datetimepicker("collapse")).toBe(true);
            });

            test("sets collapse", () => {
                const collapse = false;
                expect(dtpElement.datetimepicker("collapse", collapse)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("collapse")).toBe(collapse);
            });
        });
    });

    describe("icons() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.icons).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets icons", () => {
                expect(dtpElement.datetimepicker("icons")).toEqual(dtpElement.datetimepicker.defaults.icons);
            });

            test("sets icons", () => {
                const icons = {time: "fa fa-time"};
                expect(dtpElement.datetimepicker("icons", icons)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("icons")).toEqual($.extend(true, {}, dtpElement.datetimepicker.defaults.icons, icons));
            });
        });
    });

    describe("useStrict() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.useStrict).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets use strict", () => {
                expect(dtpElement.datetimepicker("useStrict")).toBe(false);
            });

            test("sets use strict", () => {
                const useStrict = true;
                expect(dtpElement.datetimepicker("useStrict", useStrict)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("useStrict")).toBe(useStrict);
            });
        });
    });

    describe("sideBySide() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.sideBySide).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets side-by-side", () => {
                expect(dtpElement.datetimepicker("sideBySide")).toBe(false);
            });

            test("sets side-by-side", () => {
                const sideBySide = true;
                expect(dtpElement.datetimepicker("sideBySide", sideBySide)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("sideBySide")).toBe(sideBySide);
            });
        });
    });

    describe("viewMode() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.viewMode).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets view mode", () => {
                expect(dtpElement.datetimepicker("viewMode")).toBe("days");
            });

            test("sets view mode", () => {
                const viewMode = "years";
                expect(dtpElement.datetimepicker("viewMode", viewMode)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("viewMode")).toBe(viewMode);
            });
        });
    });

    describe("widgetPositioning() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.widgetPositioning).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets widget positioning", () => {
                expect(dtpElement.datetimepicker("widgetPositioning")).toEqual(dtpElement.datetimepicker.defaults.widgetPositioning);
            });

            test("sets widget positioning", () => {
                const widgetPositioning = {horizontal: "left"};
                expect(dtpElement.datetimepicker("widgetPositioning", widgetPositioning)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("widgetPositioning")).toEqual($.extend(true, {}, dtpElement.datetimepicker.defaults.widgetPositioning, widgetPositioning));
            });
        });
    });

    describe("calendarWeeks() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.calendarWeeks).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets calendar weeks", () => {
                expect(dtpElement.datetimepicker("calendarWeeks")).toBe(false);
            });

            test("sets calendar weeks", () => {
                const calendarWeeks = true;
                expect(dtpElement.datetimepicker("calendarWeeks", calendarWeeks)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("calendarWeeks")).toBe(calendarWeeks);
            });
        });
    });

    describe("showTodayButton() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.showTodayButton).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets show today button", () => {
                expect(dtpElement.datetimepicker("showTodayButton")).toBe(false);
            });

            test("sets show today button", () => {
                const showTodayButton = true;
                expect(dtpElement.datetimepicker("showTodayButton", showTodayButton)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("showTodayButton")).toBe(showTodayButton);
            });
        });
    });

    describe("showClear() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.showClear).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets show clear", () => {
                expect(dtpElement.datetimepicker("showClear")).toBe(false);
            });

            test("sets show clear", () => {
                const showClear = true;
                expect(dtpElement.datetimepicker("showClear", showClear)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("showClear")).toBe(showClear);
            });
        });
    });

    describe("dayViewHeaderFormat() function", () => {
        describe("typechecking", () => {
            test("does not accept a false value", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat(false);
                }).toThrow();
            });

            test("accepts a string", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat("YYYY-MM-DD");
                }).not.toThrow();
            });

            test("does not accept undefined", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat(undefined);
                }).toThrow();
            });

            test("does not accept true", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat(true);
                }).toThrow();
            });

            test("does not accept a generic Object", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat({});
                }).toThrow();
            });
        });

        describe("functionality", () => {
            test("expects dayViewHeaderFormat to be default of MMMM YYYY", () => {
                expect(dtp.dayViewHeaderFormat()).toBe("MMMM YYYY");
            });

            test("sets the dayViewHeaderFormat correctly", () => {
                dtp.dayViewHeaderFormat("MM YY");
                expect(dtp.dayViewHeaderFormat()).toBe("MM YY");
            });
        });

        describe("access", () => {
            test("gets day view header format", () => {
                expect(dtpElement.datetimepicker("dayViewHeaderFormat")).toBe("MMMM YYYY");
            });

            test("sets day view header format", () => {
                const dayViewHeaderFormat = "MM YY";
                expect(dtpElement.datetimepicker("dayViewHeaderFormat", dayViewHeaderFormat)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("dayViewHeaderFormat")).toBe(dayViewHeaderFormat);
            });
        });
    });

    describe("extraFormats() function", () => {
        describe("typechecking", () => {
            test("accepts a false value", () => {
                expect(() => {
                    dtp.extraFormats(false);
                }).not.toThrow();
            });

            test("does not accept a string", () => {
                expect(() => {
                    dtp.extraFormats("YYYY-MM-DD");
                }).toThrow();
            });

            test("does not accept undefined", () => {
                expect(() => {
                    dtp.extraFormats(undefined);
                }).toThrow();
            });

            test("does not accept true", () => {
                expect(() => {
                    dtp.extraFormats(true);
                }).toThrow();
            });

            test("accepts an Array", () => {
                expect(() => {
                    dtp.extraFormats(["YYYY-MM-DD"]);
                }).not.toThrow();
            });
        });

        describe("functionality", () => {
            test("returns no extraFormats before extraFormats is set", () => {
                expect(dtp.extraFormats()).toBe(false);
            });

            test("sets the extraFormats correctly", () => {
                dtp.extraFormats(["YYYY-MM-DD"]);
                expect(dtp.extraFormats()[0]).toBe("YYYY-MM-DD");
            });
        });

        describe("access", () => {
            test("gets extra formats", () => {
                expect(dtpElement.datetimepicker("extraFormats")).toBe(false);
            });

            test("sets extra formats", () => {
                const extraFormats = ["YYYY-MM-DD"];
                expect(dtpElement.datetimepicker("extraFormats", extraFormats)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("extraFormats")).toEqual(extraFormats);
            });
        });
    });

    describe("toolbarPlacement() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.toolbarPlacement).toBeDefined();
            });
        });
        describe("check type and parameter validity", () => {
            test("does not accept a false value", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat(false);
                }).toThrow();
            });
            test("does not accept a false value", () => {
                expect(() => {
                    dtp.dayViewHeaderFormat(false);
                }).toThrow();
            });
            test("accepts a string", () => {
                const toolbarPlacementOptions = ["default", "top", "bottom"];

                toolbarPlacementOptions.forEach(function (value) {
                    expect(() => {
                        dtp.toolbarPlacement(value);
                    }).not.toThrow();
                });

                expect(() => {
                    dtp.toolbarPlacement("test");
                }).toThrow();
                expect(() => {
                    dtp.toolbarPlacement({});
                }).toThrow();
            });
        });

        describe("access", () => {
            test("gets toolbar placement", () => {
                expect(dtpElement.datetimepicker("toolbarPlacement")).toBe("default");
            });

            test("sets toolbar placement", () => {
                const toolbarPlacement = "top";
                expect(dtpElement.datetimepicker("toolbarPlacement", toolbarPlacement)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("toolbarPlacement")).toBe(toolbarPlacement);
            });
        });
    });

    describe("widgetParent() function", () => {
        describe("typechecking", () => {
            test("accepts a null", () => {
                expect(() => {
                    dtp.widgetParent(null);
                }).not.toThrow();
            });

            test("accepts a string", () => {
                expect(() => {
                    dtp.widgetParent("testDiv");
                }).not.toThrow();
            });

            test("accepts a jquery object", () => {
                expect(() => {
                    dtp.widgetParent($("#testDiv"));
                }).not.toThrow();
            });

            test("does not accept undefined", () => {
                expect(() => {
                    dtp.widgetParent(undefined);
                }).toThrow();
            });

            test("does not accept a number", () => {
                expect(() => {
                    dtp.widgetParent(0);
                }).toThrow();
            });

            test("does not accept a generic Object", () => {
                expect(() => {
                    dtp.widgetParent({});
                }).toThrow();
            });

            test("does not accept a boolean", () => {
                expect(() => {
                    dtp.widgetParent(false);
                }).toThrow();
            });
        });

        describe("access", () => {
            test("gets widget parent", () => {
                expect(dtpElement.datetimepicker("widgetParent")).toBe(null);
            });

            test("sets widget parent", () => {
                expect(dtpElement.datetimepicker("widgetParent", "testDiv")).toBe(dtpElement);
                expect(dtpElement.datetimepicker("widgetParent")).not.toBe(null);
            });
        });
    });

    describe("keepOpen() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.keepOpen).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets keep open", () => {
                expect(dtpElement.datetimepicker("keepOpen")).toBe(false);
            });

            test("sets keep open", () => {
                const keepOpen = true;
                expect(dtpElement.datetimepicker("keepOpen", keepOpen)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("keepOpen")).toBe(keepOpen);
            });
        });
    });

    describe("inline() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.inline).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets inline", () => {
                expect(dtpElement.datetimepicker("inline")).toBe(false);
            });

            test("sets inline", () => {
                const inline = true;
                expect(dtpElement.datetimepicker("inline", inline)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("inline")).toBe(inline);
            });
        });
    });

    describe("clear() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.clear).toBeDefined();
            });
        });

        describe("access", () => {
            test("returns jQuery object", () => {
                expect(dtpElement.datetimepicker("clear")).toBe(dtpElement);
            });
        });
    });

    describe("keyBinds() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.keyBinds).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets key binds", () => {
                expect(dtpElement.datetimepicker("keyBinds")).toEqual(dtpElement.datetimepicker.defaults.keyBinds);
            });

            test("sets key binds", () => {
                const keyBinds = {up: () => {}};
                expect(dtpElement.datetimepicker("keyBinds", keyBinds)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("keyBinds")).toEqual(keyBinds);
            });
        });
    });

    describe("parseInputDate() function", () => {
        describe("existence", () => {
            test("is defined", () => {
                expect(dtp.parseInputDate).toBeDefined();
            });
        });

        describe("access", () => {
            test("gets parse input date", () => {
                expect(dtpElement.datetimepicker("parseInputDate")).toBe(undefined);
            });

            test("sets parse input date", () => {
                const parseInputDate = () => {};
                expect(dtpElement.datetimepicker("parseInputDate", parseInputDate)).toBe(dtpElement);
                expect(dtpElement.datetimepicker("parseInputDate")).toBe(parseInputDate);
            });
        });
    });

    // describe("Time zone tests", () => {
    //     function makeFormatTest (format, displayTimeZone) {
    //         test("should not change the value that was set when using format " + format, () => { // #1326
    //             var oldFormat = dtp.format(),
    //                 oldTimeZone = dtp.timeZone(),
    //                 now = dayjs().startOf("second");

    //             dtp.timeZone(displayTimeZone);
    //             dtp.format(format);

    //             dtp.date(now);
    //             dpChangeSpy.mockClear();
    //             dtp.show();
    //             dtp.hide();
    //             expect(dpChangeSpy).not.toHaveBeenCalled();
    //             expect(dtp.date().format()).toEqual(now.tz(displayTimeZone).format());

    //             dtp.format(oldFormat);
    //             dtp.timeZone(oldTimeZone);
    //         });
    //     }

    //     makeFormatTest("YYYY-MM-DD HH:mm:ss Z", "UTC");
    //     makeFormatTest("YYYY-MM-DD HH:mm:ss", "UTC");
    //     makeFormatTest("YYYY-MM-DD HH:mm:ss Z", "America/New_York");
    //     makeFormatTest("YYYY-MM-DD HH:mm:ss", "America/New_York");
    // });
});

