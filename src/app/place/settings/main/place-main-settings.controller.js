(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMainSettingsController', PlaceMainSettingsController);

  /** @ngInject */
  function PlaceMainSettingsController($q, NST_PLACE_POLICY_OPTION) {
    var vm = this;

    console.log("PLACE PLACE", vm.place);

    vm.setAddPostPolicy = setAddPostPolicy;
    vm.updateName = updateName;
    vm.updateDescription = updateDescription;
    vm.updateSearchPrivacy = updateSearchPrivacy;

    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcPlaceFactory.update(params).then(function () {
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Sorry, an error has occurred while updating the place information."));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    function updateName(value) {
      return update({ 'name' : value }).then(function () {
        vm.place.name = value;
      });
    }

    function updateDescription(value) {
      return update({ 'description' : value }).then(function () {
        vm.place.description = value;
      });
    }

    function setAddPostPolicy(value) {
      var deferred = $q.defer();

      deferred.resolve();
      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:

          break;
        case NST_PLACE_POLICY_OPTION.TEAMMATES:

          break;
        case NST_PLACE_POLICY_OPTION.EVERYONE:

          break;
        default:
          throw Error("Policy is not valid.")
        break;
      }

      return deferred.promise;
    }

    function updateSearchPrivacy(value) {

      return $q.resolve();
    }
  }
})();
