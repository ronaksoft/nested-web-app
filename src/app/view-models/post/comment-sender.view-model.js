(function() {
  'use strict';

  angular
    .module('nested')
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
        this.avatar = model.getPicture().getThumbnail(32).getUrl().view;
      }

    }

    return VmCommentSender;
  }
})();
