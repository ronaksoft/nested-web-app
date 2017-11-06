(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskActivityController', TaskActivityController);

  function TaskActivityController($timeout, $scope, $rootScope, _, $q, $state, NstSvcTaskActivityFactory,
                                  NST_TASK_EVENT_ACTION, NstSvcAuth, NstSvcTaskFactory, NstSvcTranslation,
                                  toastr, NstTaskActivity, NstSvcUserFactory, NstSvcDate, NstSvcTaskUtility) {
    var vm = this;
    var eventReferences = [];
    var latestActivityTimestamp = -1;
    vm.setting = {};
    $scope.loadMore = getActivities;
    vm.isLoading = false;
    vm.haveMore = true;

    reset();

    vm.sendComment = sendComment;

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    $scope.scrollEnd = function() {}; // will Assigned by directive stickBottomScroll
    vm.activityTypes = NST_TASK_EVENT_ACTION;

    vm.activities = [];
    $scope.scrollInstance = {
      maxScrollY : 0
    };

    (function () {
      getActivities();
    })();

    var init = false;
    $timeout(function () {
      init = true;
    }, 1000);

    $scope.$watch(function () {
      return vm.onlyComments;
    }, function () {
      reset();
      if (init) {
        getActivities()
      }
    });

    function reset() {
      vm.setting = {
        limit: 16,
        skip: 0,
        id: vm.taskId
      };
      latestActivityTimestamp = -1;
      vm.activities = [];
      vm.isLoading = false;
      vm.haveMore = true;
    }

    function findLatestTimestamp(activities) {
      _.map(activities, function (activity) {
        if (activity.date > latestActivityTimestamp) {
          latestActivityTimestamp = activity.date;
        }
      });
    }

    function getActivities() {
      if (vm.isLoading || !vm.haveMore) {
        return;
      }
      vm.isLoading = true;
      vm.setting.onlyComments = vm.onlyComments;
      NstSvcTaskActivityFactory.get(vm.setting).then(function (activities) {
        vm.haveMore = activities.length === vm.setting.limit;
        vm.setting.skip += activities.length;
        findLatestTimestamp(activities);
        vm.activities.unshift.apply(vm.activities, activities)
        vm.activities = _.unionBy(vm.activities, 'id');
        vm.activityCount = vm.activities.length;
        vm.isLoading = false;
      });
    }

    vm.isSendingComment = false;
    var focusOnSentTimeout = null;

    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    var resizeTextare = _.debounce(resize, 100);

    function resize(el) {
      el.style.height = '';
      el.style.height = el.scrollHeight + "px";
    }

    function sendComment(e) {
      if (vm.isSendingComment) {
        return;
      }
      var element = angular.element(e.target);
      resizeTextare(e.target);

      if (!sendKeyIsPressed(e) || element.attr('mention') === 'true') {
        return;
      }

      var body = extractCommentBody(e);

      if (body.length === 0) {
        return;
      }

      vm.isSendingComment = true;

      NstSvcTaskFactory.addComment(vm.taskId, body).then(function (activityId) {
        vm.activityCount++;
        addActivityCallback(activityId, body);
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
      });

      function addActivityCallback(activityId, commentBody) {
        if (!_.isObject(vm.user)) {
          vm.user = NstSvcAuth.user;
        }
        //TODO
        if (!_.some(vm.activities, {
            id: activityId
          })) {
          var activity = new NstTaskActivity();
          activity.id = activityId.id;
          activity.type = NST_TASK_EVENT_ACTION.COMMENT;
          activity.date = NstSvcDate.now();
          activity.actor = vm.user;
          activity.comment = {
            id: activityId.id,
            body: commentBody,
            timestamp: activity.date,
            sender: activity.actor,
            removedById: null,
            attachment_id: ''
          };
          // vm.activities.push(activity);
          // $scope.scrollEnd(true);
        }

        e.currentTarget.value = '';
        vm.isSendingComment = false;

        if (focusOnSentTimeout) {
          $timeout.cancel(focusOnSentTimeout);
        }

        focusOnSentTimeout = $timeout(function () {
          e.currentTarget.focus();
        }, 10);
        if (typeof vm.onCommentSent === 'function') {
          vm.onCommentSent(activity);
        }
        resizeTextare(e.target);
      }
    }

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    /**
     * extractCommentBody - extract and refine the comment
     *
     * @param  {Event}    e   event handler
     * @return {string}       refined comment
     */
    function extractCommentBody(e) {
      return e.currentTarget.value.trim();
    }

    function taskActivityHandler(event, data) {
      if (vm.taskId !== data.taskId) {
        return;
      }
      getRecentActivities();
    }

    function getRecentActivities() {
      if (latestActivityTimestamp === -1) {
        vm.haveMore = true;
        getActivities();
      } else {
        var params = {
          id: vm.taskId,
          limit: 16,
          date: latestActivityTimestamp,
          onlyComments: vm.onlyComments
        };
        vm.isLoading = true;
        NstSvcTaskActivityFactory.getAfter(params).then(function (activities) {
          findLatestTimestamp(activities);
          vm.activities.push.apply(vm.activities, activities);
          vm.activities = _.unionBy(vm.activities, 'id');
          vm.activityCount = vm.activities.length;
          vm.isLoading = false;
          // $scope.scrollEnd();
          if (activities.length === 16) {
            $timeout(getRecentActivities, 100);
          }
        });
      }
    }

    eventReferences.push($rootScope.$on(NST_TASK_EVENT_ACTION.TASK_ACTIVITY, taskActivityHandler));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
