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
    .module('nested')
    .directive('nstShowEffect', function($timeout) {
      return {
        restrict: 'A',
        scope :{
          show : "@"
        },
        link: function(scope, element, attrs) {
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

          scope.$watch(function () {
            return scope.show;
          }, function() {
            var value = eval(scope.show);
            if (hideImmediately && !value) {
              jqElm.hide(0, callback);
            } else {
              $timeout(function() {
                if (type == 'fade') {
                  value ? jqElm.fadeIn(duration, callback) : jqElm.fadeOut(duration, callback);
                } else if (type == 'slide') {
                  value ? jqElm.slideDown(duration, callback) : jqElm.slideUp(duration, callback);
                } else {
                  value ? jqElm.show(duration, callback) : jqElm.hide(duration, callback);
                }
              }, delay);
            }
          });
        }
      }
    });
})();
