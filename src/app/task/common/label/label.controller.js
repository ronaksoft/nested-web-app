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

  function TaskLabelController($scope, $q, NstSvcLabelFactory, _) {
    var vm = this;

    vm.labelInput = '';
    vm.labels = [];
    vm.labelKeyDown = labelKeyDown;
    vm.removeLabelChip = removeLabelChip;

    function getLabelsData(labels) {
      var promises;
      //TODO
      promises = _.map(labels, function (item) {
        return NstSvcLabelFactory.get(item);
      });
      $q.all(promises).then(function (lists) {
        vm.labelsData = lists;
      });
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
      var index = _.indexOf(vm.labels, id);
      if (index > -1) {
        vm.labels.splice(index, 1);
      }
      index = _.findIndex(vm.labelsData, {id: id});
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
        getLabelsData(vm.labels);
        vm.labelInput = '';
      }
    }
  }
})();
