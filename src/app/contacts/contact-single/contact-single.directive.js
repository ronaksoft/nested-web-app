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
      replace: true,
      controller: 'ContactSingleController',
      controllerAs: 'ctrl',
      scope: {
        contactId: '=',
        contact: '='
      },
      bindToController: true,
      link: function () {
      }
    };
  }

})();
