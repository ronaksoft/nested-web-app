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
    vm.items = [
      {Name: 'Nested Story.pdf' , Size:'18.9' },
      {Name: 'Nested Story.pdf' ,  Size:'18.9'},
      {Name: 'First Blog Piece.doc' , Size:'18.9'}
    ]
    
    
    vm.onSelect = function (fileIds) {
      console.log(fileIds);
    }







  }

})();
