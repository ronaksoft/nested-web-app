(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('createTaskController', createTaskController);

    /** @ngInject */
    function createTaskController($q, $scope, $state, $stateParams, $uibModal, $rootScope, NstSvcAuth, _) {
      var vm = this;
      // var eventReferences = [];
      vm.showMoreOption = false
      vm.user = NstSvcAuth.user

      vm.assigneeInput = '';
      vm.assigneeKeyDown = assigneeKeyDown;
      vm.assignees = [];

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

    }
  })();
