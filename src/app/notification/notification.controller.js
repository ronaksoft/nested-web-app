(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .controller('NotificationsController', NotificationsController);

  function NotificationsController(_, $q, $state, $scope, $log, $rootScope, $uibModal,
    NST_NOTIFICATION_TYPE, NST_NOTIFICATION_EVENT, NstSvcInvitationFactory,
    NstSvcNotificationFactory, NstSvcInteractionTracker, NstSvcDate) {
    var vm = this;
    vm.NST_NOTIFICATION_TYPE = NST_NOTIFICATION_TYPE;
    var pageItemsCount = 12;
    vm.postNotifications = NstSvcNotificationFactory.getLoadedNotification() || [];
    vm.taskNotifications = [];

    vm.changeTab = changeTab;
    vm.markAllSeen = markAllSeen;
    vm.loadMore = loadBefore;
    vm.openNotificationsModal = openNotificationsModal;
    vm.loadNew = loadAfter;
    vm.onClickMention = onClickMention;
    vm.error = null;
    vm.selectedView = 1;
    vm.isModal = $scope.$resolve && $scope.$resolve.isModal;
    vm.taskCounts = 0;
    vm.postCounts = 0;

    //initialize
    NstSvcNotificationFactory.resetCounter();
    if (vm.postNotifications.length === 0) {
      loadBefore();
    } else {
      loadAfter();
    }

    function changeTab(v) {
      vm.selectedView = parseInt(v);
    }

    var closePopover = function () {
      $scope.$emit('close-mention');
    };
    var closeModal = function () {
      $scope.$dismiss();
    };

    function markAsSeen(notification) {
      var deferred = $q.defer();

      markAllItemsAsSeen([notification]);
      NstSvcNotificationFactory.markAsSeen(notification.id).then(function () {
        deferred.resolve();
      }).catch(deferred.reject);

      NstSvcInteractionTracker.trackEvent('notification', 'mark all seen');

      return deferred.promise;
    }

    function markAllSeen() {
      var deferred = $q.defer();

      NstSvcNotificationFactory.markAsSeen().then(function () {
        markAllItemsAsSeen(vm.postNotifications);
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
      NstSvcNotificationFactory.getNotifications({
        before: before,
        after: after,
        limit: limit
      }).then(function (notifications) {

        if (notifications) {
          var notifs = _.concat(notifications, vm.postNotifications);
          vm.postNotifications = _.orderBy(_.uniqBy(notifs, 'id'), [function (notif) {
            if (notif.type === NST_NOTIFICATION_TYPE.COMMENT)
              return notif.lastUpdate.getTime();

            return notif.date.getTime();
          }], ['desc']);
        }

        NstSvcNotificationFactory.storeLoadedNotification(vm.postNotifications);

        if (notifications.length < limit && !vm.loadingAfter) {
          vm.reached = true;
        }
        vm.loadingBefore = false;
        vm.loadingAfter = false;

        deferred.resolve(vm.postNotifications);
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
      var lastItem = _.last(vm.postNotifications);
      return loadNotification(lastItem ? lastItem.lastUpdate ? lastItem.lastUpdate.getTime() : lastItem.date.getTime() : NstSvcDate.now());
    }

    function loadAfter() {
      vm.loadingAfter = true;
      var firstItem = _.first(vm.postNotifications);
      return loadNotification(null, firstItem.date.getTime());
    }

    function onClickMention(notification, $event) {
      markAsSeen(notification);
      if (vm.isModal) {
        closeModal();
      } else {
        closePopover();
      }

      switch (notification.type) {
        case NST_NOTIFICATION_TYPE.INVITE:
          $event.preventDefault();
          return showInvitationModal(notification);
        case NST_NOTIFICATION_TYPE.COMMENT:
          $event.preventDefault();
          return viewPost(notification.post.id);
        case NST_NOTIFICATION_TYPE.MENTION:
          $event.preventDefault();
          return viewPost(notification.mention.post.id);
        case NST_NOTIFICATION_TYPE.YOU_JOINED:
        case NST_NOTIFICATION_TYPE.PROMOTED:
        case NST_NOTIFICATION_TYPE.DEMOTED:
        case NST_NOTIFICATION_TYPE.PLACE_SETTINGS_CHANGED:
          $event.preventDefault();
          return openPlace(notification.place.id);
        case NST_NOTIFICATION_TYPE.NEW_SESSION:
          return;
      }
    }

    function showInvitationModal(notification) {
      $rootScope.$broadcast(NST_NOTIFICATION_EVENT.OPEN_INVITATION_MODAL, {
        invitationId: notification.invitation.id
      });
    }

    function viewPost(postId) {
      $state.go('app.message', {
        postId: postId
      }, {
        notify: false
      });
    }

    function openPlace(placeId) {
      $state.go('app.place-messages', {
        placeId: placeId
      });
    }

    function openNotificationsModal() {
      $uibModal.open({
        animation: false,
        size: 'notifications',
        templateUrl: 'app/notification/notification-modal.html',
        controller: 'NotificationsController',
        controllerAs: 'ctlNotifications',
        backdropClass: 'taskBackDrop',
        resolve: {
          isModal: function () {
            return true
          }
        }
      })
    }

    vm.showinvitationModal = function (id) {
      $rootScope.$broadcast(NST_NOTIFICATION_EVENT.OPEN_INVITATION_MODAL, {
        notificationId: id
      });
      // NstSvcInvitationFactory.get(id).then(function (invitation) {
      //   $uibModal.open({
      //     animation: false,
      //     size: 'sm',
      //     templateUrl: 'app/components/sidebar/invitation/decide-modal.html',
      //     controller: 'InvitationController',
      //     controllerAs: 'ctrlInvitation',
      //     resolve: {
      //       argv: {
      //         invitation: invitation
      //       }
      //     }
      //   }).result.then(function (result) {
      //     for (var k in vm.invitations) {
      //       if (id == vm.invitations[k].id) {
      //         vm.invitations.splice(k, 1);
      //       }
      //     }

      //     if (result) { // Accept the Invitation
      //       return NstSvcInvitationFactory.accept(id).then(function (invitation) {

      //       });
      //     } else { // Decline the Invitation
      //       return NstSvcInvitationFactory.decline(id);
      //     }
      //   }).catch(function () {});
      // });
    };


  }

})();
