(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMainSettingsController', PlaceMainSettingsController);

  /** @ngInject */
  function PlaceMainSettingsController($q, toastr,
    NstSvcPlaceFactory, NstSvcTranslation,
    NST_PLACE_POLICY_OPTION, NST_PLACE_POLICY) {
    var vm = this;

    vm.setAddPostPolicy = setAddPostPolicy;
    vm.updateName = updateName;
    vm.updateDescription = updateDescription;
    vm.setSearchPrivacy = setSearchPrivacy;
    vm.setAddMemberPolicy = setAddMemberPolicy;
    vm.setAddPlacePolicy = setAddPlacePolicy;

    vm.getAddPostPrivacyLevel = getAddPostPrivacyLevel;
    vm.getAddPlacePrivacyLevel = getAddPlacePrivacyLevel;
    vm.getAddMemberPrivacyLevel = getAddMemberPrivacyLevel;

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

    function updateName(value) {
      return update({ 'place_name' : value }).then(function () {
        vm.place.name = value;
      });
    }

    function updateDescription(value) {
      return update({ 'place_desc' : value }).then(function () {
        vm.place.description = value;
      });
    }

    function setAddPostPolicy(value) {
      switch (value) {
        case NST_PLACE_POLICY_OPTION.MANAGERS:
            return update({
              'privacy.receptive': 'off',
              'policy.add_post': 'creators'
            });
        case NST_PLACE_POLICY_OPTION.MEMBERS:
            return update({
              'privacy.receptive': 'off',
              'policy.add_post': 'everyone'
            });
        case NST_PLACE_POLICY_OPTION.TEAMMATES:
            return update({
              'privacy.receptive': 'internal',
              'policy.add_post': 'everyone'
            });
        case NST_PLACE_POLICY_OPTION.EXTERNAL:
            return update({
              'privacy.receptive': 'external',
              'policy.add_post': 'creators'
            });
        default:
        console.log('oops');
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
          newValue = "creators";
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          newValue = "key_holders";
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
          newValue = "creators";
          break;
        case NST_PLACE_POLICY_OPTION.MEMBERS:
          newValue = "key_holders";
          break;
        default:
        return $q.reject(Error("Policy add_place is not valid : " + value));
      }

      return update({ 'policy.add_place' : newValue });
    }

    function getAddPostPrivacyLevel(place) {
      if (place.privacy.receptive === 'off' && place.policy.add_post === 'creators') {
        return NST_PLACE_POLICY_OPTION.MANAGERS;
      } else if (place.privacy.receptive === 'off' && place.policy.add_post === 'everyone') {
        return NST_PLACE_POLICY_OPTION.MEMBERS;
      } else if (place.privacy.receptive === 'internal' && place.policy.add_post === 'everyone') {
        return NST_PLACE_POLICY_OPTION.TEAMMATES;
      } else if (place.privacy.receptive === 'external' && place.policy.add_post === 'everyone') {
        return NST_PLACE_POLICY_OPTION.EVERYONE;
      } else {
        throw Error('Place add_post privacy is not supported');
      }
    }

    function getAddMemberPrivacyLevel(place) {
      switch (place.policy.add_member) {
        case NST_PLACE_POLICY.CREATORS:
          return NST_PLACE_POLICY_OPTION.MANAGERS;
        case NST_PLACE_POLICY.EVERYONE:
          return NST_PLACE_POLICY_OPTION.MEMBERS;
        default:
          throw Error('Place add_member privacy is not supported');
      }
    }

    function getAddPlacePrivacyLevel(place) {
      switch (place.policy.add_place) {
        case NST_PLACE_POLICY.CREATORS:
          return NST_PLACE_POLICY_OPTION.MANAGERS;
        case NST_PLACE_POLICY.EVERYONE:
          return NST_PLACE_POLICY_OPTION.MEMBERS;
        default:
          throw Error('Place add_place privacy is not supported');
      }
    }
  }
})();
