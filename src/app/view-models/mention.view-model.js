(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmMention', NstVmMention);

  function NstVmMention(NstMention, moment, _) {
    function VmMention(model, currentUserId) {
      this.id = null;
      this.name = null;
      this.avatar = null;
      this.commentBody = null;
      this.postSubject = null;
      this.date = null;
      this.mode = null;
      this.seen = null;

      if (model instanceof NstMention) {
        this.id = model.id;
        this.name = model.sender.fullName;
        this.avatar = model.sender.picture.thumbnails.x32.url.view;
        this.date = moment(model.date);
        this.seen = model.seen;
        this.commentBody = _.trim(model.comment.body);
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
