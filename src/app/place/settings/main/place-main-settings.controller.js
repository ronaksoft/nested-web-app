(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMainSettingsController', PlaceMainSettingsController);

  /** @ngInject */
  function PlaceMainSettingsController() {
    var vm = this;

    vm.setAddPostPolicy = setAddPostPolicy;
    vm.updateName = updateName;
    vm.updateDescription = updateDescription;

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
      switch (value) {
        case 'managers':

          break;
        case 'members':

          break;
        case 'grand-members':

          break;
        case 'everyone':
          
          break;
        default:
          throw Error("Policy is not valid.")
        break;
      }
    }
  }
})();
