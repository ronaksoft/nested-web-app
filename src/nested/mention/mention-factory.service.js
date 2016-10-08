(function() {
  'use strict';

  angular
    .module('ronak.nested.web.mention')
    .service('NstSvcMentionFactory', NstSvcMentionFactory);

  function NstSvcMentionFactory($q,
    NstSvcServer,
    NstBaseFactory, NstFactoryQuery, NstFactoryError, NstMention) {
    function MentionFactory() {

    }

    MentionFactory.prototype = new NstBaseFactory();
    MentionFactory.prototype.constructor = MentionFactory;

    MentionFactory.prototype.getMentions = getMentions;
    MentionFactory.prototype.getMentionsCount = getMentionsCount;

    return new MentionFactory();

    function getMentions(skip, limit) {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('account/get_mentions', {
          skip: skip || 0,
          limit: limit || 12,
          show_data: true
        }).then(function(data) {

          defer.resolve(data.mentions);
        }).catch(defer.reject);

        return defer.promise;
      }, "getMentions");
    }

    function getMentionsCount() {
      return this.sentinel.watch(function () {
        var defer = $q.defer();

        NstSvcServer.request('account/get_mentions', {
          show_data: false
        }).then(function(data) {
          var count = data.total_unreads || 0;
          defer.resolve(count);
        }).catch(defer.reject);

        return defer.promise;
      }, "getMentionsCount");
    }
  }
})();
