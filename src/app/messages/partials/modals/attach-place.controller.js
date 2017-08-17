(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('AttachPlaceController', AttachPlaceController);

  function AttachPlaceController( $uibModalInstance, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace,
    postId, postPlaces) {

    var vm = this;
    var POST_PLACE_LIMIT = 10;
    var PLACE_SUGGEST_LIMIT = 16;
    vm.getAttachButtonLabel = getAttachButtonLabel;
    vm.postPlaces = postPlaces;
    vm.attachPlaces = _.partial(attachPlaces, postId, postPlaces, POST_PLACE_LIMIT);
    vm.searchPlace = _.partial(searchPlace, postPlaces, PLACE_SUGGEST_LIMIT);
    vm.selectedTargets = [];

    function attachPlaces(postId, postPlaces, limit, places) {
      vm.attachProgress = true;
      var placeIds = _.map(places, 'id');

      if (_.size(placeIds) === 0) {
        vm.attachProgress = false;
        return;
      }

      if (reachedTheLimit(postPlaces, places, limit)) {
        toastr.warning(NstUtility.string.format(NstSvcTranslation.get("A post could not have more than {0} targets, Please remove some."), limit));
        vm.attachProgress = false;
        return;
      }

      NstSvcPostFactory.attachPlaces(postId, placeIds).then(function (result) {
        if (result.allAttached) {
          toastr.success(NstSvcTranslation.get("All places have been attached successfully."));
        } else if (result.noneAttached) {
          toastr.error(NstSvcTranslation.get("You can not attach any of those places!"));
        } else {
          toastr.warning(NstUtility.string.format(
            NstSvcTranslation.get("We had trouble attaching place(s) {0}, but the others have been attached."),
            NstUtility.string.format("<b>{0}</b>", _.join(result.notAttachedPlaces, NstSvcTranslation.get("</b>, <b>")))));
        }

        if (!result.noneAttached) {
          $uibModalInstance.close(_.filter(places, function (place) {
            return _.includes(result.attachedPlaces, place.id);
          }));
        }
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error occured while attaching a place to the post"));
      }).finally(function () {
        vm.attachProgress = false;
      });
    }

    function searchPlace(postPlaces, limit, keyword) {
      vm.searchPlaceProgress = true;

      NstSvcPlaceFactory.searchForCompose(keyword, limit).then(function (result) {
        vm.resultTargets = _.chain(result.places).differenceBy(postPlaces, 'id').uniqBy('id').take(10).value();

        if (_.isString(keyword)
          && _.size(keyword) >= 4
          && _.indexOf(keyword, " ") === -1
          && !_.some(vm.resultTargets, { id : keyword })) {

            var initPlace = new NstTinyPlace();
            initPlace.id = keyword;
            initPlace.name = keyword;
            vm.resultTargets.push(initPlace);
        }
      }).catch(function () {
        vm.resultTargets = [];
      }).finally(function () {
        vm.searchPlaceProgress = false;
      });
    }

    function reachedTheLimit(oldPlaces, newPlaces, limit) {
      return _.size(oldPlaces) + _.size(newPlaces) > limit;
    }

    function getAttachButtonLabel(count) {
      return NstUtility.string.format(NstSvcTranslation.get("Attach {0} Places"), count);
    }
  }

})();
