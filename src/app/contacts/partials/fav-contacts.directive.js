(function() {
  'use strict';

  angular
    .module('ronak.nested.web.contact')
    .directive('favContacts', function () {
      return {
        restrict: 'E',
        templateUrl : 'app/contacts/partials/fav-contacts.html',
        controller : 'FavoriteContactsController',
        controllerAs : 'ctrl',
        bindToController : true,
        replace : true,
        link: function () {

        }
      };
    });
})();
