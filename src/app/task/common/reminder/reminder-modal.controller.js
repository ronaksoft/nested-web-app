/**
 * @file reminder.controller.js
 * @desc Controller for task reminder
 * @kind {Controller}
 * Documented by:          hamidrezakk < hamidrezakks@gmail.com >
 * Date of documentation:  2017-10-14
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskReminderModalController', TaskReminderModalController);

  function TaskReminderModalController($scope, _, NstSvcI18n, datesCalculator, moment, $uibModalInstance, NstSvcTranslation, data, NST_REMINDER_REPEAT_CASE, NstReminder, NstSvcReminderFactory) {
    var vm = this;
    // var jalali = NstSvcI18n.selectedCalendar !== 'gregorian';
    vm.selectTypes = [
      "Days", "Weeks"
    ];
    vm.repeatCase = vm.selectTypes[0];
    vm.model = _.cloneDeep(data);
    vm.repeatCount = 1;
    var dayLength = 24 * 60 * 60 * 1000;
    var weeklength = 7 * dayLength;
    if (vm.model.interval > 0) {
      if (vm.model.repeat_case === NST_REMINDER_REPEAT_CASE.DAYS){
        vm.repeatCount = vm.model.interval / dayLength;
      } else if (vm.model.repeat_case === NST_REMINDER_REPEAT_CASE.WEEKS){
        vm.repeatCount = vm.model.interval / weeklength;
        vm.repeatCase = vm.selectTypes[1];
      }
    }
    vm.model.timestamp *= 1000;
    vm.model.repeated = true;
    vm.daysNameList = datesCalculator.getDaysNames();
    vm.select = select;
    vm.clockOpts = {
      donetext: NstSvcTranslation.get('Apply'),
      twelvehour: true
    };
    vm.save = save;
    vm.close = close;
    var eventReferences = [];

    function select(day) {
      var ind = vm.model.days.indexOf(day);
      if (ind === -1) {
        vm.model.days.push(day)
      } else {
        vm.model.days.splice(ind, 1);
      }
      vm.model.days = _.sortBy(vm.model.days)
    }

    function close() {
      $scope.$dismiss()
    }
    function save() {
      var model = _.cloneDeep(vm.model);
      if (typeof model.timestamp === 'object') {
        model.timestamp = parseInt(model.timestamp.format('x')) / 1000;
      }
      model.repeat_case = vm.repeatCase.toLowerCase();
      $scope.$dismiss(model)
    }

    eventReferences.push($scope.$watch(function() {return vm.repeatCount + vm.repeatCase}, function () {
      if (vm.model) {
        vm.model.interval = vm.repeatCount * dayLength * (vm.repeatCase.toLowerCase() === NST_REMINDER_REPEAT_CASE.DAYS ? 1 : 7);
      }
    }));

    // eventReferences.push($scope.$watch(function() {return vm.clockPickerTime}, function () {
    //   if (vm.clockPickerTime && vm.model) {
    //     vm.model.timestamp = vm.clockPickerTime.format('x');
    //   }
    //   // moment().set('hour', 13).set('minute', 20);
    // }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
