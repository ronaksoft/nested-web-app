(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmCommentItem', NstVmCommentItem);

  function NstVmCommentItem(moment, NstTinyUser) {

    function VmCommentItem(model, noMoment) {
      this.id = model.id;
      this.body = model.body;

      // TODO: Do not apply moment in vm model. Instead use it as a filter on template
      // NOTE: sorousht: moment is a kind of rich date type and is better for sort, manipulate, query and etc
      //       We need these features right in controller not html view
      // NOTE : @sina: You are right, I fix all the usages ASAP

      if (moment.isMoment(model.date) || noMoment) {
        this.date = model.date;
      } else {
        this.date = moment(model.date);
      }

      this.sender = model.sender;
    }

    return VmCommentItem;
  }
})();
