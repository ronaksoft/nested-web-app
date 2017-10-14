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
        if (draft === null) {
          this.hasDraft = false;
          return this.hasDraft;
        }
        this.hasDraft = _.isObject(draft);
      }

      return this.hasDraft;
    };

    PostDraft.prototype.save = function (draft) {
      this.cache.set(this.key, draft, {
        expiration: new Date().setFullYear(new Date().getFullYear() + 1)
      });

      this.hasDraft = true;
    };

    PostDraft.prototype.get = function () {
      return this.cache.get(this.key);
    };

    PostDraft.prototype.reset = function () {
      this.hasDraft = null;
    };

    return new PostDraft();
  }
})();
