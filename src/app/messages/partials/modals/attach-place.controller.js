(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('AttachPlaceController', AttachPlaceController);

  function AttachPlaceController($timeout, $scope, $q,
                                 NstSvcTranslation,
                                   moment, toastr, _) {
    var vm = this;
    vm.inputPlaceHolderLabel = NstSvcTranslation.get("Enter a Place name or a Nested address...");

  }

})();
