(function () {
    'use strict';

    angular
      .module('ronak.nested.web.task')
      .controller('createTaskController', createTaskController);

    /** @ngInject */
    function createTaskController($q, $scope, $state, $stateParams, $uibModal, $rootScope) {
      var vm = this;
      // var eventReferences = [];
      vm.showMoreOption = false


    }
  })();
