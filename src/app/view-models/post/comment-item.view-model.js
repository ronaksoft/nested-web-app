(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstVmCommentItem', NstVmCommentItem);

  function NstVmCommentItem(NstTinyUser, NstVmCommentSender) {

    function VmCommentItem(model) {
      this.body = model.body;

      if (moment.isMoment(model.date)) {
        this.date = model.date;
      } else {
        this.date = moment(model.date);
      }

      if (model.sender instanceof NstTinyUser) {
        this.sender = new NstVmCommentSender(model.sender);
      } else {
        throw new Exception('The comment sender must be of NstTinyUser type.');
      }
    }

    return VmCommentItem;
  }
})();
