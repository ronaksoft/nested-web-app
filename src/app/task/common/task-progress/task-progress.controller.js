(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('taskProgressIconController', taskProgressIconController);

    /** @ngInject */
    function taskProgressIconController($q, $scope, $state, $stateParams, $uibModal, $rootScope) {
      var vm = this;
      // var eventReferences = [];
      var sit = ['not-assigned', 'assigned', 'overdue', 'rejected', 'hold', 'complete']
      vm.hasChecklist = false;

      vm.status = 'assigned';
      


    }
  })();
