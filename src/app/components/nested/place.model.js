(function() {
  'use strict';

  angular
    .module('nested')
    .constant('PLACE_ACCESS', {
      READ: 'RD',
      WRITE: 'WR',
      READ_POST: 'RD',
      WRITE_POST: 'WR',
      REMOVE_POST: 'D',
      CONTROL: 'C',
      ADD_MEMBERS: 'AM',
      REMOVE_MEMBERS: 'RM',
      SEE_MEMBERS: 'SM',
      REMOVE_PLACE: 'RP',
      ADD_PLACE: 'AP',
      GUEST: 'G'
    })
    .constant('MEMBER_TYPE', {
      KEY_HOLDER: 'key_holder',
      KNOWN_GUEST: 'known_guest',
      CREATOR: 'creator'
    })
    .factory('NestedPlace', function ($rootScope, $q, NestedPlaceRepoService, WsService, NestedUser, PLACE_ACCESS, MEMBER_TYPE, StoreItem, $log) {
      function Place(data, parent, full) {
        this.full = full || false;

        this.id = null;
        this.local_id = null;
        this.name = null;
        this.description = null;

        this.parent = parent ? (parent instanceof Place ? parent : { id: parent }) : null; // <NestedPlace>
        this.grandParent = null; // <NestedPlace>
        this.children = []; // [<NestedPlace>]

        this.activeMembers = []; // [<NestedUser>]
        this.members = {
          creators: {
            loaded: false,
            count: -1,
            users: [] // [<NestedUser>]
          },
          keyHolders: {
            loaded: false,
            count: -1,
            users: [] // [<NestedUser>]
          },
          pendingKeyHolders: {
            loaded: false,
            count: -1,
            users: [] // [<NestedUser>]
          },
          knownGuests: {
            loaded: false,
            count: -1,
            users: [] // [<NestedUser>]
          },
          pendingKnownGuests: {
            loaded: false,
            count: -1,
            users: [] // [<NestedUser>]
          }
        };

        this.picture = {
          org: new StoreItem(), // <StoreItem>
          x32: new StoreItem(),
          x64: new StoreItem(),
          x128: new StoreItem()
        };
        this.counters = {
          creators: -1,
          keyHolders: -1,
          knownGuests: -1,
          allMembers: -1,
          childs: -1,
          posts: -1,
          size: -1
        };
        this.privacy = {
          broadcast: false,
          email: false,
          locked: false,
          receptive: false,
          search: false
        }; // <NestedPrivacy>
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

            this.change();
          } else if (data.hasOwnProperty('_id')) {
            $log.debug("Place Data:", data);

            this.id = data._id;
            this.parent = parent || (this.parent instanceof Place ? this.parent : (data.parent_id ? new Place(this.full ? data.parent_id : { id: data.parent_id }, undefined, this.full) : null));
            this.updateLocalId();
            this.grandParent = data.grand_parent_id ? (this.id === data.grand_parent_id ? this : new Place(this.full ? data.grand_parent_id : { id: data.grand_parent_id }, undefined, this.full)) : null;
            this.name = data.name;
            this.description = data.description;
            this.access = data.access;
            this.role = data.member_type || data.role;

            if (data.privacy && angular.isObject(data.privacy)) {
              this.privacy.broadcast = data.privacy.broadcast;
              this.privacy.email = data.privacy.email;
              this.privacy.locked = data.privacy.locked;
              this.privacy.receptive = data.privacy.receptive;
              this.privacy.search = data.privacy.search;
            }

            if (data.picture && angular.isObject(data.picture)) {
              this.picture.org = new StoreItem(data.picture.org);
              this.picture.x32 = new StoreItem(data.picture.x32);
              this.picture.x64 = new StoreItem(data.picture.x64);
              this.picture.x128 = new StoreItem(data.picture.x128);
            }

            this.counters = {
              creators: -1,
              keyHolders: -1,
              knownGuests: -1,
              allMembers: -1,
              children: -1,
              posts: -1,
              size: -1
            };
            if (data.counters && angular.isObject(data.counters)) {
              this.counters.creators = data.counters.creators;
              this.members.creators.count = this.counters.creators;

              this.counters.keyHolders = data.counters.key_holders;
              this.members.keyHolders.count = this.counters.keyHolders;

              this.counters.knownGuests = data.counters.known_guests;
              this.members.knownGuests.count = this.counters.knownGuests;

              this.counters.children = data.counters.childs;
              this.counters.posts = data.counters.posts;
              this.counters.size = data.counters.size;
            }
            this.counters.allMembers = this.counters.knownGuests + this.counters.keyHolders + this.counters.creators;

            this.children = [];
            if (angular.isArray(data.childs)) {
              this.counters.children = this.counters.children > -1 ? this.counters.children : data.childs.length;
              for (var k in data.childs) {
                this.children[k] = new Place(this.full ? data.childs[k]._id : data.childs[k], this, this.full);
              }
            }

            this.activeMembers = [];
            for (var k in data.active_members) {
              this.activeMembers[k] = new NestedUser(this.full ? data.active_members[k]._id : data.active_members[k]);
            }

            this.full && this.loadAllMembers();

            this.change();
          } else if (data.hasOwnProperty('status')) {
            this.setData(data.info);
          }

          return this;
        },

        updateLocalId: function () {
          this.local_id = this.id.split('.').pop();
        },

        change: function () {
          if(!$rootScope.$$phase) {
            $rootScope.$digest()
          }
        },

        load: function(id) {
          this.id = id || this.id;
          this.updateLocalId();

          return NestedPlaceRepoService.get(this.id).then(this.setData.bind(this));
        },

        getParent: function (full) {
          this.parent = this.parent ? (this.parent instanceof Place ? this.parent : new Place(this.parent, null, full)) : null;

          return this.parent;
        },

        getGrandParent: function (full) {
          this.grandParent = this.grandParent ? (this.grandParent instanceof Place ? this.grandParent : new Place(this.grandParent, null, full)) : null;

          return this.grandParent;
        },

        loadCreators: function (reload) {
          if (this.members.creators.loaded && !reload) {
            return $q(function (resolve) {
              resolve(this.members.creators);
            }.bind(this));
          }

          return WsService.request('place/get_creators', {
            place_id: this.id
          }).then(function (data) {
            this.members.creators.users = [];
            this.members.creators.count = data.creators.length;
            for (var k in data.creators) {
              this.members.creators.users.push(new NestedUser(data.creators[k]));
            }

            this.members.creators.loaded = true;
            this.change();

            return this.loadCreators();
          }.bind(this));
        },

        loadKeyHolders: function (reload) {
          if (this.members.keyHolders.loaded && !reload) {
            return $q(function (resolve) {
              resolve(this.members.keyHolders);
            }.bind(this));
          }

          return WsService.request('place/get_key_holders', {
            place_id: this.id
          }).then(function (data) {
            this.members.keyHolders.users = [];
            this.members.keyHolders.count = data.key_holders.length;
            for (var k in data.key_holders) {
              this.members.keyHolders.users.push(new NestedUser(data.key_holders[k]));
            }

            this.members.keyHolders.loaded = true;
            this.change();

            return this.loadKeyHolders();
          }.bind(this));
        },

        loadPendingKeyHolders: function (reload) {
          if (this.members.pendingKeyHolders.loaded && !reload) {
            return $q(function (resolve) {
              resolve(this.members.pendingKeyHolders);
            }.bind(this));
          }

          return WsService.request('place/get_pending_invitations', {
            place_id: this.id,
            member_type: MEMBER_TYPE.KEY_HOLDER
          }).then(function (data) {
            this.members.pendingKeyHolders.users = [];
            this.members.pendingKeyHolders.count = 0;
            for (var k in data.invitations) {
              this.members.pendingKeyHolders.users.push(new NestedUser(data.invitations[k]));
            }

            this.members.pendingKeyHolders.loaded = true;
            this.change();

            return this.loadPendingKeyHolders();
          }.bind(this));
        },

        loadKnownGuests: function (reload) {
          if (this.members.knownGuests.loaded && !reload) {
            return $q(function (resolve) {
              resolve(this.members.knownGuests);
            }.bind(this));
          }

          return WsService.request('place/get_known_guests', {
            place_id: this.id
          }).then(function (data) {
            this.members.knownGuests.users = [];
            this.members.knownGuests.count = data.known_guests.length;
            for (var k in data.known_guests) {
              this.members.knownGuests.users.push(new NestedUser(data.known_guests[k]));
            }

            this.members.knownGuests.loaded = true;
            this.change();

            return this.loadKnownGuests();
          }.bind(this));
        },

        loadPendingKnownGuests: function (reload) {
          if (this.members.pendingKnownGuests.loaded && !reload) {
            return $q(function (resolve) {
              resolve(this.members.pendingKnownGuests);
            }.bind(this));
          }

          return WsService.request('place/get_pending_invitations', {
            place_id: this.id,
            member_type: MEMBER_TYPE.KNOWN_GUEST
          }).then(function (data) {
            this.members.pendingKnownGuests.users = [];
            this.members.pendingKnownGuests.count = 0;
            for (var k in data.invitations) {
              this.members.pendingKnownGuests.users.push(new NestedUser(data.invitations[k]));
            }

            this.members.pendingKnownGuests.loaded = true;
            this.change();

            return this.loadPendingKnownGuests();
          }.bind(this));
        },

        loadAllMembers: function (reload) {
          if (this.members.creators.loaded && this.members.keyHolders.loaded && this.members.knownGuests.loaded && !reload) {
            return $q(function (resolve) {
              resolve(this.members);
            }.bind(this));
          }

          return WsService.request('place/get_members', {
            place_id: this.id
          }).then(function (data) {
            this.members.creators.users = [];
            this.members.creators.count = data.creators.length;
            this.counters.creators = this.members.creators.count;
            for (var k in data.creators) {
              this.members.creators.users.push(new NestedUser(data.creators[k]));
            }
            this.members.creators.loaded = true;

            this.members.keyHolders.users = [];
            this.members.keyHolders.count = data.key_holders.length;
            this.counters.keyHolders = this.members.keyHolders.count;
            for (var k in data.key_holders) {
              this.members.keyHolders.users.push(new NestedUser(data.key_holders[k]));
            }
            this.members.keyHolders.loaded = true;

            this.members.knownGuests.users = [];
            this.members.knownGuests.count = data.known_guests.length;
            this.counters.knownGuests = this.members.knownGuests.count;
            for (var k in data.known_guests) {
              this.members.knownGuests.users.push(new NestedUser(data.known_guests[k]));
            }
            this.members.knownGuests.loaded = true;

            this.counters.allMembers = this.counters.knownGuests + this.counters.keyHolders + this.counters.creators;
            this.change();
            this.loadPendingKeyHolders();
            this.loadPendingKnownGuests();

            return this.loadAllMembers();
          }.bind(this));
        },

        togglePrivacy: function (key) {
          if (this.privacy.hasOwnProperty(key)) {
            this.privacy[key] = !this.privacy[key];

            // TODO: Request Update
          }
        },

        delete: function() {
          return WsService.request('place/remove', {
            post_id: this.id
          });
        },

        update: function() {
          if (this.id) {
            // TODO: Check if API Exists and is correct
            return WsService.request('place/update', {
              post_id: this.id
            });
          } else if (this.local_id) {
            var params = {
              parent_id: this.parent.id,
              place_id: this.local_id,
              place_name: this.name,
              place_desc: this.description,
              place_pic: this.picture.org.uid
            };

            return WsService.request('place/add', params).then(function (data) {
              this.id = data.place._id;
              this.updateLocalId();

              return $q(function (res) {
                res(this);
              }.bind(this));
            }.bind(this));
          } else {
            return $q(function (res, rej) {
              rej({
                err_code: -1,
                items: [],
                status: 'err'
              });
            });
          }
        }
      };

      return Place;
    });
})();
