(function() {
  'use strict';

  angular.module('ronak.nested.web.contact').controller('ContactController', ContactController);

  /** @ngInject */
  function ContactController($stateParams, toastr, $uibModalInstance, $state, $timeout, $q, $scope) {
    var vm = this,
      eventReferences = [];

    (function() {
      if ($stateParams.contactId && $stateParams.contactId.length > 0) {
        vm.mode = 'single';
        vm.contact = $stateParams.contact;
        vm.contactId = $stateParams.contactId;
      } else {
        vm.mode = 'list';
      }
    })();

    eventReferences.push($scope.$on('view-contact', function(event, data) {
      vm.mode = 'single';
      vm.contact = data;
      vm.contactId = data.id;
    }));

    eventReferences.push($scope.$on('view-contact-list', function(event, data) {
      vm.mode = 'list';
    }));

    eventReferences.push($scope.$on('close-modal', function(event, data) {
      $uibModalInstance.dismiss();
    }));

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
  }
})();
