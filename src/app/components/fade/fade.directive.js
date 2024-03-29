/**
 * This directive copied from https://gist.github.com/fcoury/4402158
 *
 * Usage : <div
 *            nst-show-effect="whatever you use for ng-show"
 *            jq-options="{type:'fade', duration:200, delay:200, hideImmediately: true, timeout : 1000}">
 *              Content
 *         </div>
 */

(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('nstShowEffect', function($rootScope, $timeout, $) {
      return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs) {
          var eventReferences = [];
          // configure options
          var passedOptions = scope.$eval(attrs.jqOptions);

          // defaults
          var options = {
            type: 'fade', // or 'slide'
            duration: 200,
            delay: 0,
            hideImmediately: false, // if true, will hide without effects or duration
            timeout: 0,
            callback: null
          };

          $.extend(options, passedOptions);

          var type = options.type;
          var duration = options.duration;
          var callback = options.callback;
          var delay = options.delay;
          var hideImmediately = options.hideImmediately;

          // watch the trigger
          var jqElm = $(element);

          eventReferences.push(scope.$watch(function () {
            return attrs.show;
          }, function() {
            var value = eval(attrs.show);
            if (hideImmediately && !value) {
              jqElm.hide(0, callback);
            } else {
              $timeout(function() {
                if (type == 'fade') {
                  value ? jqElm.fadeIn(duration, callback) : hideLoading();
                } else if (type == 'slide') {
                  value ? jqElm.slideDown(duration, callback) : jqElm.slideUp(duration, callback);
                } else {
                  value ? jqElm.show(duration, callback) : jqElm.hide(duration, callback);
                }
              }, delay);
            }
          }));
          function hideLoading() {
            jqElm.addClass('disappear-loading');
            $timeout(function() {
              jqElm.fadeOut(duration, callback);
            }, 1800);
          }
          $rootScope.$on('hide-loading-fast', hideFastLoading);
          function hideFastLoading() {
            jqElm.addClass('disappear-loading');
            jqElm.fadeOut(100, callback);
          }
          scope.$on('$destroy', function () {
            _.forEach(eventReferences, function (canceler) {
              if (_.isFunction(canceler)) {
                canceler();
              }
            });
          });
        }
      }
    });
})();
