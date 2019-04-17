(function() {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .directive('notificationList', notificationList);

  /** @ngInject */
  function notificationList() {
    return {
      restrict: 'E',
      templateUrl: 'app/notification/directive/notification-list.html',
      controller: 'NotificationListController',
      controllerAs: 'ctlNotifications',
      scope: {},
      bindToController: {
        notifFilter: '=',
        notifCount: '=',
        notifClick: '=',
        notifMarkAll: '='
      }
    };
  }

})();
