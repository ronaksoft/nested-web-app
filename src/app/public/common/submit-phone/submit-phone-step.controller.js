/**
 * @file src/app/public/common/submit-phone/submit-phone-step.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user submits her phone number and receives a verification code.
 * This is reusable component and has been used in register and recover-password components as the first step
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-05
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('SubmitPhoneStepController', SubmitPhoneStepController);

  /** @ngInject */
  /**
   * The component gives you a list of countries and lets you one and submit your phone number.
   *
   * @param {any} $scope
   * @param {any} NstHttp
   * @param {any} $q
   * @param {any} NstSvcTranslation
   * @param {any} toastr
   */
  function SubmitPhoneStepController($scope, NstHttp, $q, NstSvcTranslation, toastr, _) {
    var vm = this;

    // This phone number is for test purpose only and you wont receive any verification code or call.
    // Use "123456" to verify the phone number. You will get a fake success response if you try to register
    // an account with this phone number.
    var dummyPhone = "123456789";

    vm.validatePhone = validatePhone;
    vm.nextStep = nextStep;
    vm.getPhoneNumber = getPhoneNumber;
    vm.phoneAvailableStatus = 'none';
    vm.autoLocateEnabled = true;
    var autoSubmitReferece = null;

    (function () {
      // If you provide a country code, autolocate feature will be disabled.
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
        }], function(newValues) {
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

    /**
     * Validates the given phone number and submits if the validation was successfull. Then navigates to the next step.
     *
     * @param {any} phoneNumber
     */
    function validateAndSend(phoneNumber) {
      validatePhone().then(function (available) {
        if (available) {
          sendPhoneNumber(phoneNumber).then(function (result) {
            nextStep(result.verificationId, phoneNumber);
          }).catch(function (error) {
            if (error === 'phone_number_exists') {
              var alreadyRegisteredMessage = NstSvcTranslation.get("We've found an account already registered with your phone number. If you've forgotten your password, try to recover it or contact us for help.");
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

    /**
     * Emits an event that leads to changing the step
     *
     * @param {any} verificationId
     * @param {any} phone
     */
    function nextStep(verificationId, phone) {
      $scope.$emit(vm.onCompleted, {verificationId: verificationId, phone: phone});
    }

    /**
     * Sends the phone number
     *
     * @param {any} phone
     * @returns
     */
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
          if (data.code === 5) {
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

    /**
     * Validates the given phone number with the country validation rules
     *
     * @returns
     */
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
        checkPhone(getPhoneNumber()).then(function (ok) {
          deferred.resolve(ok);
        }).catch(deferred.reject);
      } else {
        deferred.resolve(false);
      }


      return deferred.promise;
    }

    /**
     * Check the phone to be available or registered depending on the component configuration.
     *
     * @param {any} phone
     * @returns
     */
    function checkPhone(phone) {
      var deferred = $q.defer();

      if (vm.checkPhoneAvailable) {

        phoneAvailable(phone).then(function (available) {
          vm.phoneAvailableStatus = available ? 'available' : 'used';
          deferred.resolve(vm.phoneAvailableStatus === 'available');
        }).catch(function () {
          vm.phoneAvailableStatus = 'error';
          deferred.resolve(false);
        });

      } else if (vm.checkPhoneRegistered) {

        phoneRegistered(phone).then(function (registered) {
          vm.phoneAvailableStatus = registered ? 'registered' : 'notfound';
          deferred.resolve(vm.phoneAvailableStatus === 'registered');
        }).catch(function () {
          vm.phoneAvailableStatus = 'error';
          deferred.resolve(false);
        });

      } else {

        deferred.resolve(true);

      }

      return deferred.promise;
    }

    /**
     * Returns true if the given phone number is a valid one
     *
     * @param {any} countryId
     * @param {any} phone
     * @returns
     */
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

    /**
     * Concatinates country code and phone to build a complete phone number
     *
     * @returns
     */
    function getPhoneNumber() {
      if (vm.countryCode && vm.phone) {
        return vm.countryCode.toString() + _.trimStart(vm.phone.toString(), "0");
      }
      return "";
    }

    /**
     * Checks the phone number to be available for registration. In other words, The phone number should not be taken before
     *
     * @param {any} phone
     * @returns
     */
    function phoneAvailable(phone) {
      var deferred = $q.defer();

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

      return deferred.promise;
    }

    /**
     * Checks the phone number to be exist. In other words, The phone number should be associated with an account
     *
     * @param {any} phone
     * @returns
     */
    function phoneRegistered(phone) {
      var deferred = $q.defer();

      new NstHttp('',
        {
          cmd: 'auth/phone_available',
          data: {
            'phone': phone
          }
        }).post().then(function (data) {
        if (data.status === 'ok') {
          deferred.resolve(false);
        } else {
          deferred.resolve(true);
        }
      }).catch(deferred.reject);

      return deferred.promise;
    }

    // Validates the phone number when the user changes her country.
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

    // The function is declared but is not used.
    // TODO: Remove it
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
