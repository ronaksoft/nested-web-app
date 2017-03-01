(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('CropController', function ($state, $scope, $uibModalInstance, argv,$timeout){
      var vm = this;

      /*****************************
       *** Controller Properties ***
       *****************************/

      vm.uploadedImage = argv.file;
      vm.type = argv.type || 'circle';
      vm.uploadedImageURL = '';
      vm.cropedImage = '';
      vm.ready = false;
      var imageLoadTimeout = null;


      var reader = new FileReader();
      reader.onload = function (event) {
        imageLoadTimeout = $timeout(function () {
          vm.uploadedImage = event.target.result;
          vm.ready = true;
        });
      };
      reader.readAsDataURL(vm.uploadedImage);

      $scope.$watch(function () {
        return vm.ready;
      }, function () {
        if (vm.ready) {
          vm.uploadedImageURL = vm.uploadedImage;
        }
      });
      vm.calc = function () {
        var img = new Image();
        img.src = vm.uploadedImageURL;
        vm.width = img.width;
        vm.height = img.height;
      };

      $scope.$watch(function () {
        return vm.cropedImage;
      }, function () {
        if (vm.cropedImage) {
          var file = dataURItoFile(vm.cropedImage,'profile_image');
          vm.uploadedImage = file;
        }
      });

      vm.accept = function () {
        $uibModalInstance.close(vm.uploadedImage);
      };


      vm.close = function () {
        $uibModalInstance.dismiss();
      };

      function dataURItoFile(dataURI, filename) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
        else
          byteString = decodeURI(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new File([ia], filename + '.' +  mimeString.split('/')[1], {type: mimeString});
      }

    })
})();
