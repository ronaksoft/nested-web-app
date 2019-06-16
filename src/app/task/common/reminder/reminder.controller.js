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
    .controller('TaskReminderController', TaskReminderController);

  function TaskReminderController($scope, _, $uibModal, moment, datesCalculator, NstSvcReminderFactory, $timeout, NstReminder, NST_REMINDER_REPEAT_CASE, NST_REMINDER_TYPES) {
    var vm = this;

    var eventReferences = [];

    vm.hasTime = true;
    vm.type = null;
    vm.reminderDate = null;
    vm.adding = false;
    vm.reminders = [];
    vm.daysNameList = datesCalculator.getDaysNames();
    vm.reminderKeyUp = reminderKeyUp;
    vm.reminderKeyDown = reminderKeyDown;
    vm.addIt = addReminder;
    vm.remove = remove;
    vm.removeReminderChip = removeReminderChip;
    vm.reminderClickChip = reminderClickChip;
    vm.NST_REMINDER_REPEAT_CASE = NST_REMINDER_REPEAT_CASE;
    vm.NST_REMINDER_TYPES = NST_REMINDER_TYPES;
    vm.removeItems = removeItems;
    vm.openModal = openModal;
    vm.model = new NstReminder();
    vm.timestamp = 0;
    vm.datePickerconfig = {
      allowFuture: true,
      allowPast: false
    };

    if (vm.addItem === undefined) {
      vm.addItem = true;
    }

    if (vm.removeItem === undefined) {
      vm.removeItem = true;
    }

    function removeRedundantReminders(reminders, remindersData) {
      var tempList = [];
      _.forEach(reminders, function (reminder) {
        var index = _.findIndex(remindersData, {timestamp: reminder});
        if (index > -1) {
          tempList.push(remindersData[index]);
        }
      });
      return tempList;
    }

    function removeReminderChip(id) {
      if (vm.removeItem !== true) {
        return;
      }
      if (_.isObject(id)) {
        id = id.timestamp;
      }
      var index = _.indexOf(vm.reminders, id);
      if (index > -1) {
        vm.reminders.splice(index, 1);
      }
      index = _.findIndex(vm.remindersData, {timestamp: id});
      if (index > -1) {
        vm.remindersData.splice(index, 1);
      }
    }

    function reminderClickChip(id) {
      if (_.isFunction(vm.reminderClick)) {
        vm.reminderClick(id);
      }
    }

    function reminderKeyDown(event) {
      // if (vm.addItem && event.keyCode === 13) {
      // }
    }


    function addReminder() {
      if (vm.addItem !== true) {
        return;
      }
      var model =_.cloneDeep(vm.model);
      if (vm.timestamp.length === 0) {
        return;
      }
      vm.adding = true;
      model.timestamp = [];
      if ((vm.timestamp + '').split('.')[0].length === 10) {
        model.timestamp[0] = vm.timestamp * 1000;
      } else {
        model.timestamp[0] = vm.timestamp;
      }
      vm.reminders.push(model);
      vm.reminders = _.uniq(vm.reminders);
      vm.remindersData = vm.reminders;
      vm.model = new NstReminder();
      vm.timestamp = 0;
      vm.reminderDate = null;
      $timeout(function() {
        vm.adding = false;
      }, 100)
    }


    function remove(id) {
      var ind = _.findIndex(vm.reminders, function(reminder) { return reminder.id === id});
      vm.reminders.splice(ind, 1);
      vm.remindersData = vm.reminders;
      updateTypes(vm.reminders);
    }

    function reminderKeyUp(event) {
      if (event.keyCode === 8) {
        if (vm.reminders.length > 0 && vm.remindersData.length > 0) {
          /*var text = */vm.reminders.pop();
          vm.remindersData.pop();
          // vm.labelInput = text.substr(0, text.length - 1);
        }
      }
    }

    function removeItems () {
       vm.reminders = [];
       vm.remindersData = [];
    }

    eventReferences.push($scope.$watch(function () {
      return vm.taskDueDate;
    }, function (newVal) {
      if (vm.model.relative) {
        vm.timestamp = parseInt(moment(newVal * 1000).subtract(vm.type * 60 * 1000, 'miliseconds').format('x'));
      } 
    }));

    eventReferences.push($scope.$watch(function () {
      return vm.reminders;
    }, function (newVal) {
      updateTypes(newVal);
    }));

    eventReferences.push($scope.$watch(function () {
      return vm.timestamp;
    }, function (newVal) {
      if (newVal) {
        addReminder();
      }
    }));

    function updateTypes(newVal) {
      var types = _.cloneDeep(NST_REMINDER_TYPES);
      var types_keys = Object.keys(types);
      _.forEach(newVal, function(reminder) {
        if (reminder.interval === 0) {
          var diff = moment(vm.taskDueDate * 1000).diff(Array.isArray(reminder.timestamp) ? reminder.timestamp[0] : parseInt(reminder.timestamp));
          var mins = diff / (60 * 1000);
          var key = _.find(types_keys, function(type){
            return types[type] === mins
          });
          if (types[key]) {
            delete types[key]
          }
        }
      });
      vm.NST_REMINDER_TYPES = types

    }

    eventReferences.push($scope.$watch(function () {
      return vm.type;
    }, function (newVal) {

      if (newVal !== 'custom' && newVal && vm.taskDueDate) {
        vm.model.relative = true;
        vm.timestamp = parseInt(moment(vm.taskDueDate * 1000).subtract(parseInt(newVal), 'minutes').format('x'));
        addReminder();
      } else {
        vm.timestamp = 0;
        vm.model.relative = false;
      }
    }));

    eventReferences.push($scope.$watch(function () {
      return vm.remindersData;
    }, function (newVal) {
      if (newVal.hasOwnProperty('init') && newVal.init === true) {
        initData(newVal.data);
      }
    }));

    function initData(reminders) {
      vm.reminders = reminders.slice(0);
      vm.remindersData = reminders.slice(0);
    }

    function openModal(data) {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/task/common/reminder/reminder-modal.html',
        controller: 'TaskReminderModalController',
        controllerAs: 'ctlReminderModal',
        size: 'sm',
        resolve: {
          data: data
        }
      }).result.then(function(){}).catch(function(model) {
        if (model && model instanceof NstReminder) {
          vm.model = model;
          vm.timestamp = model.timestamp;
          addReminder()
        }
      });
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
