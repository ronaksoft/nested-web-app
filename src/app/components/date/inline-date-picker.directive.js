(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.date')
    .directive('inlineDatePicker', inlineDatePicker);

  function inlineDatePicker(moment, NstSvcI18n, NstUtility, NstSvcDate, NstSvcCalendarTranslation, _) {
    return {
      restrict: 'E',
      replace : true,
      templateUrl: 'app/components/date/inline-date-picker.html',
      scope : {
        value : '=selectedValue'
      },
      link: function (scope ,element, attrs) {
        var eventReferences = [];
        scope.validationEnabled = _.has(attrs, "validationEnabled");
        var momentValue = moment(scope.value, "YYYY-MM-DD");
        if (scope.value && momentValue.isValid()) {
          scope.year = getYear(momentValue);
          scope.month = getMonth(momentValue);
          scope.day = getDay(momentValue);
        } else {
          scope.year = null;
          scope.month = null;
          scope.day = null;
        }

        scope.min = parseDate(attrs.min, moment(NstSvcDate.now()).subtract(100, 'years'));
        scope.max = parseDate(attrs.max, moment(NstSvcDate.now()));

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
        }], _.debounce(function(newValues) {

          if (_.every(newValues)) {
            setValue(newValues[0], newValues[1], newValues[2]);
          }

        }, 300));

        var yearMonthWatcher = scope.$watchGroup([function () {
          return scope.year;
        },
        function () {
          return scope.month;
        }], _.debounce(function(newValues) {
          if (newValues[0] && newValues[1]) {
            // set days range according to the selected year and month
            scope.days = createDaysList(newValues[0], newValues[1], scope.min, scope.max);
            // reset the selected day if is out of range
            if (!_.includes(scope.days, scope.day)) {
              scope.day = _.last(scope.days);
            }
          }
        }, 300));

        eventReferences.push(scope.$watch('year', _.debounce(function(newValue) {
          if (newValue) {
            scope.months = createMonthsList(newValue, scope.min, scope.max);
          }
        }, 300)));


        function setValue(year, month, day) {
          var newValue = createDate(year, month, day);

          scope.value = NstUtility.string.format("{0}-{1}-{2}",
            _.padStart(newValue.year(), 4, "0"),
            _.padStart(newValue.month() + 1, 2, "0"),
            _.padStart(newValue.date(), 2, "0"));
        }

        scope.$on('$destroy', function () {
          allSelectWatch();
          yearMonthWatcher();
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
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
      // var format = NstSvcCalendarTranslation.get("YYYY-MM-DD");
      var format = "YYYY-MM-DD";
       date = moment(date, format);

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
      var months = [];
      if (isJalali()) {
        months = getJalaliMonths();
      } else {
        months = moment.months();
      }
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

    function createMonthsList() {
      return getMonths();
    }

    function createDaysList() {
      return getDays();
    }

    function getJalaliMonths() {
      if (NstSvcI18n.selectedLocale === 'fa-IR') {
        return 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_')
      } else {
        return 'Farvardin_Ordibehesht_Khordad_Tir_Mordad_Shahrivar_Mehr_Aban_Azar_Dey_Bahman_Esfand'.split('_');
      }
    }

    function isJalali() {
      return NstSvcI18n.selectedCalendar === "jalali";
    }
  }
})();
