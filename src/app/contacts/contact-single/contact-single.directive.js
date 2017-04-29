(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .directive('contactSingle', contactSingle);

  /** @ngInject */
  function contactSingle() {
    return {
      restrict: 'EA',
      templateUrl: 'app/contacts/contact-single/contact-single.html',
      controller: 'ContactSingleController',
      controllerAs: 'ctrl',
      scope: {
        contactId: '='
      },
      bindToController: true,
      link: function (scope, element, attrs) {
      }
    };
  }

})();
