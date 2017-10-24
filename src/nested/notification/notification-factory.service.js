(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.notification')
    .service('NstSvcNotificationFactory', NstSvcNotificationFactory);

  function NstSvcNotificationFactory(_, $q, $rootScope,
                                     NstSvcServer, NstSvcUserFactory, NstSvcPostFactory, NstSvcCommentFactory, NstSvcAuth,
                                     NstBaseFactory, NstMention, NstSvcInvitationFactory, NstSvcPlaceFactory, NstSvcLabelFactory,
                                     NST_AUTH_EVENT, NST_NOTIFICATION_EVENT, NST_NOTIFICATION_TYPE, NST_SRV_PUSH_CMD, NST_INVITATION_EVENT) {
    function NotificationFactory() {
      var that = this;
      that.count = 0;

      $rootScope.$on(NST_AUTH_EVENT.AUTHORIZE, function () {
        if (NstSvcAuth.user.unreadNotificationCount) {
          $rootScope.$broadcast(NST_NOTIFICATION_EVENT.UPDATE, { count: NstSvcAuth.user.unreadNotificationCount });
        } else {
          that.getNotificationsCount().then(function (count) {
            $rootScope.$broadcast(NST_NOTIFICATION_EVENT.UPDATE, { count: count });
          });
        }
      });

      NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_NOTIFICATION, function () {
        that.getNotificationsCount().then(function (count) {
          $rootScope.$broadcast(NST_NOTIFICATION_EVENT.UPDATE, { count: count });
        });
      });

      $rootScope.$on(NST_AUTH_EVENT.UNAUTHORIZE, function () {
        that.loadedNotifications = [];
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
    NotificationFactory.prototype.resetCounter = resetCounter;
    NotificationFactory.prototype.checkIfHasInvitation = checkIfHasInvitation;


    var factory = new NotificationFactory();
    return factory;

    /*****************
     **   Methods   **
     *****************/

    function checkIfHasInvitation(notifications) {
      var hasInvite = false;
      // var hasInviteRespond = false;
      _.forEach(notifications, function (item) {
        if (item.type === NST_NOTIFICATION_TYPE.INVITE) {
          hasInvite = true;
        } /*else if (item.type === NST_NOTIFICATION_TYPE.INVITE_RESPOND) {
          hasInviteRespond = true;
        }*/
      });

      if (hasInvite) {
        $rootScope.$broadcast(NST_INVITATION_EVENT.ADD);
      }

      // if (hasInviteRespond) {
      //   $rootScope.$broadcast(NST_INVITATION_EVENT.ACCEPT);
      // }
    }

    function getNotifications(settings) {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('notification/get_all', {
          details: true,
          skip: settings.skip || 0,
          limit: settings.limit || 12,
          before: settings.before,
          after: settings.after
        }).then(function (data) {
          console.log(data);
          var notificationPromises = _.map(data.notifications, function (notif) {
            switch (notif.type) {
              case NST_NOTIFICATION_TYPE.MENTION:
                return parseMention(notif);

              case NST_NOTIFICATION_TYPE.INVITE:
                if (notif.invite_id !== undefined)
                  return parseInvitation(notif);
                break;
              case NST_NOTIFICATION_TYPE.INVITE_RESPOND:
                if (notif.invite_id !== undefined)
                  return parseInvitationResponse(notif);
                break;
              case NST_NOTIFICATION_TYPE.COMMENT:
                return parseComment(notif);

              case NST_NOTIFICATION_TYPE.YOU_JOINED:
                return parseYouJoined(notif);

              case NST_NOTIFICATION_TYPE.PROMOTED:
              case NST_NOTIFICATION_TYPE.DEMOTED:
                return parsePromote(notif);

              case NST_NOTIFICATION_TYPE.PLACE_SETTINGS_CHANGED:
                return parsePlaceSettingsChanged(notif);

              case NST_NOTIFICATION_TYPE.NEW_SESSION:
                return parseNewSession(notif);

              case NST_NOTIFICATION_TYPE.LABEL_REQUEST_APPROVED:
              case NST_NOTIFICATION_TYPE.LABEL_REQUEST_REJECTED:
              case NST_NOTIFICATION_TYPE.LABEL_REQUEST_CREATED:
              case NST_NOTIFICATION_TYPE.LABEL_JOINED:
                return parseLabelNotification(notif);

              case NST_NOTIFICATION_TYPE.TASK_MENTION:
              case NST_NOTIFICATION_TYPE.TASK_COMMENT:
              case NST_NOTIFICATION_TYPE.TASK_ASSIGNED:
              case NST_NOTIFICATION_TYPE.TASK_ASSIGNEE_CHANGED:
              case NST_NOTIFICATION_TYPE.TASK_ADD_TO_CANDIDATES:
              case NST_NOTIFICATION_TYPE.TASK_ADD_TO_WATCHERS:
              case NST_NOTIFICATION_TYPE.TASK_DUE_TIME_UPDATED:
              case NST_NOTIFICATION_TYPE.TASK_OVER_DUE:
              case NST_NOTIFICATION_TYPE.TASK_TITLE_UPDATED:
              case NST_NOTIFICATION_TYPE.TASK_UPDATED:
              case NST_NOTIFICATION_TYPE.TASK_REJECTED:
              case NST_NOTIFICATION_TYPE.TASK_ACCEPTED:
              case NST_NOTIFICATION_TYPE.TASK_COMPLETED:
                break;

            }
          });
          var notifications = notificationPromises.filter(function (obj) {
            var hasData = obj && (obj.data !== null);
            if (!hasData) {
              if (obj)
                removeNotification(obj.id);
            }
            return hasData;
          });
          factory.checkIfHasInvitation(notifications);
          defer.resolve(notifications);

        }).catch(defer.reject);

        return defer.promise;
      }, "getNotifications");
    }

    function removeNotification(id) {
      var defer = $q.defer();
      NstSvcServer.request('notification/remove', {
        notification_id: id
      }).then(function () {
        defer.resolve();
      }).catch(defer.reject);
      return defer;
    }

    function getAfter(settings) {
      return factory.getNotifications({
        limit: settings.limit,
        after: settings.date
      });
    }

    function getNotificationsCount() {
      var that = this;
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('notification/get_counter', {})
          .then(function (data) {
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
          notification_id: ids
        }).then(function () {
          factory.getNotificationsCount().then(function (count) {
            $rootScope.$broadcast(NST_NOTIFICATION_EVENT.UPDATE, { count: count });
          }).catch(defer.reject);
          defer.resolve();
        }).catch(defer.reject);

        return defer.promise;
      }, "markAsSeen");
    }

    function resetCounter() {
      return this.sentinel.watch(function () {
        var defer = $q.defer();
        NstSvcServer.request('notification/reset_counter', {}).then(function () {
          $rootScope.$broadcast(NST_NOTIFICATION_EVENT.UPDATE, { count: 0 });
          defer.resolve();
        }).catch(defer.reject);

        return defer.promise;
      }, "resetCounter");
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
     **    Parsers    **
     *****************/

    function parseMention(data) {
      var mention = new NstMention();
      if (!data._id) {
        throw 'Could not find _id in the notification raw object.';
      }

      mention.id = data._id;
      mention.commentId = data.comment_id;
      mention.postId = data.post_id;
      mention.senderId = data.actor_id;
      mention.sender = NstSvcUserFactory.parseTinyUser(data.actor);
      mention.comment = NstSvcCommentFactory.parseComment(data.comment);
      mention.post = {
        id: data.post_id
      };

      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        mention: mention,
        type: data.type
      };
    }

    function parsePromote(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        actor: NstSvcUserFactory.parseTinyUser(data.actor),
        member: data.account !== undefined? NstSvcUserFactory.parseTinyUser(data.account): null,
        place: NstSvcPlaceFactory.parseTinyPlace(data.place),
        type: data.type
      }
    }


    function parsePlaceSettingsChanged(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        actor: NstSvcUserFactory.parseTinyUser(data.actor),
        place: NstSvcPlaceFactory.parseTinyPlace(data.place),
        type: data.type
      }
    }

    function parseInvitation(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        actor: NstSvcUserFactory.parseTinyUser(data.actor),
        place: NstSvcPlaceFactory.parseTinyPlace(data.place),
        invitation: {
          id: data.invite_id
        },
        type: data.type
      };
    }

    function parseInvitationResponse(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        actor: NstSvcUserFactory.parseTinyUser(data.actor),
        place: NstSvcPlaceFactory.parseTinyPlace(data.place),
        invitation: {
          id: data.invite_id
        },
        type: data.type
      };
    }


    function parseYouJoined(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        place: NstSvcPlaceFactory.parseTinyPlace(data.place),
        adder: NstSvcUserFactory.parseTinyUser(data.actor),
        type: data.type
      };
    }

    function parseComment(notif) {
      if (notif.data && notif.others.length > 0) {
        var countOfMappedUsers = 1;
        var users = _.map(notif.others.splice(1, 4), function (user) {
          countOfMappedUsers++;
          return NstSvcUserFactory.parseTinyUser(user);
        });
        return {
          id: notif._id,
          isSeen: notif.read,
          date: new Date(notif.timestamp),
          lastUpdate: new Date(notif.last_update),
          post: {
            id: notif.post_id
          },
          comment: NstSvcCommentFactory.parseComment(notif.comment),
          actor: NstSvcUserFactory.parseTinyUser(notif.actor),
          users: users,
          otherUsersCount: notif.data.others.length - countOfMappedUsers < 1 ? 0 : notif.data.others.length - countOfMappedUsers,
          type: notif.type
        }
      } else {
        return {
          id: notif._id,
          isSeen: notif.read,
          date: new Date(notif.timestamp),
          lastUpdate: new Date(notif.last_update),
          post: {
            id: notif.post_id
          },
          comment: NstSvcCommentFactory.parseComment(notif.comment),
          actor: NstSvcUserFactory.parseTinyUser(notif.actor),
          users: [],
          otherUsersCount: 0,
          type: notif.type
        }
      }
    }

    function parseNewSession(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        actor: NstSvcUserFactory.parseTinyUser(data.actor),
        type: data.type,
        from : data.client_id.split("_").join(" ")
      };
    }

    function parseLabelNotification(data) {
      return {
        id: data._id,
        isSeen: data.read,
        date: new Date(data.timestamp),
        // account: NstSvcUserFactory.parseTinyUser(data.account),
        account: data.account ? NstSvcUserFactory.parseTinyUser(data.account) : '',
        actor: NstSvcUserFactory.parseTinyUser(data.actor),
        label: NstSvcLabelFactory.parseLabel(data.label),
        place: NstSvcPlaceFactory.parseTinyPlace(data.place),
        type: data.type
      }
    }
  }
})();
