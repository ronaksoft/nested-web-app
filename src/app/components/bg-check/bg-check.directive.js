(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('bgCheck', function($log) {
      return {
        restrict: 'A',
        link: function(scope, element, $attrs) {

          scope.$watch(function () {
            return $attrs.bgCheck
          },function (newValue) {
            if(newValue){
              ChangeColorBaseOnBrightness(newValue)
            }
          });

          function ChangeColorBaseOnBrightness(Url) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
              var reader = new FileReader();
              reader.onloadend = function() {
                getImageBrightness(reader.result,function(brightness) {
                  $log.debug('place pic brightness' , brightness);
                  if (brightness < 130) {
                    $(element).addClass('dark')
                  } else {
                    $(element).removeClass('dark')
                  }

                });
              };
              reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', Url);
            xhr.send();
          }
          function getImageBrightness(imageSrc,callback) {
            var img = document.createElement("img");
            img.src = imageSrc;
            img.style.display = "none";
            document.body.appendChild(img);

            var colorSum = 0;

            img.onload = function() {
              // create canvas
              var canvas = document.createElement("CANVAS");

              canvas.width = this.width;
              canvas.height = this.height;

              var ctx = canvas.getContext("2d");
              ctx.drawImage(this,0,0);
              //canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '')



              var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
              var data = imageData.data;
              var r,g,b,avg;

              for(var x = 0, len = data.length; x < len; x+=4) {
                r = data[x];
                g = data[x+1];
                b = data[x+2];

                avg = Math.floor((r+g+b)/3);
                colorSum += avg;
              }

              var brightness = Math.floor(colorSum / (this.width*this.height));
              callback(brightness);
            }
          }


        }
      }
    });
})();
