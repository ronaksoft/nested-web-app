(function() {
  'use strict';

  describe('controllers', function(){
    var vm;

    beforeEach(module('nested'));
    beforeEach(inject(function(_$controller_) {
      vm = _$controller_('Place-optionController');
    }));
  });
})();
