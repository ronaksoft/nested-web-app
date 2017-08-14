(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
      .directive('previewOnLoad', function ($timeout) {
      return {
        restrict: 'A',
        link: function($scope, $element) {
          // $element.hide();
          $scope.$parent.attachment.loaded = false;
          $scope.$parent.attachment.loadedProgress = 0;
          var jelement = $($element);
          // var jthumb = $attrs.thumbnailId ? $($attrs.thumbnailId) : null;
          jelement.on($element[0].nodeName === 'VIDEO' ? 'loadeddata' : 'load', function() {
            $timeout(function(){
              $scope.$parent.attachment.loaded = true;
              // $element.parent().addClass('loaded');
            },100);
          });
          // $scope.$watch(function(){
          //   return $attrs.src;
          // }, function () {
          //   $element.hide();
          // })


          // function load ( url, callback ) {
          //   var xmlHTTP = new XMLHttpRequest();


          //   xmlHTTP.open( 'GET', url , true );
          //   xmlHTTP.responseType = 'arraybuffer';

          //   xmlHTTP.onload = function( e ) {
          //     $scope.$parent.attachment.loadedProgress = 1;
          //     $scope.$parent.attachment.loaded = true;
          //     $element[0].src = url;
          //       // var h = xmlHTTP.getAllResponseHeaders(),
          //       //     m = h.match( /^Content-Type\:\s*(.*?)$/mi ),
          //       //     mimeType = m[ 1 ] || 'image/png';
          //       //     // Remove your progress bar or whatever here. Load is done.

          //       // var blob = new Blob( [ this.response ], { type: mimeType } );
          //       // thisImg.src = window.URL.createObjectURL( blob );
          //       // if ( callback ) callback( this );
          //   };

          //   xmlHTTP.onprogress = function( e ) {
          //     if ( e.lengthComputable )
          //       $scope.$parent.attachment.loadedProgress = parseInt( ( e.loaded / e.total ) * 100 ) / 100;
          //       console.log($scope.$parent.attachment.loadedProgress);
          //       // Update your progress bar here. Make sure to check if the progress value
          //       // has changed to avoid spamming the DOM.
          //       // Something like:
          //       // if ( prevValue != thisImage completedPercentage ) display_progress();
          //   };


          //   xmlHTTP.onloadend = function() {
          //     $scope.$parent.attachment.loadedProgress = 1;
          //   }

          //   xmlHTTP.send();
          // };
        }
      }
    });
})();
