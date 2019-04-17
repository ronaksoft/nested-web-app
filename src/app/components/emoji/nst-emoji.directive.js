(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('emojiInit', function ($timeout, _, NstSvcKeyFactory, NST_KEY, wdtEmojiBundle) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          NstSvcKeyFactory.get(NST_KEY.WEBAPP_SETTING_RECENT_EMOJI, true).then(function (recentItems) {
            var recent = recentItems ? recentItems.split('|').map(function (item) {
              return JSON.parse(item);
            }) : [{
              "name": "REGIONAL INDICATOR SYMBOL LETTERS UM",
              "short_name": "🇺🇸",
              "short_names": ["united", "states", "um", "america", "flag", "nation", "country", "banner"],
              "sort_order": 257
            }];
            if (attrs.composeEmoji) {
              wdtEmojiBundle.init(attrs.emojiInit, element[0], recent, callback);
            } else {
              wdtEmojiBundle.init(attrs.emojiInit, null, recent, callback);
            }
          });

          function callback(recentEmojies) {
            var sts = recentEmojies.map(function (em) {
              return JSON.stringify(em);
            }).join('|');
            NstSvcKeyFactory.set(NST_KEY.WEBAPP_SETTING_RECENT_EMOJI, sts)
              .then(function () {});
          }

        }
      };
    });
})();
