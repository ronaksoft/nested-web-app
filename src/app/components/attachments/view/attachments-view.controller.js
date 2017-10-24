(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .controller('AttachmentsViewController', AttachmentsViewController);

  function AttachmentsViewController($scope, $uibModal, _) {
    var vm = this;
    var eventReferences = [];

    /*****************************
     *** Controller Properties ***
     *****************************/

    /*****************************
     ***** Controller Methods ****
     *****************************/

    vm.open = function (vmAttachment, vmAttachments) {

      eventReferences.push($scope.$emit('post-attachment-viewed', { postId : vm.postId }));
      // $('body').addClass('attach-modal');
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        windowClass: '_oh',
        openedClass : ' modal-open-attachment-view attach-modal',
        backdropClass : 'attachmdrop',
        size: 'full',
        resolve: {
          fileViewerItem : function () {
            return vmAttachment;
          },
          fileViewerItems : function () {
            return vmAttachments;
          },
          fileId : function () {
            return null;
          },
          fileIds : function () {
            return null;
          },
          currentPlaceId: function () {
            return null;
          },
          currentPostId: function () {
            return vm.postId;
          },
          currentTaskId: function () {
            return null;
          }
        }
      }).result.catch(function(){
        // $('body').removeClass('attach-modal');
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
