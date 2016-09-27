(function() {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .service('NstSvcPostCommentFriend', NstSvcPostCommentFriend);

  function NstSvcPostCommentFriend(NST_COMMENT_EVENT,
                                   NstSvcPostFactory, NstSvcCommentFactory) {
    NstSvcCommentFactory.addEventListener(NST_COMMENT_EVENT.ADD, function (event) {
      var comment = event.detail.comment;
      var postId = event.detail.postId;

      if (NstSvcPostFactory.has(postId)) {
        NstSvcPostFactory.get(postId).then(function (post) {
          post.addComment(comment);
          NstSvcPostFactory.set(post);
        });
      }
    });
  }
})();
