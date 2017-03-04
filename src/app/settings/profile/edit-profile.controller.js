(function () {
  'use strict';

  angular
    .module('ronak.nested.web.settings')
    .controller('EditProfileController', EditProfileController);

  /** @ngInject */
  function EditProfileController($rootScope, $scope, $stateParams, $state, $q, $uibModal, $timeout, $log, $window,
                                 toastr, moment,
                                 NST_STORE_UPLOAD_TYPE, NST_DEFAULT, NST_NAVBAR_CONTROL_TYPE, NstPicture,
                                 NstSvcAuth, NstSvcStore, NstSvcUserFactory, NstUtility, NstSvcTranslation, NstSvcI18n, NstSvcPlaceFactory) {
    var vm = this;

    vm.updateName = updateName;
    vm.updateGender = updateGender;
    vm.updateSearchable = updateSearchable;
    vm.updateDateOfBirth = updateDateOfBirth;
    vm.getGender = getGender;


    vm.genders = [
      {key: 'u', title: NstSvcTranslation.get("Undefined")},
      {key: 'm', title: NstSvcTranslation.get("Male")},
      {key: 'f', title: NstSvcTranslation.get("Female")},
      {key: 'o', title: NstSvcTranslation.get("Other")}
    ];

    (function () {

      vm.model = NstSvcAuth.user;

    })();


    function update(params) {
      var deferred = $q.defer();

      vm.updateProgress = true;
      NstSvcUserFactory.update(params).then(function () {
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("Sorry, an error has occurred while updating your profile."));
        deferred.reject();
      }).finally(function () {
        vm.updateProgress = false;
      });

      return deferred.promise;
    }

    function updateName(firstName, lastName, $close, $dismiss) {
      return update({
        'firstName' : firstName,
        'lastName' : lastName
      }).then(function () {
        vm.model.firstName = firstName;
        vm.model.lastName = lastName;
        $close();
      });
    }

    function updateDateOfBirth(value) {
      return update({
        'dateOfBirth' : value
      }).then(function () {
        vm.model.dateOfBirth = value;
      });
    }

    function updateGender(value, $close) {
      return update({
        'gender' : value
      }).then(function () {
        vm.model.gender = value;
        $close();
      });
    }

    function updateSearchable(value) {
      return update({
        'searchable' : value
      }).then(function () {
        vm.model.searchable = value;
      });
    }

    function getGender() {
      var selected = _.find(vm.genders, { key : vm.model.gender });

      return selected ? selected.title : vm.genders[0].title;
    }
  }
})();
