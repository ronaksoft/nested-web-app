/**
 * @file src/app/authenticate/logout/logout.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description Removesthe the authenticated user's session and navigates to signin page
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController($state, NstSvcAuth, NstSvcGlobalCache) {
    if (NstSvcAuth.isAuthorized()) {
      NstSvcGlobalCache.flush();
      NstSvcAuth.logout();
    }
    document.getElementById('river-embed').remove();
    
    $state.go('public.signin');
  }
})();
