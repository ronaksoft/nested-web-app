(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('SubmitPhoneStepController', SubmitPhoneStepController);

  /** @ngInject */
  function SubmitPhoneStepController($scope, NstHttp, $q, NstSvcTranslation, toastr) {
    var vm = this;

    var dummyPhone = "123456789";

    vm.validatePhone = validatePhone;
    vm.nextStep = nextStep;
    vm.getPhoneNumber = getPhoneNumber;
    vm.phoneAvailableStatus = 'none';
    vm.autoLocateEnabled = true;
    var autoSubmitReferece = null;

    (function () {
      if (vm.countryCode) {
        vm.autoLocateEnabled = false;
      }

      if (vm.phone && vm.countryCode && vm.instantSubmit) {
        // wait for country select component to bind vm.countryId to be able to validate the provided phone number
        autoSubmitReferece = $scope.$watchGroup([function () {
          return vm.phone;
        },
        function () {
          return vm.countryCode;
        },
        function () {
          return vm.countryId;
        }], function(newValues, oldValues, scope) {
          if (_.every(newValues)) {
            if (autoSubmitReferece) {
              autoSubmitReferece();
            }
            vm.submitted = true;
            validateAndSend(getPhoneNumber());
          }
        });
      }

      vm.ready = true;

    })();

    vm.submitPhoneNumber = function (isValid) {
      vm.submitted = true;
      if (!isValid) {
        return;
      }

      validateAndSend(getPhoneNumber());
    };

    function validateAndSend(phoneNumber) {
      var alreadyRegisteredMessage = NstSvcTranslation.get("We've found an account already registered with your phone number. If you've forgotten your password, try to recover it or contact us for help.");
      validatePhone().then(function (available) {
        if (available) {
          sendPhoneNumber(phoneNumber).then(function (result) {
            nextStep(result.verificationId, phoneNumber);
          }).catch(function (error) {
            if (error === 'phone_number_exists') {
              toastr.error(alreadyRegisteredMessage);
            } else {
              toastr.error(NstSvcTranslation.get("Sorry, an unknown error has occurred."));
            }
          });
        }
      }).catch(function () {
        toastr.error('An error has occured while validating your phone number');
      });
    }

    function nextStep(verificationId, phone) {
      $scope.$emit(vm.onCompleted, {verificationId: verificationId, phone: phone});
    }

    function sendPhoneNumber(phone) {
      var deferred = $q.defer();
      vm.phoneSubmitProgress = true;
      var request = new NstHttp('', {
        cmd: 'auth/get_verification',
        data: {
          phone: phone
        }
      });
      request.post().then(function (data) {
        if (data.status === 'ok') {
          deferred.resolve({
            verificationId: data.data.vid
          });
        } else if (data.status === 'err') {
          if (data.err_code === 5) {
            deferred.reject('phone_number_exists');
          } else {
            deferred.reject('unknown')
          }
        }
      })
        .catch(function (error) {
          deferred.reject(error);
        }).finally(function () {
        vm.phoneSubmitProgress = false;
      });

      return deferred.promise;
    }

    function validatePhone() {
      var deferred = $q.defer();

      if (!vm.phone) {
        vm.phoneIsEmpty = true;
        vm.phoneIsWrong = false;
      } else if (!vm.countryCode) {
        vm.phoneIsEmpty = true;
      } else if (!getPhoneIsValid(vm.countryId, vm.phone)) {
        vm.phoneIsWrong = true;
        vm.phoneIsEmpty = false;
      } else {
        vm.phoneIsWrong = false;
        vm.phoneIsEmpty = false;
      }
      vm.phoneIsValid = !vm.phoneIsWrong && !vm.phoneIsEmpty;
      vm.phoneAvailableStatus = 'available';
      if (vm.phoneIsValid) {
        vm.phoneAvailableStatus = 'checking';
        phoneAvailable(getPhoneNumber()).then(function (available) {
          vm.phoneAvailableStatus = available ? 'available' : 'used';
          deferred.resolve(vm.phoneAvailableStatus === 'available');
        }).catch(function (error) {
          vm.phoneAvailableStatus = 'error';
          deferred.resolve(false);
        });
      } else {
        deferred.resolve(false);
      }


      return deferred.promise;
    }

    function getPhoneIsValid(countryId, phone) {
      if (phone === dummyPhone) {
        return true;
      }
      try {
        return phoneUtils.isValidNumber(phone.toString(), countryId);
      } catch (e) {
        return false;
      }
    }

    function getPhoneNumber() {
      if (vm.countryCode && vm.phone) {
        return vm.countryCode.toString() + _.trimStart(vm.phone.toString(), "0");
      }
      return "";
    }

    function phoneAvailable(phone) {
      var deferred = $q.defer();

      if (!vm.checkPhoneAvailable) {
        deferred.resolve(true);
      } else {
        new NstHttp('',
          {
            cmd: 'auth/phone_available',
            data: {
              'phone': phone
            }
          }).post().then(function (data) {
          if (data.status === 'ok') {
            deferred.resolve(true);
          } else {
            deferred.resolve(false);
          }
        }).catch(deferred.reject);
      }

      return deferred.promise;
    }

    $scope.$on('country-select-changed', function (event, data) {
      if (data && data.code) {
        vm.countryCode = data.code;
        vm.countryId = data.id;

        vm.countryIsValid = true;
      } else {
        vm.countryId = null;

        vm.countryIsValid = false;
      }

      validatePhone();
    });

    function getParameterByName(name) {
      var url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

  }
})();
