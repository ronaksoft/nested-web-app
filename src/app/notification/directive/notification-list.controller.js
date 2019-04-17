(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .controller('NotificationListController', NotificationListController);

  function NotificationListController(_, $q, $state, $scope, $log, $rootScope,
                                        NST_NOTIFICATION_TYPE, NstSvcNotificationFactory, NstSvcDate) {
    var vm = this;
    vm.NST_NOTIFICATION_TYPE = NST_NOTIFICATION_TYPE;
    var pageItemsCount = 12;

    vm.notifications = [];
    vm.error = null;

    vm.loadMore = loadBefore;
    vm.itemClick = itemClick;

    loadAll();

    function itemClick(notif, event) {
      markAsSeen(notif);
      vm.notifClick(notif, event);
    }

    var debounceCount = _.debounce(countNotifications, 100);

    function markAsSeen(notification) {
      var deferred = $q.defer();

      markAllItemsAsSeen([notification]);
      NstSvcNotificationFactory.markAsSeen(notification.id).then(function () {
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function markAllSeen() {
      var deferred = $q.defer();

      NstSvcNotificationFactory.markAsSeen().then(function () {
        markAllItemsAsSeen(vm.notifications);
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }

    vm.notifMarkAll = function () {
      markAllSeen();
    };

    function markAllItemsAsSeen(items) {
      _.forEach(items, function (item) {
        item.isSeen = true;
      });
      debounceCount();
    }

    function loadNotification(before, after) {
      var limit = pageItemsCount;
      var deferred = $q.defer();
      vm.error = false;
      vm.loading = true;
      var setting = {
        before: before,
        after: after,
        limit: limit,
        filter: vm.notifFilter
      };
      NstSvcNotificationFactory.getNotifications(setting).then(function (notifications) {
        if (notifications) {
          var notifs = _.concat(notifications, vm.notifications);
          vm.notifications = sortNotification(notifs);
        }

        countNotifications();

        if (notifications.length < limit && !vm.loadingAfter) {
          vm.reached = true;
        }
        vm.loadingBefore = false;
        vm.loadingAfter = false;

        deferred.resolve(vm.notifications);
      }).catch(function (error) {
        $log.error(error);
        vm.error = true;
        vm.loadingBefore = false;
        vm.loadingAfter = false;
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function loadBefore() {
      vm.loadingBefore = true;
      var lastItem = _.last(vm.notifications);
      return loadNotification(lastItem ? lastItem.lastUpdate ? lastItem.lastUpdate.getTime() : lastItem.date.getTime() : NstSvcDate.now());
    }

    function loadAll() {
      vm.loadingAfter = true;
      return loadNotification();
    }

    function countNotifications() {
      vm.notifCount = 0;
      _.forEach(vm.notifications, function (item) {
        if (!item.isSeen) {
          vm.notifCount++;
        }
      });
    }

    function sortNotification(notifications) {
      return _.orderBy(_.uniqBy(notifications, 'id'), [function (notif) {
        if (notif.type === NST_NOTIFICATION_TYPE.COMMENT) {
          return notif.lastUpdate.getTime();
        }

        return notif.date.getTime();
      }], ['desc']);
    }
  }

})();
