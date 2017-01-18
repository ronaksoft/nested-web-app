/**
 *
 * Sync Notification Service
 *
 * this service check all sync-n WS Pushes and receive all notification after a certain timestamp
 * and dispatch sync event.
 *
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.notification')
    .service('NstSvcNotificationSync', NstSvcNotificationSync);

  /** @ngInject */
  function NstSvcNotificationSync(_,
                                  NST_SRV_PUSH_CMD,
                                  NstSvcNotificationFactory, NstObservableObject,
                                  NstSvcServer, NstSvcLogger, NstSvcNotification) {


    function SyncService() {


      this.recivedNotifStack = [];
      this.latestNotifTimestamp = Date.now();

      NstObservableObject.call(this);

      var self = this;
      NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_NOTIFICATION, function (event) {
        dispatchNotificationPushEvents.apply(self, [event]);
      });

    }

    SyncService.prototype = new NstObservableObject();
    SyncService.prototype.constructor = SyncService;


    /**
     * Dispatch sync event after received new sync-n
     *
     * 1. Fetch notifications after this.latestNotificationTimestamp recursively
     * 3. Dispatch Sync Notification event with notification type
     *
     *
     * @param event           sync-a payload data
     */
    function dispatchNotificationPushEvents(event) {
      var self = this;


      NstSvcLogger.debug2('Sync Notification Service | Get Latest Notifications from:', new Date(self.latestNotifTimestamp));

      // get activities base on place id
      NstSvcNotificationFactory.getAfter({}).then(function (data) {

        var nearNotifTime = self.latestNotifTimestamp;

        // filter received Notifications with latest time
        var newNotifs = _.filter(data, function (notif) {

          if (notif === undefined) return false;

          //check and update near notification timestamp
          if (notif.date.getTime() > nearNotifTime) nearNotifTime = notif.date.getTime();
          // return notif.date.getTime() > self.latestNotifTimestamp;
          return true;
        });

        newNotifs = _.sortBy(newNotifs, ['date']);

        NstSvcLogger.debug2('Sync Notification Service | Received Notification after ' + new Date(self.latestNotifTimestamp), data.length, newNotifs.length);

        // update latestNotificationTimestamp with near notification time
        // if (self.latestNotificationTimestamp === nearNotifTime) return;
        self.latestNotifTimestamp = nearNotifTime;

        //check each notification and dispatch sync events
        _.map(newNotifs, function (notif) {

          //check dispatched notification Id for duplication
          // if (self.recivedNotifStack.indexOf(notif.id) < 0) {
          //   self.recivedNotifStack.push(notif.id);


          //Handle witch notifications show desktop notification
          // if (_.indexOf([NST_NOTIFICATION_TYPE.INVITE, NST_NOTIFICATION_TYPE.INVITE_RESPOND, NST_NOTIFICATION_TYPE.FRIEND_JOINED], notificationObject.type) > -1) {
          //   NstSvcNotification.push2(notif);
          // }

          NstSvcLogger.debug2('Sync Notification Service | Dispatch ', notif.type, notif);

          self.dispatchEvent(new CustomEvent(
            notif.type,
            notif
          ));

          // }
        });

        // check data length and try to get more new notification
        if (data.length === 32) {
          NstSvcNotificationFactory.apply(self, [event])
        }

      });
    }

    return new SyncService();

  }
})();
