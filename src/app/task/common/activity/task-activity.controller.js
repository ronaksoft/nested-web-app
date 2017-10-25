(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskActivityController', TaskActivityController);

  function TaskActivityController($timeout, $scope, _, $q, $state, NstSvcTaskActivityFactory, NST_TASK_EVENT_ACTION,
                                  NstSvcAuth, NstSvcTaskFactory, NstSvcTranslation, toastr, NstTaskActivity, NstSvcUserFactory) {
    var vm = this;
    var eventReferences = [];

    vm.sendComment = sendComment;

    $timeout(function () {
      vm.user = NstSvcAuth.user;
    }, 100);

    vm.activityTypes = NST_TASK_EVENT_ACTION;

    vm.activities = [];

    (function () {
      getActivities(vm.taskId);
    })();

    var init = false;
    $timeout(function () {
      init = true;
    }, 1000);

    $scope.$watch(function () {
      return vm.onlyComments;
    }, function () {
      if (init) {
        getActivities(vm.taskId)
      }
    });

    function getActivities(id) {
      vm.activities = [];
      var setting = {
        id: id,
        onlyComments: vm.onlyComments
      };
      NstSvcTaskActivityFactory.get(setting).then(function (activities) {
        vm.activities = activities;
        vm.activityCount = vm.activities.length;
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
          activity.date = new Date().getTime();
          activity.actor = vm.user;
          activity.comment = {
            id: activityId.id,
            body: commentBody,
            timestamp: activity.date,
            sender: activity.actor,
            removedById: null,
            attachment_id: ''
          };
          vm.activities.push(activity);
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

    function createCommentActivity(comment) {
      var activity = new NstTaskActivity();
      activity.id = comment.id;
      activity.type = NST_TASK_EVENT_ACTION.COMMENT;
      activity.date = comment.timestamp;
      activity.actor = NstSvcUserFactory.parseTinyUser(comment.sender);
      activity.comment = comment;
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

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
