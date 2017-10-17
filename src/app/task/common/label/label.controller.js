/**
 * @file label.controller.js
 * @desc Controller for task label
 * @kind {Controller}
 * Documented by:          hamidrezakk < hamidrezakks@gmail.com >
 * Date of documentation:  2017-10-14
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .controller('TaskLabelController', TaskLabelController);

  function TaskLabelController($scope, _) {
    var vm = this;

    vm.labelInput = '';
    vm.labels = [];
    vm.mentionLabelsData = [];
    vm.labelKeyUp = labelKeyUp;
    vm.labelKeyDown = labelKeyDown;
    vm.removeLabelChip = removeLabelChip;
    vm.removeItems = removeItems;

    function removeRedundantLabels(labels, labelsData) {
      var tempList = [];
      _.forEach(labels, function (label) {
        var index = _.findIndex(labelsData, {title: label});
        if (index > -1) {
          tempList.push(labelsData[index]);
        }
      });
      return tempList;
    }

    function parseMentionData(data) {
      data = data.replace(/, /g, ',');
      data = data.split(',');
      data = _.map(data, function (item) {
        return _.trim(item);
      });
      data = _.filter(data, function (item) {
        return item.length > 1;
      });
      return data;
    }

    function removeLabelChip(id) {
      if (_.isObject(id)) {
        id = id.title;
      }
      var index = _.indexOf(vm.labels, id);
      if (index > -1) {
        vm.labels.splice(index, 1);
      }
      index = _.findIndex(vm.labelsData, {title: id});
      if (index > -1) {
        vm.labelsData.splice(index, 1);
      }
    }

    function labelKeyDown(event) {
      if (event.keyCode === 13) {
        _.forEach(parseMentionData(vm.labelInput), function (item) {
          vm.labels.push(item);
        });
        vm.labels = _.uniq(vm.labels);
        vm.labelsData = removeRedundantLabels(vm.labels, vm.mentionLabelsData);
        vm.labelInput = '';
      }
    }

    var inputLastValue = '';
    function labelKeyUp(event) {
      if (event.keyCode === 8 && inputLastValue === '') {
        if (vm.labels.length > 0 && vm.labelsData.length > 0) {
          /*var text = */vm.labels.pop();
          vm.labelsData.pop();
          // vm.labelInput = text.substr(0, text.length - 1);
        }
      }
      inputLastValue = vm.labelInput;
    }

     function removeItems () {
       vm.labels = [];
       vm.labelsData = [];
       vm.mentionLabelsData = [];
    }
  }
})();
