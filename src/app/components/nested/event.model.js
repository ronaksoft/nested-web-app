(function() {
  'use strict';

  angular
    .module('nested')
    .constant('EVENT_ACTIONS', {
      MEMBER_ADD: 1,
      MEMBER_REMOVE: 2,
      MEMBER_INVITE: 4,
      MEMBER_JOIN: 8,

      PLACE_ADD: 16,
      PLACE_REMOVE: 32,
      PLACE_PRIVACY: 64,
      PLACE_PICTURE: 128,

      POST_ADD: 256,
      POST_REMOVE: 512,
      POST_UPDATE: 1024,

      COMMENT_ADD: 2048,
      COMMENT_REMOVE: 3840, //!

      ACCOUNT_REGISTER: 4096,
      ACCOUNT_LOGIN: 8192,
      ACCOUNT_PICTURE: 16384
    })
    .factory('NestedEvent', function (WsService, NestedUser, NestedPost, EVENT_ACTIONS) {
      function Event(data) {
        this.id = null;
        this.type = null;
        this.actor = null;
        this.date = null;

        this.post = null;
        this.place = null;
        this.comment = null;
        this.view = {
          class: null,
          tpl: null
        };

        if (data) {
          this.setData(data);
        }

        // Some other initializations related to event
      }

      var templates = {};
      templates[EVENT_ACTIONS.MEMBER_INVITE] = 'app/components/nested/event/member/invite.html';
      templates[EVENT_ACTIONS.POST_ADD] = 'app/components/nested/event/post/add.html';
      templates[EVENT_ACTIONS.COMMENT_ADD] = 'app/components/nested/event/comment/add.html';

      Event.prototype = {
        setData: function(data) {
          console.log("Raw Event Data: ", data);

          this.id = data._id.$oid;
          this.type = data.action;
          this.actor = new NestedUser(data.actor);
          this.date = new Date(data.date * 1e3);
          this.view.tpl = templates.hasOwnProperty(this.type) ? templates[this.type] : null;

          if (this.type & EVENT_ACTIONS.POST_ADD) {
            this.post = new NestedPost(data.post_id.$oid);
          }
        },

        load: function(id) {
          WsService.request('event/get_info', {
            event_id: id
          }).then(function (data) {
            this.setData(data);
          }.bind(this));
        },

        delete: function() {
          return WsService.request('post/remove', {
            post_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('post/update', {
            post_id: this.id
          });
        }
      };

      return Event;
    });
})();
