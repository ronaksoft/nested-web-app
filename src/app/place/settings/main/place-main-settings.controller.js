/**
 * @file src/app/place/settings/main/place-main-settings.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A place settings
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.place')
    .controller('PlaceMainSettingsController', PlaceMainSettingsController);

  /** @ngInject */
  /**
   * The main settings of a place
   *
   * @param {any} $q
   * @param {any} toastr
   * @param {any} NstSvcPlaceFactory
   * @param {any} NstSvcTranslation
   * @param {any} NstSvcLogger
   * @param {any} NST_PLACE_POLICY_OPTION
   * @param {any} NST_PLACE_POLICY
   * @param {any} NST_PLACE_POLICY_RECEPTIVE
   */
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

    /**
     * Requests for updating a place settings
     *
     * @param {any} params
     * @returns
     */
    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcPlaceFactory.update(vm.place.id, params).then(function () {
        deferred.resolve();
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error has occurred while trying to update the place settings.'));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    /**
     * Updates a place name, then closes the edit modal
     *
     * @param {any} isValid
     * @param {any} value
     * @param {any} $close
     * @returns
     */
    function updateName(isValid, value, $close) {
      if (!isValid) {
        return;
      }

      return update({ 'place_name' : value }).then(function () {
        vm.place.name = value;
        $close();
      });
    }

    /**
     * Updates a place description, then closes the edit modal
     *
     * @param {any} isValid
     * @param {any} value
     * @param {any} $close
     * @returns
     */
    function updateDescription(isValid, value, $close) {
      if (!isValid) {
        return;
      }

      return update({ 'place_desc' : value }).then(function () {
        vm.place.description = value;
        $close();
      });
    }

    /**
     * Updates a place privacy.receptive and policy.add_post regarding
     * the selected type of policy for add_post
     *
     * @param {any} value
     * @returns
     */
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

    /**
     * Turns off/on privacy.search of the place
     *
     * @param {any} value
     * @returns
     */
    function setSearchPrivacy(value) {
      return update({ 'privacy.search' : value });
    }

    /**
     * Updates policy.add_member of a place
     *
     * @param {any} value
     * @returns
     */
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

    /**
     * Updates policy.add_place of a place
     *
     * @param {any} value
     * @returns
     */
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

    /**
     * Maps the place privacy and policy to the options that user is abel to select
     *
     * @param {any} place
     * @returns
     */
    function getAddPostPrivacyLevel(place) {
      if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.OFF && place.policy.add_post === NST_PLACE_POLICY.CREATORS) {
        return NST_PLACE_POLICY_OPTION.MANAGERS;
      } else if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.OFF && place.policy.add_post === NST_PLACE_POLICY.EVERYONE) {
        return NST_PLACE_POLICY_OPTION.MEMBERS;
      } else if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.INTERNAL && place.policy.add_post === NST_PLACE_POLICY.EVERYONE) {
        return NST_PLACE_POLICY_OPTION.TEAMMATES;
      } else if (place.privacy.receptive === NST_PLACE_POLICY_RECEPTIVE.EXTERNAL) {
        return NST_PLACE_POLICY_OPTION.EVERYONE;
      } else {
        NstSvcLogger.error('The place receptive privacy and add_post policy combination is not expected!');
        return NST_PLACE_POLICY_OPTION.MANAGERS;
      }
    }

    /**
     * Maps the place policy.add_member to the options that the user is able to select
     *
     * @param {any} place
     * @returns
     */
    function getAddMemberPrivacyLevel(place) {
      switch (place.policy.add_member) {
        case NST_PLACE_POLICY.CREATORS:
          return NST_PLACE_POLICY_OPTION.MANAGERS;
        case NST_PLACE_POLICY.EVERYONE:
          return NST_PLACE_POLICY_OPTION.MEMBERS;
        case NST_PLACE_POLICY.NO_ONE:
          return null;
        default:
          NstSvcLogger.error('The place add_member policy is not expected!');
          return NST_PLACE_POLICY_OPTION.MANAGERS;
      }
    }

    /**
     * Maps policy.add_place of the place to the options that the user is able to select
     *
     * @param {any} place
     * @returns
     */
    function getAddPlacePrivacyLevel(place) {
      switch (place.policy.add_place) {
        case NST_PLACE_POLICY.CREATORS:
        case NST_PLACE_POLICY.NO_ONE:
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
