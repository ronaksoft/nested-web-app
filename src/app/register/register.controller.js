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
        return;
      }

      sendPhoneNumber(vm.phone).then(function (result) {
        vm.verificationCode = result.verificationCode;
        vm.verificationId = result.verificationId;
      }).catch(function (error) {
        console.log(error);
      });

    };

    function sendPhoneNumber(phone) {
      var deferred = $q.defer();

      vm.phoneSubmitProgress = true;
      new NstHttp('/register/', {
        f: 'verify_phone',
        phone: phone
      }).get().then(function (data) {
        if (data.status === 'ok') {
          deferred.resolve({
            verificationCode : data.code,
            verificationId : data.vid
          });
        } else {
          deferred.reject(data);
        }
      })
      .catch(function (error) {
        deferred.reject(error);
      }).finally(function () {
        vm.phoneSubmitProgress = true;
      });

      return deferred.promise;
    }

    function validatePhone() {
      if (!vm.phone) {
        vm.phoneIsEmpty = true;
        vm.phoneIsWrong = false;
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


    vm.resend = function(){

      var ajax = new NstHttp('/register/',
      {
        f: 'send_code_txt',
            vid: vm.vid,
            phone: vm.phone
      })
      ajax.get()
      .then(function(data){
        toastr.success("Varification code has been sent again.")
      })
      .catch(function(error){

      })
    }

    vm.callMe = function (){
      var ajax = new NstHttp('/register/',
      {
        f: 'send_code_call',
        vid: vm.vid,
        phone: vm.phone
      })
      ajax.get()
      .then(function(){
        toastr.success("We call you now.")
      })
      .catch(function(error){

      })
    }

    vm.verifyCode = function (){
        vm.verification = 'start';

         var ajax = new NstHttp('/register/',
        {
          f: 'verify_phone_code',
          vid: vm.vid,
          code: vm.verificationCode
        });

        ajax.get().then(function (data) {
          if (data.status == 'ok') {
            vm.step = 'step3';
            vm.verificationWrongCode = false;
          }
          else {
            vm.verificationWrongCode = true;
          }
          vm.verification = 'finished';

        })
        .catch(function (error) {
          vm.verification = 'wrong';
        });
    }


    vm.register = function(event){
        $scope.registrationForm.$setSubmitted();
        if(vm.birth === undefined){
          vm.hasNotBirth = true;
        }else{
          vm.hasNotBirth = false;
        }

        if(vm.agreement){
          vm.acceptAgreement = true;
        }else{
          vm.acceptAgreement = false;
        }



        if(vm.gender === undefined){
          vm.hasNotGender = true;
        }else{
          vm.hasNotGender = false;
        }

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

        if (vm.hasNotBirth ||
          vm.hasNotGender ||
          !vm.password ||
          !vm.username ||
          vm.requiredLastname ||
          vm.requiredFirstname ||
          !vm.acceptAgreement) return false;

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
        postData.append('vid', vm.vid);
        postData.append('phone', vm.phone);
        postData.append('country', vm.country);
        postData.append('uid', credentials.username);
        postData.append('pass', credentials.password);
        postData.append('fname', vm.fname);
        postData.append('lname', vm.lname);
        postData.append('gender', vm.gender);
        postData.append('agreement', vm.agreement);
        postData.append('dob', dob.getFullYear() + "-" + pad(dob.getMonth() + 1) + "-" + pad(dob.getDay() + 1));


        var ajax = new NstHttp('/register/',postData);

        ajax.post().then(function (data) {
          if (data.data.status === "ok") {
            NstSvcAuth.login(credentials, true).then(function () {
              return $state.go(NST_DEFAULT.STATE);
            }).catch(function () {
              return $state.go("signin");
            });
          }else{
            toastr.error("Error in create account!");
          }
        })
        .catch(function (error) {
          toastr.error("Error in create account!");
        })

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

    //checking phone from get
    var phone = $stateParams.phone || getParameterByName('phone');
    if (phone){
      vm.phone = phone;
      vm.submitPhoneNumber();
      vm.step = "step2";
    }else{
      vm.step = "step1";
    }

    $scope.$on('country-select-changed', function (event, data) {
      if (data && data.code) {
        vm.countryCode = data.code;
        vm.countryId = data.id;

        vm.countryIsValid = true;
      } else {
        vm.countryCode = vm.countryId = null;

        vm.countryIsValid = false;
      }
    });

  }
})();
