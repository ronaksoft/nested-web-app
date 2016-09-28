(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('PlaceFilesController', PlaceFilesController);

  /** @ngInject */
  function PlaceFilesController($rootScope, $q, $stateParams, $log, $timeout, $state, $interval, $scope,
                              NST_MESSAGES_SORT_OPTION, NST_MESSAGES_VIEW_SETTING, NST_DEFAULT, NST_SRV_EVENT, NST_EVENT_ACTION, NST_POST_FACTORY_EVENT,NST_PLACE_ACCESS,
                              NstSvcPostFactory, NstSvcPlaceFactory, NstSvcServer, NstSvcLoader, NstSvcTry, NstUtility, NstSvcAuth,
                              NstSvcMessagesSettingStorage,
                              NstSvcPostMap) {
    var vm = this;

    vm.onSelect = function (fileIds) {
      console.log(fileIds);
      vm.demo();
    }
    vm.filesCount = 0 ;

    vm.demo = function () {

      var selectableElement = $('ul.options');

      $timeout(function () {
        vm.filesCount = selectableElement.finderSelect('selected').length;
      });
      vm.filesCount = selectableElement.finderSelect('selected').length;
      console.log(vm.filesCount);


    }

  }

})();
