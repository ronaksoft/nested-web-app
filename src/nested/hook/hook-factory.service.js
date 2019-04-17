(function () {
  'use strict';

  angular
    .module('ronak.nested.web.hook')
    .service('NstSvcHookFactory', NstSvcHookFactory);

  /** @ngInject */
  function NstSvcHookFactory($q, _,
                             NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache, NstSvcAttachmentFactory,
                             NstHook, NstSvcLabelFactory, NST_SRV_ERROR, NST_TASK_ACCESS) {

    function HookFactory() {
      this.collector = new NstCollector('hook', this.getMany);
    }

    HookFactory.prototype = new NstBaseFactory();
    HookFactory.prototype.addAccountHook = addAccountHook;
    HookFactory.prototype.addPlaceHook = addPlaceHook;
    HookFactory.prototype.constructor = HookFactory;
    HookFactory.prototype.parseHook = parseHook;
    HookFactory.prototype.remove = remove;
    HookFactory.prototype.list = list;
    HookFactory.prototype.get = get;

    function parseHook(data) {
      var factory = this;
      if (!data) {
        return null;
      }

      var hook = new NstHook();

      hook.id = data._id || data.id;
      hook.name = data.name;
      hook.url = data.url;
      hook.setBy = data.set_by;
      hook.anchorId = data.anchor_id;
      hook.eventType = data.event_type;

      return hook;
    }

    function addPlaceHook(data) {
      return NstSvcServer.request('hook/add_place_hook', {
        place_id: data.id,
        hook_name: data.name,
        event_type: parseInt(data.eventType),
        url: data.url,
      });
    }

    function addAccountHook(data) {
      return NstSvcServer.request('hook/add_account_hook', {
        account_id: NstSvcAuth.user.id,
        hook_name: data.name,
        event_type: parseInt(data.eventType),
        url: data.url,
      });
    }

    function remove(hookId) {
      return NstSvcServer.request('hook/remove', {
        hook_id: hookId
      });
    }

    function list() {
      var factory = this;
      var defer = $q.defer();
      return factory.sentinel.watch(function () {
        NstSvcServer.request('hook/list', {}).then(function (result) {
          defer.resolve(_.map(result.hooks, function(hook) {
            return factory.parseHook(hook);
          }));
        }).catch(defer.reject);
        return defer.promise;
      }, 'hookList');
    }
    
    function get(id, cachedResponse) {
      var factory = this;
      var deferred = $q.defer();

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

    var factory = new HookFactory();
    return factory;
  }
})();
