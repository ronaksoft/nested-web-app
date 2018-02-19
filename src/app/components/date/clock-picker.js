(function () {
  'use strict';

  function clickOnDone() {
    var popover = $('.clockpicker-popover'),
      hoursView = popover.find('.clockpicker-span-hours'),
      minutesView = popover.find('.clockpicker-span-minutes'),
      amPmBlock = popover.find('.clockpicker-span-am-pm');
    $('[data-lng-clockpicker]').val(hoursView.text() + ':' + minutesView.text() + ' ' + amPmBlock.text());
    $('[data-lng-clockpicker]').trigger('input');
  }

  angular.module('ronak.nested.web.components')

    .factory('clockpickerService', function () {

      function strictParse(twelvehour, string) {
        var match = string && string.trim().match(
          twelvehour ?
            /^(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i :
            /^(\d{1,2}):(\d{1,2})$/
        );

        if (!match) {
          return;
        }

        var pm = match[3] && match[3].toUpperCase() === 'PM';
        var hour = parseInt(match[1], 10);
        var minute = parseInt(match[2], 10);

        if (minute > 59) {
          return;
        }

        if (twelvehour) {
          if (hour < 1 || hour > 12) {
            return;
          }
          hour = (hour % 12) + (pm ? 12 : 0);
        } else if (hour > 23) {
          return;
        }

        return {
          hour: hour,
          minute: minute
        };
      }

      function parseMobileTime(string) {
        if (!string) {
          return;
        } else if (string.match(/(AM|PM)\s*$/i)) {
          return strictParse(true, string);
        } else {
          var withoutPotentialMillisecond = (string.trim().match(/^\d{1,2}:\d{1,2}/) || [null])[0];
          return strictParse(false, withoutPotentialMillisecond);
        }
      }

      function parseTime(nativeMobile, twelvehour, string) {
        return nativeMobile ? parseMobileTime(string) : strictParse(twelvehour, string);
      }

      return {
        parseTime: parseTime
      };
    })

    .value('clockpickerDefaultOptions', {
      twelvehour: true,
      autoclose: false,
      donetext: 'Apply',
      afterShow: function (e) {
        var datepicker = $('.ng-flat-datepicker');
        $('.clockpicker-popover').on('mousedown', function (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return e.stopPropagation();
        });

        if (datepicker[0]) {
          $('.clockpicker-popover').appendTo(datepicker);
        }
        $('.btn-block.clockpicker-button').on('mousedown', clickOnDone);
        var amBtnObj = $('.clockpicker-am-pm-block .am-button');
        var pmBtnObj = $('.clockpicker-am-pm-block .pm-button');
        if ($('.clockpicker-span-am-pm').text().toLowerCase() === 'pm') {
          pmBtnObj.addClass('btn-active');
        } else {
          amBtnObj.addClass('btn-active');
        }
        amBtnObj.on('click', function () {
          pmBtnObj.removeClass('btn-active');
          $(this).addClass('btn-active');
        });
        pmBtnObj.on('click', function () {
          amBtnObj.removeClass('btn-active');
          $(this).addClass('btn-active');
        });
      },
      beforeHide: function () {
        // $('.btn-block.clockpicker-button').off('mousedown', clickOnDone);
        $('.clockpicker-popover').off();
        $('.clockpicker-am-pm-block .am-button').off();
        $('.clockpicker-am-pm-block .pm-button').off();
      }
    })

    .directive('lngClockpicker', ['clockpickerService', 'clockpickerDefaultOptions', 'moment', '$timeout', 'detectUtils', '_', function (clockpickerService, clockpickerDefaultOptions, moment, $timeout, detectUtils, _) {

      function link(scope, element, attr, ngModel) {
        var eventReferences = [];
        var options = angular.extend({}, clockpickerDefaultOptions, scope.$eval(attr.lngClockpickerOptions));

        var isMobile = false;

        var formatTime = options.twelvehour && !(isMobile && options.nativeOnMobile) ? 'hh:mm A' : 'HH:mm';

        if (!isMobile || !options.nativeOnMobile) {
          element.clockpicker(options);
        }

        if (isMobile) {
          if (options.nativeOnMobile) {
            element.attr('type', 'time');
          } else if (!element.is('[readonly]')) {
            element.attr('readonly', 'readonly');
            element.addClass('ignore-readonly');
          }
        }

        function getModelValue() {
          return ngModel.$modelValue ? moment(_.clone(ngModel.$modelValue)) : moment();
        }

        var parseViewValue = clockpickerService.parseTime.bind(null, isMobile && options.nativeOnMobile, options.twelvehour);

        eventReferences.push(scope.$watch(function () {
          return ngModel.$modelValue && ngModel.$modelValue.unix && ngModel.$modelValue.unix();
        }, function () {
          ngModel.$viewValue = ngModel.$formatters.reduceRight(function (prev, formatter) {
            return formatter(prev);
          }, ngModel.$modelValue);

          ngModel.$render();
        }));

        element.blur(function () {
          ngModel.$valid && element.val(getModelValue().local().format(formatTime));
        });

        ngModel.$render = function (val) {
          element.val(ngModel.$viewValue || '');
        };

        ngModel.$parsers.push(function (val) {
          var time = parseViewValue(val);
          ngModel.$setValidity('badFormat', !!time);
          if (!time) {
            return getModelValue();
          }
          var inUtc = getModelValue().isUTC();
          var newDate = moment(getModelValue());
          newDate = newDate.local();
          newDate.hour(time.hour);
          newDate.minute(time.minute);
          newDate.second(0);
          return inUtc ? newDate.utc() : newDate;
        });

        ngModel.$formatters.push(function (momentDate) {
          var val = parseViewValue(ngModel.$viewValue);

          if (!momentDate) {
            return '';
          }
          var localMomentDate = moment(_.clone(momentDate)).local();
          var isSameTime = !val ||
            (val.hour === localMomentDate.hour() && val.minute === localMomentDate.minute());

          return (element.is(':focus') && isSameTime) ?
            ngModel.$viewValue :
            localMomentDate.format(formatTime);
        });

        scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }

      return {
        restrict: 'A',
        require: 'ngModel',
        link: link
      };
    }]);

})();
