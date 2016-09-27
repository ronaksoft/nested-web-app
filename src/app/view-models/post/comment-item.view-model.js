(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmCommentItem', NstVmCommentItem);

  function NstVmCommentItem(moment, NstTinyUser, NstVmCommentSender) {

    function VmCommentItem(model, noMoment) {
      this.id = model.id;
      this.body = model.body;

      // TODO: Do not apply moment in vm model. Instead use it as a filter on template
      // NOTE: sorousht: moment is a kind of rich date type and is better for sort, manipulate, query and etc
      //       We need these features right in controller not html view
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
