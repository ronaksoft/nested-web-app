(function() {
  'use strict';
  angular
    .module('emojiBundle', [])
    .service('wdtEmojiBundle', wdtEmojiBundle );
  function wdtEmojiBundle() {
    return window.wdtEmojiBundle;
  }
})();
