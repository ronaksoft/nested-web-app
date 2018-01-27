(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('taskCard', PostItem);

  /** @ngInject */
  function PostItem() {
    return {
      restrict: 'E',
      scope: {},
      link: function () {
      },
      templateUrl: 'app/messages/partials/task-card/task-card.html',
      controller: 'TaskCardController',
      controllerAs: 'ctlTaskCard',
      bindToController: {
        task: '=',
      }
    };
  }

})();
