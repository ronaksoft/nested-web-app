/**
 * @file scenes/private/posts/components/post/index.tsx
 * @author robzizo <me@robzizo.ir>
 * @description Date picker component that alows to pick a date from only past or feuture
 *              by supporting both jalali and georgian calenders.
 *              Thanks https://github.com/thg303/ng-jalaali-flat-datepicker
 *              and https://github.com/RemiAWE/ng-flat-datepicker
 *              for their contribiutes.
 */
(function () {

  'use strict';

  /**
   * @desc Datepicker directive
   * @example <ng-datepicker></ng-datepicker>
   */

  ngJalaaliFlatDatepickerDirective.$inject = ["$templateCache", "$compile", "$document", "datesCalculator", "ngJalaaliFDP", "moment", "NstSvcI18n", "NstSvcTranslation", "_"];
  angular
    .module('ngJalaaliFlatDatepicker', ["ronak.nested.web.components.i18n"])
    .filter('persianDate', PersianDateFilter)
    .provider('ngJalaaliFDP', ngJalaaliFlatDatepickerProvider)
    .directive('ngJalaaliFlatDatepicker', ngJalaaliFlatDatepickerDirective);


  function PersianDateFilter(moment) {
    return function (input, format, fromNow) {
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
      dateOnlyFormat: 'YYYY/MM/DD',
      dateFormat: 'YYYY/MM/DD hh:mm a',
      dateTimeFormat: 'YYYY/MM/DD hh:mm a',
      jalaliDateFormat: 'jYYYY/jMM/jDD',
      jalaliDateTimeFormat: 'jYYYY/jMM/jDD hh:mm a',
      gregorianDateFormat: 'YYYY/MM/DD hh:mm a',
      minDate: null,
      dropDownYears: 10,
      maxDate: null,
      allowFuture: false
    };

    var ngJFD = {
      getOptions: function (type) {
        var typeOptions = type && options[type] || options;
        return typeOptions;
      },
      options: options
    };

    this.setOptions = function (customOptions) {
      options = angular.extend(options, customOptions);
    };

    this.$get = function () {
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
        config: '=?',
        haveTime: '=?',
        gPickedDate: '=?gregorianPickedDate',
        gFormattedPickedDate: '=?gregorianFormattedPickedDate',
        isJalali: '=?isJalali',
        timestampModel: '='
      },
      link: function (scope, element, attrs, ngModel) {
        var jalali = NstSvcI18n.selectedCalendar !== 'gregorian';
        var farsi = NstSvcI18n.selectedLocale === 'fa-IR';
        setTimeFromTimeStamp();
        // setViewTime();
        scope.showTime = scope.haveTime;

        function reformatTime(haveTime) {
          if (haveTime) {
            scope.config.dateFormat = jalali ? scope.config.jalaliDateTimeFormat : scope.config.dateTimeFormat
          } else {
            scope.config.dateFormat = jalali ? scope.config.jalaliDateFormat : scope.config.dateOnlyFormat
          }
        }

        scope.$watch('haveTime', function (haveTime) {
          reformatTime(haveTime);
        });

        var template = angular.element($templateCache.get('datepicker.html'));

        var dateSelected = '';
        var today = moment();

        //time
        scope.timeHour = 0;
        scope.timeMinute = 0;

        /*
         * returns start year based on configuration
         */
        var getStartYear = function () {
          if (typeof(scope.config.minDate) == 'undefined') {
            return scope.config.minDate.format('YYYY');
          }
          if (scope.config.allowFuture) {
            return moment().subtract('5', 'years').format('YYYY');
          }
          return moment().subtract('10', 'years').format('YYYY');
        };


        // scope.config = _.extend(ngJalaaliFDP.getOptions(), scope.config)
        scope.config = angular.extend(ngJalaaliFDP.options, scope.config);
        if (jalali) {
          scope.config.dateFormat = scope.config.jalaliDateFormat
        }
        if (angular.isDefined(scope.config.minDate)) {
          moment(scope.config.minDate).subtract(1, 'day');
        }
        if (angular.isDefined(scope.config.maxDate)) {
          moment(scope.config.maxDate).add(1, 'day');
        }
        if (!angular.isDefined(scope.config.gregorianDateFormat)) {
          scope.config.gregorianDateFormat = scope.config.dateFormat.replace(/j/g, "");
        }

        // Data
        scope.calendarCursor = today;
        scope.currentWeeks = [];
        scope.daysNameList = datesCalculator.getDaysNames();

        if (jalali && farsi) {
          scope.monthsList = moment.localeData()._jMonths;
        } else if (jalali && !farsi) {
          scope.monthsList = moment.localeData()._jMonths;
        } else if (!jalali && farsi) {
          scope.monthsList = moment.monthsShort();
        } else {
          scope.monthsList = moment.months();
        }

        scope.yearsList = datesCalculator.getYearsList(getStartYear(), scope.config.dropDownYears);

        // Display
        scope.pickerDisplayed = false;
        ngModel.$parsers.push(function (value) {
          if (value) {
            if (angular.isString(value)) {
              if (value.toLowerCase() === "today" || value === "امروز") {
                return moment();
              }
              if (value.toLowerCase() === "yesterday" || value === "دیروز") {
                return moment().subtract(1, 'day');
              }
              if (value.toLowerCase() === "tomorrow" || value === "فردا") {
                return moment().add(1, 'day');
              }
            }
            return moment(value, scope.config.dateFormat);
          }
        });

        ngModel.$formatters.push(function (value) {
          if (value) {
            return moment(value).format(scope.config.dateFormat);
          }
        });

        scope.$watch('calendarCursor', function (val) {
          //scope.$apply(function() {
          scope.currentWeeks = getWeeks(val);
          //});
        });

        /**
         * ClickOutside, handle all clicks outside the DatePicker when visible
         */
        element.bind('click', function () {
          scope.$apply(function () {
            scope.pickerDisplayed = true;
            $document.on('click', onDocumentClick);
          });
        });

        function onDocumentClick(e) {
          if (template !== e.target && !template[0].contains(e.target) && e.target !== element[0]) {
            $document.off('click', onDocumentClick);
            scope.$apply(function () {
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
        scope.prevMonth = function () {
          if (jalali) {
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
          if (jalali) {
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
          if (jalali) {
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
        scope.selectDay = function (day) {
          if (day.isSelectable && !day.isFuture || (scope.config.allowFuture && day.isFuture)) {
            resetSelectedDays();
            day.isSelected = true;
            var tempMoment = moment(day.date);
            var vw;
            vw = tempMoment.format(scope.config.dateFormat);
            ngModel.$setViewValue(vw);
            ngModel.$render();
            scope.gPickedDate = moment(day.date);
            scope.gFormattedPickedDate = moment(day.date).format(scope.config.gregorianDateFormat);
            scope.pickerDisplayed = false;
            scope.timestampModel = tempMoment.unix();
          }
        };

        function trimNumber(number) {
          number = String(number);
          return number.length <= 1 ? '0' + number : number;
        }

        function validateNumber(number, min, max) {
          number = parseInt(number);
          if (isNaN(number)) {
            return min;
          } else {
            if (number < min) {
              number = min;
            }
            if (number > max) {
              number = max;
            }
            return number;
          }
        }

        function getInputTime(hour, minute) {
          hour = validateNumber(hour, 0, 23);
          minute = validateNumber(minute, 0, 59);
          if (hour > 23 || hour < 0 || minute > 59 || minute < 0) {
            return '00:00';
          }
          hour = trimNumber(hour);
          minute = trimNumber(minute);
          return hour + ':' + minute;
        }

        scope.$watch('timeHour', function (newVal) {
          var temp = validateNumber(newVal, 0, 23);
          if (temp !== newVal) {
            scope.timeHour = temp;
          }
        });

        scope.$watch('timeMinute', function (newVal) {
          var temp = validateNumber(newVal, 0, 59);
          if (temp !== newVal) {
            scope.timeMinute = temp;
          }
        });

        scope.setTime = function (add) {
          var inputTime;
          if (add) {
            inputTime = getInputTime(scope.timeHour, scope.timeMinute);
            scope.haveTime = true;
            scope.inheritTime = true;
            scope.initialTime = inputTime;
          } else {
            inputTime = '00:00';
            scope.haveTime = false;
            scope.inheritTime = false;
            scope.time = inputTime;
          }
          reformatTime(scope.haveTime);
          setTime(inputTime);
          // setViewTime(inputTime);
          var temp = moment(scope.calendarCursor);
          var vw;
          vw = temp.format(scope.config.dateFormat);
          scope.gPickedDate = temp;
          scope.gFormattedPickedDate = temp.format(scope.config.gregorianDateFormat);
          ngModel.$setViewValue(vw);
          ngModel.$render();
          if (add) {
            scope.pickerDisplayed = false;
          }
          scope.timestampModel = temp.unix();
        };

        /**
         * Init the directive
         * @return {}
         */
        function init() {

          element.wrap('<div class="ng-flat-datepicker-wrapper"></div>');

          $compile(template)(scope);
          element.after(template);

          if (scope.timestampModel !== null && scope.timestampModel > 0) {
            scope.calendarCursor = moment.unix(scope.timestampModel);
            scope.timeHour = scope.calendarCursor.hours();
            scope.timeMinute = scope.calendarCursor.minutes();
            reformatTime(scope.haveTime);
            var vw;
            var temp = moment(scope.calendarCursor);
            vw = temp.format(scope.config.dateFormat);
            scope.gPickedDate = temp;
            scope.gFormattedPickedDate = temp.format(scope.config.gregorianDateFormat);
            ngModel.$setViewValue(vw);
            ngModel.$render();
            dateSelected = temp;
          }

        }

        /**
         * Get all weeks needed to display a month on the Datepicker
         * @return {array} list of weeks objects
         */
        function getWeeks(date) {

          var weeks = [];
          date = moment(date);
          var firstDayOfMonth, lastDayOfMonth;
          // Todo:
          if (jalali) {
            firstDayOfMonth = moment(date).jDate(1);
            lastDayOfMonth = moment(date).jDate(moment.jDaysInMonth(moment(date).jYear, moment(date).jMonth()));
          } else {
            firstDayOfMonth = moment(date).date(1);
            lastDayOfMonth = moment(date).date(date.daysInMonth());
          }

          var startDay = moment(firstDayOfMonth);
          var endDay = moment(lastDayOfMonth);
          // NB: We use weekday() to get a locale aware weekday
          startDay = firstDayOfMonth.weekday() === 0 ? startDay : startDay.weekday(0);
          endDay = lastDayOfMonth.weekday() === 6 ? endDay : endDay.weekday(6);

          var currentWeek = [];

          for (var start = moment(startDay.toDate()); start.isBefore(moment(endDay).add(1, 'days')); start.add(1, 'days')) {
            var afterMinDate = !scope.config.minDate || start.isAfter(scope.config.minDate, 'day');
            var beforeMaxDate = !scope.config.maxDate || start.isBefore(scope.config.maxDate, 'day');
            var isFuture = start.isAfter(today);
            var beforeFuture = scope.config.allowFuture || !isFuture;
            var tempStart = moment(start.toDate()); //there's a bug in isSame method below
            var tempStart2 = moment(start.toDate()); //there's a bug in isSame method below
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
          scope.currentWeeks.forEach(function (week, wIndex) {
            week.forEach(function (day, dIndex) {
              scope.currentWeeks[wIndex][dIndex].isSelected = false;
            });
          });
        }

        function setTimeFromTimeStamp(value) {
          var d = value ? new Date(value) : new Date();
          scope.defaultTime = d.toString().substr(16, 5);
          scope.time = scope.defaultTime;
          setTime(scope.time);
        }

        function setTime(time) {
          if (typeof time === 'string') {
            scope.calendarCursor = moment(scope.calendarCursor).hour(parseInt(time.substr(0, 2))).minute(parseInt(time.substr(3, 2)));
          }
        }

        scope.$on('$destroy', function () {
        });
      }
    };
  }

})();

(function () {

  'use strict';

  /**
   * @desc Dates calculator factory
   */

  angular
    .module('ngJalaaliFlatDatepicker')
    .factory('datesCalculator', datesCalculator);

  function datesCalculator(moment, NstSvcI18n) {
    var jalali = NstSvcI18n.selectedCalendar !== 'gregorian';
    var farsi = NstSvcI18n.selectedLocale === 'fa-IR';

    /**
     * List all years for the select
     * @param {Integer} start year eg. 2005
     * @param {Integer} total number of years to be appear in the drop down
     * @return {Array<integer>} years list
     */
    function getYearsList(startYear, dropDownYears) {
      var yearsList = [];
      for (var i = 2012; i <= parseInt(2012) + parseInt(dropDownYears); i++) {

        if (jalali) {
          yearsList.push(moment(i.toString(), 'YYYY').format('jYYYY'));
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
    function getDaysNames() {
      var daysNameList = [];
      if (farsi) {
        daysNameList = moment.weekdaysMin();
      } else {
        for (var i = 0; i < 7; i++) {
          daysNameList.push(moment().weekday(i).format(jalali ? 'dd' : 'ddd'));
        }
      }
      return daysNameList;
    }

    return {
      getYearsList: getYearsList,
      getDaysNames: getDaysNames
    };
  }

})();

angular.module("ngJalaaliFlatDatepicker").run(["$templateCache", "$http", "NstSvcI18n", "$rootScope", function ($templateCache, $http, NstSvcI18n) {
  var html;
  if (NstSvcI18n.selectedCalendar === "gregorian") {
    // if ($rootScope._direction === 'ltr') {
    html = 'app/components/date-picker/datepicker-en.html';
  } else {
    html = 'app/components/date-picker/datepicker-fa.html';
  }
  $http.get(html, {cache: $templateCache})
    .success(function (tplContent) {
      $templateCache.put("datepicker.html", tplContent);
    });
}]);
