/**
 * @file app/messages/post-card.controller.js
 * @author robzizo < me@robzizo.ir >
 * @description controller for post card directive
 *              Documented by:          robzizo
 *              Date of documentation:  2017-07-25
 *              Reviewed by:            -
 *              Date of review:         -
 */
(function () {
    'use strict';
  
    angular
      .module('ronak.nested.web.message')
      .controller('TaskCardController', TaskCardController);
  
    function TaskCardController($state, $log, $timeout, $stateParams, $rootScope, $scope, $uibModal,
                                _, NST_TASK_PROGRESS_ICON, NstSvcAuth, $) {
      var vm = this;
      vm.statuses = NST_TASK_PROGRESS_ICON;

      vm.goToTask = function() {
        return $state.go('app.task.edit', {
          taskId: vm.task.id
        }, {
          notify: false
        });
      }
    }
  
  })();
  