(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('indexController', AppController);

  /** @ngInject */
  function AppController($q, $scope, $window, $rootScope, $timeout, $state, $stateParams, $uibModalStack, $interval, $log, $injector,
                         hotkeys, deviceDetector,
                         NST_CONFIG, NST_UNREGISTER_REASON, NST_PUBLIC_STATE, NST_DEFAULT, NST_PAGE, NST_SRV_ERROR, NST_AUTH_EVENT, NST_SRV_EVENT, NST_PLACE_ACCESS,
                         NstSvcServer, NstSvcAuth, NstFactoryError, NstSvcLogger, NstSvcModal, NstSvcI18n, NstSvcNotification,
                         NstObject) {
    var vm = this;
    vm.removeClass = _.debounce(removeClass, 512);


    NstSvcNotification.requestPermission();


    $window.addEventListener("dragover",function(e){
      e = e || event;
      e.preventDefault();
      $('body').addClass('drag-enter');
      vm.removeClass();

    },false);

    $window.addEventListener("drop",function(e){
      e = e || event;
      e.preventDefault();
      removeClass()
    },false);


    function removeClass() {
      $('body').removeClass('drag-enter');

    }

  }
})();
