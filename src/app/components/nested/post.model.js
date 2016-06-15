(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedPost', function ($rootScope, $q, $injector, $log, WsService, NestedUser, NestedPlace, NestedAttachment, NestedRecipient) {
      function Post(data, full) {
        this.full = full || false;

        this.commentLimit = 30;
        this.moreComments = false;

        this.id = null;
        this.subject = null;
        this.body = null;
        this.contentType = "text/plain";
        this.sender = null; // <NestedUser>
        this.replyTo = null;
        this.date = null;
        this.updated = null;
        this.attachments = []; // [<NestedAttachment>]
        this.attachmentPreview = false;
        this.comments = []; // [<NestedComment>]
        this.places = []; // [<NestedPlace>]
        this.recipients = []; // [<NestedRecipients>]
        this.spam = 0;
        this.monitored = false;
        this.internal = false;
        this.forwarded = null;
        this.counters = {
          attaches: -1,
          comments: -1,
          replied: -1,
          forwarded: -1,
          size: -1
        };

        if (data) {
          this.setData(data);
        }
      }

      Post.prototype = {
        last_comments: [], // <Comment>

        setData: function(data) {
          if (angular.isString(data)) {
            return this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            this.id = data._id.$oid;
            this.sender = (data.sender instanceof NestedUser) ? data.sender : new NestedUser(this.full ? (data.sender.id || data.sender._id) : data.sender);
            this.replyTo = data.replyTo ? new Post(this.full ? data.replyTo : { id: data.replyTo }) : null;
            this.subject = data.subject;
            this.contentType = data.content_type;
            this.body = data.body;
            this.internal = data.internal;
            this.date = new Date(data['time-stamp'] * 1e3);
            this.updated = new Date(data['last-update'] * 1e3);
            this.counters = data.counters || this.counters;
            this.moreComments = this.counters.comments > -1 ? this.counters.comments > this.comments.length : true;
            this.monitored = data.monitored;
            this.forwarded = data.forwarded ? new Post(this.full ? data.forwarded : { id: data.forwarded }) : null;
            this.spam = data.spam;

            this.places = [];
            for (var k in data.post_places) {
              this.places[k] = new NestedPlace(this.full ? data.post_places[k]._id : { id: data.post_places[k]._id, name: data.post_places[k].name });
            }

            if (data.place_access) {
              _.forEach(this.places, function (place) {
                place.access = _.find(data.place_access, { '_id' : place.id }).access;
              });
            }

            this.attachments = [];
            this.attachmentPreview = false;
            for (var k in data.post_attachments) {
              this.attachments[k] = new NestedAttachment(data.post_attachments[k], this);
              this.attachmentPreview = this.attachmentPreview || !!this.attachments[k].thumbs.x128.uid;
            }

            this.recipients = []; // TODO: ?
            for (var k in data.recipients) {
              this.recipients[k] = new NestedRecipient(data.recipients[k]);
            }

            if (this.full) {
              this.commentLimit = this.counters.comments || 100 * this.commentLimit;
              this.loadComments();
            }

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.post);
          }

          return $q(function (res) {
            res(this);
          }.bind(this));
        },

        loadComments: function (reload) {

          if (this.comments.length > 0 && !reload  && !this.moreComments) {
            return $q(function (resolve) {
              resolve(this.comments);
            }.bind(this));
          }

          return WsService.request('post/get_comments', {
            skip: this.comments.length,
            limit: this.commentLimit,
            post_id: this.id
          }).then(function (data) {
            var NestedComment = $injector.get('NestedComment');

            for (var k in data.comments) {
              this.comments.push(new NestedComment(this, data.comments[k]));
            }

            this.moreComments = !(data.comments.length < this.commentLimit);
            if (!this.moreComments) {
              this.counters.comments = this.comments.length;
            }

            this.change();

            return this.comments;
          }.bind(this));
        },

        addComment: function (comment) {
          var NestedComment = $injector.get('NestedComment');

          if (comment instanceof NestedComment) {
            if (0 == this.comments.filter(function (v) { return v.id == comment.id }).length) {
              this.comments.unshift(comment);
              this.counters.comments > -1 && this.counters.comments++;

              return $q(function (res) {
                res(comment);
              });
            } else {
              return $q(function (res, rej) {
                rej(comment);
              });
            }
          }

          return WsService.request('post/add_comment', {
            post_id: this.id,
            txt: comment
          }).then(function (data) {
            return (new NestedComment(this)).load(data.comment_id.$oid).then(function (loadedComment) {
              this.addComment(loadedComment).catch(function () {});

              return $q(function (res) {
                res(loadedComment);
              });
            }.bind(this));
          }.bind(this));
        },

        deleteComment: function (comment) {
          var bound = undefined;
          for (var k in this.comments) {
            if (comment.id == this.comments[k].id) {
              bound = Number(k);
              break;
            }
          }

          if (undefined != bound) {
            this.comments = this.comments.slice(0, bound).concat(this.comments.slice(bound + 1));
          }
        },

        addAttachment: function (attachment) {
          attachment = attachment instanceof NestedAttachment ? attachment : new NestedAttachment(attachment, this);
          attachment.post = this;
          this.attachments.push(attachment);

          this.attachmentPreview = this.attachmentPreview || !!attachment.thumbs.x128.uid;
        },
        removeAttachment: function (attachment) {
          var itemIndex = this.attachments.indexOf(attachment);
          if(itemIndex !== -1)
          {
            //TODO : use const instead of 'uploading'
            if (attachment.status === 'uploading'){
              // abort the pending upload request
              attachment.cancelUpload();
            }
            this.attachments.splice(itemIndex, 1);
          }
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id) {
          this.id = id || this.id;

          return WsService.request('post/get', { post_id: this.id }).then(this.setData.bind(this));
        },

        delete: function() {
          return WsService.request('post/remove', {
            post_id: this.id
          });
        },

        deleteFromPlace: function(postId, placeId) {
          return WsService.request('post/remove', {
            post_id: postId,
            place_id: placeId
          });
        },

        update: function() {
          if (this.id) {
            // TODO: Check if API Exists and is correct
            return WsService.request('post/update', {
              post_id: this.id
            });
          } else {
            var params = {
              targets: (this.places.map(function (place) { return place.id; }).concat(this.recipients.map(function (recp) { return recp.id; }))).join(','),
              content_type: this.contentType,
              reply_to: this.replyTo ? this.replyTo.id : undefined,
              forwarded_from: this.forwarded ? this.forwarded.id : undefined,
              subject: this.subject,
              body: this.body,
              // return attachment.id changed into return attachment._id because id was undefined
              // FIXME: Ask pouyan what's the difference between _id and id
              attaches: (this.attachments.map(function (attachment) { return attachment._id; })).join(',')
            };

            return WsService.request('post/add', params).then(function (data) {
              this.id = data.post_id.$oid;

              return $q(function (res) {
                res(this);
              })
            }.bind(this));
          }
        },


        getPlacesHaveDeleteAccess: function (post) {
          return getPlacesWithAccess(post, 'RM');
        },

        haveAnyPlaceWithDeleteAccess: function () {
          return filterPlacesByAccessCode(this.places, ['RM']).length > 0;
        }
      };

      function loadPlacesWithAccess(ids) {
        return WsService.request('place/get_access', { place_ids: ids });
      }

      function getPlacesWithAccess(post, accessCodes) {
        var separator = ',';
        var codes = _.split(accessCodes, separator);
        var defer = $q.defer();

        if (placesHaveAccessInside(post)) {
          $log.debug('the places have access object inside');
          defer.resolve(filterPlacesByAccessCode(post.places, codes));
        }
        else {
          $log.debug('Could not find place accesses and they should be retrieved from the server.');

          var ids = getAllPlacesIds(post);
          loadPlacesWithAccess(ids).then(function (res) {
            fillAccess(post, res.places); // fills access inside every place
            defer.resolve(filterPlacesByAccessCode(post.places, codes));

          }).catch(function (res) {
            defer.reject(res);
          });
        }

        return defer.promise;
      }

      function placesHaveAccessInside(post) {

        if (!(post.places && post.places.length > 0)) //does not have any place
        {
          return false;
        }

        return _.every(post.places, function (place) { // all places carry access with themeselves
          return place.access.length > 0;
        });
      }

      function getAllPlacesIds(post) {
        return _.join(_.map(post.places,'id'), ',');
      }

      function filterPlacesByAccessCode(places, accessCodes) {
        return _.filter(places, function (place) {
          return _.intersection(place.access, accessCodes).length > 0; //do the codes exists in access array?
        });
      }

      function fillAccess(post, places) { //fills the post's places access
        for (var i = 0; i < post.places.length; i++) {
          post.places[i].access = _.find(places, { '_id' : post.places[i].id }).access;
        }
      }

      return Post;
    });
})();
