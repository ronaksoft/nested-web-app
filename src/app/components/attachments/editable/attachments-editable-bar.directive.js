(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstAttachmentsEditableBar', AttachmentsEditableBar);

  function AttachmentsEditableBar(NST_ATTACHMENTS_EDITABLE_BAR_MODE) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/attachments/editable/main.html',
      scope: {
        onItemDelete: '=',
        onItemClick: '=',
        items: '=',
        mode: '='
      },
      link: function (scope, element, attributes) {
        scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.AUTO;

        if (modeIsValid(attributes.mode)) {
          scope.internalMode = attributes.mode;
        }

        if (scope.internalMode === NST_ATTACHMENTS_EDITABLE_BAR_MODE.AUTO){
          if (_.some(scope.items, 'hasThumbnail')) {
            scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.THUMBNAIL;
          } else {
            scope.internalMode = NST_ATTACHMENTS_EDITABLE_BAR_MODE.BADGE;
          }
        }

        scope.onClick = function (item) {
          if (scope.onItemClick) {
            scope.onItemClick(item);
          }
        };

        scope.onDelete = function (item) {
          if (scope.onItemDelete) {
            scope.onItemDelete(item);
          }
        };
      }
    };

    function modeIsValid(mode) {
      return _.values(NST_ATTACHMENTS_EDITABLE_BAR_MODE).indexOf(mode) > -1;
    }
  }
})();
