(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .controller('AttachmentsViewController', AttachmentsViewController);

  function AttachmentsViewController($uibModal, NstVmFileViewerItem) {
    var vm = this;

    /*****************************
     *** Controller Properties ***
     *****************************/

    /*****************************
     ***** Controller Methods ****
     *****************************/
     function mapToFileViewerItem(model) {
       return new NstVmFileViewerItem(model);
     }

    vm.open = function (vmAttachment, vmAttachments) {
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        size: 'mlg',
        resolve: {
          fileViewerItem : function () {
            return mapToFileViewerItem(vmAttachment);
          },
          fileViewerItems : function () {
            return _.map(vmAttachments, mapToFileViewerItem);
          },
          fileId : function () {
            return null;
          },
          fileIds : function () {
            return null;
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
