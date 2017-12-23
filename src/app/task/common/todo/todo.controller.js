/**
 * @file todo.controller.js
 * @desc Controller for task todo
 * @kind {Controller}
 * Documented by:          hamidrezakk < hamidrezakks@gmail.com >
 * Date of documentation:  2017-10-15
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskTodoController', TaskTodoController);

  function TaskTodoController($scope, _) {
    var vm = this;

    if (vm.enableCheck === undefined) {
      vm.enableCheck = true;
    }

    if (vm.addItem === undefined) {
      vm.addItem = true;
    }

    if (vm.removeItem === undefined) {
      vm.removeItem = true;
    }

    vm.temp = {
      id: -parseInt(_.uniqueId()),
      text: '',
      checked: false,
      weight: 1,
      focusTrigger: 0
    };

    vm.addTodo = addTodo;
    vm.updateTodo = updateTodo;
    vm.checkTodo = checkTodo;
    vm.removeTodo = removeTodo;
    vm.removeItems = removeItems;
    vm.addAfterTodo = addAfterTodo;

    vm.previousTodo = previousTodo;

    function addTodo() {
      // if (_.findIndex(vm.todosData, {text: vm.temp.text}) > -1) {
      //   toastr.warning(NstSvcTranslation.get('This todo already exists!'));
      //   return;
      // }
      if (_.trim(vm.temp.text).length === 0) {
        // toastr.warning(NstSvcTranslation.get('Please enter a title'));
        return;
      }
      vm.todosData.push(Object.assign({}, vm.temp));
      vm.temp.id = -parseInt(_.uniqueId());
      vm.temp.text = '';
      vm.temp.checked = false;
    }

    function updateTodo(id) {
      var index = _.findIndex(vm.todosData, {id: id});
      if (_.trim(vm.todosData[index].text).length === 0) {
        // toastr.warning(NstSvcTranslation.get('Please enter a title'));
        return;
      }
      if (_.isFunction(vm.updateItem)) {
        vm.updateItem(index, vm.todosData[index]);
      }
    }

    function checkTodo(id) {
      var index = _.findIndex(vm.todosData, {id: id});
      if (_.isFunction(vm.checkItem)) {
        vm.checkItem(index, vm.todosData[index]);
      }
    }

    function removeTodo(id) {
      if (vm.removeItem !== true) {
        return;
      }
      var index = _.findIndex(vm.todosData, {id: id});
      if (index > -1) {
        vm.todosData.splice(index, 1);
        vm.todoFocusMe++;
      }
    }

    function removeItems () {
      vm.todosData = [];
    }

    function previousTodo() {
      if (vm.todosData.length > 0) {
        vm.todosData[vm.todosData.length - 1].focusTrigger++;
      }
    }

    function addAfterTodo(id) {
      var index = _.findIndex(vm.todosData, {id: id});
      if (index > -1) {
        if (_.trim(vm.todosData[index].text).length === 0) {
          return;
        }
        vm.todosData.splice(index + 1, 0, {
          id: -parseInt(_.uniqueId()),
          text: '',
          checked: false,
          weight: 1,
          focusTrigger: 0
        });
        vm.todosData[index + 1].focusTrigger++;
      }
    }
  }
})();
