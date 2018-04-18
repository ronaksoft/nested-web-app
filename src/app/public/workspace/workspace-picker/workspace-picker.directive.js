(function () {
    'use strict';
    angular
      .module('ronak.nested.web.components')
      .directive('nstWorkspace', function (_, $rootScope, $timeout, $window, SvcRTL,
                                              NstSvcLabelFactory, NstSvcTranslation) {
        return {
          restrict: 'A',
          scope: {
            dataList: '=nstMentionData',
            itemClicked: '=nstMentionClicked',
            myWorkspaces: '=?'
          },
          link: function (scope, _element) {
  
            appendMention(_element);
  
            function repositionModal(offset, obj) {
              try {
                var documentDir = $('body').attr('dir');
                var containerWidth = $(obj.$el[0]).parent().width();
                var inputWidth = obj.$inputor[0].offsetWidth;
  
                if (documentDir === 'ltr') {
                    offset.left = $window.innerWidth - offset.left - 96;
                } else {
                    offset.left = offset.left + inputWidth - containerWidth - 15;
                }
                return true;
              }
              catch (e) {
                return offset;
              }
            }
  
            function appendMention(element) {
  
              var template =
                "<li data-id='${id}' class='_difv workspace-suggets'>" +
                "<img src='${src}' width='16' height='16'/>" +
                "<div>" +
                "<span class='_df list-unstyled text-centerteammate-name _fw nst-mood-solid text-name'><span class='_db _fw _txe'>${name}</span></span>" +
                "<span class='_df _fn nst-mood-storm'><span class='_db _txe'>${id}</span></span>" +
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
                  at: '',
                  searchKey: 'searchField',
                  maxLen: 10,
                  startWithSpace: false,
                  limit: 5,
                  displayTpl: template,
                  callbacks: {
                    beforeInsert: function (value, $li) {
                        element[0].value = '';
                      var elm = angular.element($li);
                      if (scope.itemClicked) {
                          $timeout(scope.itemClicked, 10);
                      }
                      return elm.attr('data-id').trim();
                    },
                    remoteFilter: function (query, callback) {
                        var item = {id: 'nested', name:"ronaksoft"};
                        callback([{
                            id: item.id,
                            name: item.name,
                            src : '',
                          },]);
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
  