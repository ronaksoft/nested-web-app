(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('indexController', AppController);

  /** @ngInject */
  function AppController($window, $rootScope, NstSvcI18n, NstSvcNotification) {
    var vm = this;
    vm.removeClass = _.debounce(removeClass, 512);

    $rootScope._direction = NstSvcI18n.getLocale()._direction || "ltr";

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
