(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('createTaskController', createTaskController);

    /** @ngInject */
    function createTaskController($q, $scope, $state, $stateParams, $uibModal, $rootScope, NstSvcUserFactory, NstSvcAuth, _) {
      var vm = this;
      // var eventReferences = [];
      vm.showMoreOption = false;
      vm.user = NstSvcAuth.user;
      vm.datePickerconfig = {allowFuture : true};

      vm.assigneeFocus = false;
      vm.assigneeInput = '';
      vm.assignees = [];
      vm.assigneesData = [];
      vm.assigneeIcon = 'no-assignee';
      vm.assigneeKeyDown = assigneeKeyDown;
      vm.removeAssigneeChip = removeAssigneeChip;
      vm.placeFiles = placeFiles;

      vm.dueDate = new Date("July 21, 1983 01:15:00");

      /**
       * Opens the placeFiles modal
       * Pass the `addToCompose` function to the new modal
       */
      function placeFiles() {
        $uibModal.open({
          animation: false,
          // backdropClass: 'comdrop',
          size: 'sm',
          templateUrl: 'app/pages/compose/partials/place-files-modal.html',
          controller: 'placeFilesModalController',
          controllerAs: 'ctrl',
          resolve: {
            uploadfiles: function () {
              return // add function;
            }
          }
        });
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
