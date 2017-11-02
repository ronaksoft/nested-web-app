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
    vm.isModal = $scope.$resolve && $scope.$resolve.isModal;
    if (vm.isModal) {
      vm.notifications = [];
    } else {
      vm.notifications = NstSvcNotificationFactory.getLoadedNotification() || [];
    }
    vm.postNotifications = [];
    vm.taskNotifications = [];

    vm.changeTab = changeTab;
    vm.markAllSeen = markAllSeen;
    vm.loadMore = loadBefore;
    vm.openNotificationsModal = openNotificationsModal;
    vm.loadNew = loadAfter;
    vm.onClickMention = onClickMention;
    vm.error = null;
    vm.selectedView = $state.current.options.group === 'task'? 2: 1;
    vm.taskCounts = 0;
    vm.postCounts = 0;

    //initialize
    NstSvcNotificationFactory.resetCounter();
    if (vm.isModal) {
      loadAll();
    } else {
      if (vm.notifications.length === 0) {
        loadBefore();
      } else {
        loadAfter();
      }
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
        markAllItemsAsSeen(vm.notifications);
        deferred.resolve();
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function markAllItemsAsSeen(items) {
      countNotifications(vm.notifications);
      _.forEach(items, function (item) {
        item.isSeen = true;
      });
    }

    function loadNotification(before, after) {
      var limit = pageItemsCount;
      var deferred = $q.defer();
      vm.error = false;
      vm.loading = true;
      var setting = {
        before: before,
        after: after,
        limit: limit
      };
      if (!vm.isModal) {
        setting.onlyUnread = true;
      }
      NstSvcNotificationFactory.getNotifications(setting).then(function (notifications) {

        if (notifications) {
          var notifs = _.concat(notifications, vm.notifications);
          vm.notifications = sortNotification(notifs);
        }

        if (!vm.isModal) {
          NstSvcNotificationFactory.storeLoadedNotification(vm.notifications);
        }

        var temp = separateNotifications(vm.notifications);

        vm.postNotifications = temp.post;
        vm.taskNotifications = temp.task;

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

    function loadAfter() {
      vm.loadingAfter = true;
      var firstItem = _.first(vm.notifications);
      return loadNotification(null, firstItem.date.getTime());
    }

    function loadAll() {
      vm.loadingAfter = true;
      return loadNotification();
    }

    function countNotifications(notifications) {
      vm.taskCounts = 0;
      vm.postCounts = 0;
      _.forEach(notifications, function (item) {
        if (item.isTask) {
          if (!item.isSeen) {
            vm.taskCounts++;
          }
        } else {
          if (!item.isSeen) {
            vm.postCounts++;
          }
        }
      });
    }

    function separateNotifications(notifications) {
      var task = [];
      var post = [];
      _.forEach(notifications, function (item) {
        if (item.isTask) {
          if (!item.isSeen) {
            vm.taskCounts++;
          }
          task.push(item);
        } else {
          if (!item.isSeen) {
            vm.postCounts++;
          }
          post.push(item);
        }
      });
      return {
        task: task,
        post: post
      };
    }

    function sortNotification(notifications) {
      return _.orderBy(_.uniqBy(notifications, 'id'), [function (notif) {
        if (notif.type === NST_NOTIFICATION_TYPE.COMMENT) {
          return notif.lastUpdate.getTime();
        }

        return notif.date.getTime();
      }], ['desc']);
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
        case NST_NOTIFICATION_TYPE.TASK_ADD_TO_CANDIDATES:
          $event.preventDefault();
          return viewGlance();
        case NST_NOTIFICATION_TYPE.TASK_MENTION:
        case NST_NOTIFICATION_TYPE.TASK_COMMENT:
        case NST_NOTIFICATION_TYPE.TASK_ASSIGNEE_CHANGED:
        case NST_NOTIFICATION_TYPE.TASK_ADD_TO_WATCHERS:
        case NST_NOTIFICATION_TYPE.TASK_DUE_TIME_UPDATED:
        case NST_NOTIFICATION_TYPE.TASK_TITLE_UPDATED:
        case NST_NOTIFICATION_TYPE.TASK_UPDATED:
        case NST_NOTIFICATION_TYPE.TASK_ASSIGNED:
        case NST_NOTIFICATION_TYPE.TASK_OVER_DUE:
        case NST_NOTIFICATION_TYPE.TASK_REJECTED:
        case NST_NOTIFICATION_TYPE.TASK_ACCEPTED:
        case NST_NOTIFICATION_TYPE.TASK_COMPLETED:
        case NST_NOTIFICATION_TYPE.TASK_HOLD:
        case NST_NOTIFICATION_TYPE.TASK_IN_PROGRESS:
          $event.preventDefault();
          return viewTask(notification.task.id);
      }
    }

    function showInvitationModal(notification) {
      $rootScope.$broadcast(NST_NOTIFICATION_EVENT.OPEN_INVITATION_MODAL, {
        invitationId: notification.invitation.id
      });
    }

    function viewPost(id) {
      $state.go('app.message', {
        postId: id
      }, {
        notify: false
      });
    }

    function openPlace(id) {
      $state.go('app.place-messages', {
        placeId: id
      });
    }

    function viewGlance() {
      $state.go('app.task.glance', {});
    }

    function viewTask(id) {
      $state.go('app.task.edit', {
        taskId: id
      }, {
        notify: false
      });
    }

    function openNotificationsModal() {
      $uibModal.open({
        animation: false,
        size: 'notifications',
        templateUrl: 'app/notification/notification-modal.html',
        controller: 'ModalNotificationsController',
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
    };


  }

})();
