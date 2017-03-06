(function() {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('SelectLanguageController', SelectLanguageController);

  /** @ngInject */
  function SelectLanguageController($scope, NstSvcI18n) {
    var vm = this;

    vm.locale = NstSvcI18n.selectedLocale;
    vm.changeLocale = changeLocale;

    function changeLocale(locale) {
      $scope.$emit('show-loading', {});
      NstSvcI18n.setLocale(locale);
      window.location.reload(true);
    }

  }
})();
