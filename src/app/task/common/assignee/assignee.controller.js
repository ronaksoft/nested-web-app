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
    vm.assigneeKeyDown = assigneeKeyDown;
    vm.removeAssigneeChip = removeAssigneeChip;

    function getAssigneesData(assignees) {
      var promises;
      promises = _.map(assignees, function (item) {
        return NstSvcUserFactory.getCached(item);
      });
      $q.all(promises).then(function (lists) {
        vm.assigneesData = lists;
      });
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
        getAssigneesData(vm.assignees);
        vm.assigneeInput = '';
      }
    }
  }
})();
