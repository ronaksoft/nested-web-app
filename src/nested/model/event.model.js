(function() {
  'use strict';

  angular
    .module('nested')
    .constant('EVENT_ACTIONS', {
      MEMBER_ADD: 1,
      MEMBER_REMOVE: 2, //-- Done
      MEMBER_INVITE: 4, //-- Done
      MEMBER_JOIN: 8, //-- Done

      PLACE_ADD: 16, //-- Done
      PLACE_REMOVE: 32,
      PLACE_PRIVACY: 64,
      PLACE_PICTURE: 128, //--

      POST_ADD: 256, //-- Done
      POST_REMOVE: 512, //--
      POST_UPDATE: 1024,

      COMMENT_ADD: 2048, //-- Done
      COMMENT_REMOVE: 3840, //--

      ACCOUNT_REGISTER: 4096,
      ACCOUNT_LOGIN: 8192,
      ACCOUNT_PICTURE: 16384
    })
    .factory('NestedEvent', function (WsService, EVENT_ACTIONS, NestedUser, NestedPost, NestedComment, NestedPlace, $log) {
      function Event(data) {
        this.id = null;
        this.type = null;
        this.actor = null;
        this.date = null;

        this.post = null;
        this.place = null;
        this.places = [];
        this.comment = null;

        this.member = null;
        this.memberType = null;

        this.view = {
          class: null,
          tpl: null,
          dateFormat: null
        };

        if (data) {
          this.setData(data);
        }

        // Some other initializations related to event
      }

      var templates = {};
      templates[EVENT_ACTIONS.MEMBER_ADD] = { path: 'app/events/partials/event/member/add.html' };
      templates[EVENT_ACTIONS.MEMBER_REMOVE] = { path: 'app/events/partials/event/member/remove.html' };
      templates[EVENT_ACTIONS.MEMBER_INVITE] = { path: 'app/events/partials/event/member/invite.html' };
      templates[EVENT_ACTIONS.MEMBER_JOIN] = { path: 'app/events/partials/event/member/join.html' };

      templates[EVENT_ACTIONS.PLACE_ADD] = { path: 'app/events/partials/event/place/add.html' };
      templates[EVENT_ACTIONS.PLACE_REMOVE] = { path: 'app/events/partials/event/place/remove.html' };
      templates[EVENT_ACTIONS.PLACE_PICTURE] = { path: 'app/events/partials/event/place/picture.html' };

      templates[EVENT_ACTIONS.POST_ADD] = { path: 'app/events/partials/event/post/add.html' };

      templates[EVENT_ACTIONS.COMMENT_ADD] = { path: 'app/events/partials/event/comment/add.html' };

      Event.prototype = {
        setData: function(data) {
          this.id = data._id.$oid;
          this.type = data.action;
          var q = {};

          q = {
            _id: data.actor,
            fname: data.actor_fname,
            lname: data.actor_lname,
            picture: data.actor_picture
          };
          for (var k in q) {
            if (!q[k]) {
              q = q._id;
              break;
            }
          }
          this.actor = new NestedUser(q);

          this.date = new Date(data.date * 1e3);
          var now = new Date(Date.now());
          if (now.getFullYear() === this.date.getFullYear()) {
            if (now.getMonth() === this.date.getMonth()) {
              this.view.dateFormat = 'H:mm';
            } else {
              this.view.dateFormat = 'EEE d';
            }
          } else {
            this.view.dateFormat = 'd MMM';
          }

          this.view.tpl = templates.hasOwnProperty(this.type) ? templates[this.type] : null;

          if (data.hasOwnProperty('post_id')) {
            q = {
              _id: data.post_id,
              sender: (EVENT_ACTIONS.POST_ADD == this.type ? this.actor : ''),
              subject: data.post_subject,
              body: data.post_body || (EVENT_ACTIONS.POST_ADD == this.type ? data.post_body : ''),
              post_attachments: data.post_attachments || [],
              post_places: data.post_places, // TODO: Please be `places`
              'time-stamp': data.date // TODO: Please be `time`
            };
            for (var k in q) {
              if (undefined == q[k]) {
                $log.debug('Requesting To Get Post Because', '`' + k + '`', 'was undefined:', data);
                q = q._id.$oid;
                break;
              }
            }

            this.post = new NestedPost(q);
          }

          if (data.hasOwnProperty('comment_id')) {
            q = {
              _id: data.comment_id,
              attach: true,
              sender_id: this.actor.username,
              sender_fname: this.actor.name.fname,
              sender_lname: this.actor.name.lname,
              sender_picture: this.actor.picture,
              text: data.comment_body,
              time: data.date
            };
            for (var k in q) {
              if (undefined == q[k]) {
                $log.debug('Requesting To Get Comment Because', '`' + k + '`', 'was undefined:', data);
                q = q._id.$oid;
                break;
              }
            }

            this.comment = new NestedComment(this.post, q);
          }

          if (data.hasOwnProperty('place_id')) {
            var place_ids = angular.isArray(data.place_id) ? data.place_id : [data.place_name ? {
              _id: data.place_id,
              name: data.place_name,
              picture: data.place_picture
            } : data.place_id];

            var parent = data.parent_id ? new NestedPlace(
              data.parent_name ? {
                _id: data.parent_id,
                name: data.parent_name
              } : data.parent_id
            ) : undefined;

            this.places = [];
            for (var k in place_ids) {
              this.places.push(new NestedPlace(place_ids[k]), parent);
            }

            this.place = this.places[0];
          }

          if (data.hasOwnProperty('member_type')) {
            this.memberType = data.member_type;
          }

          if (data.hasOwnProperty('member_id')) {
            this.member = new NestedUser(data.member_id);
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
