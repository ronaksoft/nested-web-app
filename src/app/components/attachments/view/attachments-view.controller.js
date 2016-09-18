(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .controller('AttachmentsViewController', AttachmentsViewController);

  function AttachmentsViewController($uibModal) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.open = function (vmAttachment, vmAttachments) {
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        size: 'mlg',
        resolve: {
          postId: function () {
            return vm.postId;
          },
          vmAttachment: function () {
            return vmAttachment;
          },
          vmAttachments: function () {
            return vmAttachments;
          }
        }
      });

      return modal.result;
    };

    /*****************************
     *****  Controller Logic  ****
     *****************************/

    /*****************************
     *****   Request Methods  ****
     *****************************/

    /*****************************
     *****     Map Methods    ****
     *****************************/

    /*****************************
     *****    Push Methods    ****
     *****************************/

    /*****************************
     *****  Event Listeners   ****
     *****************************/

    /*****************************
     *****   Other Methods    ****
     *****************************/
  }
})();
