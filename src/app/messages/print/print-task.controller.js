(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('PrintTaskController', PrintTaskController);

  /** @ngInject */
  function PrintTaskController($scope, $stateParams,
                          _, toastr, NstSvcTaskFactory, NstSvcPostInteraction, NstSvcTranslation, NstSvcSync, NstSvcTaskUtility) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.taskId = $stateParams.taskId;
    vm.loadProgress = false;
    vm.emptyFunc = function(){};
    vm.now = new Date();

    vm.model = {
      isRelated: false,
      relatedTask: null,
      childTasks: [],
      titleLengthLimit: 64,
      descriptionLengthLimit: 511,
      assignor: null,
      status: null,
      progress: -1,
      counters: {},
      title: '',
      assignees: [],
      dueDateText: null,
      dueDate: null,
      hasDueTime: false,
      description: '',
      todos: [],
      attachments: [],
      watchers: [],
      editors: [],
      labels: [],
      access: null
    };
    vm.getTaskIcon = NstSvcTaskUtility.getTaskIcon;
    /*****************************
     ***** Controller Methods ****
     *****************************/


    (function () {
      vm.loadProgress = true;
      load()
    })();


    function importTaskData(task) {
      vm.model.status = task.status;
      vm.model.progress = task.progress;

      vm.model.title = task.title;
      vm.model.assignor = task.assignor;
      vm.model.counters = task.counters;
      vm.model.access = task.access;

      if (task.assignee !== undefined) {
        vm.model.assignees = {
          init: true,
          data: [task.assignee]
        };
      } else if (task.candidates !== undefined) {
        vm.model.assignees = {
          init: true,
          data: task.candidates
        };
        // vm.isInCandidateMode = true;
      }

      if (task.dueDate !== undefined && task.dueDate !== 0) {
        vm.model.dueDate = task.dueDate / 1000;
        vm.model.hasDueTime = task.hasDueTime;
        // vm.enableDue = true;
      } else {
        vm.model.dueDate = null;
      }

      if (task.description !== undefined && _.trim(task.description).length > 0) {
        vm.model.description = task.description;
        vm.enableDescription = true;
      }

      if (task.todos !== undefined && task.todos.length > 0) {
        vm.model.todos = task.todos;
        vm.enableTodo = true;
      }

      if (task.attachments !== undefined && task.attachments.length > 0) {
        vm.model.attachments = {
          init: true,
          data: task.attachments
        };
        vm.enableAttachment = true;
      }

      if (task.watchers !== undefined && task.watchers.length > 0) {
        vm.model.watchers = {
          init: true,
          data: task.watchers
        };
        vm.enableWatcher = true;
      }

      if (task.editors !== undefined && task.editors.length > 0) {
        vm.model.editors = {
          init: true,
          data: task.editors
        };
        vm.enableEditor = true;
      }

      if (task.labels !== undefined && task.labels.length > 0) {
        vm.model.labels = {
          init: true,
          data: task.labels
        };
        vm.enableLabel = true;
      }

      if (task.relatedTask !== undefined) {
        vm.model.isRelated = true;
        vm.model.relatedTask = task.relatedTask;
      }

      if (task.childTasks !== undefined) {
        vm.model.childTasks = task.childTasks;
      }
    }

    function load() {
      NstSvcTaskFactory.get(vm.taskId, function (task) {
        importTaskData(task)
        vm.loading = false;
      }).then(function (task) {
        importTaskData(task)
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error occured while tying to show the task.'));
      }).finally(function (){
        vm.loadProgress = false;
      });

    }

    $scope.$on('$destroy', function () {
    });
  }

})();
