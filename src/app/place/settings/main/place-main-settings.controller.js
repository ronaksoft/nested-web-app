(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMainSettingsController', PlaceMainSettingsController);

  /** @ngInject */
  function PlaceMainSettingsController($q, toastr,
    NstSvcPlaceFactory, NstSvcTranslation, NstSvcLogger,
    NST_PLACE_POLICY_OPTION, NST_PLACE_POLICY, NST_PLACE_POLICY_RECEPTIVE) {
    var vm = this;

    vm.setAddPostPolicy = setAddPostPolicy;
    vm.updateName = updateName;
    vm.updateDescription = updateDescription;
    vm.setSearchPrivacy = setSearchPrivacy;
    vm.setAddMemberPolicy = setAddMemberPolicy;
    vm.setAddPlacePolicy = setAddPlacePolicy;

    (function () {
      vm.addPostLevel = getAddPostPrivacyLevel(vm.place);
      vm.addPlaceLevel = getAddPlacePrivacyLevel(vm.place);
      vm.addMemberLevel = getAddMemberPrivacyLevel(vm.place);

    })();

    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcPlaceFactory.update(vm.place.id, params).then(function () {
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error has occured while trying to update the place settings.'));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    function updateName(isValid, value, $close, $dismiss) {
      if (!isValid) {
        return;
      }

      return update({ 'place_name' : value }).then(function () {
        vm.place.name = value;
        $close();
      });
    }

    function updateDescription(isValid, value, $close, $dismiss) {
      if (!isValid) {
        return;
      }

      return update({ 'place_desc' : value }).then(function () {
        vm.place.description = value;
        $close();
      });
    }

    function setAddPostPolicy(value) {
      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
            return update({
              'privacy.receptive': NST_PLACE_POLICY_RECEPTIVE.OFF,
              'policy.add_post': NST_PLACE_POLICY.CREATORS
            });
        case NST_PLACE_POLICY_OPTION.MEMBERS:
            return update({
              'privacy.receptive': NST_PLACE_POLICY_RECEPTIVE.OFF,
              'policy.add_post': NST_PLACE_POLICY.EVERYONE
            });
        case NST_PLACE_POLICY_OPTION.TEAMMATES:
            return update({
              'privacy.receptive': NST_PLACE_POLICY_RECEPTIVE.INTERNAL,
              'policy.add_post': NST_PLACE_POLICY.EVERYONE
            });
        case NST_PLACE_POLICY_OPTION.EVERYONE:
            return update({
              'privacy.receptive': NST_PLACE_POLICY_RECEPTIVE.EXTERNAL,
              'policy.add_post': NST_PLACE_POLICY.EVERYONE
            });
        default:
          return $q.reject(Error("Policy add_post is not valid : " + value));
      }
    }

    function setSearchPrivacy(value) {
      return update({ 'privacy.search' : value });
    }

    function setAddMemberPolicy(value) {
      var newValue = null;

      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
          newValue = NST_PLACE_POLICY.CREATORS;
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          newValue = NST_PLACE_POLICY.EVERYONE;
          break;
        default:
        return $q.reject(Error("Policy add_member is not valid : " + value));
      }

      return update({ 'policy.add_member' : newValue });
    }

    function setAddPlacePolicy(value) {
      var newValue = null;

      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
          newValue = NST_PLACE_POLICY.CREATORS;
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          newValue = NST_PLACE_POLICY.EVERYONE;
          break;
        default:
        return $q.reject(Error("Policy add_place is not valid : " + value));
      }

      return update({ 'policy.add_place' : newValue });
    }

    function getAddPostPrivacyLevel(place) {
      if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.OFF && place.policy.add_post === NST_PLACE_POLICY.CREATORS) {
        return NST_PLACE_POLICY_OPTION.MANAGERS;
      } else if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.OFF && place.policy.add_post === NST_PLACE_POLICY.EVERYONE) {
        return NST_PLACE_POLICY_OPTION.MEMBERS;
      } else if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.INTERNAL && place.policy.add_post === NST_PLACE_POLICY.EVERYONE) {
        return NST_PLACE_POLICY_OPTION.TEAMMATES;
      } else if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.EXTERNAL && place.policy.add_post === NST_PLACE_POLICY.EVERYONE) {
        return NST_PLACE_POLICY_OPTION.EVERYONE;
      } else {
        NstSvcLogger.error('The place receptive privacy and add_post policy combination is not expected!');
        return NST_PLACE_POLICY_OPTION.MANAGERS;
      }
    }

    function getAddMemberPrivacyLevel(place) {
      switch (place.policy.add_member) {
        case NST_PLACE_POLICY.CREATORS:
          return NST_PLACE_POLICY_OPTION.MANAGERS;
        case NST_PLACE_POLICY.EVERYONE:
          return NST_PLACE_POLICY_OPTION.MEMBERS;
        default:
          NstSvcLogger.error('The place add_member policy is not expected!');
          return NST_PLACE_POLICY_OPTION.MANAGERS;
      }
    }

    function getAddPlacePrivacyLevel(place) {
      switch (place.policy.add_place) {
        case NST_PLACE_POLICY.CREATORS:
          return NST_PLACE_POLICY_OPTION.MANAGERS;
        case NST_PLACE_POLICY.EVERYONE:
          return NST_PLACE_POLICY_OPTION.MEMBERS;
        default:
          NstSvcLogger.error('The place add_place policy is not expected!');
          return NST_PLACE_POLICY_OPTION.MANAGERS;
      }
    }
  }
})();
