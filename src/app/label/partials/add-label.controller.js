(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('addLabelController', addLabelController);

  function addLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace) {

    var vm = this;
    vm.color = 'D';
    vm.labelSelectPlaceHolder = 'Select from below or type label name…';
    vm.targetLimit = 8;
    vm.haveMore = false;
    vm.search = {};
    vm.selectedLabels = [
      {
        color : 'A',
        name : 'Idea',
      },
      {
        color : 'B',
        name : 'ID Cards',
      }
    ];
    vm.search.results = [
      {
        color : 'A',
        name : 'Idea',
      },
      {
        color : 'F',
        name : 'sam',
      },
      {
        color : 'G',
        name : 'ple',
      },
      {
        color : 'B',
        name : 'ID Cards',
      }
    ];
  }

})();
