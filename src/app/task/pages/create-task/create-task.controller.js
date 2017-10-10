(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('createTaskController', createTaskController);

    /** @ngInject */
    function createTaskController($q, $scope, $state, $stateParams, $uibModal, $rootScope, NstSvcAuth) {
      var vm = this;
      // var eventReferences = [];
      vm.showMoreOption = false
      vm.user = NstSvcAuth.user
      console.log(vm.user)


    }
  })();
