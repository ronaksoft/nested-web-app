(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('requestLabelController', requestLabelController);

  function requestLabelController($timeout, $scope, $q, $uibModalInstance, $filter,
    moment, toastr, _, NstSvcLabelFactory, NstSvcTranslation, NstUtility, NST_LABEL_SEARCH_FILTER) {

    var vm = this;
    vm.code = 'D';
    vm.label = {
      id: null,
      code: 'A',
      title: ''
    };
    vm.userSelectPlaceHolder = 'Enter username or user-id…';
    vm.newLabel = false;
    vm.editCode = false;
    vm.keyword = '';
    vm.openSuggests = true;
    vm.codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    vm.suggests = [];
    vm.disabled = false;
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
      } else if (vm.label.title.length <= 1) {
        return true;
      }
      return false;
    }

    function requestLabel() {
      vm.disabled = true;
      var labelService;
      if (vm.newLabel) {
        var title = $filter('scapeSpace')(vm.label.title);
        labelService = NstSvcLabelFactory.request(null, title, vm.label.code);
      } else {
        labelService = NstSvcLabelFactory.request(vm.label.id);
      }
      labelService.then(function () {
        toastr.success(NstSvcTranslation.get("Your request submited successfully."));
        $uibModalInstance.close(true);
      }).catch(function(error) {
        if (error.code === 5) {
          toastr.warning(NstSvcTranslation.get("Label request already exists!"));
        } else {
          toastr.error(NstSvcTranslation.get("Something went wrong."));
        }
      }).finally(function () {
        vm.disabled = false;
        $scope.$dismiss();
      });
    }
  }

})();
