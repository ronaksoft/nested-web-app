(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .controller('NotificationsController', NotificationsController);

  function NotificationsController(_, $q, $state, $scope, $log,
                                   NST_NOTIFICATION_TYPE,
                                   NstSvcNotificationFactory, NstSvcAuth, NstSvcLogger) {
    var vm = this;
    vm.NST_NOTIFICATION_TYPE = NST_NOTIFICATION_TYPE;
    var pageItemsCount = 12;
    vm.notifications = NstSvcNotificationFactory.getLoadedNotification() || [];
    vm.controls = {
      left: [],
      right: []
    };

    vm.markAllSeen = markAllSeen;
    vm.loadMore = loadBefor;
    vm.loadNew = loadAfter;
    vm.viewPost = viewPost;
    vm.error = null;

    (function () {
      if (vm.notifications.length === 0) {
        loadBefor();
      } else {
        loadAfter();
      }
    })();

    vm.closeMention = function () {
      $scope.$emit('close-mention');
    };

    function markAllSeen() {
      var deferred = $q.defer();

      NstSvcNotificationFactory.markAsSeen().then(function () {
        markAllItemsAsSeen(vm.notifications);
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function markAllItemsAsSeen(items) {
      _.forEach(items, function (item) {
        item.isSeen = true;
      });
    }

    function loadNotification(before, after) {
      var limit = pageItemsCount;
      var deferred = $q.defer();
      vm.error = false;
      vm.loading = true;
      NstSvcNotificationFactory.getNotifications(
        {
          before: before,
          after: after,
          limit: limit
        }).then(function (notifications) {

        if (notifications)
          vm.notifications = _.concat(vm.notifications, _.uniqBy(notifications, 'id'));

        console.log(11111,vm.notifications )
        NstSvcNotificationFactory.storeLoadedNotification(vm.notifications);

        if (notifications.length < limit) {
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

    function loadBefor() {
      vm.loadingBefore = true;
      var lastItem = _.last(vm.notifications);
      return loadNotification(lastItem ? lastItem.date.getTime() : Date.now());
    }

    function loadAfter() {
      vm.loadingAfter = true;
      var firstItem = _.first(vm.notifications);
      return loadNotification(null ,firstItem.date.getTime());
    }

    function viewPost(mention, $event) {
      $event.preventDefault();

      if (!mention.isSeen) {
        NstSvcMentionFactory.markAsSeen(mention.id).then(function () {
          markAllItemsAsSeen([mention]);
        }).catch(function (error) {
          NstSvcLogger.error(error);
        }).finally(function () {
          $state.go('app.message', {postId: mention.postId}, {notify: false});
        });
      } else {
        $state.go('app.message', {postId: mention.postId}, {notify: false});
      }

    };

  }

})();
