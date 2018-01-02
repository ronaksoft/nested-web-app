(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('taskLabel', taskLabel);

  /** @ngInject */
  function taskLabel() {
    return {
      restrict: 'E',
      templateUrl: 'app/task/common/label/label.html',
      controller: 'TaskLabelController',
      controllerAs: 'ctlLabel',
      scope: {},
      bindToController: {
        labelsData: '=',
        labelFocus: '=',
        addItem: '=?',
        removeItem: '=?',
        labelPlaceholder: '@',
        removeItems: '=',
        labelClick: '=?'
      }
    };
  }

})();
