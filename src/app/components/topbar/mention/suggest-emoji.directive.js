(function () {
  'use strict';
  angular
    .module('ronak.nested.web.components.mention')
    .directive('nstSuggestEmoji', function (_, $rootScope, $timeout, $window,
      NST_USER_SEARCH_AREA, SvcRTL, NstSvcTranslation,
      NstSvcUserFactory, NstVmUser, NstSvcAuth, NST_SEARCH_QUERY_PREFIX) {
      return {
        restrict: 'A',
        scope: {
          selectedList: '=nstMentionList',
          dataList: '=nstMentionData',
          itemClicked: '=nstMentionClicked'
        },
        link: function (scope, _element) {

          appendMention(_element, NST_SEARCH_QUERY_PREFIX.EMOJI);

          function repositionModal(offset, obj) {
            try {
              var documentDir = $('body').attr('dir');
              var containerWidth = $(obj.$el[0]).find('.atwho-view').width();
              var direction = obj.$inputor[0].style.direction;
              var inputWidth = obj.$inputor[0].offsetWidth;

              if (documentDir === 'ltr') {
                if (direction === 'rtl') {
                  offset.left = ($window.innerWidth - offset.left) - containerWidth + 5;
                }
              } else {
                if (direction === 'ltr') {
                  offset.left = (offset.left - containerWidth) + 5;
                } else {
                  offset.left = offset.left + inputWidth - containerWidth - 15;
                }
              }

              return true;
            } catch (e) {
              return offset;
            }
          }

          function appendMention(element, key) {

            var template =
            "<li data-id='${id}' data-emoji='${emoji}' class='_difv suggest-emoji'>" +
            "<span> ${emoji} </span>" +
            "<div>" +
            "<span class='_df list-unstyled _fw nst-mood-solid'><span class='_db _fw _txe' dir='ltr'>${name}</span></span>" +
            "</div>" +
            "</li>";

            element.on('hidden.atwho', function () {
              $timeout(function () {
                element.attr('mention', false);
              }, 200);
            });

            element.on('shown.atwho', function () {
              element.attr('mention', true);
            });

            element
            .atwho({
              at: key,
              searchKey: 'searchField',
              maxLen: 24,
              startWithSpace: false,
              limit: 5,
              displayTpl: template,
              callbacks: {
                beforeInsert: function (value, $li) {
                  var elm = angular.element($li);
                  return elm.attr('data-emoji').trim().replace(/ /gi, "");
                },
                remoteFilter: function (query, callback) {
                  window.wdtEmojiBundle.fillPickerPopup();
                  query = query.replace(/-/gi, " ");
                  window.wdtEmojiBundle.search(query, 5, callb);

                  function callb(arr) {

                    var items = _.map(arr, function (emoji) {
                      var name = emoji.dataset.wdtEmojiName.toLowerCase().replace(/ /gi, "-");
                      return {
                        id: emoji.dataset.wdtEmojiOrder,
                        emoji: emoji.dataset.wdtEmojiShortname,
                        name: name,
                        searchField: name
                      }
                    });
                    callback(items);
                  }
                },
                beforeReposition: function (offset) {
                  repositionModal(offset, this);
                }
              }
            });
          }

        }
      }
    })

})();
