(function () {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcScrollSaver', SvcScrollSaver);

  /** @ngInject */
  function SvcScrollSaver($rootScope, _, $, $timeout, NstSvcGlobalCache) {

    var lastScroll = 0;
    var lastUrl = '';

    function ScrollSaver() {
      this.storage = NstSvcGlobalCache.createProvider('scroll');
      $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll !== 0) {
          lastScroll = scroll;
        }
      });
    }

    ScrollSaver.prototype.constructor = ScrollSaver;
    ScrollSaver.prototype.store = store;
    ScrollSaver.prototype.restore = restore;
    ScrollSaver.prototype.hasHistory = hasHistory;

    var service = new ScrollSaver();
    return service;

    function store() {
      if (lastUrl === '') {
        return;
      }
      if (lastScroll > 100) {
        this.storage.set(lastUrl, {
          url: lastUrl,
          scroll: lastScroll
        });
      } else {
        this.storage.remove(lastUrl);
      }
    }

    function restore(url) {
      lastUrl = url;
      var data = this.storage.get(url);
      if (data && data.scroll) {
        $('html, body').animate({scrollTop: data.scroll}, 200);
      }
    }

    function hasHistory(url) {
      lastUrl = url;
      var data = this.storage.get(url);
      return (data && data.scroll > 100);
    }
  }
})();
