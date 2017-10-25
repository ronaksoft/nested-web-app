(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskActivityController', TaskActivityController);

  function TaskActivityController($timeout, $scope, $q, $state, NstSvcTaskActivityFactory, NST_TASK_EVENT_ACTION,
                                   NstSvcAuth, _) {
    var vm = this;
    var eventReferences = [];

    $timeout(function () {
      vm.user = NstSvcAuth.user;
    }, 100);

    vm.activityTypes = NST_TASK_EVENT_ACTION;

    vm.activities = [];

    (function () {
      getActivities(vm.taskId);
    })();

    function getActivities(id) {
      var setting = {
        id: id
      };
      NstSvcTaskActivityFactory.get(setting).then(function (activities) {
        vm.activities = activities;
        vm.activityCount = vm.activities.length;
      });
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
