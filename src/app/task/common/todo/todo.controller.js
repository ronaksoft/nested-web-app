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

  function TaskTodoController($scope, _, toastr, NstSvcTranslation) {
    var vm = this;

    vm.temp = {
      id: -parseInt(_.uniqueId()),
      value: '',
      weight: 1,
      checked: false
    };

    vm.addTodo = addTodo;
    vm.removeTodo = removeTodo;
    vm.removeItems = removeItems;

    function addTodo() {
      // if (_.findIndex(vm.todosData, {value: vm.temp.value}) > -1) {
      //   toastr.warning(NstSvcTranslation.get('This todo already exists!'));
      //   return;
      // }
      if (_.trim(vm.temp.value).length > 0) {
        toastr.warning(NstSvcTranslation.get('Please enter a title'));
        return;
      }
      vm.todosData.push(Object.assign({}, vm.temp));
      vm.temp.id = -parseInt(_.uniqueId());
      vm.temp.value = '';
      vm.temp.checked = false;
    }

    function removeTodo(id) {
      var index = _.findIndex(vm.todosData, {id: id});
      if (index > -1) {
        vm.todosData.splice(index, 1);
      }
    }

    function removeItems () {
      vm.todosData = [];
    }
  }
})();
