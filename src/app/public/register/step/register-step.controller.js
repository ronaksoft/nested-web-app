/**
 * @file src/app/public/register/step/register-step.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user creates her account. She must have been verified her phone before performing this action.
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-05
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RegisterStepController', RegisterStepController);

  /** @ngInject */
  /**
   * Gives the user a form to fill and create an account
   * 
   * @param {any} $scope 
   * @param {any} $state 
   * @param {any} $timeout 
   * @param {any} $stateParams 
   * @param {any} md5 
   * @param {any} toastr 
   * @param {any} NST_DEFAULT 
   * @param {any} NST_PATTERN 
   * @param {any} NstSvcAuth 
   * @param {any} NstHttp 
   * @param {any} $q 
   * @param {any} NstSvcTranslation 
   */
  function RegisterStepController($scope, $state, $timeout, $stateParams, md5, toastr, NST_DEFAULT, NST_PATTERN, NstSvcAuth, NstHttp, $q, NstSvcTranslation) {
    var vm = this;


    vm.nextStep = nextStep;
    vm.usernameErrors = [];
    vm.emailPattern = NST_PATTERN.EMAIL;
    vm.validateUsername = validateUsername;
    vm.usernameValidationStatus = 'none';
    var eventReferences = [];

    /**
     * Emits an event that leads to a route change
     * 
     * @param {any} credentials 
     */
    function nextStep(credentials) {
      eventReferences.push($scope.$emit(vm.onCompleted, { credentials : credentials }));
    }

    /**
     * Registers the user account
     * 
     * @param {any} formIsValid 
     */
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

    /**
     * Concatinates country code and phone to form a complete phone number
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
     * Checks the username to be available
     * 
     * @param {any} username 
     * @returns 
     */
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

    /**
     * Validates username with precise rules and helps the user to pick her username
     * 
     * @param {any} username 
     * @param {any} check 
     * @returns 
     */
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

      if (_.size(username) < 5) {
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
