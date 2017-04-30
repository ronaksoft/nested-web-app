(function () {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .directive('contactList', contactList);

  /** @ngInject */
  function contactList() {
    return {
      restrict: 'EA',
      templateUrl: 'app/contacts/contact-list/contact-list.html',
      controller: 'ContactListController',
      controllerAs: 'ctrl',
      link: function (scope, element, attrs) {

      }
    };
  }

})();
