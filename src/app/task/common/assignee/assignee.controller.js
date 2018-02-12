/**
 * @file assignee.controller.js
 * @desc Controller for task assignee
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
    .controller('TaskAssigneeController', TaskAssigneeController);

  function TaskAssigneeController($scope, _, NstSvcAuth, $timeout) {
    var vm = this;
    var eventReferences = [];

    vm.user = NstSvcAuth.user;
    vm.assigneeInput = '';
    vm.assignees = [];
    vm.mentionAssigneesData = [];
    vm.assigneeKeyDown = assigneeKeyDown;
    vm.assigneeKeyUp = assigneeKeyUp;
    vm.addIt = addIt;
    vm.removeAssigneeChip = removeAssigneeChip;
    vm.removeItems = removeItems;
    vm.unFocus = unFocus;

    if (vm.addItem === undefined) {
      vm.addItem = true;
    }

    if (vm.removeItem === undefined) {
      vm.removeItem = true;
    }

    if (vm.removeMyself === undefined) {
      vm.removeMyself = false;
    }

    (function () {
      if (vm.assigneeExclude !== undefined) {
        var excludes = vm.assigneeExclude.split(',');
        _.forEach(excludes, function (exclude) {
          vm.assignees.push(_.trim(exclude));
        });
      }
    })();
    function unFocus() {
      $timeout(function(){
        // vm.elementFocus = false
      }, 100)
    }
    function removeRedundantAssignees(assignees, assigneesData) {
      var tempList = [];
      _.forEach(assignees, function (label) {
        var index = _.findIndex(assigneesData, {id: label});
        if (index > -1) {
          tempList.push(assigneesData[index]);
        }
      });
      return tempList;
    }

    function parseMentionData(data) {
      data = data.split(',');
      data = _.map(data, function (item) {
        return _.trim(item);
      });
      data = _.filter(data, function (item) {
        return item.length > 1;
      });
      return data;
    }

    function removeAssigneeChip(id) {
      if (_.isObject(id)) {
        id = id.id;
      }
      if (!(vm.removeItem === true || id === vm.user.id)) {
        return;
      }
      var index = _.indexOf(vm.assignees, id);
      if (index > -1) {
        vm.assignees.splice(index, 1);
      }
      index = _.findIndex(vm.assigneesData, {id: id});
      if (index > -1) {
        vm.assigneesData.splice(index, 1);
      }
    }

    function assigneeKeyDown(event) {
      if (vm.addItem && event.keyCode === 13) {
        if (vm.assigneeInput === '' && _.isFunction(vm.onKeyDown)) {
          vm.onKeyDown(13);
        }
        addAssigneeChip();
      } else if (event.keyCode === 27) {
        if (_.isFunction(vm.onKeyDown)) {
          vm.onKeyDown(27);
        }
      }
    }

    function addIt() {
      addAssigneeChip();
    }

    function addAssigneeChip() {
      if (vm.addItem !== true) {
        return;
      }
      _.forEach(parseMentionData(vm.assigneeInput), function (item) {
        vm.assignees.push(item);
      });
      vm.assignees = _.uniq(vm.assignees);
      vm.assigneesData = removeRedundantAssignees(vm.assignees, vm.mentionAssigneesData);
      vm.assigneeInput = '';
    }

    var inputLastValue = '';
    function assigneeKeyUp(event) {
      if (vm.removeItem && event.keyCode === 8 && inputLastValue === '') {
        if (vm.assignees.length > 0 && vm.assigneesData.length > 0) {
          var text = vm.assignees.pop();
          vm.assigneesData.pop();
          vm.assigneeInput = text.substr(0, text.length - 1);
        }
      }
      inputLastValue = vm.assigneeInput;
    }

    function removeItems() {
      vm.assignees = [];
      vm.assigneesData = [];
      vm.mentionAssigneesData = [];
    }

    eventReferences.push($scope.$watch(function () {
      return vm.assigneesData;
    }, function (newVal) {
      if (newVal.hasOwnProperty('init') && newVal.init === true) {
        initData(newVal.data);
      }
    }));

    function initData(users) {
      vm.assignees = _.map(users, function (user) {
        return user.id;
      });
      vm.assigneesData = users.slice(0);
      vm.mentionAssigneesData = users.slice(0);
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
