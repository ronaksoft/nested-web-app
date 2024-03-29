(function() {
  'use strict';

  angular
    .module('ronak.nested.web.user')
    .controller('CropController', function ($state, $scope, $uibModalInstance, argv){
      var vm = this;

      /*****************************
       *** Controller Properties ***
       *****************************/
      var eventReferences = [];
      vm.uploadedImage = argv.file;
      vm.type = argv.type || 'circle';
      vm.uploadedImageURL = '';
      vm.cropedImage = '';
      vm.ready = false;

      var reader = new FileReader();
      reader.onload = function () {
        vm.ready = true;
      };
      reader.readAsDataURL(vm.uploadedImage);

      eventReferences.push($scope.$watch(function () {
        return vm.ready;
      }, function () {
        if (vm.ready) {
          vm.uploadedImageURL = reader.result;
        }
      }));
      vm.calc = function () {
        var img = new Image();
        img.src = vm.uploadedImageURL;
        vm.width = img.width;
        vm.height = img.height;
      };

      // $scope.$watch(function () {
      //   return vm.cropedImage;
      // }, function () {
      //   if (vm.cropedImage) {
      //     var file = dataURItoBlob(vm.cropedImage,'profile_image');
      //     vm.uploadedImage = file;
      //   }
      // });

      vm.accept = function () {
        if (vm.cropedImage) {
          var file = dataURItoBlob(vm.cropedImage);
          vm.uploadedImage = file;
          vm.uploadedImage.name = argv.file.name || 'pic.jpg';
        }
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
        /* eslint-disable */
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new File([ia], filename + '.' +  mimeString.split('/')[1], {type: mimeString});

      }

      function dataURItoBlob(dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
      }

      $scope.$on('$destroy', function () {
        _.forEach(eventReferences, function (canceler) {
          if (_.isFunction(canceler)) {
            canceler();
          }
        });
      });

    })
})();
