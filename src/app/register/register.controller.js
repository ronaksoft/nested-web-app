(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope, $state, $timeout, $stateParams, md5, toastr, NST_DEFAULT, NST_PATTERN, NstSvcAuth, NstHttp, $q) {
    var vm = this;


    vm.hasNotBirth = false;
    vm.hasNotGender = false;
    vm.acceptAgreement = true;
    vm.requiredUser = false;
    vm.requiredPassword = false;
    vm.requiredFirstname = false;
    vm.requiredLastname = false;


    vm.patterns = {
      // password : NST_PATTERN.PASSWORD,

      username : {
        general : NST_PATTERN.USERNAME
      }
    };

    vm.tooltipPasswordAlert = {
      letters : /(?=.*[A-Z])(?=.*[a-z])/,
      symbolOrNumber: /(?=.*[\d~!@#\$%\^&\*\(\)\-_=\+\|\{\}\[\]\?\.])/
    };



    vm.checkWithServer = false;

    vm.avaiablity = false;
    vm.validatePhone = validatePhone;
    vm.nextStep = nextStep;
    vm.previousStep = previousStep;
    vm.getPhoneNumber = getPhoneNumber;

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

    vm.clearPassError = function (val) {
      if (val && val.length > 0) {
        vm.requiredPassword = false;
      }
      else {
        vm.requiredPassword = true;
        return;
      }
    };

    vm.clearUserError = function (val) {
      if (val && val.length > 0) {
        vm.requiredUser = false;
      }
      else {
        vm.requiredUser = true;
        return;
      }
    };

    vm.clearFnameError = function (val) {
      if (val && val.length > 0) {
        vm.requiredFirstname = false;
      }
      else {
        vm.requiredFirstname = true;
        return;
      }
    };

    vm.clearLnameError = function (val) {
      if (val && val.length > 0) {
        vm.requiredLastname = false;
      }
      else {
        vm.requiredLastname = true;
        return;
      }
    };

    vm.clearGenderError = function (val) {
      if (val && val.length > 0) {
        vm.hasNotGender = false;
      }
      else {
        vm.hasNotGender = true;
        return;
      }
    };

    vm.clearBdayError = function (val) {
      if (val) {
        vm.hasNotBirth = false;
      }
      else {
        vm.hasNotBirth = true;
        return;
      }
    };

    vm.clearAgreementError = function (val) {
      if (val && val.length > 0) {
        vm.acceptAgreement = false;
      }
      else {
        vm.acceptAgreement = true;
        return;
      }
    };

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
          toastr.error("We found an account with your phone number. If you forgot your password, try to recover it or contact us for any help.");
        } else {
          toastr.error("Sorry, an unknown error happened.");
        }
      });

    };

    function nextStep() {
      vm.step++;
    }

    function previousStep() {
      if (vm.step > 1) {
        vm.step--;
      }
    }

    function sendPhoneNumber(phone) {
      var deferred = $q.defer();
      vm.phoneSubmitProgress = true;
      var request = new NstHttp('/register/', {
        f: 'verify_phone',
        phone: phone
      });
      request.get().then(function (data) {
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
      var request = new NstHttp('/register/', {
        f: 'send_code_txt',
        vid: verificationId,
        phone: phoneNumber
      });

      request.get().then(function (response) {
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
        toastr.success("Varification code has been sent again.");
      }).catch(function (error) {
        toastr.error("An error happened while sending a new verification code.");
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
      var request = new NstHttp('/register/', {
        f: 'send_code_call',
        vid: verificationId,
        phone: phoneNumber
      });

      request.get().then(function (response) {
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
        toastr.success("We call you now.");
      }).catch(function () {
        toastr.error("An error happened while trying to call you.");
      });
    }

    function verifyCode(verificationId, code) {
      var deferred = $q.defer();
      var request = new NstHttp('/register/', {
        f: 'verify_phone_code',
        vid: verificationId,
        code: code
      });

      vm.callForVerificationProgress = true;
      request.get().then(function(response) {
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
        toastr.error('Sorry, an error happened while verifing the code.');
      });
    }

    vm.register = function(event) {

      //TODO: clean my validations
        if(vm.username === undefined){
          vm.requiredUser = true;
        }else{
          vm.requiredUser= false;
        }

        if(vm.password === undefined){
          vm.requiredPassword = true;
        }else{
          vm.requiredPassword= false;
        }

        if(vm.fname === undefined){
          vm.requiredFirstname = true;
        }else{
          vm.requiredFirstname= false;
        }

      if(vm.lname === undefined){
        vm.requiredLastname = true;
      }else{
        vm.requiredLastname= false;
      }

      if (vm.hasNotGender ||
          !vm.password ||
          !vm.username ||
          vm.requiredLastname ||
          vm.requiredFirstname) return false;

        function pad(d) {
          return (d < 10) ? '0' + d.toString() : d.toString();
        } //convert 1 digit numbers to 2 digits

        var dob = new Date(vm.birth);

        var credentials = {
          username: vm.username.toLowerCase(),
          password: md5.createHash(vm.password)
        };

        var postData  = new FormData();
        postData.append('f', 'register');
        postData.append('vid', vm.verificationId);
        postData.append('phone', vm.phone);
        postData.append('country', vm.country);
        postData.append('uid', credentials.username);
        postData.append('pass', credentials.password);
        postData.append('fname', vm.fname);
        postData.append('lname', vm.lname);
        postData.append('email', vm.email);

        vm.registerProgress = true;
        var ajax = new NstHttp('/register/',postData);

        ajax.post().then(function (data) {
          if (data.data.status === "ok") {
            NstSvcAuth.login(credentials, true).then(function () {
              return $state.go(NST_DEFAULT.STATE);
            }).catch(function () {
              return $state.go("signin");
            });
          } else if (data.data.status === "err") {
            if (data.data.err_code === 5 && data.data.items[0] === 'uid') {
              toastr.warning("The username is already taken. Please try another one.")
            } else {
              toastr.error("Sorry, an error happened while creating your account, Please contact us.");
            }
          }
        })
        .catch(function (error) {
          toastr.error("An error happened while creating your account.");
        }).finally(function () {
          vm.registerProgress = false;
        });

    };

    var timers = [];
    vm.checkUser = function (val) {
      if (val && val.length > 4) {
        timers.forEach(function (promises) {
          $timeout.cancel(promises);
        });

        var timer = $timeout(function () {
          vm.checkWithServer = true;
          var ajax = new NstHttp('/register/',{
              f: 'account_exists',
              uid: val
          });
          ajax.get()
          .then(function(data){
            vm.checkWithServer = false;
              $timeout(function () {
                if (data.status == "ok") {
                  vm.avaiablity = true;
                } else {
                  vm.avaiablity = false;

                }
              });
            });

        },550);
        timers.push(timer);
        timer;
      }
    };

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
