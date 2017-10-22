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
      text: '',
      checked: false,
      weight: 1
    };

    vm.addTodo = addTodo;
    vm.removeTodo = removeTodo;
    vm.removeItems = removeItems;

    function addTodo() {
      // if (_.findIndex(vm.todosData, {text: vm.temp.text}) > -1) {
      //   toastr.warning(NstSvcTranslation.get('This todo already exists!'));
      //   return;
      // }
      if (_.trim(vm.temp.text).length === 0) {
        toastr.warning(NstSvcTranslation.get('Please enter a title'));
        return;
      }
      vm.todosData.push(Object.assign({}, vm.temp));
      vm.temp.id = -parseInt(_.uniqueId());
      vm.temp.text = '';
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
