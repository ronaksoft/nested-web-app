(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('requestLabelController', requestLabelController);

  function requestLabelController($timeout, $scope, $q, $uibModalInstance,
    moment, toastr, _, NstSvcLabelFactory, NstSvcTranslation, NstUtility, NST_LABEL_SEARCH_FILTER) {

    var vm = this;
    vm.code = 'D';
    vm.label = {
      id: '',
      code: 'A',
      title: '',
    };
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.newLabel = false;
    vm.editCode = false;
    vm.keyword = '';
    vm.openSuggests = true;
    vm.codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    vm.suggests = [];
    vm.changeColor = changeColor;
    vm.suggestClickHandler = suggestClickHandler;
    vm.requestNewLabel = requestNewLabel;
    vm.inputKeyUpHandler = _.debounce(inputKeyUpHandler, 512);
    vm.isNotValid = isNotValid;
    vm.requestLabel = requestLabel;

    function changeColor(code) {
      vm.label.code = code;
    }

    function suggestClickHandler(suggest) {
      vm.label = suggest;
      vm.keyword = suggest.title;
      vm.newLabel = false;
      vm.openSuggests = false;
    }

    function inputKeyUpHandler() {
      vm.openSuggests = true;
      searchLabel();
    }

    function searchLabel() {
      if (vm.keyword.length > 1) {
        NstSvcLabelFactory.search(vm.keyword, NST_LABEL_SEARCH_FILTER.PRIVATES).then(function (result) {
          vm.suggests = result;
        });
      } else {
        vm.suggests = [];
      }
    }

    function requestNewLabel() {
      vm.newLabel = true;
      vm.openSuggests = false;
      vm.label.id = null;
      vm.label.title = vm.keyword;
    }

    function isNotValid() {
      if (!vm.newLabel) {
        if (vm.label.id !== null) {
          return false;
        } else {
          return true;
        }
      } else if (vm.label.title.length <= 3) {
        return true;
      }
      return false;
    }

    function requestLabel() {
      var labelService;
      if (vm.newLabel) {
        labelService = NstSvcLabelFactory.request(null, vm.label.title, vm.label.code);
      } else {
        labelService = NstSvcLabelFactory.request(vm.label.id);
      }
      labelService.then(function (result) {
        toastr.success(NstSvcTranslation.get("Your request submited successfully."));
      }).catch(function(error) {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      }).finally(function () {
        $scope.$dismiss();
      });
    }
  }

})();
