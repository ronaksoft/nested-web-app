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

  function TaskAssigneeController($scope, $q, NstSvcUserFactory, _) {
    var vm = this;

    vm.assigneeInput = '';
    vm.assignees = [];
    vm.mentionAssigneesData = [];
    vm.assigneeKeyDown = assigneeKeyDown;
    vm.assigneeKeyUp = assigneeKeyUp;
    vm.removeAssigneeChip = removeAssigneeChip;

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
      if (event.keyCode === 13) {
        _.forEach(parseMentionData(vm.assigneeInput), function (item) {
          vm.assignees.push(item);
        });
        vm.assignees = _.uniq(vm.assignees);
        vm.assigneesData = removeRedundantAssignees(vm.assignees, vm.mentionAssigneesData);
        vm.assigneeInput = '';
      }
    }

    var inputLastValue = '';
    function assigneeKeyUp(event) {
      if (event.keyCode === 8 && inputLastValue === '') {
        if (vm.assignees.length > 0 && vm.assigneesData.length > 0) {
          var text = vm.assignees.pop();
          vm.assigneesData.pop();
          vm.assigneeInput = text.substr(0, text.length - 1);
        }
      }
      inputLastValue = vm.assigneeInput;
    }
  }
})();
