(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope, $state, $timeout, $stateParams, md5, toastr, NST_DEFAULT, NST_PATTERN, NstSvcAuth, NstHttp, $q, NstSvcTranslation) {
    var vm = this;


    vm.avaiablity = false;
    vm.validatePhone = validatePhone;
    vm.nextStep = nextStep;
    vm.previousStep = previousStep;
    vm.getPhoneNumber = getPhoneNumber;
    vm.usernameErrors = [];
    vm.emailPattern = NST_PATTERN.EMAIL;
    vm.validateUsername = validateUsername;
    vm.usernameValidationStatus = 'none';

    (function() {
      var phone = $stateParams.phone || getParameterByName('phone');
      var code = $stateParams.code || getParameterByName('code');
      if (phone && code) {
        vm.phone = phone;
        vm.countryCode = code;
        vm.submitPhoneNumber();
        vm.step = 2;
      } else {
        vm.step = 1;
      }

    })();

    vm.submitPhoneNumber = function (isValid) {
      vm.submitted = true;

      if (!isValid) {
        validatePhone();
        return;
      }

      sendPhoneNumber(getPhoneNumber()).then(function (result) {
        vm.verificationId = result.verificationId;
        nextStep();
      }).catch(function (error) {
        if (error === 'phone_number_exists') {
          toastr.error(NstSvcTranslation.get("We've found an account already registered with your phone number. If you've forgotten your password, try to recover it or contact us for help."));
        } else {
          toastr.error(NstSvcTranslation.get("Sorry, an unknown error has occurred."));
        }
      });

    };

    function nextStep() {
      vm.step++;
      vm.submitted = false;
    }

    function previousStep() {
      if (vm.step > 1) {
        vm.submitted = false;
        vm.step--;
      }
    }

    function sendPhoneNumber(phone) {
      var deferred = $q.defer();
      vm.phoneSubmitProgress = true;
      var request = new NstHttp('', {
        cmd : 'auth/get_verification',
        data : {
          phone: phone
        }
      });
      request.post().then(function (data) {
        if (data.status === 'ok') {
          deferred.resolve({
            verificationId : data.vid
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
      if (!vm.phone) {
        vm.phoneIsEmpty = true;
        vm.phoneIsWrong = false;
      }else if (!vm.countryCode){
        vm.phoneIsEmpty = true;
      } else if (!getPhoneIsValid(vm.countryId, vm.phone)) {
        vm.phoneIsWrong = true;
        vm.phoneIsEmpty = false;
      } else {
        vm.phoneIsWrong = false;
        vm.phoneIsEmpty = false;
      }
      vm.phoneIsValid = !vm.phoneIsWrong && !vm.phoneIsEmpty;
    }

    function getPhoneIsValid(countryId, phone) {
      try {
        return phoneUtils.isValidNumber(phone.toString(), countryId);
      } catch (e) {
        return false;
      }
    }

    function resendVerificationCode(verificationId, phoneNumber) {
      var deferred = $q.defer();

      vm.resendVerificationCodeProgress = true;
      var request = new NstHttp('', {
        cmd : 'auth/send_text',
        data : {
          'vid' : verificationId,
        }
      });

      request.post().then(function (response) {
        deferred.resolve(true);
      }).catch(function (error) {
        deferred.reject('unknown');
      }).finally(function () {
        vm.resendVerificationCodeProgress = false;
      });

      return deferred.promise;
    }

    vm.resend = function(){
      resendVerificationCode(vm.verificationId, getPhoneNumber()).then(function () {
        toastr.success(NstSvcTranslation.get("Verification code has been sent again."));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error has occurred in sending a new verification code."));
      });
    }

    function getPhoneNumber() {
      if (vm.countryCode && vm.phone) {
        return vm.countryCode.toString() + _.trimStart(vm.phone.toString(), "0");
      }
       return "";
    }

    function callForVerification(verificationId, phoneNumber) {
      var deferred = $q.defer();

      vm.callForVerificationProgress = true;
      var request = new NstHttp('', {
        cmd : 'auth/call_phone',
        data : {
          vid: verificationId,
        }
      });

      request.post().then(function (response) {
        deferred.resolve(true);
      }).catch(function (error) {
        deferred.reject('unknown');
      }).finally(function () {
        vm.callForVerificationProgress = false;
      });

      return deferred.promise;
    }

    vm.callMe = function (){
      callForVerification(vm.verificationId, getPhoneNumber()).then(function () {
        toastr.success(NstSvcTranslation.get("We are calling you now!"));
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("An error has occurred in trying to reach you via phone call."));
      });
    }

    function verifyCode(verificationId, code) {
      var deferred = $q.defer();
      var request = new NstHttp('', {
        cmd : 'auth/verify_code',
        data : {
          vid: verificationId,
          code: code
        }
      });

      vm.callForVerificationProgress = true;
      request.post().then(function(response) {
        if (response.status === 'ok') {
          deferred.resolve(true);
        } else {
          deferred.reject('unknown');
        }
      }).catch(function(error) {
        deferred.reject('unknown');
      }).finally(function() {
        vm.callForVerificationProgress = false;
      });

      return deferred.promise;
    }

    vm.verify = function() {
      verifyCode(vm.verificationId, vm.verificationCode).then(function() {
        nextStep();
      }).catch(function(error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred in verifying the code.'));
      });
    }

    vm.register = function(formIsValid) {

      vm.submitted = true;

      validateUsername(vm.username, true).then(function (errors) {
        if (errors.length > 0 || !formIsValid) {
          return;
        }

        var credentials = {
          username: vm.username.toLowerCase(),
          password: md5.createHash(vm.password)
        };

        var postData = new FormData();


        vm.registerProgress = true;
        var ajax = new NstHttp('',
        {
          cmd : 'account/register',
          data : {
            'vid' : vm.verificationId,
            'phone' : getPhoneNumber(),
            'country' : vm.country,
            'uid' : credentials.username,
            'pass' : credentials.password,
            'fname' : vm.fname,
            'lname' : vm.lname,
            'email' : vm.email
          }
        });

        ajax.post().then(function (data) {
          if (data.data.status === "ok") {
            NstSvcAuth.login(credentials, true).then(function () {
              return $state.go(NST_DEFAULT.STATE);
            }).catch(function () {
              return $state.go("signin");
            });
          } else if (data.data.status === "err") {
            if (data.data.err_code === 5 && data.data.items[0] === 'uid') {
              toastr.warning(NstSvcTranslation.get("This username is already taken."));
            } else {
              toastr.error(NstSvcTranslation.get("Sorry, an error has occurred in creating your account. Please contact us."));
            }
          }
        })
        .catch(function (error) {
          toastr.error("An error happened while creating your account.");
        }).finally(function () {
          vm.registerProgress = false;
        });

      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occured while checking your username.'))
      });

    };

    var timers = [];

    function usernameExists(username, id) {
      var deferred = $q.defer();
      // TODO: use a valid API address
      NstHttp('/register/', { f: 'account_exists', uid: id }).get().then(function(data){
        if (data.status === 'ok') {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      }).catch(deferred.reject);

      return deferred.promise;
    }

    function validateUsername(username, check) {
      if (!check || !username) {
        return $q.resolve(vm.usernameErrors);
      }

      vm.usernameErrors.length = 0;

      var VALID_CHAR_REGEX = /^[a-zA-Z0-9-.]+$/,
          DOT_REGEX = /\./,
          SEQUENCE_DASHES_REGEX = /--/,
          START_WITH_DASH_AND_NUMBER_REGEX = /^(-|[0-9])/,
          END_WITH_DASH_REGEX = /-$/;

      if (!VALID_CHAR_REGEX.test(username)) {
        vm.usernameErrors.push(NstSvcTranslation.get('alphanumeric and dash(-) only'));
        return $q.resolve(vm.usernameErrors);
      }

      if (DOT_REGEX.test(username)) {
        vm.usernameErrors.push(NstSvcTranslation.get('dot(.) is not allowed'));
        return $q.resolve(vm.usernameErrors);
      }

      if (SEQUENCE_DASHES_REGEX.test(username)) {
        vm.usernameErrors.push(NstSvcTranslation.get('Sequence dashes (--) are not allowed'));
      }

      if (START_WITH_DASH_AND_NUMBER_REGEX.test(username)) {
        vm.usernameErrors.push(NstSvcTranslation.get('Don\'t start your username with a number (0-9) or a dash (-)'));
      }

      if (END_WITH_DASH_REGEX.test(username)) {
        vm.usernameErrors.push(NstSvcTranslation.get('Don\'t end your username with a dash (-)'));
      }

      if (vm.usernameErrors.length > 0) {
        return $q.resolve(vm.usernameErrors);
      }

      if (_.size(username) < 4) {
        vm.usernameErrors.push(NstSvcTranslation.get('The username is too short'));
      }

      if (_.size(username) > 32) {
        vm.usernameErrors.push(NstSvcTranslation.get('The username is too long'));
      }

      if (vm.usernameErrors.length > 0) {
        return $q.resolve(vm.usernameErrors);
      }

      vm.usernameValidationStatus = 'checking';
      return $q(function (resolve, reject) {
        usernameExists(username, vm.verificationId).then(function (exists) {
          if (exists) {
            vm.usernameValidationStatus = 'exists';
          } else {
            vm.usernameValidationStatus = 'available';
          }
          resolve(vm.usernameErrors);
        }).catch(function (error) {
          vm.usernameValidationStatus = 'error';
          reject(error);
        });
      });

    }

    //Parse url and get params from url
    function getParameterByName(name) {
      var url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
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

  }
})();
