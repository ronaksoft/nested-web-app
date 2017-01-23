(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .controller('NotificationsController', NotificationsController);

  function NotificationsController(_, $q, $state, $scope, $log,
                                   NST_NOTIFICATION_TYPE, NST_NOTIFICATION_FACTORY_EVENT,
                                   NstFactoryEventData, NstSvcNotificationFactory) {
    var vm = this;
    vm.NST_NOTIFICATION_TYPE = NST_NOTIFICATION_TYPE;
    var pageItemsCount = 12;
    vm.notifications = NstSvcNotificationFactory.getLoadedNotification() || [];
    vm.controls = {
      left: [],
      right: []
    };

    vm.markAllSeen = markAllSeen;
    vm.loadMore = loadBefore;
    vm.loadNew = loadAfter;
    vm.onClickMention = onClickMention;
    vm.error = null;


    //initialize
    NstSvcNotificationFactory.resetCounter();
    if (vm.notifications.length === 0) {
      loadBefore();
    } else {
      loadAfter();
    }

    var closePopover = function () {
      $scope.$emit('close-mention');
    };

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

        if (notifications) {
          var notifs = _.concat(notifications, vm.notifications);
          vm.notifications = _.orderBy(_.uniqBy(notifs, 'id'), [function (notif) {
            if (notif.type === NST_NOTIFICATION_TYPE.COMMENT)
              return notif.lastUpdate.getTime();

            return notif.date.getTime();
          }], ['desc']);
        }

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

    function loadBefore() {
      vm.loadingBefore = true;
      var lastItem = _.last(vm.notifications);
      return loadNotification(lastItem ? lastItem.lastUpdate ? lastItem.lastUpdate.getTime() : lastItem.date.getTime() : Date.now());


    }

    function loadAfter() {
      vm.loadingAfter = true;
      var firstItem = _.first(vm.notifications);
      return loadNotification(null, firstItem.date.getTime());
    }

    function onClickMention(notification, $event) {

      $event.preventDefault();
      markAsSeen(notification);

      switch (notification.type) {
        case NST_NOTIFICATION_TYPE.INVITE :
          closePopover();
          return showInvitationModal(notification);
        case NST_NOTIFICATION_TYPE.COMMENT:
        case NST_NOTIFICATION_TYPE.MENTION:
          closePopover();
          return viewPost(notification);
      }
    }


    function showInvitationModal(notification) {

      NstSvcNotificationFactory.dispatchEvent(
        new CustomEvent(NST_NOTIFICATION_FACTORY_EVENT.OPEN_INVITATION_MODAL, new NstFactoryEventData(notification.invitation))
      )
    }


    function viewPost(notification) {
      $state.go('app.message', {postId: notification.post.id}, {notify: false});
    };

  }

})();
