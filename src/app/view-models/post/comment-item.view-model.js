(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstVmCommentItem', NstVmCommentItem);

  function NstVmCommentItem(NstTinyUser, NstVmCommentSender) {

    function VmCommentItem(model, noMoment) {
      this.id = model.id;
      this.body = model.body;

      // TODO: Do not apply moment in vm model. Instead use it as a filter on template
      if (moment.isMoment(model.date) || noMoment) {
        this.date = model.date;
      } else {
        this.date = moment(model.date);
      }

      if (model.sender instanceof NstTinyUser) {
        // TODO: Use NstVmUser instead
        this.sender = new NstVmCommentSender(model.sender);
      } else {
        throw new Exception('The comment sender must be of NstTinyUser type.');
      }
    }

    return VmCommentItem;
  }
})();
