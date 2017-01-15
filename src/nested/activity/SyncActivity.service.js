/**
 *
 * Sync Service
 *
 * this service check all sync-a WS Pushes and receive all activities after a certain timestamp
 * and dispatch sync event.
 * Controllers must open an channel with place id Or open all channel and get channel Id, then listen to NstSvcSync Events.
 * Controllers can close channel with chanel Id
 *
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.data')
    .service('NstSvcSync', NstSvcSync);

  /** @ngInject */
  function NstSvcSync(_,
                      NST_SRV_PUSH_CMD,
                      NstFactoryEventData, NstObservableObject,
                      NstSvcServer, NstSvcActivityFactory, NstSvcLogger) {

    var OPEN_ALL_CHANNEL = '_all_';

    function SyncService() {

      this.openChannelsStack = [];
      this.recivedActivityStack = [];
      this.latestActivityTimestamp = Date.now();

      NstObservableObject.call(this);

      var self = this;
      NstSvcServer.addEventListener(NST_SRV_PUSH_CMD.SYNC_ACTIVITY, function (event) {
        dispatchActivityPushEvents.apply(self, [event]);
      });

    }

    SyncService.prototype = new NstObservableObject();
    SyncService.prototype.constructor = SyncService;


    /**
     * Open a channel with place Id
     *
     * Service filter activity by place Ids that it's has open
     * chanel
     *
     * @param {string} placeId
     * @returns {string} chanel ID
     */
    SyncService.prototype.openChannel = function (placeId) {

      NstSvcLogger.debug2('Sync Service | Open chanel :', placeId);
      if (!placeId) throw new NstServerError('placeId is undefined for open channel');

      var uid = placeId + '_' + guid();
      this.openChannelsStack.push(uid);
      return uid;
    };


    /**
     * Open all channel
     *
     * Service doesn't filter activity by place Ids
     *
     * @returns {string} chanel ID
     */
    SyncService.prototype.openAllChannel = function () {
      NstSvcLogger.debug2('Sync Service | Open all chanel');
      return this.openChannel(OPEN_ALL_CHANNEL);
    };


    /**
     * Close and chanel with channelId
     *
     * remove channel and its place id from stack
     * and sync-a listener will not dispatch that events
     *
     * @param chanelId
     */
    SyncService.prototype.closeChannel = function (chanelId) {
      NstSvcLogger.debug2('Sync Service | Close channel:', placeId);
      this.openChannelsStack.splice(this.openChannelsStack.indexOf(chanelId), 1);
    };


    /**
     * close all open channels
     *
     * Sync service will not dispatch any sync event
     *
     */
    SyncService.prototype.closeAllChannel = function () {
      NstSvcLogger.debug2('Sync Service | Close all chanel');
      this.openChannelsStack = [];
    };


    /**
     * Dispatch sync event after received new sync-a
     *
     * 1. Check this sync-a push's placeId exist in open channel places
     * 2. Fetch activities after this.latestActivityTimestamp recursively
     * 3. Dispatch Sync Activity event with action_Id
     *
     *
     * @param event           sync-a payload data
     */
    function dispatchActivityPushEvents(event) {
      var self = this;

      // check open event's place_id has channel
      if (!hasOpenChannel.apply(this, [event.detail.place_id])) return;

      NstSvcLogger.debug2('Sync Service | Get activity for channel :', event.detail.place_id);

      // get activities base on place id
      NstSvcActivityFactory.getAfter({
        date: this.latestActivityTimestamp,
        placeId: event.detail.place_id
      }).then(function (data) {

        var nearActTime = self.latestActivityTimestamp;

        // filter received activities with latest time
        var newActs = _.filter(data, function (act) {

          //check and update near activity timestamp
          if (act.date.getTime() > nearActTime) nearActTime = act.date.getTime();

          return act.date.getTime() > self.latestActivityTimestamp;
        });

        NstSvcLogger.debug2('Sync Service | Received activity after ' + new Date(self.latestActivityTimestamp), data.length, newActs.length);

        // update latestActivityTimestamp with near activity time
        self.latestActivityTimestamp = nearActTime;

        //check each activity and dispatch sync events
        _.map(newActs, function (act) {

          //check dispatched activities Id for duplication
          if (self.recivedActivityStack.indexOf(act.id) < 0) {
            self.recivedActivityStack.push(act.id);

            NstSvcLogger.debug2('Sync Service | Dispatch ' ,act.type, act);

            self.dispatchEvent(new CustomEvent(
              act.type,
              new NstFactoryEventData(act)
            ));

          }
        });

        // check data length and try to get more new activity
        if (data.length === 20) {
          dispatchActivityPushEvents(event)
        }

      });
    }


    /**
     * check placeId has open channel
     *
     * 1. if open channel stack is empty return false
     * 2. if stack has an item that start with OPEN_ALL_CHANNEL return true
     * 3. if stack has an item that start with Place Id return true
     * 4. otherwise return false
     *
     *
     * @param placeId
     * @returns {boolean}
     */
    function hasOpenChannel(placeId) {
      // check stack is empty or not
      if (!placeId && this.openChannelsStack.length === 0)
        return false;

      // check stack for OPEN_ALL_CHANNEL and place id
      if (_.findIndex(this.openChannelsStack, function (channel) {
          return channel.indexOf(OPEN_ALL_CHANNEL) === 0 || channel.indexOf(placeId) === 0
        }) > -1)
        return true;


      return false;

    }

    /**
     * generate GUID
     *
     * @returns {string}
     */
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }


    return new SyncService();

  }
})();
