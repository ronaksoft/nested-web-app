(function() {
  'use strict';

  angular
    .module('nested')
    .service('NestedPlaceRepoService', function (WsService) {
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
              return new Promise(function (res, rej) {
                res.call(this, this.repo[id]);
              }.bind(this));
            }
          } else {
            this.repo[id] = WsService.request('place/get_info', { place_id: id }).then(function (data) {
              // TODO: Cache the native object
              this.repo[id] = data;

              return this.repo[id];
            }.bind(this));

            return this.repo[id];
          }
        }
      };

      return new PlaceRepoService();
    });
})();
