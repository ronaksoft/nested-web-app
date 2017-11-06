(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskAbstractController', TaskAbstractController);

  function TaskAbstractController($rootScope, $scope, _) {
    var vm = this;
    var eventReferences = [];

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });

    });
  }
})();
