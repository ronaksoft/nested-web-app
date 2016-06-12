(function() {
  'use strict';

  angular
    .module('nested')
    .controller('AttachmentPdfController', PdfController);

  /** @ngInject */
  function PdfController($scope) {
    var vm = this;
    
    $scope.pdfUrl = $scope.attachment.download.url;
  }
})();
