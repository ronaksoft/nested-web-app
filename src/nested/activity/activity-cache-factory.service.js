(function () {
  'use strict';
  angular
    .module('ronak.nested.web.activity')
    .service('NstSvcActivityCacheFactory', NstSvcActivityCacheFactory);

  /** @ngInject */
  function NstSvcActivityCacheFactory(NST_PLACE_EVENT_ACTION,
    NstSvcPostFactory, NstSvcPlaceFactory, NstSvcUserFactory, NstSvcCommentFactory, NstSvcLabelFactory,
    NstSvcLogger, NstActivity) {


    function ActivityCacheFactory() { }

    ActivityCacheFactory.prototype = {};
    ActivityCacheFactory.prototype.constructor = ActivityCacheFactory;

    ActivityCacheFactory.prototype.parseCachedModel = parseCachedModel;

    var factory = new ActivityCacheFactory();
    return factory;

    function parseCachedModel(data) {
      if (!data) {
        return null;
      }

      if (!data._id) {
        return null;
      }

      switch (data.action) {
        case NST_PLACE_EVENT_ACTION.MEMBER_REMOVE:
          return parseMemberRemoveCached(data);
        case NST_PLACE_EVENT_ACTION.MEMBER_JOIN:
          return parseMemberJoinCached(data);
        case NST_PLACE_EVENT_ACTION.PLACE_ADD:
          return parsePlaceAddCached(data);
        case NST_PLACE_EVENT_ACTION.POST_ADD:
          return parsePostAddCached(data);
        case NST_PLACE_EVENT_ACTION.POST_ATTACH_PLACE:
          return parsePostAttachPlaceCached(data);
        case NST_PLACE_EVENT_ACTION.POST_MOVE_TO:
        case NST_PLACE_EVENT_ACTION.POST_MOVE_FROM:
          return parsePostMoveCached(data);
        case NST_PLACE_EVENT_ACTION.POST_REMOVE_PLACE:
          return parsePostRemovePlaceCached(data);
        default:
          NstSvcLogger.error('The provided activity type is not supported:' + data.action);
          return null;
      }
    }

    function parsePostAddCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }

      return activity;
    }

    function parsePostRemovePlaceCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }
      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }
      activity.place = NstSvcPlaceFactory.getCachedSync(data.place_id);
      if (data.place_id && !activity.place) {
        return null;
      }

      return activity;
    }

    function parsePostAttachPlaceCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }
      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }
      activity.place = NstSvcPlaceFactory.getCachedSync(data.place_id);
      if (data.place_id && !activity.place) {
        return null;
      }

      return activity;
    }

    function parsePostMoveCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }

      activity.oldPlace = NstSvcPlaceFactory.getCachedSync(data.old_place_id);
      if (data.old_place_id && !activity.oldPlace) {
        return null;
      }

      activity.newPlace = NstSvcPlaceFactory.getCachedSync(data.new_place_id);
      if (data.new_place_id && !activity.newPlace) {
        return null;
      }

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      return activity;
    }

    function parseAddCommentCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }

      activity.comment = NstSvcCommentFactory.getCachedSync(data.comment_id, data.post_id);
      if (data.comment_id && data.post_id && !activity.comment) {
        return null;
      }

      return activity;
    }

    function parseAddLabelCached(data) {
      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.label = NstSvcLabelFactory.getCachedSync(data.label_id);
      if (data.label_id && !activity.label) {
        return null;
      }

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }

      return activity;
    }

    function parseRemoveLabelCached(data) {
      var activity = new NstActivity();
      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.label = NstSvcLabelFactory.getCachedSync(data.label_id);
      if (data.label_id && !activity.label) {
        return null;
      }

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      activity.post = NstSvcPostFactory.getCachedSync(data.post_id);
      if (data.post_id && !activity.post) {
        return null;
      }

      return activity;
    }

    function parseRemoveCommentCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);
      activity.comment = NstSvcCommentFactory.getComment(data.comment_id, data.post_id);
      if (data.comment_id && data.post_id && !activity.comment) {
        return null;
      }

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      return activity;
    }

    function parseMemberRemoveCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      activity.member = NstSvcUserFactory.getCachedSync(data.member_id);
      if (data.member_id && !activity.member) {
        return null;
      }

      activity.place = NstSvcPlaceFactory.getCachedSync(data.place_id);
      if (data.place_id && !activity.place) {
        return null;
      }

      return activity;
    }

    function parseMemberJoinCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      activity.place = NstSvcPlaceFactory.getCachedSync(data.place_id);
      if (data.place_id && !activity.place) {
        return null;
      }

      return activity;
    }

    function parsePlaceAddCached(data) {
      var activity = new NstActivity();

      activity.id = data._id;
      activity.type = data.action;
      activity.date = new Date(data.timestamp);

      activity.place = NstSvcPlaceFactory.getCachedSync(data.place_id);
      if (data.place_id && !activity.place) {
        return null;
      }

      activity.actor = NstSvcUserFactory.getCachedSync(data.actor_id);
      if (data.actor_id && !activity.actor) {
        return null;
      }

      return activity;
    }
  }
})();
