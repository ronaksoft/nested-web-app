/**
 * @file scenes/private/posts/components/post/index.tsx
 * @author robzizo <me@robzizo.ir>
 * @description Date picker component that alows to pick a date from only past or feuture
 *              by supporting both jalali and georgian calenders.
 *              Thanks https://github.com/thg303/ng-jalaali-flat-datepicker
 *              and https://github.com/RemiAWE/ng-flat-datepicker
 *              for their contribiutes.
 */
(function() {

    'use strict';

    /**
     * @desc Datepicker directive
     * @example <ng-datepicker></ng-datepicker>
     */

    ngJalaaliFlatDatepickerDirective.$inject = ["$templateCache", "$compile", "$document", "datesCalculator", "ngJalaaliFDP", "moment", "NstSvcI18n"];
    angular
        .module('ngJalaaliFlatDatepicker', ["ronak.nested.web.components.i18n"])
        .filter('persianDate', PersianDateFilter)
        .provider('ngJalaaliFDP', ngJalaaliFlatDatepickerProvider)
        .directive('ngJalaaliFlatDatepicker', ngJalaaliFlatDatepickerDirective);


    function PersianDateFilter(moment) {
        return function(input, format, fromNow) {
            if (!input || input == null) return '';
            moment.loadPersian();
            try {
                input = moment(input);
            } catch (ex) {
                return input + ' تاریخ نیست!';
            }
            if (format == null || format == 'shortDate') {
                format = 'jYYYY/jMM/jDD';
            }
            return (fromNow ? input.fromNow() + " " : "") + input.format(format);
        };
    }

    function ngJalaaliFlatDatepickerProvider() {
        var options = {
            dateFormat: 'jYYYY/jMM/jDD',
            gregorianDateFormat: 'YYYY/MM/DD',
            minDate: null,
            dropDownYears: 10,
            maxDate: null,
            allowFuture: false
        };

        var ngJFD = {
            getOptions: function(type) {
                var typeOptions = type && options[type] || options;
                return typeOptions;
            }
        };

        this.setOptions = function(customOptions) {
            options = angular.extend(options, customOptions);
        };

        this.$get = function() {
            return ngJFD;
        };

    }


    function ngJalaaliFlatDatepickerDirective($templateCache, $compile, $document, datesCalculator, ngJalaaliFDP, moment, NstSvcI18n) {
        /*function parseConfig (config) {
            var temp = angular.fromJson(config);
            if (typeof(temp.minDate) == 'undefined') {
                temp.minDate = moment.utc(temp.minDate);
            }
            if (typeof(temp.maxDate) == 'undefined') {
                temp.maxDate = moment.utc(temp.maxDate);
            }
            return temp;
        }*/
        
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                config: '=?datepickerConfig',
                gPickedDate: '=?gregorianPickedDate',
                gFormattedPickedDate: '=?gregorianFormattedPickedDate',
                isJalali: '=?isJalali'
            },
            link: function(scope, element, attrs, ngModel) {
                var jalali = true;
                var farsi = false;
                if ( NstSvcI18n.selectedCalendar === "gregorian") {
                    jalali = false;
                }
                if ( NstSvcI18n.selectedLocale === 'fa-IR') {
                    farsi = true;
                }
                var template = angular.element($templateCache.get('datepicker.html'));

                var dateSelected = '';
                var today = moment.utc();

                /*
                 * returns start year based on configuration
                 */
                var getStartYear = function() {
                    if (typeof(scope.config.minDate) == 'undefined') {
                        return scope.config.minDate.format('YYYY');
                    }
                    if (scope.config.allowFuture) {
                        return moment.utc().subtract('5', 'years').format('YYYY');
                    }
                    return moment.utc().subtract('10', 'years').format('YYYY');
                };


                // Apply and init options
                scope.config = angular.extend(ngJalaaliFDP.getOptions(), scope.config);
                if (angular.isDefined(scope.config.minDate)) moment.utc(scope.config.minDate).subtract(1, 'day');
                if (angular.isDefined(scope.config.maxDate)) moment.utc(scope.config.maxDate).add(1, 'day');
                if (!angular.isDefined(scope.config.gregorianDateFormat)) scope.config.gregorianDateFormat = scope.config.dateFormat.replace(/j/g, "");

                // Data
                scope.calendarCursor = today;
                scope.currentWeeks = [];
                scope.daysNameList = datesCalculator.getDaysNames();

                if ( jalali && farsi ) {
                    scope.monthsList = moment.localeData()._jMonths;
                } else if( jalali && !farsi ) {
                    scope.monthsList = moment.localeData()._jMonths;
                }else if ( !jalali && farsi) {
                    scope.monthsList = moment.monthsShort();
                } else {
                    scope.monthsList = moment.months();
                }

                scope.yearsList = datesCalculator.getYearsList(getStartYear(), scope.config.dropDownYears);

                // Display
                scope.pickerDisplayed = false;
                ngModel.$parsers.push(function(value) {
                    if (value) {
                        if (angular.isString(value)) {
                            if (value.toLowerCase() === "today" || value === "امروز") {
                                return moment.utc();
                            }
                            if (value.toLowerCase() === "yesterday" || value === "دیروز") {
                                return moment.utc().subtract(1, 'day');
                            }
                            if (value.toLowerCase() === "tomorrow" || value === "فردا") {
                                return moment.utc().add(1, 'day');
                            }
                        }
                        return moment.utc(value, scope.config.dateFormat);
                    }
                })
                ngModel.$formatters.push(function(value) {
                    if (value) {
                        var daysDiff = moment.utc(value).diff(moment.utc(), 'days');
                        if (daysDiff === -1) return "دیروز";
                        else if (daysDiff === 0) return "امروز";
                        else if (daysDiff === 1) return "فردا";
                        return moment.utc(value).format(scope.config.dateFormat);
                    }
                })
                scope.$watch(function() {
                    return ngModel.$modelValue;
                }, function(value) {
                    if (value) {
                        dateSelected = scope.calendarCursor = moment.utc(value);
                    }
                });

                scope.$watch('calendarCursor', function(val) {
                    //scope.$apply(function() {
                    scope.currentWeeks = getWeeks(val);
                    //});

                });

                /**
                 * ClickOutside, handle all clicks outside the DatePicker when visible
                 */
                element.bind('click', function() {
                    scope.$apply(function() {
                        scope.pickerDisplayed = true;
                        $document.on('click', onDocumentClick);
                    });
                });

                function onDocumentClick(e) {
                    if (template !== e.target && !template[0].contains(e.target) && e.target !== element[0]) {
                        $document.off('click', onDocumentClick);
                        scope.$apply(function() {
                            scope.calendarCursor = dateSelected ? dateSelected : today;
                            scope.pickerDisplayed = scope.showMonthsList = scope.showYearsList = false;
                        });
                    }
                }

                init();

                /**
                 * Display the previous month in the datepicker
                 * @return {}
                 */
                scope.prevMonth = function() {
                    if ( jalali ) {
                        scope.calendarCursor = moment(scope.calendarCursor).subtract(1, 'jMonths');
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).subtract(1, 'months');
                    }
                };

                /**
                 * Display the next month in the datepicker
                 * @return {}
                 */
                scope.nextMonth = function nextMonth() {
                    scope.calendarCursor = moment(scope.calendarCursor).add(1, jalali ? 'jMonths' : 'months');
                };

                /**
                 * Select a month and display it in the datepicker
                 * @param  {string} month The month selected in the select element
                 * @return {}
                 */
                scope.selectMonth = function selectMonth(month) {
                    scope.showMonthsList = false;
                    if ( jalali ) {
                        scope.calendarCursor = moment(scope.calendarCursor).jMonth(month);
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).month(month);
                    }
                };

                /**
                 * Select a year and display it in the datepicker depending on the current month
                 * @param  {string} year The year selected in the select element
                 * @return {}
                 */
                scope.selectYear = function selectYear(year) {
                    scope.showYearsList = false;
                    if ( jalali ) {
                        scope.calendarCursor = moment(scope.calendarCursor).jYear(parseInt(year));
                    } else {
                        scope.calendarCursor = moment(scope.calendarCursor).year(year);
                    }
                };

                /**
                 * Select a day
                 * @param  {[type]} day [description]
                 * @return {[type]}     [description]
                 */
                scope.selectDay = function(day) {
                    if (day.isSelectable && !day.isFuture || (scope.config.allowFuture && day.isFuture)) {
                        resetSelectedDays();
                        day.isSelected = true;
                        ngModel.$setViewValue(moment.utc(day.date).format(scope.config.dateFormat));
                        ngModel.$render();
                        scope.gPickedDate = moment.utc(day.date);
                        scope.gFormattedPickedDate = moment.utc(day.date).format(scope.config.gregorianDateFormat);
                        scope.pickerDisplayed = false;
                    }
                };

                /**
                 * Init the directive
                 * @return {}
                 */
                function init() {

                    element.wrap('<div class="ng-flat-datepicker-wrapper"></div>');

                    $compile(template)(scope);
                    element.after(template);

                    if (angular.isDefined(ngModel.$modelValue) && moment.isDate(ngModel.$modelValue)) {
                        scope.calendarCursor = ngModel.$modelValue;
                    }
                }

                /**
                 * Get all weeks needed to display a month on the Datepicker
                 * @return {array} list of weeks objects
                 */
                function getWeeks(date) {

                    var weeks = [];
                    date = moment.utc(date);
                    var firstDayOfMonth,lastDayOfMonth;
                    // Todo:
                    if ( jalali ) {
                        firstDayOfMonth = moment.utc(date).jDate(1);
                        lastDayOfMonth = moment.utc(date).jDate(moment.jDaysInMonth(moment(date).jYear, moment(date).jMonth()));
                    } else {
                        firstDayOfMonth = moment(date).date(1);
                        lastDayOfMonth = moment(date).date(date.daysInMonth());
                    }

                    var startDay = moment.utc(firstDayOfMonth);
                    var endDay = moment.utc(lastDayOfMonth);
                    // NB: We use weekday() to get a locale aware weekday
                    startDay = firstDayOfMonth.weekday() === 0 ? startDay : startDay.weekday(0);
                    endDay = lastDayOfMonth.weekday() === 6 ? endDay : endDay.weekday(6);

                    var currentWeek = [];

                    for (var start = moment.utc(startDay.toDate()); start.isBefore(moment.utc(endDay).add(1, 'days')); start.add(1, 'days')) {
                        var afterMinDate = !scope.config.minDate || start.isAfter(scope.config.minDate, 'day');
                        var beforeMaxDate = !scope.config.maxDate || start.isBefore(scope.config.maxDate, 'day');
                        var isFuture = start.isAfter(today);
                        var beforeFuture = scope.config.allowFuture || !isFuture;
                        var tempStart = moment.utc(start.toDate()); //there's a bug in isSame method below
                        var tempStart2 = moment.utc(start.toDate()); //there's a bug in isSame method below
                        var day = {
                            date: moment(start).toDate(),
                            gdate: moment(start).format('DD'),
                            jDate: moment(start).format('jDD'),
                            isToday: start.isSame(today, 'day'),
                            isInMonth: tempStart.isSame(firstDayOfMonth, jalali ? 'jmonth' : 'month'),
                            isSelected: tempStart2.isSame(dateSelected, 'day'),
                            isSelectable: afterMinDate && beforeMaxDate && beforeFuture
                        };
                        currentWeek.push(day);

                        if (start.weekday() === 6 || start === endDay) {
                            weeks.push(currentWeek);
                            currentWeek = [];
                        }
                    }

                    return weeks;
                }

                /**
                 * Reset all selected days
                 */
                function resetSelectedDays() {
                    scope.currentWeeks.forEach(function(week, wIndex) {
                        week.forEach(function(day, dIndex) {
                            scope.currentWeeks[wIndex][dIndex].isSelected = false;
                        });
                    });
                }
            }
        };
    }

})();

