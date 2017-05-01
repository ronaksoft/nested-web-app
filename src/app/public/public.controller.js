(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('PublicController', PublicController);

  /** @ngInject */
  function PublicController($scope, NstSvcI18n) {
    var vm = this;
    vm.currentLocale = NstSvcI18n.selectedLocale;
    vm.setLocale = setLocale;

    function setLocale(locale) {
      if (NstSvcI18n.selectedLocale === locale) {
        return;
      }

      $scope.$emit('show-loading', {});
      NstSvcI18n.setLocale(locale);
      window.location.reload(true);
    }
  }
})();
