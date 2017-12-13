(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('CustomFilterController', CustomFilterController);

  /** @ngInject */
  function CustomFilterController($q, $scope, $state, $stateParams, _, $uibModal, $rootScope, NstSvcTranslation) {
    var vm = this;
    vm.backDropClick = backDropClick;

    vm.conditions = [
      {
        key: 'assigne',
        title: NstSvcTranslation.get("Assigne")
      },
      {
        key: 'assignor',
        title: NstSvcTranslation.get(" Assignor")
      },
      {
        key: 'label',
        title: NstSvcTranslation.get("Label")
      },
      {
        key: 'status',
        title: NstSvcTranslation.get("Status")
      },
      {
        key: 'keyword',
        title: NstSvcTranslation.get("Keyword")
      },
      {
        key: 'dueTime',
        title: NstSvcTranslation.get("Due Time")
      },
    ];
    vm.equivalents = [
        {
            key: 'is',
            title: NstSvcTranslation.get("is")
        },
        {
            key: 'isNext',
            title: NstSvcTranslation.get("in next")
        },
    ]

    function backDropClick() {
      $scope.$dismiss();
    }
  }
})();
