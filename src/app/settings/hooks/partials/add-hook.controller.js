(function () {
  'use strict';

  angular
    .module('ronak.nested.web.hook')
    .controller('AddHookController', AddHookController);

  function AddHookController($scope, toastr, NstSvcHookFactory, NstSvcTranslation, NST_HOOK_EVENT_TYPE, NstSvcAuth, NstSvcPlaceFactory, _) {
    var vm = this;
    vm.intiatlLoading = true;
    vm.NST_HOOK_EVENT_TYPE = NST_HOOK_EVENT_TYPE;
    vm.createHook = createHook;
    vm.hookType = '1';
    vm.model = {
      id: NstSvcAuth.user.id,
      name: '',
      eventType: '',
      url: ''
    };
    vm.selecteds = [];
    vm.suggests = [];
    vm.searchMore = searchMore;
    vm.suggestPickerConfig = {
      limit : 100,
      suggestsLimit: 8,
      singleRow: false,
      mode: 'place',
      alwaysVisible: false,
      placeholder: NstSvcTranslation.get('Select from below or type...')
    };
    (function(){
      NstSvcPlaceFactory.getPlacesWithCreatorFilter().then(function(items){
        vm.suggests = items;
        vm.loaded = true;
      });
    })();
    function createHook() {
      if (!vm.model.eventType) {
        return;
      }
      var submitModel = vm.model;

      if (submitModel.name === '') {
        submitModel.name = submitModel.url
      }

      if (vm.model.eventType !== NST_HOOK_EVENT_TYPE.HOOK_EVENT_TYPE_ACCOUNT_TASK_ASSIGNED) {
        _.forEach(vm.selecteds, function(place){
          submitModel.id = place.id;
          NstSvcHookFactory.addPlaceHook(submitModel).then(function (res) {
            $scope.$dismiss();
          }).catch(function (e){
            if(e.code === 6) {
              toastr.error(NstSvcTranslation.get("You have no control access to that Place"));
            }
          });
        });
      } else {
        NstSvcHookFactory.addAccountHook(submitModel).then(function (res) {
          $scope.$dismiss();
        });
      }
    }
    function searchMore() {}
    function suggestsUpdated() {}
  }
})();
