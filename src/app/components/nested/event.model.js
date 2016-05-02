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

      POST_ADD: 256, //--
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
      templates[EVENT_ACTIONS.MEMBER_ADD] = { path: 'app/components/nested/event/member/add.html' };
      templates[EVENT_ACTIONS.MEMBER_REMOVE] = { path: 'app/components/nested/event/member/remove.html' };
      templates[EVENT_ACTIONS.MEMBER_INVITE] = { path: 'app/components/nested/event/member/invite.html' };
      templates[EVENT_ACTIONS.MEMBER_JOIN] = { path: 'app/components/nested/event/member/join.html' };

      templates[EVENT_ACTIONS.PLACE_ADD] = { path: 'app/components/nested/event/place/add.html' };
      templates[EVENT_ACTIONS.PLACE_REMOVE] = { path: 'app/components/nested/event/place/remove.html' };
      templates[EVENT_ACTIONS.PLACE_PICTURE] = { path: 'app/components/nested/event/place/picture.html' };

      templates[EVENT_ACTIONS.POST_ADD] = { path: 'app/components/nested/event/post/add.html' };

      templates[EVENT_ACTIONS.COMMENT_ADD] = { path: 'app/components/nested/event/comment/add.html' };

      Event.prototype = {
        setData: function(data) {
          $log.debug("Raw Event Data: ", data.action, data);

          this.id = data._id.$oid;
          this.type = data.action;
          this.actor = new NestedUser({
            _id: data.actor,
            fname: data.actor_fname,
            lname: data.actor_lname,
            picture: data.actor_picture
          });

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
            this.post = new NestedPost({
              _id: data.post_id,
              sender: {
                _id: data.actor,
                fname: data.actor_fname,
                lname: data.actor_lname,
                picture: data.actor_picture
              },
              subject: data.post_subject,
              body: data.post_body,
              post_places: data.post_places, // TODO: Please be `places`
              'time-stamp': data.date
            });
          }

          if (data.hasOwnProperty('comment_id')) {
            this.comment = new NestedComment(this.post, {
              _id: data.comment_id,
              attach: null,
              sender_id: data.actor,
              sender_fname: data.actor_fname,
              sender_lname: data.actor_lname,
              sender_picture: data.actor_picture,
              text: data.comment_body,
              time: data.date
            });
          }

          if (data.hasOwnProperty('place_id')) {
            // TODO: Handle Multiple Places
            if (angular.isArray(data.place_id)) {
              this.places = [];
              for (var k in data.place_id) {
                this.places.push(new NestedPlace(data.place_id[k]));
              }
            }

            var parent = data.parent_id ? new NestedPlace(
              data.parent_name ? {
                _id: data.parent_id,
                name: data.parent_name
              } : data.parent_id
            ) : undefined;

            this.place = new NestedPlace(angular.isArray(data.place_id) ? data.place_id[0] : {
              _id: data.place_id,
              name: data.place_name,
              picture: data.place_picture
            }, parent);
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
