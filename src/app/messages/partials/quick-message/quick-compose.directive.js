/**
 * @file app/messages/quick-message/quick-message.directive.js
 * @desc quick message directive , pass the placeId and mod to the component
 * @kind {directive}
 * Documented by:          robzizo < me@robzizo.ir >
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .directive('nstQuickCompose', QuickMessage);

  /** @ngInject */
  function QuickMessage() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/compose/main.html',
      controller: 'ComposeController',
      controllerAs: 'ctlCompose',
      bindToController: {
        placeId: '=',
        mode: '='
      }
    };
  }

})();
