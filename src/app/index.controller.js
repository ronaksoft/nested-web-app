(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('indexController', AppController);

  /** @ngInject */
  function AppController($window, $scope, $rootScope, NstSvcI18n, _, $, $timeout) {
    var vm = this;
    var removeClassDeb = _.debounce(removeClass, 512);

    vm.showLoadingScreen = false;
    vm.removeLoadingElements = false;

    $rootScope._direction = NstSvcI18n.getLocale()._direction || "ltr";

    $window.addEventListener("dragover",function(e){
      e = e || event;
      e.preventDefault();
      $('body').addClass('drag-enter');
      removeClassDeb();

    },false);

    $window.addEventListener("drop",function(e){
      e = e || event;
      e.preventDefault();
      removeClass();
    },false);

    $scope.$on('show-loading', function () {
      vm.showLoadingScreen = true;
      vm.removeLoadingElements = false;
    })
    $rootScope.$on('login-loaded', function () {
      vm.showLoadingScreen = false;
      $timeout(function(){
        vm.removeLoadingElements = true;
      }, 4500);
    });

    function removeClass() {
      $('body').removeClass('drag-enter');
    }
  }
})();
