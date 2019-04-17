(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskActivityController', TaskActivityController);

  function TaskActivityController($timeout, $scope, $rootScope, _, $q, $state, NstSvcTaskActivityFactory,
                                  NST_TASK_EVENT_ACTION, NstSvcAuth, NstSvcTaskFactory, NstSvcTranslation,
                                  toastr, NstTaskActivity, NstSvcUserFactory, NstSvcDate, NstSvcTaskUtility, NstSvcModal) {
    var vm = this;
    $scope.fullFilled = true;
    var eventReferences = [];
    var latestActivityTimestamp = -1;
    vm.setting = {};
    $scope.loadMore = getActivities;
    vm.isLoading = false;
    vm.haveMore = true;
    vm.initiateScroll = true;

    reset();

    vm.sendComment = sendComment;
    vm.retrySendComment = retrySendComment;
    vm.removeCommentRef = removeCommentRef;

    vm.user = undefined;
    NstSvcTaskUtility.getValidUser(vm, NstSvcAuth);

    $scope.scrollEnd = function() {}; // will be Overrided by directive stickBottomScroll
    vm.activityTypes = NST_TASK_EVENT_ACTION;

    vm.activities = [];
    $scope.scrollInstance = {
      maxScrollY : 0
    };

    (getActivities)();

    var init = false;
    $timeout(function () {
      init = true;
    }, 1000);

    eventReferences.push($scope.$watch(function () {
      return vm.onlyComments;
    }, function () {
      reset();
      $scope.isScrolled = false;
      vm.firstLoading = true;
      if (init) {
        getActivities()
      }
    }));

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
        vm.firstLoading = false;
        $scope.$broadcast('scroll-handler', {});
        $timeout(function(){
          if (!$scope.fullFilled) {
            getActivities();
          }
        }, 1024)
      });
    }

    vm.isSendingComment = false;
    var focusOnSentTimeout = null;

    /**
     * send - add the comment to the list of the post comments
     *
     * @param  {Event}  e   keypress event handler
     */
    var resizeTextarea = _.debounce(resize, 100);

    function resize(el) {
      el.style.height = '';
      el.style.height = el.scrollHeight + "px";
    }

    function sendComment(e) {
      // if (vm.isSendingComment) {
      //   return;
      // }
      var element = angular.element(e.target);
      resizeTextarea(e.target);

      if (!sendKeyIsPressed(e) || element.attr('mention') === 'true') {
        return;
      }

      var body = extractCommentBody(e);

      if (body.length === 0) {
        return;
      }

      var activity = new NstTaskActivity();
      var id =  (Math.random() * 10000).toFixed();
      activity.id = id;
      activity.type = NST_TASK_EVENT_ACTION.COMMENT;
      activity.date = NstSvcDate.now();
      activity.actor = NstSvcAuth.user;
      activity.comment = {
        id: id,
        body: body,
        timestamp: NstSvcDate.now(),
        sender: NstSvcAuth.user,
        removedById: null,
        attachmentId: '',
        isSending: true
      };
      vm.activityCount++;

      if (!_.some(vm.activities, {
        id: activity.id
      })) {
        // if (typeof vm.onCommentSent === 'function') {
        //   vm.onCommentSent(activity);
        // } else {
          vm.activities.push(activity);
        // }
      }

      $timeout(function(){
        e.currentTarget.value = '';
        resizeTextarea(e.target);
        if (focusOnSentTimeout) {
          $timeout.cancel(focusOnSentTimeout);
        }
        focusOnSentTimeout = $timeout(function () {
            e.currentTarget.focus();
        }, 2);
      }, 10);

      NstSvcTaskFactory.addComment(vm.taskId, body).then(function (res) {
        // $scope.scrollEnd(true);
        var index = _.findIndex(vm.activities, {id: activity.id});
        if (index > -1) {
          vm.activities[index].id = res.activity_id;
          vm.activities[index].comment.id = res.activity_id;
          vm.activities[index].comment.isSending = false;
        }
      }).catch(function () {
        var index = _.findIndex(vm.activities, {id: activity.id});
        if (index > -1) {
          vm.activities[index].comment.isSending = false;
          vm.activities[index].comment.isFailed = true;
        }
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
      });
    }


    function retrySendComment(commentModel) {
      NstSvcTaskFactory.addComment(vm.taskId, commentModel.body).then(function (activityId) {
        var index = _.findIndex(vm.activities, {id: commentModel.id});
        if (index > -1) {
          vm.activities[index].id = activityId;
          vm.activities[index].comment.id = activityId;
          vm.activities[index].comment.isSending = false;
          vm.activities[index].comment.isFailed = false;
        }
      }).catch(function () {
        var index = _.findIndex(vm.activities, {id: commentModel.id});
        if (index > -1) {
          vm.activities[index].comment.isSending = false;
          vm.activities[index].comment.isFailed = true;
        }
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in sending your comment'));
      });
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
      if (data.type !== NST_TASK_EVENT_ACTION.COMMENT && vm.onlyComments) {
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
          var newActs = _.filter(activities, function(act) {
            return act.actor.id !== NstSvcAuth.user.id
          });
          vm.activities.push.apply(vm.activities, newActs);
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

    function removeCommentRef(id) {
      var index = _.findIndex(vm.activities, {id: id});
      if (index > -1) {
        NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("Are you sure to remove this comment?")).then(function (result) {
          if (result) {
            NstSvcTaskFactory.removeComment(vm.taskId, id).then(function () {
              vm.activities.splice(index, 1);
              vm.activityCount = vm.activities.length;
            }).catch(function () {
              toastr.error(NstSvcTranslation.get('An error has occurred while removing the comment.'));
            });
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
