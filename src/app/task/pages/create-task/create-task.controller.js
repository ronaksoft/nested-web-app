(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('createTaskController', createTaskController);

    /** @ngInject */
    function createTaskController($q, $scope, $state, $stateParams, $uibModal, $rootScope, NstSvcUserFactory, NstSvcAuth, _) {
      var vm = this;
      // var eventReferences = [];
      vm.showMoreOption = false
      vm.user = NstSvcAuth.user
      vm.datePickerconfig = {allowFuture : true};

      vm.assigneeInput = '';
      vm.assignees = [];
      vm.assigneeIcon = 'no-assignee';
      vm.assigneeKeyDown = assigneeKeyDown;
      vm.removeAssigneeChip = removeAssigneeChip;

      function assigneeKeyDown(event) {
        if (event.keyCode === 13) {
          _.forEach(parseMentionData(vm.assigneeInput), function (item) {
            vm.assignees.push(item);
          });
          vm.assignees = _.uniq(vm.assignees);
          vm.assigneeInput = '';
        }
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
      }

      function getAssigneeIcon(data) {
        if (data.length === 0) {
          vm.assigneeIcon = 'no-assignee';
        } else if (data.length === 1) {
          NstSvcUserFactory.getCached(data[0]).then(function(user) {
            vm.assigneeIcon = user;
          });
        } else if (data.length > 1) {
          vm.assigneeIcon = 'candidate';
        }
      }

      $scope.$watch(function () {
        return vm.assignees;
      }, function (newVal) {
        getAssigneeIcon(newVal);
      }, true);
    }
  })();
