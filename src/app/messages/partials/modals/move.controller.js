(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('MovePlaceController', MovePlaceController);

  function MovePlaceController($timeout, $uibModalInstance, $interval,
    toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    postId, selectedPlace, postPlaces, multi) {
    var vm = this;
    var SEARCH_PLACE_LIMIT = 3;
    vm.selectedPlace = selectedPlace;
    vm.search = _.debounce(_.partial(search, postPlaces, selectedPlace, SEARCH_PLACE_LIMIT), 256);
    vm.replace = _.partial(replace, postId, vm.selectedPlace);
    vm.setTargetPlace = setTargetPlace;
    vm.getMoveButtonLabel = getMoveButtonLabel;
    vm.resultTargets = [];
    vm.searchProgress = false;
    vm.replaceProgress = false;
    vm.targetPlace = null;
    vm.ready = false;
    $timeout(function () {
      vm.ready = true;
    }, 500);

    (function () {
      search(postPlaces, selectedPlace, 3, "");
    })();

    function search(postPlaces, selectedPlace, limit, keyword) {
      vm.searchPlaceProgress = true;

      NstSvcPlaceFactory.getPlacesWithCreatorFilter().then(function (places) {
        vm.resultTargets = _.chain(places)
          .filter(_.partial(searchCriteria, keyword))
          .uniqBy('id')
          .reject({ id : selectedPlace.id })
          .differenceBy(postPlaces, 'id')
          .take(limit).value();

      }).catch(function () {
        vm.resultTargets = [];
      }).finally(function () {
        vm.searchPlaceProgress = false;
      });
    }

    function searchCriteria(keyword, place) {
      keyword = _.lowerCase(keyword);
      var placeName = _.lowerCase(place.name);
      return _.includes(placeName, keyword) || _.includes(place.id, keyword);
    }

    function replace(postId, selectedPlace, targetPlace) {
      vm.replaceProgress = true;

      if ( multi ) {
        var postsC = postId.length;
        var successC = [];
        var failedC = [];
        for (var i = 0; i < postsC; i++) {
          NstSvcPostFactory.movePlace(postId[i], selectedPlace.id, targetPlace.id).then(function (result) {
            successC.push(result.postId);
          }).catch(function () {
            failedC.push('');
          }).finally(function () {
            vm.replaceProgress = false;
          });
        }
        var inter = $interval(function () {
          if (postsC === successC.length + failedC.length) {
            $interval.cancel(inter);
            if ( postsC === successC.length ) {
              toastr.success(NstUtility.string.format(NstSvcTranslation.get("The posts has been successfully moved from <b>{0}</b> to <b>{1}</b>."), selectedPlace.name, targetPlace.name));
            } else {
              toastr.warning(NstUtility.string.format(NstSvcTranslation.get("The {0} posts moved successfully and {1} did not move to <b>{2}</b>."), successC.length, failedC.length, targetPlace.name));
            }
            $uibModalInstance.close({
              success : successC,
              failed : failedC,
              fromPlace: selectedPlace,
              toPlace: targetPlace
            });
          }
        }, 100);
      } else {

        NstSvcPostFactory.movePlace(postId, selectedPlace.id, targetPlace.id).then(function () {
          toastr.success(NstUtility.string.format(NstSvcTranslation.get("The post has been successfully moved from <b>{0}</b> to <b>{1}</b>."), selectedPlace.name, targetPlace.name));
        }).catch(function () {
          toastr.error(NstUtility.string.format(NstSvcTranslation.get("An error occured while trying to move from <b>{0}</b> to <b>{1}</b>"), selectedPlace.name, targetPlace.name));
        }).finally(function () {
          vm.replaceProgress = false;
        })
        $uibModalInstance.close({
          fromPlace: selectedPlace,
          toPlace: targetPlace
        });
      }


    }

    function setTargetPlace(place) {
      vm.targetPlace = place;
    }

    function getMoveButtonLabel(name) {
      return NstUtility.string.format(NstSvcTranslation.get("Move to {0}"), name);
    }
  }

})();
