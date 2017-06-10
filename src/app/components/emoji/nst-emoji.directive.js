(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('emojiInit', function ($timeout, _, NstSvcKeyFactory,NST_KEY) {
      return {
        restrict: 'A',
        link: function (scope, element , attrs) {
          NstSvcKeyFactory.get(NST_KEY.GENERAL_SETTING_RECENT_EMOJI).then(function (recentItems) {
            var recent = recentItems ? recentItems.split('|').map(function (item) {
              return JSON.parse(item);
            }) : [{"has_img_apple":true,"has_img_google":false,"has_img_twitter":true,"has_img_emojione":true,"has_img_facebook":true,"has_img_messenger":true,"name":"REGIONAL INDICATOR SYMBOL LETTERS UM","short_name":"🇺🇸","short_names":["united","states","um","america","flag","nation","country","banner"],"sort_order":257}];
            if ( attrs.composeEmoji ) {
              wdtEmojiBundle.init(attrs.emojiInit,element[0],recent,callback);
            } else {
              wdtEmojiBundle.init(attrs.emojiInit,null,recent,callback);
            }
          });
          function callback(recentEmojies) {
            var sts = recentEmojies.map(function(em){
              return JSON.stringify(em);
            }).join('|');
            NstSvcKeyFactory.set(NST_KEY.GENERAL_SETTING_RECENT_EMOJI, sts)
            .then(function (result) {
              console.log(result);
            });
          }
            
        }
      };
    });
})();
