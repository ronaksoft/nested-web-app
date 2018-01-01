/**
 * @file src/app/authenticate/login/login.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Authenticates a user
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LoginController', LoginController);

  /** @ngInject */
  /**
   * Matches the provided username and password, then registers a new session for the authenticated user
   *
   * @param {any} $window
   * @param {any} $state
   * @param {any} $stateParams
   * @param {any} md5
   * @param {any} $location
   * @param {any} NST_DEFAULT
   * @param {any} NST_SRV_ERROR
   * @param {any} NstSvcAuth
   * @param {any} NstSvcTranslation
   */
  function LoginController($window, $state, $stateParams, md5, $location,
                           NST_DEFAULT, NST_SRV_ERROR, _, NstHttp, $scope, $rootScope,
                           NstSvcAuth, NstSvcTranslation, NstSvcGlobalCache, NstSvcRequestCacheFactory, NstSvcPostDraft, NstSvcI18n) {

    var eventReferences = [];
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.username = '';
    vm.password = '';
    vm.remember = false;
    vm.message = {
      fill: false,
      class: '',
      text: ''
    };
    vm.progress = false;
    vm.activeRegister = false;
    vm.companyConstant = null;

    /*****************************
     ***** Initialization ****
     *****************************/

    (function () {
      // Navigates to the default state if the user has already been authenticated before
      if (NstSvcAuth.isInAuthorization()) {
        $state.go(NST_DEFAULT.STATE);
      }
      vm.loadConstantsProgress = true;
      new NstHttp('', {
        cmd: 'system/get_int_constants',
        data: {}
      }).post().then(function(result) {
        vm.activeRegister = result.data.register_mode === 1;
      }).finally(function() {
        vm.loadConstantsProgress = false;
      });

      loadCompanyConstants();
      eventReferences.push($rootScope.$on('company-constants-loaded', function () {
        loadCompanyConstants();
      }));
    })();

    function loadCompanyConstants() {
      var data = localStorage.getItem('ronak.nested.company.constants');
      if (data) {
        vm.companyConstant = JSON.parse(data);
      }
    }
    /*****************************
     ***** Controller Methods ****
     *****************************/

    /**
     * Authenticates a user with username and password
     *
     * @param {any} isValid
     * @returns
     */
    vm.auth = function (isValid) {
      if (!isValid) {
        return;
      }

      vm.progress = true;
      vm.message.fill = false;

      var credentials = {
        username: _.toLower(vm.username),
        password: md5.createHash(vm.password)
      };

      NstSvcAuth.login(credentials, true).then(function () {
        NstSvcGlobalCache.flush();
        NstSvcRequestCacheFactory.flush();
        NstSvcPostDraft.reset();
        // TODO check local and language settings
        NstSvcI18n.checkSettings().then(function (v) {
          if (v) {
            $window.location.reload();
          } else {
            if ($stateParams.back) {
              goToBackUrl();
            } else {
              $state.go(NST_DEFAULT.STATE);
            }
            vm.progress = false;
          }
        }).catch(function () {
          if ($stateParams.back) {
            goToBackUrl();
          } else {
            $state.go(NST_DEFAULT.STATE);
          }
          vm.progress = false;
        })

      }).catch(function (error) {
        vm.password = '';

        vm.message.fill = true;
        vm.message.class = 'nst-error-msg';

        if (error.code === NST_SRV_ERROR.INVALID) {
          vm.message.text = NstSvcTranslation.get('Invalid Username or Password');
        } else if (error.code === NST_SRV_ERROR.ACCESS_DENIED && error.message[0] === 'disabled') {
          vm.message.text = NstSvcTranslation.get('Your account has been disabled! Contact Nested administrator to get more information.');
        } else {
          vm.message.text = NstSvcTranslation.get('An error occurred in login. Please try again later');
        }

        vm.progress = false;
      })
    };

    /*****************************
     ***** Internal Methods ****
     *****************************/

    /**
     * Navigates to the return url or default state
     *
     */
    function goToBackUrl() {
      var url = $window.decodeURIComponent($stateParams.back);
      $location.url(_.trimStart(url, "#"));
    }

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
