(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcTaskDraft', NstSvcTaskDraft);

  /** @ngInject */
  function NstSvcTaskDraft(_, NstSvcGlobalCache) {
    function TaskDraft() {
      this.hasDraft = null;
      this.key = '_model';
      this.cache = NstSvcGlobalCache.createProvider('task_draft');
    }

    TaskDraft.prototype.discard = function () {
      this.cache.remove(this.key);
      this.hasDraft = false;
    };

    TaskDraft.prototype.has = function () {
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

    TaskDraft.prototype.save = function (draft) {
      this.cache.set(this.key, draft, {
        expiration: new Date().setFullYear(new Date().getFullYear() + 1)
      });

      this.hasDraft = true;
    };

    TaskDraft.prototype.get = function () {
      return this.cache.get(this.key);
    };

    TaskDraft.prototype.reset = function () {
      this.hasDraft = null;
    };

    return new TaskDraft();
  }
})();
