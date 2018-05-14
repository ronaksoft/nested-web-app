(function() {
  'use strict';

  angular.module('ronak.nested.web.activity').factory('NstPostActivity', NstPostActivity);

  function NstPostActivity() {

    function PostActivity() {
      this.id = null;
      this.type = null;
      this.actor = null;
      this.date = null;
      this.postId = null;

      this.label = undefined;
      this.comment = undefined;
      this.newPlace = undefined;
      this.oldPlace = undefined;
      this.post = undefined;
    }

    PostActivity.prototype = {};
    PostActivity.prototype.constructor = PostActivity;

    return PostActivity;
  }
})();
