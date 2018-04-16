(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .controller('NotificationsController', NotificationsController);

  function NotificationsController(_, $q, $state, $scope, $log, $rootScope, $uibModal, $timeout,
                                   NST_NOTIFICATION_TYPE, NST_NOTIFICATION_EVENT,
                                   NstSvcNotificationFactory, NstSvcInteractionTracker, NstSvcDate) {
    var vm = this;
    vm.NST_NOTIFICATION_TYPE = NST_NOTIFICATION_TYPE;
    var pageItemsCount = 24;
    vm.notifications = /*NstSvcNotificationFactory.getLoadedNotification() ||*/ [];
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
    if (vm.notifications.length === 0) {
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

    var debounceCount = _.debounce(countNotifications, 100);

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
      _.forEach(items, function (item) {
        item.isSeen = true;
      });
      debounceCount();
    }

    function loadNotification(before, after) {
      console.log('loadNotification', before, after);
      var limit = pageItemsCount;
      var deferred = $q.defer();
      vm.error = false;
      vm.loading = true;
      var setting = {
        before: before,
        after: after,
        limit: limit,
        onlyUnread: true
      };
      NstSvcNotificationFactory.getNotifications(setting).then(function (notifications) {

        if (notifications) {
          var notifs = _.concat(notifications, vm.notifications);
          vm.notifications = sortNotification(notifs);
        }

        // NstSvcNotificationFactory.storeLoadedNotification(vm.notifications);

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
      console.log('loadBefore');
      vm.loadingBefore = true;
      var lastItem = _.last(vm.notifications);
      return loadNotification(lastItem ? lastItem.lastUpdate ? lastItem.lastUpdate.getTime() : lastItem.date.getTime() : NstSvcDate.now());
    }

    function loadAfter() {
      console.log('loadAfter');
      vm.loadingAfter = true;
      var firstItem = _.first(vm.notifications);
      return loadNotification(null, firstItem.date.getTime());
    }

    function countNotifications() {
      vm.taskCounts = 0;
      vm.postCounts = 0;
      _.forEach(vm.notifications, function (item) {
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
      closePopover();

      switch (notification.type) {
        case NST_NOTIFICATION_TYPE.INVITE:
          $event.preventDefault();
          return ;
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
          return;
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

    function gotoFeedBefore(callback) {
      if (!$state.current.options || ($state.current.options && ($state.current.options.group === 'task' || $state.current.options.group === 'settings'))) {
        $state.go('app.messages-favorites');
        $timeout(callback, 1000);
      } else {
        callback();
      }
    }

    function viewPost(id) {
      gotoFeedBefore(function () {
        $state.go('app.message', {
          postId: id
        }, {
          notify: false
        });
      });
    }

    function openPlace(id) {
      gotoFeedBefore(function () {
        $state.go('app.place-messages', {
          placeId: id
        });
      });
    }

    function gotoTaskGlanceBefore(callback) {
      if ($state.current.options && $state.current.options.group !== 'task') {
        $state.go('app.task.glance');
        $timeout(callback, 1000);
      } else {
        callback();
      }
    }

    function viewTask(id) {
      gotoTaskGlanceBefore(function () {
        $state.go('app.task.edit', {
          taskId: id
        }, {
          notify: false
        });
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
          argv: {
            selectedView: vm.selectedView,
          }
        }
      })
    }


  }

})();
