/**
 * @file app/messages/quick-message/quick-message.controller.js
 * @desc Controller for quick-message directive
 * @kind {Controller}
 * Documented by:          robzizo < me@robzizo.ir >
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('QuickMessageController', QuickMessageController);

  function QuickMessageController(NstSvcAuth) {
    var vm = this;
    vm.text = '';
    vm.mode = 'quick';

    /*****************************
     *** Controller Properties ***
     *****************************/

    vm.model = {
      subject: '',
      body: '',
      attachments: [],
      attachfiles: {},
      errors: [],
      modified: false,
      ready: false,
      saving: false,
      saved: false
    };
    vm.fireFoxBodySet = false;

    vm.attachments = {
      elementId: 'attach',
      viewModels: [],
      requests: {},
      size: {
        uploaded: 0,
        total: 0
      }
    };

    vm.user = NstSvcAuth.user;
  }
})();
