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
        this.name = model.fullName;
        this.username = model.id;
        this.avatar = model.picture.getThumbnail('32').url.view;
      }

    }

    return VmCommentSender;
  }
})();
