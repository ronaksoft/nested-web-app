(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcPostDraft', NstSvcPostDraft);

  /** @ngInject */
  function NstSvcPostDraft(NstPostDraft, _, NstSvcGlobalCache) {
    function PostDraft() {
      this.hasDraft = null;
      this.key = '_model'
      this.cache = NstSvcGlobalCache.createProvider('draft');
    }

    PostDraft.prototype.discard = function () {
      this.cache.remove(this.key);
      this.hasDraft = false;
    };

    PostDraft.prototype.has = function () {
      if (this.hasDraft === null) {

        var draft = this.cache.get(this.key);
        this.hasDraft = _.isObject(draft);
      }

      return this.hasDraft;
    };

    PostDraft.prototype.save = function (draft) {
      this.cache.set(this.key, draft);
      this.hasDraft = true;
    };

    PostDraft.prototype.get = function () {
      return this.cache.get(this.key);
    };

    return new PostDraft();
  }
})();
