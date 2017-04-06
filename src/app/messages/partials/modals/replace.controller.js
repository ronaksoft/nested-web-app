(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('ReplaceController', ReplaceController);

  function ReplaceController($timeout, $scope, $q, $uibModalInstance,
    toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    postId, selectedPlace) {
    var vm = this;
    var SEARCH_PLACE_LIMIT = 3;
    vm.selectedPlace = selectedPlace;
    vm.search = _.partial(search, selectedPlace, SEARCH_PLACE_LIMIT);
    vm.replace = _.partial(replace, postId, vm.selectedPlace);
    vm.setTargetPlace = setTargetPlace;
    vm.resultTargets = [];
    vm.searchProgress = false;
    vm.replaceProgress = false;

    function search(selectedPlace, limit, keyword) {
      vm.searchPlaceProgress = true;

      NstSvcPlaceFactory.searchPlacesWithCreatorRole(keyword, limit).then(function (places) {
        vm.resultTargets = _.chain(places).uniqBy('id').reject({ id : selectedPlace.id }).value();
      }).catch(function (error) {
        vm.resultTargets = [];
      }).finally(function () {
        vm.searchPlaceProgress = false;
      });
    }

    function replace(postId, selectedPlace, targetPlace) {
      vm.replaceProgress = true;
      NstSvcPostFactory.movePlace(postId, selectedPlace.id, targetPlace.id).then(function (result) {
        toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been successfully moved from <b>{1}</b> to <b>{2}</b>."), selectedPlace.name, targetPlace.name));
        $uibModalInstance.close();
      }).catch(function (error) {
        toastr.error(NstUtility.string.format(NstSvcTranslation.get("An error occured while trying to move from <b>{0}</b> to <b>{1}</b>"), selectedPlace.name, targetPlace.name));
      }).finally(function () {
        vm.replaceProgress = false;
      });
    }

    function setTargetPlace(place) {
      vm.targetPlace = place;
    }

  }

})();
