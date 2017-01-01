(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .service('NstSvcMentionFactory', NstSvcMentionFactory);

  function NstSvcMentionFactory($q,
    NstSvcServer, NstSvcUserFactory, NstSvcPostFactory, NstSvcCommentFactory, NstSvcAuth,
    NstBaseFactory, NstMention, NstFactoryEventData,
    NST_AUTH_EVENT, NST_MENTION_FACTORY_EVENT, NST_SRV_EVENT) {
    function MentionFactory() {
      var that = this;
      that.count = 0;

      NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function (event) {
        if (NstSvcAuth.user.unreadMentionsCount){
          that.dispatchEvent(new CustomEvent(NST_MENTION_FACTORY_EVENT.UPDATE, new NstFactoryEventData(NstSvcAuth.user.unreadMentionsCount)));
        }else{
          that.getMentionsCount().then(function (count) {
            that.dispatchEvent(new CustomEvent(NST_MENTION_FACTORY_EVENT.UPDATE, new NstFactoryEventData(count)));
          });
        }
      });

      NstSvcServer.addEventListener(NST_SRV_EVENT.MENTION, function () {
        that.dispatchEvent(new CustomEvent(NST_MENTION_FACTORY_EVENT.NEW_MENTION, new NstFactoryEventData(that.count)));
      });

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

        NstSvcServer.request('mention/get_all', {
          skip: skip || 0,
          limit: limit || 12,
          show_data: true
        }).then(function(data) {
          var mentionPromises = _.map(data.mentions, parseMention);
          $q.all(mentionPromises).then(defer.resolve).catch(defer.reject);
        }).catch(defer.reject);

        return defer.promise;
      }, "getMentions");
    }

    function getMentionsCount() {
      var that = this;
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('mention/get_all', {
          limit : 1,
          skip : 1,
          only_unread : false
        }).then(function(data) {
          var count = data.unread_mentions || 0;
          that.count = parseInt(count);
          defer.resolve(count);
        }).catch(defer.reject);

        return defer.promise;
      }, "getMentionsCount");
    }

    function markAsSeen(mentionsIds) {
      var factory = this;
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

        NstSvcServer.request('mention/mark_as_read', {
          mention_id : ids
        }).then(function(data) {
          factory.getMentionsCount().then(function (count) {
            factory.dispatchEvent(new CustomEvent(NST_MENTION_FACTORY_EVENT.UPDATE, new NstFactoryEventData(count)));
          }).catch(defer.reject);
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

      mention.commentId = data.comment_id;
      mention.postId = data.post_id;
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
