(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RegisterStepController', RegisterStepController);

  /** @ngInject */
  function RegisterStepController($scope, $state, $timeout, $stateParams, md5, toastr, NST_DEFAULT, NST_PATTERN, NstSvcAuth, NstHttp, $q, NstSvcTranslation) {
    var vm = this;


    vm.nextStep = nextStep;
    vm.usernameErrors = [];
    vm.emailPattern = NST_PATTERN.EMAIL;
    vm.validateUsername = validateUsername;
    vm.usernameValidationStatus = 'none';
    var eventReferences = [];

    (function() {

    })();

    function nextStep(credentials) {
      eventReferences.push($scope.$emit(vm.onCompleted, { credentials : credentials }));
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
          cmd : 'account/register_user',
          data : {
            'vid' : vm.verificationId,
            'phone' : vm.phone,
            'country' : vm.country,
            'uid' : credentials.username,
            'pass' : credentials.password,
            'fname' : vm.fname,
            'lname' : vm.lname,
            'email' : vm.email
          }
        });

        ajax.post().then(function (data) {
          if (data.status === "ok") {
            nextStep(credentials);
          } else if (data.status === "err") {
            if (data.data.err_code === 5 && data.data.items[0] === 'uid') {
              toastr.warning(NstSvcTranslation.get("This username is already taken."));
            } else if (data.data.err_code === 5 && data.data.items[0] === 'phone') {
              toastr.warning(NstSvcTranslation.get("This phonenumber is already used."));
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

    function usernameAvailable(username) {
      var deferred = $q.defer();
      new NstHttp('',
      {
        cmd: 'account/available',
        data: {
          'account_id': username
        }
      }).post().then(function(data){
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
        vm.usernameErrors.push(NstSvcTranslation.get('Do not start your username with a number (0-9) or a dash (-)'));
      }

      if (END_WITH_DASH_REGEX.test(username)) {
        vm.usernameErrors.push(NstSvcTranslation.get('Do not end your username with a dash (-)'));
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
        usernameAvailable(username, vm.verificationId).then(function (available) {
          if (available) {
            vm.usernameValidationStatus = 'available';
          } else {
            vm.usernameValidationStatus = 'exists';
          }
          resolve(vm.usernameErrors);
        }).catch(function (error) {
          vm.usernameValidationStatus = 'error';
          reject(error);
        });
      });

    }

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
