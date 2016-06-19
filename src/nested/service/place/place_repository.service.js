(function() {
  'use strict';

  angular
    .module('nested')
    .service('NestedPlaceRepoService', function ($q, WsService) {
      function PlaceRepoService(repo) {
        this.repo = repo || {};
      }

      PlaceRepoService.prototype = {
        has: function (id) {
          return this.repo.hasOwnProperty(id);
        },

        get: function (id, forceReload) {
          if (this.has(id) && !forceReload) {
            if (this.repo[id] instanceof Promise) {
              return this.repo[id];
            } else {
              return $q(function (res) {
                res.call(this, this.repo[id]);
              }.bind(this));
            }
          } else {
            this.repo[id] = WsService.request('place/get_info', { place_id: id }).then(function (data) {
              // TODO: Cache the native object
              this.repo[id] = data;

              return this.repo[id];
            }.bind(this)).catch(function () {
              this.repo[id] = { _id: id };

              return this.repo[id];
            }.bind(this));

            return this.repo[id];
          }
        },

        push: function (place) {
          this.repo[place.id] = place;

          return this.repo[place.id];
        }
      };

      return new PlaceRepoService();
    });
})();
