(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .controller('CopyTokenController', CopyTokenController);

  function CopyTokenController($scope, toastr, NstSvcAppFactory, NstSvcTranslation, app) {
    var vm = this;
    vm.app = app;

    vm.copyToClipboard = copyToClipboard;
    function copyToClipboard(text) {
      var inp = document.createElement('input');
      document.body.appendChild(inp);
      inp.value = text;
      inp.select();
      document.execCommand('copy', false);
      inp.remove();
    }
  }
})();
