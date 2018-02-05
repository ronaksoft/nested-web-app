(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('AttachPlaceController', AttachPlaceController);

  function AttachPlaceController( $scope, $uibModalInstance, toastr, _,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcTranslation, NstUtility,
    NstTinyPlace, NstVmSelectTag,
    postId, postPlaces) {
    var eventReferences = [];
    var vm = this;
    vm.keyword = '';
    vm.suggestPickerConfig = {
      limit : 10,
      suggestsLimit: 16,
      singleRow: false,
      alwaysVisible: false,
      autoFocus: true,
      placeholder: NstSvcTranslation.get('Enter a Place name or a Nested address...')
    };
    vm.getAttachButtonLabel = getAttachButtonLabel;
    vm.searchMore = searchMore;
    vm.postPlaces = postPlaces;
    vm.attachPlaces = _.partial(attachPlaces, postId, postPlaces, vm.suggestPickerConfig.limit);
    vm.searchPlace = _.partial(searchPlace, postPlaces, vm.suggestPickerConfig.suggestsLimit);
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

    function searchPlace(postPlaces, limit) {
      vm.searchPlaceProgress = true;

      NstSvcPlaceFactory.searchForCompose(vm.keyword, limit).then(function (result) {
        vm.resultTargets = _.chain(result.places).differenceBy(postPlaces, 'id').uniqBy('id').take(10).map(function (place) {
          return new NstVmSelectTag(place);
        }).value();

        if (_.isString(vm.keyword)
          && _.size(vm.keyword) >= 4
          && _.indexOf(vm.keyword, " ") === -1
          && !_.some(vm.resultTargets, { id : vm.keyword })) {

            var initPlace = new NstTinyPlace();
            initPlace.id = vm.keyword;
            initPlace.name = vm.keyword;
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

    function searchMore() {
      vm.suggestPickerConfig.suggestsLimit++;
      return vm.searchPlace(vm.postPlaces, vm.suggestPickerConfig.limit);
    }

    eventReferences.push($scope.$watch(function () {
      return vm.keyword
    }, function(keyword){return vm.searchPlace(vm.postPlaces, vm.suggestPickerConfig.limit)}, true));

    function getAttachButtonLabel(count) {
      return NstUtility.string.format(NstSvcTranslation.get("Attach {0} Places"), count);
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });
  }

})();
