(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NestedPlace', function (NestedPlaceRepoService, NestedUser) {
      function Place(data, parent, full) {
        this.full = full || false;
        
        this.id = null;
        this.name = null;
        this.description = null;
        this.parent = parent || null; // <NestedPlace>
        this.grandParent = null; // <NestedPlace>
        this.children = []; // [<NestedPlace>]
        this.activeMembers = []; // [<NestedUser>]
        this.picture = {
          org: null,
          x32: null,
          x64: null,
          x128: null
        };
        this.privacy = null; // <NestedPrivacy>
        this.access = null; // <NestedAccess>
        this.role = null; // TODO: ?

        if (data) {
          this.setData(data);
        }
      }

      Place.prototype = {
        setData: function(data, parent) {
          if (angular.isString(data)) {
            this.load(data);
          } else if (data.hasOwnProperty('id')) {
            angular.extend(this, data);
          } else if (data.hasOwnProperty('_id')) {
            console.log("Place Data:", data);

            this.id = data._id;
            this.parent = parent || this.parent || (data.parent_id ? (this.full ? new Place(data.parent_id) : data.parent_id) : null);
            this.grandParent = data.grand_parent_id ? (this.id === data.grand_parent_id ? this : (this.full ? new Place(data.grand_parent_id) : data.grand_parent_id)) : null;
            this.name = data.name;
            this.description = data.description;
            this.picture = data.picture;
            this.privacy = data.privacy;
            this.access = data.access;
            this.role = data.role;

            this.children = [];
            if (angular.isArray(data.childs)) {
              if (this.full) {
                for (var k in data.childs) {
                  this.children[k] = new Place(data.childs[k]._id, this);
                }
              } else {
                this.children = data.childs;
              }
            }

            this.active_members = [];
            for (var k in data.active_members) {
              this.active_members[k] = new NestedUser(data.active_members[k]._id);
            }
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info);
          }
        },

        load: function(id) {
          NestedPlaceRepoService.get(id || this.id).then(this.setData.bind(this));
        },

        getParent: function (full) {
          this.parent = this.parent ? (this.parent instanceof Place ? this.parent : new Place(this.parent, null, full)) : null;

          return this.parent;
        },

        getGrandParent: function (full) {
          this.grandParent = this.grandParent ? (this.grandParent instanceof Place ? this.grandParent : new Place(this.grandParent, null, full)) : null;

          return this.grandParent;
        },

        delete: function() {
          return WsService.request('place/remove', {
            post_id: this.id
          });
        },

        update: function() {
          // TODO: Check if API Exists and is correct
          return WsService.request('place/update', {
            post_id: this.id
          });
        }
      };

      return Place;
    });
})();
