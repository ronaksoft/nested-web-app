(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPost', NstPost);

  function NstPost() {
    Post.prototype = {};
    Post.prototype.constructor = Post;

    function Post() {

      this.id = undefined;
      this.body = '';
      this.preview = '';
      this.contentType = undefined;
      this.counters = {};
      this.forwardFromId = undefined;
      this.internal = undefined;
      this.lastUpdate = undefined;
      this.bookmarked = undefined;
      this.pinned = false;
      this.attachments = undefined;
      this.places = undefined;
      this.read = undefined;
      this.recipients = undefined;
      this.replyToId = undefined;
      this.sender = undefined;
      this.subject = undefined;
      this.timestamp = undefined;
      this.type = undefined;
      this.wipeAccess = undefined;
      this.comments = undefined;
      this.ellipsis = undefined;
      this.resources = undefined;
      this.trusted = undefined;
      this.bodyIsTrivial = true;
      this.noComment = false;
      this.isTrusted = true;
      this.iframeUrl = undefined;
      this.iframeObj = undefined;
      this.relatedTasks = undefined;
      this.visible = true;
      this.affix = {};
    }

    Post.prototype.getTrustedBody = function () {
      var imgRegex = new RegExp('<img(.*?)source=[\'|"](.*?)[\'|"](.*?)>', 'g');
      var resources = this.resources;
      this.trusted = true;
      var text = this.body || this.preview;
      var body = text.replace(imgRegex, function (m, p1, p2, p3) {
        var src = resources[p2];
        return "<img" + p1 + "src='" + src + "' " + p3 + ">"
      });
      return body;

    };

    return Post;
  }
})();
