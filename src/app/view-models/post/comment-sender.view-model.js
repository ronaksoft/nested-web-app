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
        this.avatar = model.hasPicture() ? model.picture.getUrl("x32") : '';
        this.avatar128 = model.hasPicture() ? model.picture.getUrl("x128") : '';
      }

    }

    return VmCommentSender;
  }
})();
