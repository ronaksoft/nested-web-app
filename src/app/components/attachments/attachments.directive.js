(function() {
  'use strict';

  angular
    .module('nested')
    .directive('attachments', function () {
      return {
        restrict: 'AE',
        scope: true,
        controller: 'AttachmentsController',
        controllerAs: 'attachmentsCtrl'
      };
    });

})();
