(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmNotification', NstVmNotification);

  function NstVmNotification(NstMention, moment, _) {
    function VmMention(model, currentUserId) {
      this.id = null;
      this.name = null;
      this.avatar = null;
      this.commentBody = null;
      this.commentId = null;
      this.postSubject = null;
      this.postId = null;
      this.date = null;
      this.mode = null;
      this.isSeen = null;

      if (model instanceof NstMention) {
        this.id = model.id;
        this.name = model.sender.fullName;
        this.avatar = model.sender.hasPicture() ? model.sender.picture.getUrl("x32") : '';
        this.date = moment(model.date);
        this.isSeen = model.isSeen;
        this.commentId = model.comment.id;
        this.commentBody = _.trim(model.comment.body);
        this.postId = model.post.id;
        this.postSubject = _.trim(model.post.subject);
        if (_.trimStart(this.commentBody, '@') === currentUserId) {
          this.mode = 'post';
        } else {
          this.mode = 'comment';
        }
      } else {
        throw Error('Could not create a view-model from an unsupported type');
      }
    }

    return VmMention;
  }
})();
