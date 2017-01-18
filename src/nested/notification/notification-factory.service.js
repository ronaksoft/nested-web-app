(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.notification')
    .service('NstSvcNotificationFactory', NstSvcNotificationFactory);

  function NstSvcNotificationFactory(_, $q,
                                     NstSvcServer, NstSvcUserFactory, NstSvcPostFactory, NstSvcCommentFactory, NstSvcAuth,
                                     NstBaseFactory, NstMention, NstFactoryEventData, NstSvcInvitationFactory,
                                     NST_AUTH_EVENT, NST_NOTIFICATION_FACTORY_EVENT, NST_NOTIFICATION_TYPE, NST_SRV_PUSH_CMD) {
    function NotificationFactory() {
      var that = this;
      that.count = 0;

      NstSvcAuth.addEventListener(NST_AUTH_EVENT.AUTHORIZE, function (event) {
        if (NstSvcAuth.user.unreadNotificationCount) {
          that.dispatchEvent(new CustomEvent(NST_NOTIFICATION_FACTORY_EVENT.UPDATE, new NstFactoryEventData(NstSvcAuth.user.unreadNotificationCount)));
        } else {
          that.getNotificationsCount().then(function (count) {
            that.dispatchEvent(new CustomEvent(NST_NOTIFICATION_FACTORY_EVENT.UPDATE, new NstFactoryEventData(count)));
          });
        }
      });

    }

    NotificationFactory.prototype = new NstBaseFactory();
    NotificationFactory.prototype.constructor = NotificationFactory;

    NotificationFactory.prototype.getNotifications = getNotifications;
    NotificationFactory.prototype.getNotificationsCount = getNotificationsCount;
    NotificationFactory.prototype.getAfter = getAfter;
    NotificationFactory.prototype.storeLoadedNotification = storeLoadedNotification;
    NotificationFactory.prototype.getLoadedNotification = getLoadedNotification;
    NotificationFactory.prototype.markAsSeen = markAsSeen;


    var factory = new NotificationFactory();
    return factory;

    /*****************
     **   Methods   **
     *****************/

    function getNotifications(settings) {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('notification/get_all', {
          skip: settings.skip || 0,
          limit: settings.limit || 12,
          before: settings.before,
          after: settings.after
        }).then(function (data) {

          var notificationPromises = _.map(data.notifications, function (notif) {
            switch (notif.type) {
              case NST_NOTIFICATION_TYPE.MENTION:
                return parseMention(notif);

              case NST_NOTIFICATION_TYPE.INVITE:

                if (notif.invite_id !== undefined) {
                  return parseInvitation(notif);
                }

              case NST_NOTIFICATION_TYPE.INVITE_RESPOND:
                if (notif.invite_id !== undefined)
                  return parseInvitationResponse(notif);

              case NST_NOTIFICATION_TYPE.COMMENT:

                return parseComment(notif);
            }
          });
          $q.all(notificationPromises)
            .then(function (notifs) {
              defer.resolve(notifs)
            })
            .catch(function (err) {
              defer.reject(err)
            });
        }).catch(defer.reject);

        return defer.promise;
      }, "getNotifications");
    }

    function getAfter(settings) {
      return factory.getNotifications({
        limit: settings.limit,
        after: settings.date,
      });
    }

    function getNotificationsCount() {
      var that = this;
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('notification/get_all', {
          limit: 1,
          skip: 1,
          only_unread: false
        }).then(function (data) {
          var count = data.unread_notifications || 0;
          that.count = parseInt(count);
          defer.resolve(count);
        }).catch(defer.reject);

        return defer.promise;
      }, "getNotificationsCount");
    }

    function markAsSeen(notificationIds) {
      var factory = this;
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        var ids = "";
        if (_.isString(notificationIds)) {
          ids = notificationIds;
        } else if (_.isArray(notificationIds)) {
          ids = _.join(notificationIds, ",");
        } else {
          ids = "all";
        }

        NstSvcServer.request('notification/mark_as_read', {
          mention_id: ids
        }).then(function (data) {
          factory.getNotificationsCount().then(function (count) {
            factory.dispatchEvent(new CustomEvent(NST_NOTIFICATION_FACTORY_EVENT.UPDATE, new NstFactoryEventData(count)));
          }).catch(defer.reject);
          defer.resolve();
        }).catch(defer.reject);

        return defer.promise;
      }, "markAsSeen");
    }

    /*****************
     **   STORE     **
     *****************/

    function storeLoadedNotification(notifications) {
      this.loadedNotifications = notifications;
    }

    function getLoadedNotification() {
      return this.loadedNotifications;
    }

    /*****************
     **    Parse    **
     *****************/

    function parseMention(data) {
      var mention = new NstMention();
      if (!data._id) {
        throw 'Could not find _id in the notification raw object.';
      }
      var deferred = $q.defer();

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

        deferred.resolve(
          {
            id: data._id,
            isSeen: data.read,
            date: new Date(data.timestamp),
            mention: mention,
            type: data.type
          });
      }).catch(function (err) {

        deferred.reject()
      });

      return deferred.promise;
    }

    function parseInvitation(data) {
      return NstSvcInvitationFactory.get(data.invite_id)
        .then(function (invite) {
          return {
            id: data._id,
            isSeen: data.read,
            date: new Date(data.timestamp),
            invitation: invite,
            type: data.type
          }

        })
    }

    function parseInvitationResponse(data) {
      return NstSvcInvitationFactory.get(data.invite_id)
        .then(function (invite) {
          return {
            id: data._id,
            isSeen: data.read,
            date: new Date(data.timestamp),
            invitation: invite,
            type: data.type
          }

        })
    }

    function parseComment(notif) {
      var defer = $q.defer();

      var commentProm = NstSvcCommentFactory.getComment(notif.comment_id, notif.post_id);
      var postProm = NstSvcPostFactory.get(notif.post_id);

      if (notif.data && notif.data.others) {
        var users = $q.all(_.map(notif.data.others, function (user) {
          return NstSvcUserFactory.getTiny(user)
        }));
        $q.all([postProm, commentProm, users])
          .then(function (value) {
            defer.resolve({
              post: value[0],
              comment: value[1],
              users: value[2],
              type: notif.type
            });
          })
          .catch(function (err) {
            console.log(err)
          })
      } else {
        $q.all([postProm, commentProm])
          .then(function (value) {
            defer.resolve({
              post: value[0],
              comment: value[1],
              type: notif.type
            });
          })
          .catch(function (err) {
            console.log(err)
          });
      }


      return defer.promise;
    }
  }
})();
