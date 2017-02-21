(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .controller('AttachmentsViewController', AttachmentsViewController);

  function AttachmentsViewController($scope, $uibModal, NstSvcPostFactory, NstVmFileViewerItem) {
    var vm = this;
    var eventReferences = [];

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

      eventReferences.push($scope.$emit('post-attachment-viewed', { postId : vm.postId }));

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

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });
    });

  }
})();
