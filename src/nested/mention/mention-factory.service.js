(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .service('NstSvcMentionFactory', NstSvcMentionFactory);

  function NstSvcMentionFactory($q,
    NstSvcServer, NstSvcUserFactory, NstSvcPostFactory, NstSvcCommentFactory,
    NstBaseFactory, NstFactoryQuery, NstFactoryError, NstMention) {
    function MentionFactory() {

    }

    MentionFactory.prototype = new NstBaseFactory();
    MentionFactory.prototype.constructor = MentionFactory;

    MentionFactory.prototype.getMentions = getMentions;
    MentionFactory.prototype.getMentionsCount = getMentionsCount;
    MentionFactory.prototype.markAsSeen = markAsSeen;

    return new MentionFactory();

    /*****************
     **   Methods   **
     *****************/

    function getMentions(skip, limit) {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('account/get_mentions', {
          skip: skip || 0,
          limit: limit || 12,
          show_data: true
        }).then(function(data) {
          var mentionPromises = _.map(data.mentions, parseMention);
          $q.all(mentionPromises).then(defer.resolve).catch(defer.catch);
        }).catch(defer.reject);

        return defer.promise;
      }, "getMentions");
    }

    function getMentionsCount() {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('account/get_mentions', {
          limit : 1,
          skip : 1,
        }).then(function(data) {
          var count = data.unread_mentions || 0;
          defer.resolve(count);
        }).catch(defer.reject);

        return defer.promise;
      }, "getMentionsCount");
    }

    function markAsSeen(mentionsIds) {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        var ids = "";
        if (_.isString(mentionsIds)) {
          ids = mentionsIds;
        } else if (_.isArray(mentionsIds)) {
          ids = _.join(mentionsIds, ",");
        } else {
          ids = "all";
        }

        NstSvcServer.request('account/update_mention_read_status', {
          mention_id : ids
        }).then(function(data) {
          defer.resolve();
        }).catch(defer.reject);

        return defer.promise;
      }, "markAsSeen");
    }

    /*****************
     **    Parse    **
     *****************/

    function parseMention(data) {
      var mention = new NstMention();
      if (!data._id) {
        throw 'Could not find _id in the mention raw object.';
      }
      var deferred = $q.defer();

      mention.id = data._id;
      mention.isSeen = data.read;
      mention.date = new Date(data.timestamp);

      mention.commentId = data.comment_id.$oid;
      mention.postId = data.post_id.$oid;
      mention.senderId = data.sender_id;
      mention.mentionedId = data.mentioned_id;

      var senderPromise = NstSvcUserFactory.get(mention.senderId);
      var mentionedPromise = NstSvcUserFactory.get(mention.mentionedId);
      var commentPromise = NstSvcCommentFactory.getComment(mention.commentId, mention.postId);
      var postPromise = NstSvcPostFactory.get(mention.postId);

      $q.all([senderPromise, mentionedPromise, commentPromise, postPromise]).then(function (values) {
        mention.sender = values[0];
        mention.mentioned = values[1];
        mention.comment = values[2];
        mention.post = values[3];

        deferred.resolve(mention);
      }).catch(deferred.reject);

      return deferred.promise;
    }
  }
})();
