(function() {
  'use strict';

  angular
    .module('ronak.nested.web.activity')
    .directive('favContacts', function () {
      return {
        restrict: 'E',
        templateUrl : 'app/contacts/partials/fav-contacts.html',
        controller : 'favContactsController',
        controllerAs : 'ctrl',
        bindToController : true,
        replace : true,
        link: function (scope, element, attrs) {

        }
      };
    });
})();
