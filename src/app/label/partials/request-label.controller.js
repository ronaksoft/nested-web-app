(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('requestLabelController', requestLabelController);

  function requestLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace) {

    var vm = this;
    vm.color = 'D';
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.holders = 'all';
    vm.editColor = false;
    vm.searchQ = '';
    vm.color = 'A';
    vm.openSuggests = true;
    vm.colorPalette = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    vm.changeColor = changeColor
    vm.suggestClickHandler = suggestClickHandler
    vm.inputKeyUpHandler = inputKeyUpHandler
    vm.suggests = [
      {
        color : 'A',
        name : 'Idea',
      },
      {
        color : 'B',
        name : 'ID Cards',
      }
    ];
    function changeColor(color){
      vm.color = color;
    }
    function suggestClickHandler(suggest){
      vm.searchQ = suggest.name;
      vm.openSuggests = false;
    }
    function inputKeyUpHandler(e){
      vm.openSuggests = true;
    }
    
  }

})();