(function(){

    'use strict';

    /**
     * @desc Dates calculator factory
     */

     angular
         .module('ngJalaaliFlatDatepicker')
         .factory('datesCalculator', datesCalculator);

    function datesCalculator (moment, NstSvcI18n) {
        var jalali = true;
        if ( NstSvcI18n.selectedCalendar === "gregorian") {
            jalali = false;
        }
        /**
         * List all years for the select
         * @param {Integer} start year eg. 2005
         * @param {Integer} total number of years to be appear in the drop down
         * @return {Array<integer>} years list
         */
        function getYearsList(startYear, dropDownYears) {
            var yearsList = [];
            for (var i = 2012; i <= parseInt(2012) + parseInt(dropDownYears); i++) {

                if ( jalali ) {
                    yearsList.push(moment.utc(i.toString(), 'YYYY').format('jYYYY'));
                } else {
                    yearsList.push(i);
                }
            }
            return yearsList;
        }

        /**
         * List all days name in the current locale
         * @return {[type]} [description]
         */
        function getDaysNames () {
            var daysNameList = [];
            for (var i = 0; i < 7 ; i++) {
                daysNameList.push(moment().weekday(i).format( jalali ? 'dd' : 'ddd'));
            }
            return daysNameList;
        }

        return {
            getYearsList: getYearsList,
            getDaysNames: getDaysNames
        };
    }

})();

angular.module("ngJalaaliFlatDatepicker").run(["$templateCache", "$http", "NstSvcI18n","$rootScope", function($templateCache, $http, NstSvcI18n) {
    var html;
    if (NstSvcI18n.selectedCalendar === "gregorian") {
    // if ($rootScope._direction === 'ltr') {
        html = 'app/components/date-picker/datepicker-en.html';
    } else {
        html = 'app/components/date-picker/datepicker-fa.html';
    }
    $http.get(html, {cache: $templateCache})
        .success(function(tplContent){
        $templateCache.put("datepicker.html",tplContent);
    });
}]);
