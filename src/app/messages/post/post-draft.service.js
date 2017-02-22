(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcPostDraft', NstSvcPostDraft);

  /** @ngInject */
  function NstSvcPostDraft(NstSvcPostDraftStorage, NstPostDraft, NstSvcAuth) {
    function PostDraft() {
      this.hasDraft = null;
      this.key = NstSvcAuth.user.id;
    }

    PostDraft.prototype.discard = function () {
      NstSvcPostDraftStorage.flush();
      this.hasDraft = false;
    };

    PostDraft.prototype.has = function () {
      if (this.hasDraft === null) {

        var draft = NstSvcPostDraftStorage.get(this.key);
        this.hasDraft = _.isObject(draft);
      }

      return this.hasDraft;
    };

    PostDraft.prototype.save = function (draft) {
      NstSvcPostDraftStorage.set(this.key, draft);
      this.hasDraft = true;
    };

    PostDraft.prototype.get = function () {
      return NstSvcPostDraftStorage.get(this.key);
    };

    return new PostDraft();
  }
})();
