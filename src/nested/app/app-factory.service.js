(function () {
  'use strict';

  angular
    .module('ronak.nested.web.app')
    .service('NstSvcAppFactory', NstSvcAppFactory);

  /** @ngInject */
  function NstSvcAppFactory($q, _,
                             NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache, NstSvcAttachmentFactory,
                             NstApp, NstSvcLabelFactory, NST_SRV_ERROR, NST_TASK_ACCESS) {

    function AppFactory() {
      this.collector = new NstCollector('app', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('app');
    }

    AppFactory.prototype = new NstBaseFactory();
    AppFactory.prototype.constructor = AppFactory;
    AppFactory.prototype.parseApp = parseApp;
    AppFactory.prototype.createToken = createToken;
    AppFactory.prototype.revokeToken = revokeToken;
    AppFactory.prototype.getAllTokens = getAllTokens;
    AppFactory.prototype.register = register;
    AppFactory.prototype.remove = remove;
    AppFactory.prototype.search = search;
    AppFactory.prototype.handleCachedResponse = handleCachedResponse;
    AppFactory.prototype.parseCachedModel = parseCachedModel;
    AppFactory.prototype.transformToCacheModel = transformToCacheModel;
    AppFactory.prototype.getCachedSync = getCachedSync;
    AppFactory.prototype.set = set;
    AppFactory.prototype.get = get;
    AppFactory.prototype.getMany = getMany;

    function parseApp(data) {
      var factory = this;
      if (!(data && data._id)) {
        return null;
      }

      var app = new NstApp();

      app.id = data._id;
      app.name = data.name;
      if (data.homepage) {
        app.homepage = data.homepage;
      }
      app.developer = data.developer;
      app.iconLargeUrl = data.icon_large_url;
      app.iconSmallUrl = data.icon_small_url;

      return app;
    }

    function createToken(appId) {
      return NstSvcServer.request('app/create_token', {
        app_id: appId
      });
    }

    function revokeToken(token) {
      return NstSvcServer.request('app/revoke_token', {
        token: token
      });
    }

    function getAllTokens() {
      var deferred = $q.defer();
      NstSvcServer.request('app/get_tokens', {})
        .then(function(data){
          deferred.resolve(_.map(data.app_tokens, function(app) {
            return {
              token: app._id,
              app: parseApp(app.app)
            }
          }));
        })
        .catch(deferred.reject);
      return deferred.promise;
    }

    function register(model) {
      var params = {
        app_name: model.name,
        homepage: model.homepage,
        developer: model.developer,
        icon_large_url: model.iconLargeUrl,
        icon_small_url: model.iconSmallUrl
      };

      return NstSvcServer.request('app/register', params);
    }

    function remove(appId) {
      return NstSvcServer.request('app/remove', {
        app_id: appId
      });
    }

    function handleCachedResponse(cacheHandler, cachedResponse) {
      if (cachedResponse && _.isFunction(cacheHandler)) {
        var cachedApps = _.map(cachedResponse.apps, function (app) {
          return factory.getCachedSync(app._id);
        });
        cacheHandler(_.compact(cachedApps));
      }
    }

    function parseCachedModel(data) {
      // var factory = this;
      if (!data) {
        return null;
      }

      var app = new NstApp();

      app.id = data._id;
      app.name = data.name;
      if (data.homepage) {
        app.homepage = data.homepage;
      }
      app.developer = data.developer;
      app.iconLargeUrl = data.icon_large_url;
      app.iconSmallUrl = data.icon_small_url;

      return app;
    }

    function getCachedSync(id) {
      return this.parseCachedModel(this.cache.get(id));
    }

    function transformToCacheModel(data) {
      var copy = _.clone(data);
      //transformer here
      return copy;
    }

    function set(data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data));
      }
    }

    function get(id, cachedResponse) {
      var factory = this;
      var deferred = $q.defer();

      if (_.isFunction(cachedResponse)) {
        var cachedApp = this.getCachedSync(id);
        if (cachedApp) {
          cachedResponse(cachedApp);
        }
      }

      this.collector.add(id).then(function (data) {
        factory.set(data);
        deferred.resolve(factory.parseApp(data));
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            factory.cache.remove(id);
            break;
        }
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getMany(ids) {
      var defer = $q.defer();
      var joinedIds = ids.join(',');
      if (!joinedIds) {
        defer.reject(null);
      } else {
        NstSvcServer.request('app/get_many', {
          app_id: joinedIds
        }).then(function (data) {

          var not_access = _.differenceWith(ids, data.apps, function (i, b) {
            return i === b._id;
          });

          defer.resolve({
            idKey: '_id',
            resolves: data.apps,
            rejects: not_access
          });
        }).catch(defer.reject);
      }

      return defer.promise;
    }

    function search(keywords, limit, skip) {
      var factory = this;
      var parameters = {
        keyword: keywords,
        limit: limit || 8,
        skip: skip || 0
      };
      var defer = $q.defer();
      return factory.sentinel.watch(function () {
        NstSvcServer.request('search/apps', parameters).then(function (result) {
          defer.resolve(_.map(result.apps, function(app) {
            return factory.parseApp(app);
          }));
        }).catch(defer.reject);
        return defer.promise;
      }, 'searchApp');
    }

    var factory = new AppFactory();
    return factory;
  }
})();
