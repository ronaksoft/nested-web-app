(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .directive('inlineDatePicker', inlineDatePicker);

  function inlineDatePicker(moment, NstSvcI18n, NstUtility, NstSvcTranslation) {
    var JALALI_CALENDAR = "jalali";
    return {
      restrict: 'E',
      replace : true,
      templateUrl: 'app/components/date/inline-date-picker.html',
      scope : {
        value : '=selectedValue',
      },
      link: function (scope ,element, attrs) {

        var momentValue = moment(scope.value, "YYYY-MM-DD");
        if (momentValue.isValid()) {
          scope.year = getYear(momentValue);
          scope.month = getMonth(momentValue);
          scope.day = getDay(momentValue);
        } else {
          scope.year = null;
          scope.month = null;
          scope.day = null;
        }

        scope.min = parseDate(attrs.min, moment().subtract(100, 'years'));
        scope.max = parseDate(attrs.max, moment());

        scope.months = createMonthsList(scope.year, scope.min, scope.max);
        scope.days = createDaysList(scope.year, scope.month, scope.min, scope.max);

        var allSelectWatch = scope.$watchGroup([function () {
          return scope.year;
        },
        function () {
          return scope.month;
        },
        function () {
          return scope.day;
        }], _.debounce(function(newValues, oldValues) {

          if (_.every(newValues)) {
            setValue(newValues[0], newValues[1], newValues[2]);
          }

        }, 300));

        var yearMonthWatcher = scope.$watchGroup([function () {
          return scope.year;
        },
        function () {
          return scope.month;
        }], _.debounce(function(newValues, oldValues) {
          if (newValues[0] && newValues[1]) {
            // set days range according to the selected year and month
            scope.days = createDaysList(newValues[0], newValues[1], scope.min, scope.max);
            // reset the selected day if is out of range
            if (!_.includes(scope.days, scope.day)) {
              scope.day = _.last(scope.days);
            }
          }
        }, 300));

        var yearWatcher = scope.$watch('year', _.debounce(function(newValue, oldValue) {
          if (newValue) {
            scope.months = createMonthsList(newValue, scope.min, scope.max);
          }
        }, 300));


        function setValue(year, month, day) {
          var newValue = createDate(year, month, day);

          scope.value = NstUtility.string.format("{0}-{1}-{2}", newValue.year(), newValue.month() + 1, newValue.date());
        }

        scope.$on('$destroy', function () {
          allSelectWatch();
          yearMonthWatcher();
        });
      }
    };

    function getYear(date) {
      if (isJalali()) {
        return date.jYear();
      } else {
        return date.year();
      }
    }

    function getMonth(date) {
      if (isJalali()) {
        return date.jMonth();
      } else {
        return date.month();
      }
    }

    function getDay(date) {
      if (isJalali()) {
        return date.jDate();
      } else {
        return date.date();
      }
    }

    function createDate(year, month, day) {
      if (isJalali()) {
        return moment(NstUtility.string.format("{0}-{1}-{2}", year, month, day), "jYYYY-jMM-jDD");
      } else {
        return moment({
          year : year,
          month : month,
          day : day
        });
      }
    }

    function parseDate(date, defaultValue) {
      var format = "YYYY-MM-DD";
      var date = moment(date, format);

      return date.isValid() ? date : defaultValue;
    }

    function getDaysInMonth(year, month) {
      if (isJalali()) {
        return moment.jDaysInMonth(Number(year), Number(month));
      } else {
        return createDate(year, month).daysInMonth();
      }
    }

    function getMonths() {
      var months = isJalali() ? moment.jMonths() : moment.months();
      return _.map(months, function (month, index) {
        return {
          name : month,
          value : index
        };
      });
    }
    function getDays(year, month) {
      var upperBound = getDaysInMonth(year, month);

      return _.range(1, upperBound + 1);
    }

    function createMonthsList(year, minDate, maxDate) {
      return getMonths();
      // if (areInSameYear(year, maxDate)) {
      //
      //   return _.take(getMonths(), (getMonth(maxDate) + 1));
      // } else if (areInSameYear(year, minDate)) {
      //
      //   return _.takeRight(getMonths(), 12 - (getMonth(minDate) -1));
      // } else {
      //
      //   return getMonths();
      // }
    }

    function createDaysList(year, month, minDate, maxDate) {
      return getDays();
      // if (areInSameMonth(year, month, maxDate)) {
      //
      //   return _.take(getDays(), getDay(maxDate));
      // } else if (areInSameMonth(year, month, minDate)) {
      //
      //   return _.takeRight(getDays(), getDaysInMonth(year, month) - (getDay(minDate)));
      // } else {
      //
      //   return getDays();
      // }
    }

    function areInSameYear(year, secondDate) {
      var date = moment({ year : year });
      if (isJalali()) {
        return date.isSame(secondDate, "jYear");
      } else {
        return date.isSame(secondDate, "year");
      }
    }

    function areInSameMonth(year, month, secondDate) {
      var date = moment({ year : year, month : month });
      if (isJalali()) {
        return date.isSame(secondDate, "jMonth")
      } else {
        return date.isSame(secondDate, "month")
      }
    }

    function isJalali() {
      return NstSvcI18n.selectedCalendar === JALALI_CALENDAR;
    }
  }
})();
