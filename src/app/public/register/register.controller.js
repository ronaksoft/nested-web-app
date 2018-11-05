(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($scope, $state, NST_DEFAULT, NstSvcAuth, $stateParams, _, NstSvcGlobalCache, NstHttp, NST_CONFIG, NstSvcTranslation) {
    var oauthState = '';
    var vm = this;
    vm.phoneSubmittedEventKey = 'register-phone-submitted';
    vm.codeVerifiedEventKey = 'register-code-verified';
    vm.completedEventKey = 'register-completed';
    vm.previousStepEventKey = 'register-change-phone';
    vm.phone = null;
    vm.verificationId = null;
    vm.country = null;
    vm.step = 1;
    vm.signUpWithGoogle = signUpWithGoogle;

    var eventReferences = [];

    (function () {
      var phone = $stateParams.phone || getParameterByName('phone');
      var code = $stateParams.code || getParameterByName('code');

      if (phone) {
        vm.phone = phone;
      }

      if (code) {
        vm.code = code;
      }

      if (vm.phone && vm.code) {
        vm.autoSubmit = true;
      }

    })();

    eventReferences.push($scope.$on(vm.phoneSubmittedEventKey, function(event, data) {
      if (data.verificationId && data.phone) {
        vm.verificationId = data.verificationId;
        vm.step++;
      }
    }));

    eventReferences.push($scope.$on(vm.codeVerifiedEventKey, function(event, data) {
      if (data.verified) {
        vm.step++;
      }
    }));

    eventReferences.push($scope.$on(vm.completedEventKey, function(event, data) {
      if (data.credentials) {
        NstSvcGlobalCache.flush();
        NstSvcAuth.login(data.credentials, true).then(function() {
          return $state.go(NST_DEFAULT.STATE);
        }).catch(function() {
          return $state.go("public.signin");
        });
      }
    }));

    eventReferences.push($scope.$on(vm.previousStepEventKey, function () {
      vm.autoSubmit = false;
      vm.step--;
    }));

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
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

    function signUpWithGoogle() {
      new NstHttp(NST_CONFIG.REGISTER.AJAX.URL, {
        cmd: 'auth/get_oauth_url',
        data: {
          access_type: 'register'
        },
      }).post().then(function (result) {
        oauthState = result.data.state;
        oauthLogin(result.data.url)
      });
    }

    function oauthLogin(url) {
      var strWindowFeatures = 'location=yes,height=570,width=520,scrollbars=yes,status=yes';
      var oauthWindow = window.open('', '_blank', strWindowFeatures);
      oauthWindow.location = url;
      if (oauthWindow === undefined) {
        toastr.error('Please disable your popup blocker');
        return
      }
      var interval = setInterval(function () {
        if (oauthWindow.closed) {
          clearInterval(interval);
          getToken(oauthState)
        }
      }, 1000);
    }

    function getToken(state) {
      new NstHttp(NST_CONFIG.REGISTER.AJAX.URL, {
        cmd: 'auth/get_oauth_token',
        data: {
          state: state
        },
      }).post().then(function (result) {
        if (result.data.oauth_token) {
          registerByLogin(result.data.oauth_token.token, result.data.oauth_token.user_id);
        }
      });
    }

    function registerByLogin(token, id) {
      new NstHttp(NST_CONFIG.REGISTER.AJAX.URL, {
        cmd: 'session/register',
        data: {
          uid: id,
          token: token,
          state: oauthState,
        },
      }).post().then(function (result) {
        NstSvcAuth.loginByOauth(result.data).then(function () {
          window.location.reload();
        });
      }).catch(function () {
        toastr.error(NstSvcTranslation.get('An error has occured'));
      });
    }
  }
})();
