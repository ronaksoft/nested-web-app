(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('PlaceFilesController', PlaceFilesController);

  /** @ngInject */
  function PlaceFilesController(_) {
    var vm = this;
    vm.selectedFiles = [];

    vm.files = [
      {id: 1,type: 'pdf', size: 18.9},
      {id: 2,type: 'mp3', size: 24.9},
      {id: 3,type: 'rar', size: 26.9},
      {id: 4,type: 'doc', size: 28.9}
    ];

    vm.onSelect = function (fileIds,el) {
      console.log(fileIds,el)
      var selectedFiles = [];
      for (var i = 0; i < fileIds.length; i ++){
         var fileObj = vm.files.filter(function (file) {
          return file.id === parseInt(fileIds[i]);
        });
        if (fileObj.length === 1){
          selectedFiles.push(fileObj[0]);
        }
      }
      vm.selectedFiles = selectedFiles;
    };


     vm.totalSelectedFileSize = function() {
      var total = 0;
      vm.selectedFiles.map(function (file) {
        total += file.size;
      });
      console.log(total);
      return total;
    }

  }
})();
