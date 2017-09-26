(function() {
  'use strict';

  angular
    .module('ronak.nested.web.tasks')
    .controller('taskGlanceController', taskGlanceController);

  function taskGlanceController($rootScope, $scope, NstSvcAuth) {
    var vm = this;
    // var eventReferences = [];

    vm.user = NstSvcAuth.user;

  }
})();
