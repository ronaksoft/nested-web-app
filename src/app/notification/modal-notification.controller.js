(function () {
  'use strict';

  angular
    .module('ronak.nested.web.notification')
    .controller('ModalNotificationsController', ModalNotificationsController);

  function ModalNotificationsController(_, $q, $state, $scope, $rootScope, $timeout,
                                        NST_NOTIFICATION_TYPE, NstSvcNotificationFactory, NST_NOTIFICATION_EVENT) {
    var vm = this;
    vm.NST_NOTIFICATION_TYPE = NST_NOTIFICATION_TYPE;

    vm.changeTab = changeTab;
    vm.markAllSeen = markAllSeen;
    vm.onClickMention = onClickMention;
    vm.error = null;
    vm.selectedView = $state.current.options.group === 'task' ? 2 : 1;
    vm.taskCounts = 0;
    vm.postCounts = 0;


    function changeTab(v) {
      vm.selectedView = parseInt(v);
    }

    function closeModal() {
      $scope.$dismiss();
    }

    function markAllSeen() {
      if (vm.selectedView === 2) {
        vm.taskMarkAllSeenFunc.call();
      } else if (vm.selectedView === 1) {
        vm.postMarkAllSeenFunc.call();
      }
    }

    function onClickMention(notification, $event) {
      closeModal();
      switch (notification.type) {
        case NST_NOTIFICATION_TYPE.INVITE:
          $event.preventDefault();
          return;
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

  }

})();
