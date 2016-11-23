(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmCommentSender', NstVmCommentSender);

  function NstVmCommentSender(NstTinyUser) {

    /**
     * VmCommentSender - Creates an instance of VmCommentSender
     *
     * @param  {NstTinyUser} model The user who commented
     */
    function VmCommentSender(model) {

      this.name = null;
      this.username = null;
      this.avatar = null;

      if (model instanceof NstTinyUser) {
        this.name = model.getFullName();
        this.username = model.getId();
        this.avatar = model.picture.id ? model.picture.thumbnails.x32.url.view : null;
      }

    }

    return VmCommentSender;
  }
})();
