(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .controller('PublicController', PublicController);

  /** @ngInject */
  function PublicController($scope, NstSvcI18n, NST_CONFIG) {
    var vm = this;
    vm.currentLocale = NstSvcI18n.selectedLocale;
    vm.setLocale = setLocale;

    vm.showFooter = true;
    if (NST_CONFIG.SHOW_FOOTER == 'false') {
      vm.showFooter = false;
    }

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
