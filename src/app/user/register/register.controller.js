(function () {
  'use strict';

  angular
    .module('nested')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope, $state, $timeout, md5, toastr, NstHttp) {
    var vm = this;

    vm.step = "step1";
    vm.hasNotBirth = false;
    vm.hasNotGender = false;
    vm.acceptAgreement = true;


    vm.patterns = {
      password : {
        letters : /(?=.*[A-Z])(?=.*[a-z])/,
        symbolOrNumber: /(?=.*[\d~!@#\$%\^&\*\(\)\-_=\+\|\{\}\[\]\?\.])/,
      },
      tooltipAlert : {
        wordbgn : /^[a-zA-Z]/,
        //Todo :: check for '--'
        nodbldash : /^(?!.*--)/,
        noenddash : /^(?:-?[a-zA-Z0-9]+)*$/,
      },
      username : {
        general : /^([a-zA-Z](?!.*--)(?:-?[a-zA-Z0-9]+)*){5,}$/,
      },
    };


    vm.patterns.password.all = new RegExp(vm.patterns.password.letters.source + vm.patterns.password.symbolOrNumber.source);

    vm.checkWithServer = false;

    vm.avaiablity = false;


    vm.submitPhoneNumber = function () {

      console.log(vm)
      
      if(!vm.phone){
        return false;
      }

      var ajax = new NstHttp('/register/', {
        f: 'verify_phone',
        phone: vm.phone
      });
      ajax.get().then(function (data) {
        if (data.code) vm.verificationCode = data.code;
        vm.vid = data.vid;
        vm.step = 'step2';
      })
      .catch(function (error) {
      })
    };


    vm.resend = function(){

      var ajax = new NstHttp('/register/',
      {
        f: 'send_code_txt',
            vid: vm.vid,
            phone: vm.phone
      })
      .then(function(data){
        toastr.success("Varification code has been send again.")
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
        if (vm.hasNotBirth || vm.hasNotGender || !vm.password || !vm.username) return false;

        function pad(d) {
          return (d < 10) ? '0' + d.toString() : d.toString();
        } //convert 1 digit numbers to 2 digits

        var dob = new Date(vm.birth);



        var postData  = new FormData();
        postData.append('f', 'register');
        postData.append('vid', vm.vid);
        postData.append('phone', vm.phone);
        postData.append('uid', vm.username.toLowerCase());
        postData.append('pass', md5.createHash(vm.password));
        postData.append('fname', vm.fname);
        postData.append('lname', vm.lname);
        postData.append('gender', vm.gender);
        postData.append('agreement', vm.agreement);
        postData.append('dob', dob.getFullYear() + "-" + pad(dob.getMonth() + 1) + "-" + pad(dob.getDay() + 1));


        var ajax = new NstHttp('/register/',postData);

        ajax.post().then(function (data) {
          console.log('looog',data);
          if (data.data.status === "ok"){
            $state.go("signin");
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


  }
})();

