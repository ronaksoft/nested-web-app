(function() {
  'use strict';
  angular
    .module('nested')
    .service('NstSvcCommentMap', NstSvcCommentMap);

  /** @ngInject */
  function NstSvcCommentMap() {

    var service = {
      toMessageComment: toMessageComment
    };

    return service;

    function toMessageComment(comment) {
      return {
        body: comment.body,
        date: formatCommentDate(comment.date),
        sender: mapCommentSender(comment.sender)
      };
    }

    function formatCommentDate(date) {
      if (!date) {
        return 'Unknown';
      }

      if (!moment.isMoment(date)) {
        date = moment(date);
      }

      return date.fromNow(false); // 'true' just removes the trailing 'ago'
    }

    function mapCommentSender(sender) {
      if (!sender) {
        return {};
      }
      return {
        name: sender.fullName,
        username: sender.id,
        avatar: sender.picture.getThumbnail('32').url.download
      };
    }
  }

})();
